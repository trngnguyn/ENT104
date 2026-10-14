'use strict';

const { BLANK, mc, cap } = require('../lib/builders');
const E = require('../lib/english');

const items = [];
const add = (category, level, difficulty, tags, q) =>
    items.push({ skill: 'grammar', category, level, difficulty, tags: ['grammar', ...tags], ...q });
const choice = (category, level, difficulty, tags, question, [correct, ...distractors], explanation) =>
    add(category, level, difficulty, tags, mc({ question, correct, distractors, explanation }));

// ---------------------------------------------------------------- Verb BE
const beExplain = s => `${cap(E.describe(s))} nên động từ 'be' ở hiện tại là '${E.subject(s).be}'.`;

[
    ['My best friend', 'from Soc Trang'],
    ['These shoes', 'very comfortable'],
    ['I', 'nineteen years old'],
    ['Our school', 'near the river'],
    ['The students', 'in the library now'],
    ['Lan and her sister', 'nurses at Can Tho Hospital'],
    ['It', 'cold and windy today'],
    ['The news', 'very interesting today'],
    ['My keys', 'in my backpack'],
    ['You', 'late again!'],
].forEach(([s, rest], i) => {
    const be = E.subject(s).be;
    const note = s === 'The news' ? " Lưu ý: 'news' là danh từ không đếm được (số ít) dù tận cùng bằng -s." : '';
    choice('Verb BE', 'A1', i >= 7 ? 'medium' : 'easy', ['be'],
        `${s} ${BLANK} ${rest}${rest.endsWith('!') ? '' : '.'}`,
        [be, ...['am', 'is', 'are', 'be'].filter(x => x !== be)], beExplain(s) + note);
});

[
    ['My father', "at home now. He's at work"],
    ['These apples', "fresh. Don't eat them"],
    ['I', 'hungry, thanks. I just had lunch'],
    ['The museum', 'open on Mondays, so we can visit it on Tuesday'],
    ['Minh and Huy', "in my class. They're in class 1B"],
].forEach(([s, rest]) => {
    const neg = E.beNeg(s);
    const wrong = s === 'I' ? ["isn't", "don't", 'not'] : [E.wrongBe(s) === 'is' ? "isn't" : "aren't", E.dont(s), 'not'];
    choice('Verb BE', 'A1', 'easy', ['be', 'negative'], `${s} ${BLANK} ${rest}.`, [neg, ...wrong],
        `Câu phủ định với động từ 'be': ${E.describe(s)} → '${neg}'. Không dùng 'don't/doesn't' với 'be'.`);
});

[
    ['your parents', 'teachers'],
    ['this seat', 'free'],
    ['you', 'a new student here'],
    ['the bank', 'open on Saturdays'],
    ['your brothers', 'good at sports'],
].forEach(([s, rest]) => {
    const be = cap(E.subject(s).be);
    choice('Verb BE', 'A1', 'easy', ['be', 'question'], `${BLANK} ${s} ${rest}?`,
        [be, ...['Is', 'Are', 'Am', 'Do', 'Does'].filter(x => x !== be)],
        `Câu hỏi Yes/No với 'be': đảo 'be' lên trước chủ ngữ. ${cap(E.describe(s))} → '${be}'.`);
});

// ---------------------------------------------------------------- Pronouns & Possessives
const P = 'Pronouns & Possessives';
[
    ["Nam has a new laptop. ______ laptop is very fast.", ['His', 'He', 'Him', "He's"], "'Nam' (he) → tính từ sở hữu 'His', đứng trước danh từ 'laptop'."],
    ["My parents love ______ garden. They work in it every weekend.", ['their', 'they', 'them', 'theirs'], "'My parents' (they) → tính từ sở hữu 'their' đứng trước danh từ 'garden'."],
    ["I can't find ______ glasses. Have you seen them?", ['my', 'me', 'mine', 'I'], "Chủ ngữ 'I' → tính từ sở hữu 'my' đứng trước danh từ 'glasses'."],
    ["Linh and I are classmates. ______ teacher is Ms. Hoa.", ['Our', 'We', 'Us', 'Ours'], "'Linh and I' = we → tính từ sở hữu 'Our'."],
    ["Is this ______ phone, Mai? I found it on my desk.", ['your', 'you', 'yours', "you're"], "Nói với Mai (you) → tính từ sở hữu 'your' đứng trước danh từ 'phone'. 'you're' = you are."],
    ["The company changed ______ logo last year.", ['its', "it's", 'it', "its'"], "'The company' (it) → tính từ sở hữu 'its'. 'it's' = it is; không có dạng 'its''."],
    ["This umbrella isn't mine. I think it's Lan's. Yes, it's ______.", ['hers', 'her', 'she', "she's"], "Cuối câu, không có danh từ theo sau → dùng đại từ sở hữu. 'Lan' (she) → 'hers' (= her umbrella)."],
    ["A: Whose books are these? <br>B: They're ______. I bought them yesterday.", ['mine', 'my', 'me', 'I'], "Không có danh từ theo sau → dùng đại từ sở hữu 'mine' (= my books)."],
    ["Our house is small, but ______ is very big. They have five bedrooms.", ['theirs', 'their', 'them', 'they'], "Thay cho 'their house' → đại từ sở hữu 'theirs'."],
    ["Can you help ______? We don't understand this exercise.", ['us', 'we', 'our', 'ours'], "Sau động từ 'help' cần đại từ tân ngữ. 'We' → 'us'."],
    ["Mr. Tuan is a great teacher. All the students like ______.", ['him', 'he', 'his', "he's"], "Sau động từ 'like' cần đại từ tân ngữ. 'Mr. Tuan' (he) → 'him'."],
    ["My grandparents live far away, so I call ______ every Sunday.", ['them', 'they', 'their', 'theirs'], "Sau động từ 'call' cần đại từ tân ngữ. 'My grandparents' (they) → 'them'."],
    ["Lan is waiting for ______ friends at the café.", ['her', 'she', 'hers', "she's"], "'Lan' (she) → tính từ sở hữu 'her' đứng trước danh từ 'friends'."],
    ["______ name is Hoang. I'm from Ben Tre.", ['My', 'I', 'Me', 'Mine'], "Người nói tự giới thiệu (I) → tính từ sở hữu 'My' đứng trước danh từ 'name'."],
    ["Please send the file to Nam and ______.", ['me', 'I', 'my', 'mine'], "Sau giới từ 'to' cần đại từ tân ngữ, kể cả khi đi cùng một danh từ khác: 'to Nam and me'."],
    ["A: Is that your pen? <br>B: No, it isn't ______. It's Huy's.", ['mine', 'my', 'me', 'I'], "Không có danh từ theo sau → đại từ sở hữu 'mine' (= my pen)."],
    ["The dog is hungry. Please give ______ some food.", ['it', 'its', "it's", 'they'], "Con chó (the dog) → đại từ tân ngữ 'it' sau động từ 'give'."],
    ["Hoa and ______ are going to the library after class.", ['I', 'me', 'my', 'mine'], "Vị trí chủ ngữ (trước 'are going') → dùng đại từ chủ ngữ 'I': 'Hoa and I'."],
    ["This is Mr. and Mrs. Lee. ______ son studies at a university in Can Tho.", ['Their', 'They', 'There', 'Theirs'], "'Mr. and Mrs. Lee' (they) → tính từ sở hữu 'Their'. 'There' là trạng từ chỉ nơi chốn (đồng âm)."],
].forEach(([qText, opts, exp], i) =>
    choice(P, 'A1', i >= 14 ? 'medium' : 'easy', ['pronoun'], qText, opts, exp));

