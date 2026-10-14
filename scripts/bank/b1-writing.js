'use strict';

const { mc, orderWords, orderLines } = require('../lib/builders');

// Trình độ B1.
const items = [];
const push = (category, difficulty, tags, q) =>
    items.push({ skill: 'writing', category, level: 'B1', difficulty, tags: ['writing', ...tags], ...q });

// ---------------------------------------------------------------- Sắp xếp từ thành câu
// [difficulty, tags, chunks, các hoán vị chắc chắn sai ngữ pháp, giải thích, dấu kết câu?]
const WORDS = [
    ['medium', ['passive'], ['this temple', 'was built', 'by the local people', 'over 200 years ago'],
        [[1, 0, 2, 3], [2, 1, 0, 3], [1, 2, 0, 3]],
        "Câu bị động: Chủ ngữ + was/were + V3 + by + tác nhân + thời gian."],
    ['medium', ['relative-clause'], ['the girl', 'who sits next to me', 'comes', 'from Soc Trang'],
        [[0, 2, 1, 3], [1, 0, 2, 3], [2, 0, 1, 3]],
        "Mệnh đề quan hệ đứng ngay sau danh từ nó bổ nghĩa ('the girl who sits next to me'), sau đó mới đến động từ chính 'comes'."],
    ['medium', ['indirect-question'], ['could you tell me', 'where', 'the post office', 'is'],
        [[0, 1, 3, 2], [1, 3, 2, 0], [0, 2, 1, 3]],
        "Câu hỏi gián tiếp: Could you tell me + từ để hỏi + chủ ngữ + động từ (không đảo 'is' lên trước chủ ngữ).", '?'],
    ['hard', ['conditional'], ['I would', 'learn Japanese', 'if I', 'had', 'more free time'],
        [[0, 1, 2, 4, 3], [2, 3, 0, 1, 4], [0, 3, 2, 1, 4]],
        "Câu điều kiện loại 2: S + would + V + if + S + quá khứ đơn + ..."],
    ['medium', ['present-perfect'], ['I', 'have', 'never', 'been', 'to Hanoi'],
        [[0, 1, 3, 2, 4], [2, 0, 1, 3, 4], [0, 3, 1, 2, 4]],
        "Hiện tại hoàn thành với 'never': S + have + never + V3. 'never' đứng giữa 'have' và V3."],
    ['medium', ['used-to'], ['my grandfather', 'used to', 'work', 'on a farm', 'when he was young'],
        [[0, 2, 1, 3, 4], [1, 0, 2, 3, 4], [0, 1, 3, 2, 4]],
        "'used to + V nguyên mẫu' đứng ngay sau chủ ngữ: S + used to + V + nơi chốn + thời gian."],
    ['medium', ['reported-speech'], ['she', 'asked me', 'if', 'I', 'was free'],
        [[0, 1, 2, 4, 3], [0, 1, 4, 2, 3], [0, 2, 3, 4, 1]],
        "Tường thuật câu hỏi Yes/No: S + asked + O + if + S + V (trật tự trần thuật)."],
    ['medium', ['too-enough'], ['this coffee', 'is', 'too hot', 'for me', 'to drink'],
        [[0, 1, 3, 2, 4], [0, 2, 1, 3, 4], [0, 1, 4, 2, 3]],
        "Cấu trúc: S + be + too + tính từ + for + O + to V (quá... để ai làm gì)."],
    ['medium', ['so-that'], ['the test', 'was', 'so difficult', 'that', 'nobody finished it'],
        [[0, 1, 3, 2, 4], [0, 2, 1, 3, 4], [0, 1, 2, 4, 3]],
        "Cấu trúc: S + be + so + tính từ + that + mệnh đề (quá... đến nỗi)."],
    ['medium', ['gerund'], ['I', 'am looking forward', 'to meeting', 'you', 'next week'],
        [[0, 1, 3, 2, 4], [0, 2, 1, 3, 4], [0, 1, 2, 4, 3]],
        "'look forward to + V-ing': I am looking forward to meeting you + thời gian."],
];

for (const [difficulty, tags, chunks, wrongOrders, explain, end] of WORDS) {
    const q = orderWords({ chunks, wrongOrders, end: end || '.' });
    push('Word Order', difficulty, ['word-order', ...tags], {
        ...q,
        explanation: `${explain} → '${q.options[q.answer]}'`,
    });
}

