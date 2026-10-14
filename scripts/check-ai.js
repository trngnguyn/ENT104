#!/usr/bin/env node
/**
 * Kiểm tra cấu hình AI trong .env bằng cách chấm thử một bài mẫu (gọi AI thật, tốn 1 lượt / model).
 *   npm run check-ai                              → dùng AI_MODEL (+ AI_FALLBACK_MODELS) trong .env
 *   npm run check-ai -- gemini-3.8-flash:low ...  → thử lần lượt từng model[:mức suy luận]
 * Không in khoá API.
 */
'use strict';

const path = require('path');
const { loadEnvFile, getConfig } = require('../server/env');
const { loadTasks } = require('../server/load-tasks');
const { assessWriting } = require('../server/writing-feedback');

const SAMPLE = "My last birthday was on sunday. I was very happy because my family have a party at home. In the morning my mother make a big chocolate cake and my father buyed some balloons. At ten o'clock my best friends Lan and Minh comed to my house. First we eat noodles and fried chicken. Then we played games in the garden and we sing a lot of songs together. After that my grandparents visit us and they gave me a beautiful blue bike. I was very surprise because I wanted a bike for a long time. In the afternoon we rode our bikes to the park near my house and take many photos. In the evening my family had dinner at a small restaurant. The food was delicious and everyone was happy. At the end of the day I was tired but very happy. It was the best birthday of my life.";

async function main() {
    loadEnvFile(path.join(__dirname, '..', '.env'));
    const base = getConfig().ai;
    if (!base.enabled) {
        console.log(`AI chưa được bật: ${base.message}`);
        process.exit(1);
    }
    const task = loadTasks().get('WT-A1-05');
    const combos = process.argv.slice(2).map(s => s.split(':'));
    const runs = combos.length
        ? combos.map(([model, effort]) => ({ ...base, model, fallbackModels: [], reasoningEffort: effort || base.reasoningEffort }))
        : [base];
    const verbose = !combos.length;
    let ok = false;
    for (const ai of runs) {
        const label = `${ai.model}${ai.fallbackModels.length ? ` (dự phòng: ${ai.fallbackModels.join(', ')})` : ''} – suy luận: ${ai.reasoningEffort || 'mặc định'}`;
        const t0 = Date.now();
        try {
            const f = await assessWriting({ task, text: SAMPLE, ai });
            ok = true;
            console.log(`✔ ${label}: ${((Date.now() - t0) / 1000).toFixed(1)} giây, model trả lời: ${f.meta.model}, điểm ${f.score}/10, ${f.corrections.length} lỗi (bỏ ${f.meta.unmatchedCorrections}), bài mẫu ${f.modelAnswerWords} từ`);
            if (verbose) {
                for (const [k, v] of Object.entries(f.criteria)) console.log(`   ${k}: ${v.score} – ${v.comment}`);
                f.corrections.forEach((c, i) => console.log(`   ${i + 1}. "${c.original}" → "${c.corrected}": ${c.explanation}`));
                console.log(`   Bài tham khảo:\n   ${f.modelAnswer}`);
            }
        } catch (e) {
            console.log(`✘ ${label}: ${((Date.now() - t0) / 1000).toFixed(1)} giây – ${e.code || ''} ${String(e.message)} ${String(e.detail || '').replace(/\s+/g, ' ').slice(0, 200)}`);
        }
    }
    process.exitCode = ok ? 0 : 1;
}

main();