// ---------------------------------------------------------------- Simple Present
const SP = 'Simple Present';
[
    ['My grandmother', 'water', 'the plants in her garden every morning'],
    ['Huy', 'watch', 'football on TV every Saturday night'],
    ['The library', 'close', 'at 9 p.m. on weekdays'],
    ['My little brother', 'cry', 'when he is hungry'],
    ['Ms. Hoa', 'teach', 'English at a high school in Can Tho'],
    ['Our English class', 'finish', 'at 11:30'],
    ['My roommates', 'cook', 'dinner together every evening'],
    ['Lan', 'have', 'two younger sisters'],
    ['The bus to Can Tho', 'leave', 'every 30 minutes'],
    ['My father', 'go', 'to work by motorbike'],
    ['Thanh', 'fix', 'computers in a small shop'],
    ['I', 'study', 'at the library on weekends'],
    ['Water', 'boil', 'at 100 degrees Celsius'],
].forEach(([s, v, rest]) => {
    const info = E.subject(s);
    const correct = E.presentForm(s, v);
    const other = info.third ? v : E.sForm(v);
    const exp = info.third
        ? `Thì hiện tại đơn (thói quen, sự thật). ${cap(E.describe(s))} nên động từ ${E.sRule(v)}.`
        : `Thì hiện tại đơn (thói quen, sự thật). ${cap(E.describe(s))} nên động từ giữ nguyên mẫu '${v}'.`;
    const difficulty = info.third && E.sForm(v) !== v + 's' ? 'medium' : 'easy';
    choice(SP, 'A1', difficulty, ['present-simple'], `${s} ${BLANK} ${rest}.`,
        [correct, other, E.ingForm(v), `${info.be} ${v}`], exp);
});

[
    ['My sister', 'like', 'spicy food'],
    ['We', 'have', 'class on Sundays'],
    ['This shop', 'sell', 'phone cards'],
    ['I', 'drink', 'coffee at night'],
    ['Nam', 'live', 'with his parents. He lives in a dormitory'],
].forEach(([s, v, rest]) => {
    const correct = E.dont(s);
    choice(SP, 'A1', 'easy', ['present-simple', 'negative'], `${s} ${BLANK} ${v} ${rest}.`,
        [correct, correct === "don't" ? "doesn't" : "don't", E.beNeg(s), 'not'],
        `Phủ định thì hiện tại đơn với động từ thường: ${E.describe(s)} → '${correct} + V nguyên mẫu'.`);
});

[
    [null, 'you', 'speak', 'Korean'],
    ['Where', 'your sister', 'work', ''],
    ['What time', 'the movie', 'start', ''],
    [null, 'your parents', 'live', 'in Can Tho'],
    ['How often', 'Lan', 'go', 'swimming'],
].forEach(([wh, s, v, rest]) => {
    const aux = E.doAux(s);
    const fmt = x => (wh ? x : cap(x));
    const opts = [aux, aux === 'do' ? 'does' : 'do', 'is', 'are'].map(fmt);
    const qText = `${wh ? wh + ' ' : ''}${BLANK} ${s} ${v}${rest ? ' ' + rest : ''}?`;
    choice(SP, 'A1', 'easy', ['present-simple', 'question'], cap(qText), opts,
        `Câu hỏi thì hiện tại đơn với động từ thường '${v}': ${E.describe(s)} → trợ động từ '${aux}' + S + V nguyên mẫu.`);
});

// ---------------------------------------------------------------- Adverbs of Frequency
const FA = 'Adverbs of Frequency';
[
    ['My father', 'always', 'read', 'the news after breakfast'],
    ['I', 'never', 'eat', 'fast food'],
    ['Linh', 'often', 'go', 'jogging in the park'],
    ['The students', 'usually', 'have', 'lunch in the canteen'],
    ['My mother', 'rarely', 'drink', 'coffee'],
    ['Huy', 'always', 'do', 'his homework before dinner'],
].forEach(([s, adv, v, rest]) => {
    const f = E.presentForm(s, v);
    const other = E.subject(s).third ? v : E.sForm(v);
    choice(FA, 'A1', 'medium', ['frequency-adverb'], `${s} ${BLANK} ${rest}.`,
        [`${adv} ${f}`, `${f} ${adv}`, `${adv} ${other}`, `${E.subject(s).be} ${adv} ${v}`],
        `Trạng từ tần suất '${adv}' đứng TRƯỚC động từ thường. ${cap(E.describe(s))} → '${adv} ${f}'.`);
});

[
    ['My brother', 'always', 'late for school'],
    ['The weather in Can Tho', 'usually', 'hot in April'],
    ['I', 'never', 'tired in the morning'],
    ['Our teachers', 'often', 'busy at the end of the semester'],
].forEach(([s, adv, rest]) => {
    const be = E.subject(s).be;
    const wb = E.wrongBe(s);
    choice(FA, 'A1', 'medium', ['frequency-adverb', 'be'], `${s} ${BLANK} ${rest}.`,
        [`${be} ${adv}`, `${adv} ${be}`, `${wb} ${adv}`, `${adv} ${wb}`],
        `Trạng từ tần suất '${adv}' đứng SAU động từ 'be'. ${cap(E.describe(s))} → '${be} ${adv}'.`);
});