// ---------------------------------------------------------------- Sắp xếp hội thoại
const DIALOGUE_PROMPT = 'Put the lines in the correct order to make a conversation:';
const DIALOGUES = [
    ['easy', 'Job interview', ['A: Thank you for coming in today. Please take a seat.', 'B: Thank you for inviting me.', 'A: So, can you tell me a little about yourself?', "B: Sure. I graduated in accounting last year, and I've been working part-time at a bank since then."]],
    ['medium', 'Hotel problem', ['A: Reception. How can I help you?', "B: Hi, this is Room 208. The air conditioner isn't working.", "A: I'm sorry about that. I'll send someone to look at it right away.", 'B: Thank you. How long will it take?', 'A: About fifteen minutes.']],
    ['medium', 'Holiday plans', ['A: Have you decided what to do for the summer holiday?', "B: Not yet. I'm thinking of either Da Lat or Nha Trang.", "A: If I were you, I'd go to Da Lat. It's cooler in summer.", "B: That's a good point. I'll look for cheap hotels there."]],
    ['medium', 'At the doctor', ['A: Good morning. What seems to be the problem?', "B: I've had a high temperature since yesterday.", 'A: I see. Have you taken any medicine?', 'B: Just some paracetamol last night.', "A: OK. I'll give you a prescription. Drink plenty of water and get some rest."]],
    ['hard', 'Returning an item', ["A: Hi. I bought this shirt here last week, but it's too small.", 'B: Do you have the receipt?', 'A: Yes, here it is.', 'B: Thanks. Would you like to exchange it or get a refund?', "A: I'd like to exchange it for a larger size, please."]],
];

for (const [difficulty, topic, lines] of DIALOGUES) {
    const q = orderLines({ lines, prompt: DIALOGUE_PROMPT });
    push('Dialogue Order', difficulty, ['dialogue-order', topic.toLowerCase().replace(/[^a-z]+/g, '-')], {
        ...q,
        explanation: `Thứ tự đúng: ${q.options[q.answer]}. Hội thoại luân phiên A – B; mỗi câu trả lời phải đáp đúng câu ngay trước nó (${topic}).`,
    });
}

// ---------------------------------------------------------------- Sắp xếp câu thành đoạn văn
const PARAGRAPH_PROMPT = 'Put the sentences in the correct order to make a paragraph:';
const PARAGRAPHS = [
    ['medium', "Câu chủ đề → 'Firstly' → 'Secondly' → 'However' (ý trái chiều, đặt cuối).", ['Many people believe that university students should have a part-time job.', 'Firstly, working helps students earn money to pay for their living costs.', 'Secondly, they can gain experience that will be useful when they look for a full-time job.', 'However, students should not work too many hours, or their studies may suffer.']],
    ['medium', "Mở đầu chuyến đi → sự cố ngày đầu tiên → 'Luckily' (được giúp đỡ) → 'To thank him' (cảm ơn người đã giúp).", ['Last month, I went on a trip to Ha Giang with three friends.', 'On the first day, our motorbike broke down in the middle of the mountains.', 'Luckily, a local farmer stopped and helped us repair it.', 'To thank him, we bought him lunch at a small restaurant in the next village.']],
    ['medium', "Câu chủ đề (nên bắt đầu sớm) → 'First' → 'After that' → 'Finally'.", ['Applying for a student visa can take a long time, so you should start early.', 'First, you need an acceptance letter from the university.', 'After that, fill in the online application form and pay the fee.', 'Finally, you will be invited to an interview at the embassy.']],
    ['hard', "Email trang trọng: 'Dear Sir or Madam' → lý do viết → chi tiết vấn đề ('When it arrived') → yêu cầu → 'Yours faithfully' và tên.", ['Dear Sir or Madam,', 'I am writing to complain about the laptop I ordered from your website on 2 May.', 'When it arrived, the screen was broken.', 'I would like a full refund as soon as possible.', 'Yours faithfully, Nguyen Lan']],
    ['hard', "Câu chủ đề (có cả ưu và nhược điểm) → 'On the one hand' → 'On the other hand' → kết luận 'In my opinion'.", ['Living in a big city has both advantages and disadvantages.', 'On the one hand, there are more job opportunities and better hospitals.', 'On the other hand, the cost of living is high and the air is often polluted.', 'In my opinion, the advantages are greater than the disadvantages.']],
];

for (const [difficulty, why, lines] of PARAGRAPHS) {
    const q = orderLines({ lines, prompt: PARAGRAPH_PROMPT });
    push('Paragraph Order', difficulty, ['paragraph-order'], {
        ...q,
        explanation: `Thứ tự đúng: ${q.options[q.answer]}. ${why}`,
    });
}

// ---------------------------------------------------------------- Viết lại / nối câu
const choice = (category, difficulty, tags, question, [correct, ...distractors], explanation) =>
    push(category, difficulty, tags, mc({ type: 'choice', question, correct, distractors, explanation }));

choice('Sentence Transformation', 'medium', ['passive'],
    "Choose the sentence with the same meaning: <br><i>People grow coffee in the Central Highlands.</i>",
    ['Coffee is grown in the Central Highlands.', 'Coffee grows people in the Central Highlands.', 'Coffee was grown by the Central Highlands.', 'People are grown coffee in the Central Highlands.'],
    "Chuyển sang bị động hiện tại đơn: tân ngữ 'coffee' làm chủ ngữ + is + V3 ('is grown'). Có thể bỏ 'by people'.");
