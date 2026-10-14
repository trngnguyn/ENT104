'use strict';

const BLANK = '______';

function createRng(seed) {
    let a = seed >>> 0;
    return function next() {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Seed cố định để mỗi lần sinh lại cho ra cùng thứ tự đáp án.
let rng = createRng(104);
const reseed = seed => { rng = createRng(seed); };

function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const tidy = s => s.replace(/\s+/g, ' ').replace(/\s+([.,?!;:])/g, '$1').trim();

/**
 * Câu trắc nghiệm 4 lựa chọn. `correct` là đáp án đúng, `distractors` là các phương án nhiễu
 * (nếu nhiều hơn 3 thì chọn ngẫu nhiên 3). Thứ tự các lựa chọn được xáo trộn.
 */
function mc(item) {
    const { correct, distractors, ...rest } = item;
    const seen = new Set([norm(correct)]);
    const pool = [];
    for (const d of distractors) {
        if (!seen.has(norm(d))) {
            seen.add(norm(d));
            pool.push(d);
        }
    }
    if (pool.length < 3) throw new Error(`Thiếu phương án nhiễu (cần 3): ${rest.question}`);
    const options = shuffle([correct, ...shuffle(pool).slice(0, 3)]);
    return { type: 'completion', ...rest, options, answer: options.indexOf(correct) };
}

const U = t => ({ t, u: true });
const X = (t, wrong) => ({ t, wrong, err: true });

/**
 * Câu tìm lỗi sai. `segs` gồm chuỗi thường, U(...) (phần có thể gạch chân) và đúng một X(đúng, sai).
 * Chọn ngẫu nhiên 3 phần U cùng phần lỗi, đánh dấu (A)-(D) theo thứ tự trong câu.
 * Trong `explanation`, {L} được thay bằng chữ cái của đáp án.
 */
function findError({ segs, explanation, ...meta }) {
    const errIdx = segs.findIndex(s => s && s.err);
    if (errIdx < 0 || segs.filter(s => s && s.err).length !== 1) {
        throw new Error(`Câu tìm lỗi cần đúng 1 phần sai: ${JSON.stringify(segs)}`);
    }
    const wrongText = segs[errIdx].wrong;
    const chosen = [];
    for (const i of shuffle(segs.map((_, i) => i).filter(i => i !== errIdx && segs[i].u))) {
        if (chosen.length === 3) break;
        const t = norm(segs[i].t);
        if (t === norm(wrongText) || chosen.some(j => norm(segs[j].t) === t)) continue;
        chosen.push(i);
    }
    if (chosen.length < 3) throw new Error(`Không đủ 3 phần gạch chân: ${JSON.stringify(segs)}`);
    const marked = new Set([...chosen, errIdx]);
    const options = [];
    let answer = -1;
    const parts = segs.map((s, i) => {
        const text = typeof s === 'string' ? s : (s.err ? s.wrong : s.t);
        if (!marked.has(i)) return text;
        const letter = 'ABCD'[options.length];
        if (i === errIdx) answer = options.length;
        options.push(text);
        return `<u>${text}</u> (${letter})`;
    });
    return {
        type: 'error',
        ...meta,
        question: 'Find the incorrect part: <br>' + tidy(parts.join(' ')),
        options,
        answer,
        explanation: explanation.replace(/\{L\}/g, 'ABCD'[answer]),
        correction: segs[errIdx].t,
    };
}

function permutations(list) {
    if (list.length <= 1) return [list];
    const out = [];
    list.forEach((x, i) => {
        for (const p of permutations([...list.slice(0, i), ...list.slice(i + 1)])) out.push([x, ...p]);
    });
    return out;
}

/** Sắp xếp từ/cụm từ thành câu. `wrongOrders` là các hoán vị (theo chỉ số) chắc chắn sai ngữ pháp. */
function orderWords({ chunks, wrongOrders, end = '.', ...meta }) {
    const sentence = arr => tidy(cap(arr.join(' ')) + end);
    const correct = sentence(chunks);
    const distractors = wrongOrders.map(o => sentence(o.map(i => chunks[i])));
    let scrambled;
    do { scrambled = shuffle(chunks); } while (scrambled.join('|') === chunks.join('|'));
    return mc({
        ...meta,
        type: 'ordering',
        question: `Put the words in the correct order: <br><i>${scrambled.join(' / ')}</i>`,
        correct,
        distractors,
    });
}

/**
 * Sắp xếp câu thành hội thoại/đoạn văn. `lines` theo đúng thứ tự.
 * Phương án nhiễu: ưu tiên các hoán vị giữ nguyên câu mở đầu để không thể đoán chỉ bằng câu đầu tiên.
 */
function orderLines({ lines, prompt, ...meta }) {
    const labels = 'abcdef'.slice(0, lines.length).split('');
    let order;
    do { order = shuffle(lines.map((_, i) => i)); } while (order.every((v, i) => v === i));
    const labelOf = lineIdx => labels[order.indexOf(lineIdx)];
    const seq = idxs => idxs.map(labelOf).join(' - ');
    const correct = seq(lines.map((_, i) => i));
    const perms = permutations(lines.map((_, i) => i)).map(seq).filter(p => p !== correct);
    const sameStart = shuffle(perms.filter(p => p[0] === correct[0]));
    const otherStart = shuffle(perms.filter(p => p[0] !== correct[0]));
    const distractors = [...sameStart.slice(0, 2), ...otherStart.slice(0, 1)];
    const body = labels.map((l, k) => `${l}. ${lines[order[k]]}`).join('<br>');
    return mc({ ...meta, type: 'ordering', question: `${prompt}<br>${body}`, correct, distractors });
}

module.exports = { BLANK, reseed, shuffle, norm, cap, tidy, mc, U, X, findError, orderWords, orderLines };