choice(FA, 'A1', 'easy', ['frequency-adverb', 'how-often'],
    "A: How often do you go to the gym? <br>B: ______",
    ['Twice a week.', 'Two weeks ago.', 'For two weeks.', 'In two weeks.'],
    "'How often' hỏi về tần suất → trả lời 'Twice a week' (hai lần mỗi tuần). 'ago' chỉ thời điểm quá khứ, 'for' chỉ khoảng thời gian.");

// ---------------------------------------------------------------- Present Continuous
const PC = 'Present Continuous';
[
    ['Look!', 'The children', 'play', 'in the rain'],
    [null, 'My mother', 'make', 'dinner in the kitchen right now'],
    [null, 'I', 'write', 'an email to my teacher at the moment'],
    ['Be quiet!', 'The baby', 'sleep', ''],
    [null, 'Nam and Huy', 'sit', 'in the café near the school now'],
    [null, 'We', 'plan', 'a surprise party for Lan this week'],
    [null, 'It', 'rain', 'heavily at the moment'],
    ['Look!', 'That man', 'run', 'after the bus'],
].forEach(([pre, s, v, rest]) => {
    const be = E.subject(s).be;
    const correct = `${be} ${E.ingForm(v)}`;
    const qText = `${pre ? pre + ' ' : ''}${s} ${BLANK}${rest ? ' ' + rest : ''}.`;
    const ing = E.ingForm(v);
    const spelling = ing !== v + 'ing' ? ` (chú ý chính tả: ${v} → ${ing})` : '';
    choice(PC, 'A1', spelling ? 'medium' : 'easy', ['present-continuous'], qText,
        [correct, E.presentForm(s, v), `${E.wrongBe(s)} ${ing}`, `${be} ${v}`],
        `Hành động đang diễn ra ngay lúc nói → thì hiện tại tiếp diễn (am/is/are + V-ing). ${cap(E.describe(s))} → '${correct}'${spelling}.`);
});

[
    ['Lan', 'watch', 'TV now. She is studying'],
    ['I', 'use', 'the computer at the moment. You can use it'],
    ['The students', 'listen', 'to the teacher. They are talking'],
    ['My phone', 'work', 'properly today'],
].forEach(([s, v, rest]) => {
    const neg = `${E.beNeg(s)} ${E.ingForm(v)}`;
    const wrongNeg = s === 'I' ? "isn't" : (E.wrongBe(s) === 'is' ? "isn't" : "aren't");
    choice(PC, 'A1', 'easy', ['present-continuous', 'negative'], `${s} ${BLANK} ${rest}.`,
        [neg, `${E.beNeg(s)} ${v}`, `${wrongNeg} ${E.ingForm(v)}`, `not ${E.ingForm(v)}`],
        `Phủ định thì hiện tại tiếp diễn: S + am/is/are + not + V-ing. ${cap(E.describe(s))} → '${neg}'.`);
});

[
    [null, 'you', 'wait', 'for the bus'],
    ['What', 'your brother', 'do', 'now'],
    ['Why', 'they', 'laugh', ''],
    ['Where', 'Lan', 'go', 'right now'],
].forEach(([wh, s, v, rest]) => {
    const be = E.subject(s).be;
    const fmt = x => (wh ? x : cap(x));
    const qText = `${wh ? wh + ' ' : ''}${BLANK} ${s} ${E.ingForm(v)}${rest ? ' ' + rest : ''}?`;
    choice(PC, 'A1', 'easy', ['present-continuous', 'question'], cap(qText),
        [be, be === 'is' ? 'are' : 'is', 'does', 'do'].map(fmt),
        `Câu hỏi thì hiện tại tiếp diễn: (Wh-) + am/is/are + S + V-ing? ${cap(E.describe(s))} → '${be}'.`);
});

[
    ['I', 'need', 'some help with my homework right now'],
    ['Hoa', 'want', 'a cup of tea right now'],
    ['Lan', 'understand', 'the new lesson now'],
].forEach(([s, v, rest]) => {
    const f = E.presentForm(s, v);
    choice(PC, 'A2', 'hard', ['stative-verb'], `${s} ${BLANK} ${rest}.`,
        [f, `${E.subject(s).be} ${E.ingForm(v)}`, E.ingForm(v), `${E.wrongBe(s)} ${E.ingForm(v)}`],
        `'${v}' là động từ chỉ trạng thái (stative verb) nên KHÔNG chia tiếp diễn dù có 'now/right now'. ${cap(E.describe(s))} → '${f}'.`);
});

// ---------------------------------------------------------------- Simple Past
const PS = 'Simple Past';
[
    ['We', 'visit', 'our grandparents in Vinh Long last weekend'],
    ['Nam', 'buy', 'a new motorbike two months ago'],
    ['I', 'see', 'a great movie at the cinema last night'],
    ['My sister', 'study', 'Japanese in 2022'],
    ['The train', 'arrive', 'late yesterday morning'],
    ['Lan', 'lose', 'her student ID card last week'],
    ['They', 'stop', 'at a small café on the way home yesterday'],
    ['Our teacher', 'give', 'us a lot of homework last Friday'],
    ['I', 'take', 'a lot of photos during my trip to Da Lat last summer'],
    ['My parents', 'get married', 'in 1998'],
].forEach(([s, v, rest]) => {
    const past = E.pastForm(v);
    const pp = E.ppForm(v);
    const distractors = [v, E.sForm(v), E.ingForm(v)];
    if (pp !== past) distractors.unshift(pp);
    choice(PS, 'A2', E.isIrregular(v) ? 'medium' : 'easy', ['past-simple'], `${s} ${BLANK} ${rest}.`,
        [past, ...distractors.slice(0, 3)],
        `Hành động đã kết thúc trong quá khứ (có mốc thời gian quá khứ) → thì quá khứ đơn. ${cap(E.pastRule(v))}.`);
});

[
    ['My grandfather', 'a farmer when he was young'],
    ['The tickets', 'very expensive last year'],
    ['I', 'sick yesterday, so I stayed home'],
    ['Huy and his brother', 'at the stadium last night'],
    ['The weather', 'terrible during our trip'],
].forEach(([s, rest]) => {
    const was = E.subject(s).was;
    choice(PS, 'A2', 'easy', ['past-simple', 'was-were'], `${s} ${BLANK} ${rest}.`,
        [was, E.wrongWas(s), E.subject(s).be, 'did'],
        `Động từ 'be' ở quá khứ đơn: ${E.describe(s)} → '${was}'.`);
});