choice('Sentence Transformation', 'medium', ['present-perfect'],
    "Choose the sentence with the same meaning: <br><i>I haven't seen Lan for two months.</i>",
    ['The last time I saw Lan was two months ago.', 'I saw Lan for two months.', 'I have seen Lan for two months.', "I didn't see Lan two months ago."],
    "'haven't seen... for two months' (đã 2 tháng không gặp) ⇔ 'The last time I saw Lan was two months ago' (lần cuối gặp là 2 tháng trước).");
choice('Sentence Transformation', 'medium', ['reported-speech'],
    "Choose the sentence with the same meaning: <br><i>\"I'm going to visit my grandparents,\" said Hoa.</i>",
    ['Hoa said that she was going to visit her grandparents.', 'Hoa said that I was going to visit my grandparents.', 'Hoa said that she is going to visit my grandparents.', 'Hoa told that she was going to visit her grandparents.'],
    "Tường thuật: đổi ngôi 'I' → 'she', 'my' → 'her'; lùi thì 'am going to' → 'was going to'. 'told' phải có tân ngữ (told me), nên 'Hoa told that...' sai.");
choice('Sentence Transformation', 'hard', ['conditional'],
    "Choose the sentence with the same meaning: <br><i>I don't have a car, so I can't drive you to the airport.</i>",
    ['If I had a car, I could drive you to the airport.', "If I have a car, I can't drive you to the airport.", "If I had a car, I couldn't drive you to the airport.", "If I didn't have a car, I could drive you to the airport."],
    "Giả định trái với hiện tại → câu điều kiện loại 2, đảo nghĩa khẳng định/phủ định: không có xe → 'If I had a car, I could drive you...'.");
choice('Sentence Transformation', 'hard', ['present-perfect'],
    "Choose the sentence with the same meaning: <br><i>This is the first time I have eaten durian.</i>",
    ['I have never eaten durian before.', 'I have eaten durian many times.', 'I ate durian for the first time last year.', 'This is the last time I eat durian.'],
    "'This is the first time I have eaten...' (lần đầu tiên ăn) ⇔ 'I have never eaten... before' (trước đây chưa từng ăn).");
choice('Sentence Transformation', 'hard', ['too-enough'],
    "Choose the sentence with the same meaning: <br><i>The bag was so heavy that I couldn't lift it.</i>",
    ['The bag was too heavy for me to lift.', 'The bag was heavy enough for me to lift.', 'The bag was so heavy for me to lift.', 'The bag was too heavy for me to lift it.'],
    "'so... that... couldn't' ⇔ 'too + adj + for sb + to V'. Không lặp lại tân ngữ 'it' sau 'to lift' vì chủ ngữ 'The bag' chính là vật được nhấc.");
choice('Sentence Transformation', 'hard', ['conjunction'],
    "Choose the sentence with the same meaning: <br><i>Although it rained heavily, we went to the beach.</i>",
    ['Despite the heavy rain, we went to the beach.', 'Because of the heavy rain, we went to the beach.', 'Despite it rained heavily, we went to the beach.', 'Although the heavy rain, we went to the beach.'],
    "'Although + mệnh đề' ⇔ 'Despite + cụm danh từ' ('the heavy rain'). 'Despite' không đi với mệnh đề; 'Although' không đi với cụm danh từ.");

choice('Sentence Combining', 'medium', ['relative-clause'],
    "Choose the best way to combine the sentences: <br><i>I met a man. He can speak five languages.</i>",
    ['I met a man who can speak five languages.', 'I met a man which can speak five languages.', 'I met a man who he can speak five languages.', 'I met a man whose can speak five languages.'],
    "Thay 'He' (chỉ người) bằng đại từ quan hệ 'who'; không giữ lại 'he' trong mệnh đề quan hệ.");
choice('Sentence Combining', 'medium', ['conjunction'],
    "Choose the best way to combine the sentences: <br><i>He was very tired. He kept working until midnight.</i>",
    ['Although he was very tired, he kept working until midnight.', 'Because he was very tired, he kept working until midnight.', 'He was very tired, so he kept working until midnight.', 'Despite he was very tired, he kept working until midnight.'],
    "Hai ý trái ngược (mệt nhưng vẫn làm) → 'Although' + mệnh đề. 'Despite' không đi với mệnh đề.");
choice('Sentence Combining', 'hard', ['conditional'],
    "Choose the best way to combine the sentences: <br><i>You can borrow my bike. You must return it before 6 p.m.</i>",
    ['You can borrow my bike as long as you return it before 6 p.m.', 'You can borrow my bike unless you return it before 6 p.m.', 'You can borrow my bike although you return it before 6 p.m.', 'You can borrow my bike so that you return it before 6 p.m.'],
    "Điều kiện để được mượn xe → 'as long as' (miễn là). 'unless' = trừ khi (sai nghĩa).");

module.exports = items;