[
    ['I', 'finish', 'my homework last night'],
    ['Lan', 'go', 'to class yesterday because she was sick'],
    ['We', 'have', 'time to eat breakfast this morning'],
    ['The bakery', 'sell', 'any cakes yesterday'],
    ['My brother', 'pass', 'the driving test last month'],
].forEach(([s, v, rest]) => {
    choice(PS, 'A2', 'easy', ['past-simple', 'negative'], `${s} ${BLANK} ${rest}.`,
        [`didn't ${v}`, `didn't ${E.pastForm(v)}`, `${E.dont(s)} ${v}`, `${E.wasNeg(s)} ${v}`],
        `Phủ định quá khứ đơn: S + didn't + V nguyên mẫu (cho mọi ngôi) → 'didn't ${v}'.`);
});

[
    [null, 'you', 'enjoy', 'the party last night'],
    ['Where', 'Nam', 'buy', 'that jacket'],
    ['What time', 'you', 'get up', 'this morning'],
    ['How', 'they', 'travel', 'to Phu Quoc last summer'],
    ['Who', 'you', 'meet', 'at the conference yesterday'],
].forEach(([wh, s, v, rest]) => {
    const fmt = x => (wh ? x : cap(x));
    const qText = `${wh ? wh + ' ' : ''}${BLANK} ${s} ${v} ${rest}?`;
    choice(PS, 'A2', 'easy', ['past-simple', 'question'], cap(qText),
        ['did', 'do', 'does', E.subject(s).was].map(fmt),
        `Câu hỏi quá khứ đơn với động từ thường: (Wh-) + did + S + V nguyên mẫu? → 'did'.`);
});

// ---------------------------------------------------------------- Future
const FU = 'Future';
[
    ['I', 'visit', 'my aunt in Hanoi next month'],
    ['My cousins', 'stay', 'with us this weekend'],
    ['Lan', 'start', 'a new job in June'],
    ['We', 'have', 'a test next Friday'],
    ['It', 'be', 'very hot tomorrow, according to the weather forecast'],
    ['Nam', 'buy', 'a new laptop next week'],
].forEach(([s, v, rest]) => {
    const be = E.subject(s).be;
    choice(FU, 'A2', 'easy', ['going-to'], `${s} ${BLANK} ${v} ${rest}.`,
        [`${be} going to`, `${E.wrongBe(s)} going to`, 'going to', 'will going to'],
        `Kế hoạch/dự đoán tương lai: S + am/is/are + going to + V. ${cap(E.describe(s))} → '${be} going to'.`);
});

[
    ["A: The phone is ringing. <br>B: OK, I ______ answer it.", ["'ll", 'am going', 'answer', 'am answering'], "Quyết định ngay tại thời điểm nói (không có kế hoạch trước) → dùng 'will' ('ll)."],
    ["I think Vietnam ______ win the match tomorrow.", ['will', 'is', 'does', 'won'], "Dự đoán dựa trên ý kiến cá nhân ('I think') → 'will + V nguyên mẫu'."],
    ["We've already bought the tickets. We ______ visit Da Lat next week.", ['are going to', 'visited', 'were', 'have'], "Kế hoạch đã được chuẩn bị trước (đã mua vé) → 'be going to + V'."],
    ["A: I'm thirsty. <br>B: Wait, I ______ get you some water.", ["'ll", 'got', 'getting', "'m get"], "Lời đề nghị/quyết định tức thì khi nghe người khác nói → 'will' ('ll) + V nguyên mẫu."],
    ["Perhaps it ______ be sunny tomorrow.", ['will', 'is', 'was', 'has'], "Dự đoán không chắc chắn với 'perhaps' → 'will + V nguyên mẫu'."],
    ["Don't worry. I ______ tell anyone your secret.", ["won't", 'am not', "don't", "didn't"], "Lời hứa trong tương lai → 'will not' = 'won't' + V nguyên mẫu."],
    ["My sister ______ have a baby next month. She's very excited.", ['is going to', 'will going to', 'has', 'had'], "Sự việc tương lai đã có dấu hiệu chắc chắn ở hiện tại → 'be going to'. Không có dạng 'will going to'."],
    ["I think it will ______ tomorrow.", ['rain', 'to rain', 'raining', 'rains'], "Sau 'will' luôn là động từ nguyên mẫu không 'to' → 'will rain'."],
    ["Don't worry. Your parents will ______ the problem.", ['understand', 'to understand', 'understanding', 'understands'], "Sau 'will' là động từ nguyên mẫu → 'will understand'."],
    ["The new shopping mall will ______ next year.", ['open', 'opens', 'opening', 'to open'], "Sau 'will' là động từ nguyên mẫu → 'will open'."],
    ["A: Will you come to my party? <br>B: Yes, I ______.", ['will', 'do', 'am', 'come'], "Câu hỏi 'Will you...?' → trả lời ngắn 'Yes, I will' / 'No, I won't'."],
].forEach(([qText, opts, exp]) => choice(FU, 'A2', 'medium', ['will'], qText, opts, exp));

// ---------------------------------------------------------------- Modal Verbs
const MV = 'Modal Verbs';
[
    ['A1', "I ______ speak Japanese. I never studied it.", ["can't", 'can', 'must', 'should'], "Ngữ cảnh 'chưa từng học' → không có khả năng nói → 'can't'."],
    ['A2', "My grandfather ______ ride a bike when he was young, but now he can't.", ['could', 'can', 'should', 'must'], "Khả năng trong quá khứ ('when he was young') → 'could'."],
    ['A2', "It's very cold outside. You ______ wear a warm coat.", ['should', "shouldn't", "can't", "don't have to"], "Đưa ra lời khuyên phù hợp với ngữ cảnh trời lạnh → 'should wear a warm coat'."],
    ['A2', "You ______ smoke in the hospital. It's not allowed.", ["mustn't", "don't have to", 'should', 'can'], "'It's not allowed' (bị cấm) → 'mustn't' (không được phép). 'don't have to' = không cần thiết."],
    ['A2', "Tomorrow is Sunday, so I ______ get up early.", ["don't have to", "mustn't", 'have to', "can't"], "Chủ nhật được nghỉ → không cần thiết phải dậy sớm → 'don't have to'."],
    ['A1', "______ I borrow your pen, please?", ['Can', 'Should', 'Must', 'Do'], "Xin phép làm gì → 'Can I ...?'."],
    ['A2', "______ you help me with my homework, please?", ['Could', 'Should', 'Must', 'Are'], "Nhờ ai đó làm gì một cách lịch sự → 'Could you ..., please?'."],
    ['A2', "Drivers ______ stop when the traffic light is red.", ['must', 'can', "don't have to", 'could'], "Quy định bắt buộc (luật giao thông) → 'must'."],
    ['A2', "You ______ eat so much fast food. It's bad for your health.", ["shouldn't", 'should', 'have to', 'can'], "Lời khuyên không nên làm gì (vì có hại cho sức khỏe) → 'shouldn't'."],
    ['A1', "A: Can you swim? <br>B: No, I ______.", ["can't", "don't", "couldn't", "am not"], "Câu hỏi với 'Can you...?' → trả lời ngắn 'No, I can't'."],
    ['A2', "A: Do you have to wear a uniform at school? <br>B: Yes, we ______.", ['do', 'have', 'are', 'must'], "Câu hỏi 'Do you have to...?' dùng trợ động từ 'do' → trả lời ngắn 'Yes, we do'."],
    ['A2', "She has a bad toothache. She ______ see a dentist.", ['should', "shouldn't", "can't", "couldn't"], "Đưa ra lời khuyên (bị đau răng → nên đi nha sĩ) → 'should'."],
    ['A2', "Students ______ use their phones during the exam.", ["mustn't", 'must', 'should', 'have to'], "Quy định cấm trong phòng thi → 'mustn't' (không được phép)."],
    ['A2', "I'm sorry, I ______ come to your party yesterday. I was sick.", ["couldn't", "can't", "mustn't", "shouldn't"], "Không thể làm gì trong quá khứ ('yesterday') → 'couldn't'."],
    ['A1', "Lan ______ play the piano very well. She practices every day.", ['can', "can't", 'must', 'has'], "Diễn tả khả năng (chơi piano rất giỏi) → 'can + V nguyên mẫu'."],
    ['A2', "We ______ hurry. The class starts in five minutes.", ['have to', "don't have to", "can't", "shouldn't"], "Sự cần thiết bắt buộc do hoàn cảnh (lớp sắp bắt đầu) → 'have to'."],
    ['A2', "You ______ bring your passport. They will check it at the airport.", ['have to', "don't have to", "can't", "shouldn't"], "Bắt buộc phải mang hộ chiếu (sân bay sẽ kiểm tra) → 'have to'."],
    ['A2', "Lisa ______ work on Saturdays. She only works from Monday to Friday.", ["doesn't have to", 'has to', 'must', 'should'], "Không cần thiết phải làm vào thứ Bảy → 'doesn't have to' (chủ ngữ số ít 'Lisa')."],
    ['A2', "A: What ______ I do to improve my English? <br>B: You should read more.", ['should', "mustn't", 'does', "can't"], "Hỏi xin lời khuyên → 'What should I do...?'. Câu trả lời cũng dùng 'should'."],
    ['A1', "______ I open the window? It's very hot in here.", ['Can', 'Do', 'Am', 'Have'], "Xin phép làm gì → 'Can I + V nguyên mẫu?'."],
    ['A1', "My little sister can ______ to ten in English.", ['count', 'to count', 'counts', 'counting'], "Sau động từ khuyết thiếu 'can' là động từ nguyên mẫu không 'to' → 'can count'."],
].forEach(([level, qText, opts, exp]) => choice(MV, level, 'medium', ['modal'], qText, opts, exp));

// ---------------------------------------------------------------- Quantifiers & Nouns
const QN = 'Quantifiers & Nouns';
[
    ['A1', "______ two banks and a post office on my street.", ['There are', 'There is', 'It is', 'They are'], "Danh từ đầu tiên sau 'there' là 'two banks' (số nhiều) → 'There are'."],
    ['A1', "______ some milk in the fridge.", ['There is', 'There are', 'It has', 'They are'], "'milk' là danh từ không đếm được → 'There is'."],
    ['A1', "______ any good restaurants near your school?", ['Are there', 'Is there', 'There are', 'Have there'], "Câu hỏi với danh từ số nhiều 'restaurants' → 'Are there ...?'."],
    ['A1', "There ______ much traffic on Sundays.", ["isn't", "aren't", "don't", "doesn't"], "'traffic' là danh từ không đếm được → phủ định 'There isn't'."],
    ['A1', "How many students ______ in your class?", ['are there', 'is there', 'there are', 'there is'], "Câu hỏi 'How many + danh từ số nhiều' → '... are there?'."],
    ['A1', "How ______ money do you need for the trip?", ['much', 'many', 'a few', 'a lot'], "'money' là danh từ không đếm được → 'How much'."],
    ['A1', "There aren't ______ students in the classroom today.", ['many', 'much', 'a little', 'a lot'], "'students' là danh từ đếm được số nhiều, câu phủ định → 'many'."],
    ['A1', "I don't have ______ free time on weekdays.", ['much', 'many', 'a few', 'few'], "'time' (thời gian) là danh từ không đếm được, câu phủ định → 'much'."],
    ['A1', "How ______ languages can you speak?", ['many', 'much', 'a little', 'a lot'], "'languages' là danh từ đếm được số nhiều → 'How many'."],
    ['A1', "There isn't ______ rice left. We need to buy some.", ['much', 'many', 'a few', 'few'], "'rice' là danh từ không đếm được → 'much'."],
    ['A1', "Would you like ______ orange juice?", ['some', 'any', 'a', 'many'], "Trong lời mời (Would you like...?) ta dùng 'some' dù là câu hỏi."],
    ['A1', "I didn't buy ______ bread at the bakery.", ['any', 'some', 'a', 'many'], "Câu phủ định (didn't) + danh từ không đếm được 'bread' → 'any'."],
    ['A1', "There are ______ new students in our class this semester.", ['some', 'any', 'much', 'a'], "Câu khẳng định + danh từ số nhiều → 'some'."],
    ['A1', "Do you have ______ questions about the homework?", ['any', 'much', 'a', 'an'], "Câu hỏi + danh từ đếm được số nhiều 'questions' → 'any'."],
    ['A1', "Can I have ______ water, please? I'm thirsty.", ['some', 'any', 'many', 'a'], "Lời yêu cầu (Can I have...?) dùng 'some'. 'water' không đếm được nên không dùng 'a/many'."],
    ['A2', "I have ______ friends in Hanoi, so I'm not lonely there.", ['a few', 'a little', 'much', 'a lot'], "'friends' là danh từ đếm được số nhiều → 'a few' (một vài)."],
    ['A2', "Please add ______ sugar to my coffee.", ['a little', 'a few', 'many', 'few'], "'sugar' là danh từ không đếm được → 'a little' (một chút)."],
    ['A2', "There are only ______ tickets left for the concert.", ['a few', 'a little', 'much', 'little'], "'tickets' là danh từ đếm được số nhiều → 'a few'."],
    ['A2', "We have ______ time before the bus leaves. Let's buy a drink.", ['a little', 'a few', 'many', 'few'], "'time' không đếm được; ngữ cảnh 'còn chút thời gian để mua nước' → 'a little'."],
    ['A2', "I'm hungry. I want ______ to eat.", ['something', 'anything', 'nothing', 'anyone'], "Câu khẳng định, nói về đồ vật → 'something' (một thứ gì đó)."],
    ['A2', "I didn't buy ______ at the market this morning.", ['anything', 'something', 'nothing', 'nobody'], "Câu phủ định (didn't) + đồ vật → 'anything'. Không dùng 'nothing' vì câu đã có 'not'."],
    ['A2', "______ called you while you were out. I don't know who it was.", ['Someone', 'Anyone', 'Anything', 'Something'], "Câu khẳng định, chỉ một người không xác định → 'Someone' (một người nào đó)."],
].forEach(([level, qText, opts, exp]) => choice(QN, level, 'medium', ['quantifier'], qText, opts, exp));

// ---------------------------------------------------------------- Articles
[
    ["Don't forget to take ______ umbrella. It's raining.", ['an', 'a', 'some', 'any'], "'umbrella' bắt đầu bằng nguyên âm /ʌ/ → 'an'."],
    ["My uncle is ______ engineer at a big company.", ['an', 'a', 'some', 'any'], "Nghề nghiệp dùng a/an; 'engineer' bắt đầu bằng nguyên âm /e/ → 'an'."],
    ["The movie is about ______ hour long.", ['an', 'a', 'some', 'any'], "'hour' có chữ 'h' câm, phát âm bắt đầu bằng nguyên âm /aʊ/ → 'an'."],
    ["Students at my school have to wear ______ uniform.", ['a', 'an', 'some', 'any'], "'uniform' viết bằng 'u' nhưng phát âm /juː/ (phụ âm /j/) → 'a'."],
    ["France is ______ European country.", ['a', 'an', 'some', 'any'], "'European' phát âm /jʊə/ (phụ âm /j/) → 'a'."],
    ["I'd like ______ one-way ticket to Da Nang, please.", ['a', 'an', 'some', 'any'], "'one' phát âm /wʌn/ (phụ âm /w/) → 'a'."],
    ["My brother is ______ IT student at a university in Can Tho.", ['an', 'a', 'some', 'any'], "'IT' đọc là /aɪ tiː/, bắt đầu bằng nguyên âm → 'an'."],
    ["He is ______ honest man. He never tells lies.", ['an', 'a', 'some', 'any'], "'honest' có chữ 'h' câm, phát âm /ˈɒnɪst/ → 'an'."],
    ["Look at ______ moon! It's so bright tonight.", ['the', 'a', 'an', 'some'], "Vật duy nhất (mặt trăng) → dùng 'the'."],
    ["I have a cat and a dog. ______ cat is black and the dog is white.", ['The', 'A', 'An', 'Some'], "Danh từ đã được nhắc đến lần trước ('a cat') → lần sau dùng 'the'."],
    ["Is there ______ bank near here?", ['a', 'an', 'the', 'any'], "'There is' + danh từ đếm được số ít chưa xác định → 'a bank'. 'bank' bắt đầu bằng phụ âm."],
].forEach(([qText, opts, exp], i) => choice('Articles', 'A1', i >= 8 ? 'medium' : 'easy', ['article'], qText, opts, exp));

// ---------------------------------------------------------------- Prepositions
const PLACE_RULE = {
    in: "'in' dùng cho không gian bao quanh/khép kín (trong tủ, trong túi) và thành phố, quốc gia",
    on: "'on' dùng cho bề mặt (trên bàn, trên tường, trên sàn), tầng nhà, tên đường, phương tiện công cộng (on the bus) và TV",
    at: "'at' dùng cho một điểm/địa điểm cụ thể (at the bus stop, at home, at work, at the door)",
};
[
    ["My phone is ______ my bag.", ['in', 'on', 'at', 'to']],
    ["She lives ______ Can Tho with her family.", ['in', 'at', 'on', 'to']],
    ["There is a big clock ______ the wall.", ['on', 'in', 'at', 'to']],
    ["Our classroom is ______ the third floor.", ['on', 'in', 'at', 'to']],
    ["The bank is ______ Tran Hung Dao Street.", ['on', 'at', 'to', 'of']],
    ["He is ______ the bus now, so he can't talk.", ['on', 'at', 'to', 'of']],
    ["She is waiting for me ______ the bus stop.", ['at', 'on', 'to', 'of']],
    ["Is anyone ______ home right now?", ['at', 'in', 'on', 'to']],
    ["My father is ______ work, so he can't answer the phone.", ['at', 'in', 'on', 'to']],
    ["The children are sitting ______ the floor.", ['on', 'in', 'at', 'to']],
    ["I usually watch the news ______ TV.", ['on', 'in', 'at', 'by']],
].forEach(([qText, opts]) => choice('Prepositions', 'A1', 'easy', ['preposition', 'place'], qText, opts,
    `${PLACE_RULE[opts[0]]} → chọn '${opts[0]}'.`));

[
    ["My family arrived ______ Ho Chi Minh City last night.", ['in', 'at', 'to', 'on'], "'arrive in' + thành phố/quốc gia; 'arrive at' + địa điểm nhỏ cụ thể. Không dùng 'arrive to'."],
    ["The bank is ______ the post office and the café.", ['between', 'next', 'among', 'behind'], "Cấu trúc 'between A and B' (ở giữa A và B)."],
    ["I usually go to school ______ bus.", ['by', 'on', 'in', 'with'], "Phương tiện đi lại: 'by + phương tiện' (không có mạo từ): by bus, by car."],
    ["She goes to work ______ foot because she lives very near.", ['on', 'by', 'in', 'at'], "Đi bộ là trường hợp đặc biệt: 'on foot' (không dùng 'by foot')."],
    ["I was born ______ 2006.", ['in', 'on', 'at', 'since'], "'in' dùng với năm (in 2006), tháng, mùa."],
    ["We have a holiday ______ September 2nd.", ['on', 'in', 'at', 'by'], "'on' dùng với ngày tháng cụ thể (on September 2nd)."],
    ["The shop is open ______ 9 a.m. ______ 9 p.m.", ['from / to', 'at / in', 'on / at', 'since / for'], "Cấu trúc 'from ... to ...' (từ ... đến ...) chỉ khoảng thời gian."],
    ["My birthday is ______ October.", ['in', 'on', 'at', 'by'], "'in' dùng với tháng (in October). Có ngày cụ thể thì dùng 'on' (on October 20th)."],
].forEach(([qText, opts, exp]) => choice('Prepositions', 'A1', 'medium', ['preposition'], qText, opts, exp));

// ---------------------------------------------------------------- Would Like
[
    ["A: Would you like some coffee? <br>B: ______", ['Yes, please.', 'Yes, I like.', 'Yes, I would like.', 'Yes, I do.'], "Đáp lại lời mời 'Would you like...?' một cách lịch sự: 'Yes, please.' hoặc 'No, thank you.'"],
    ["I ______ a cup of tea, please.", ["'d like", 'like', 'am like', 'liking'], "Khi gọi món/yêu cầu lịch sự dùng 'I'd like (= I would like) + danh từ'."],
    ["______ you like a sandwich?", ['Would', 'Do', 'Are', 'Will'], "Lời mời lịch sự: 'Would you like + danh từ?'."],
    ["What would you like ______ for dinner tonight?", ['to eat', 'eat', 'eating', 'eats'], "Cấu trúc 'would like + to + V nguyên mẫu' → 'to eat'."],
    ["She'd like ______ a doctor in the future.", ['to become', 'become', 'becoming', 'becomes'], "'She'd like' = She would like → theo sau là 'to + V nguyên mẫu': 'to become'."],
].forEach(([qText, opts, exp]) => choice('Would Like', 'A1', 'easy', ['would-like'], qText, opts, exp));

// ---------------------------------------------------------------- Comparatives & Superlatives
const compExplain = (base, comp) => {
    if (comp === 'better' || comp === 'worse') return `'${base}' là tính từ bất quy tắc: ${base} → ${comp}.`;
    if (comp.startsWith('more ')) return `So sánh hơn với tính từ dài '${base}' → '${comp} than'.`;
    if (comp.endsWith('ier')) return `Tính từ ngắn tận cùng -y → đổi y thành i rồi thêm -er: '${comp}'.`;
    if (comp.length === base.length + 3) return `Tính từ ngắn tận cùng phụ âm-nguyên âm-phụ âm → gấp đôi phụ âm cuối rồi thêm -er: '${comp}'.`;
    return `Tính từ ngắn '${base}' → thêm -er/-r: '${comp}' (có 'than' → so sánh hơn).`;
};
[
    ['Can Tho', 'big', 'Vinh Long', 'bigger', 'biggest'],
    ['My new phone', 'expensive', 'my old one', 'more expensive', 'most expensive'],
    ['Today', 'hot', 'yesterday', 'hotter', 'hottest'],
    ['Math', 'easy', 'English for me', 'easier', 'easiest'],
    ['This hotel', 'good', 'the hotel we stayed at last year', 'better', 'best'],
    ['The traffic in Ho Chi Minh City', 'bad', 'the traffic in Can Tho', 'worse', 'worst'],
    ['My sister', 'tall', 'me', 'taller', 'tallest'],
    ['Living in the city', 'interesting', 'living in the countryside', 'more interesting', 'most interesting'],
    ['A plane', 'fast', 'a train', 'faster', 'fastest'],
    ['This exercise', 'difficult', 'the last one', 'more difficult', 'most difficult'],
    ['My grandfather', 'old', 'my grandmother', 'older', 'oldest'],
    ['The weather in Da Lat', 'cool', 'the weather in Can Tho', 'cooler', 'coolest'],
].forEach(([a, base, b, comp, sup]) => {
    const long = comp.startsWith('more ');
    const irregular = comp === 'better' || comp === 'worse';
    const distractors = long ? [sup, `${base}er`, base]
        : irregular ? [sup, `${base}er`, `more ${base}`]
            : [sup, `more ${base}`, base, `more ${comp}`];
    choice('Comparatives', 'A2', irregular ? 'medium' : 'easy', ['comparative'], `${a} is ${BLANK} than ${b}.`,
        [comp, ...distractors], compExplain(base, comp));
});

[
    ["Mount Everest is ______ mountain in the world.", 'high', 'higher', 'highest'],
    ["This is ______ restaurant in our neighborhood. Everyone loves it.", 'popular', 'more popular', 'most popular'],
    ["Lan is ______ student in our class. She is only 17.", 'young', 'younger', 'youngest'],
    ["That was ______ day of my life! I lost my wallet and my phone.", 'bad', 'worse', 'worst'],
    ["August is usually ______ month of the year here.", 'hot', 'hotter', 'hottest'],
    ["Ho Chi Minh City is ______ city in Vietnam.", 'large', 'larger', 'largest'],
    ["Who is ______ singer in your country?", 'famous', 'more famous', 'most famous'],
    ["This is ______ question on the test. Nobody got it right.", 'difficult', 'more difficult', 'most difficult'],
    ["My grandmother makes ______ spring rolls in the world!", 'good', 'better', 'best'],
].forEach(([qText, base, comp, sup]) => {
    const long = sup.startsWith('most ');
    const wrongSup = long ? `the ${base}est` : `the most ${base}`;
    const why = long ? `tính từ dài '${base}' → 'the most ${base}'`
        : (sup === 'best' || sup === 'worst') ? `'${base}' là tính từ bất quy tắc: ${base} → ${comp} → ${sup}`
            : `tính từ ngắn '${base}' → 'the ${sup}'`;
    choice('Superlatives', 'A2', 'easy', ['superlative'], qText,
        [`the ${sup}`, `the ${comp}`, wrongSup, sup],
        `So sánh nhất (so với cả nhóm: 'in the world/in our class...'): ${why}.`);
});

// ---------------------------------------------------------------- Questions & Negatives
const WH = {
    'What': 'hỏi về sự vật/thông tin (cái gì)', 'Where': 'hỏi về nơi chốn (ở đâu)',
    'When': 'hỏi về thời gian, ngày tháng (khi nào)', 'What time': 'hỏi về giờ cụ thể (mấy giờ)',
    'Who': 'hỏi về người (ai)', 'Whose': 'hỏi về sự sở hữu (của ai)', 'How': 'hỏi về tình trạng, cách thức (như thế nào)',
    'How old': 'hỏi về tuổi', 'How many': 'hỏi về số lượng với danh từ đếm được',
};
[
    ["A: ______ is your name? <br>B: My name is Lan.", ['What', 'Where', 'Who', 'How']],
    ["A: ______ is your brother? <br>B: He's nineteen.", ['How old', 'How', 'What', 'How many']],
    ["A: ______ is your English class? <br>B: It's on Monday and Wednesday.", ['When', 'Where', 'What', 'Who']],
    ["A: ______ is it? <br>B: It's half past seven.", ['What time', 'When', 'How', 'Who']],
    ["A: ______ is that woman? <br>B: She's my English teacher.", ['Who', 'Whose', 'What', 'Where']],
    ["A: ______ laptop is this? <br>B: It's Minh's.", ['Whose', 'Who', "Who's", 'What']],
    ["A: ______ is your job? <br>B: I'm a nurse.", ['What', 'Who', 'Where', 'How']],
    ["A: ______ is the bank? <br>B: It's next to the post office.", ['Where', 'What', 'When', 'Who']],
    ["A: ______ is your birthday? <br>B: It's on June 5th.", ['When', 'Where', 'Who', 'How']],
    ["A: ______ are your parents? <br>B: They're both fifty.", ['How old', 'How', 'Who', 'When']],
    ["A: ______ is your favorite subject? <br>B: It's English.", ['What', 'Who', 'How', 'Where']],
    ["A: ______ are your best friends? <br>B: Nam and Huy.", ['Who', 'What', 'Whose', 'Where']],
    ["A: ______ is your classroom? <br>B: It's on the third floor.", ['Where', 'What', 'When', 'How']],
    ["A: ______ do you spell your last name? <br>B: N-G-U-Y-E-N.", ['How', 'What', 'Who', 'Where']],
    ["A: ______ brothers and sisters do you have? <br>B: Two brothers.", ['How many', 'How old', 'What', 'Who']],
    ["A: ______ is your phone number? <br>B: It's 0901 234 567.", ['What', 'How', 'Who', 'Where']],
    ["A: ______ is your next class? <br>B: It's at 9:30.", ['What time', 'Where', 'Who', 'How']],
    ["A: ______ backpack is that? <br>B: It's my sister's.", ['Whose', 'Who', "Who's", 'Where']],
].forEach(([qText, opts]) => {
    const answerText = qText.split('B: ')[1];
    choice('Questions & Negatives', 'A1', 'easy', ['wh-question'], qText, opts,
        `Câu trả lời '${answerText}' ${WH[opts[0]]} → dùng '${opts[0]}'.`);
});

// ---------------------------------------------------------------- Mixed Tenses (ôn tập A1–A2)
[
    ["Lan usually ______ to school, but today she is taking a taxi.", ['walks', 'is walking', 'walked', 'walk'], "'usually' chỉ thói quen → hiện tại đơn; chủ ngữ 'Lan' số ít → 'walks'. Vế sau 'today' mới dùng hiện tại tiếp diễn."],
    ["Look! Nam ______ his bike in the rain.", ['is riding', 'rides', 'rode', 'ride'], "'Look!' → hành động đang diễn ra → hiện tại tiếp diễn 'is riding'."],
    ["I ______ my keys yesterday, so I couldn't get into my room.", ['lost', 'lose', 'am losing', 'will lose'], "'yesterday' → quá khứ đơn; 'lose' là động từ bất quy tắc → 'lost'."],
    ["We ______ to Da Lat next weekend. We've already booked the hotel.", ['are going to travel', 'traveled', 'travel', 'travels'], "Kế hoạch tương lai đã chuẩn bị (đã đặt khách sạn) → 'are going to travel'."],
    ["A: What ______ you do last weekend? <br>B: I visited my grandparents.", ['did', 'do', 'are', 'were'], "'last weekend' → câu hỏi quá khứ đơn với động từ thường 'do' → trợ động từ 'did'."],
    ["My father ______ coffee every morning, but he isn't drinking it today because he is sick.", ['drinks', 'is drinking', 'drank', 'drink'], "'every morning' → thói quen → hiện tại đơn; chủ ngữ số ít → 'drinks'."],
    ["They ______ in Hue in 2019. Now they live in Can Tho.", ['lived', 'live', 'are living', 'will live'], "'in 2019' (mốc quá khứ) → quá khứ đơn 'lived'."],
    ["I can't come to the party tomorrow. I ______ my grandmother in the hospital.", ["'m going to visit", 'visited', 'visit', 'visits'], "Kế hoạch đã định cho ngày mai → 'be going to + V': 'I'm going to visit'."],
    ["When I was a child, I ______ milk every morning.", ['drank', 'drink', 'am drinking', 'will drink'], "'When I was a child' → thói quen trong quá khứ → quá khứ đơn 'drank'."],
    ["Where ______ you yesterday afternoon? I called you three times.", ['were', 'are', 'did', 'was'], "'yesterday afternoon' → quá khứ của 'be'; chủ ngữ 'you' → 'were'."],
    ["Nam ______ football on Saturdays. It's his favorite hobby.", ['plays', 'is playing', 'played', 'play'], "'on Saturdays' (mỗi thứ Bảy) + 'It's his favorite hobby' → thói quen hiện tại → 'plays'."],
    ["A: Are you free tonight? <br>B: Sorry, I ______ dinner with my family.", ["'m having", 'had', 'has', 'have had'], "Kế hoạch đã sắp xếp cho tối nay → có thể dùng hiện tại tiếp diễn 'I'm having'."],
    ["Yesterday, it ______ all day, so we stayed at home.", ['rained', 'rains', 'is raining', 'will rain'], "'Yesterday' → quá khứ đơn 'rained'."],
    ["My brother ______ a new job last month and he loves it.", ['got', 'gets', 'is getting', 'will get'], "'last month' → quá khứ đơn; 'get' bất quy tắc → 'got'."],
].forEach(([qText, opts, exp]) => choice('Mixed Tenses', 'A1-A2', 'hard', ['mixed-tenses'], qText, opts, exp));

module.exports = items;
