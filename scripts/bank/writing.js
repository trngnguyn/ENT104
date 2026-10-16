'use strict';

const { mc, orderWords, orderLines } = require('../lib/builders');

const items = [];
const harder = difficulty => difficulty === 'easy' ? 'medium' : difficulty;
const push = (category, level, difficulty, tags, q) =>
    items.push({ skill: 'writing', category, level, difficulty: harder(difficulty), tags: ['writing', ...tags], ...q });

// ---------------------------------------------------------------- Sắp xếp từ thành câu
// Mỗi mẫu câu đi kèm các hoán vị (theo chỉ số cụm từ) chắc chắn sai ngữ pháp.
const PATTERNS = {
    // chủ ngữ + trạng từ tần suất + động từ + tân ngữ + thời gian
    freq: { wrong: [[0, 2, 1, 3, 4], [2, 0, 1, 3, 4], [0, 1, 3, 2, 4]], tags: ['frequency-adverb'],
        explain: "Trạng từ tần suất đứng sau chủ ngữ và trước động từ thường: S + adv + V + O." },
    freqBe: { wrong: [[0, 3, 1, 2, 4], [0, 1, 4, 2, 3], [3, 0, 1, 2, 4]], tags: ['frequency-adverb', 'be'],
        explain: "Trạng từ tần suất đứng sau động từ 'be': S + be + adv + adj." },
    svo: { wrong: [[0, 2, 1, 3], [1, 0, 2, 3], [0, 1, 3, 2]], tags: ['svo'],
        explain: "Trật tự câu cơ bản: Chủ ngữ + Động từ + Tân ngữ + Thời gian/Cách thức." },
    wh: { wrong: [[0, 2, 1, 3], [1, 0, 2, 3], [0, 1, 3, 2]], tags: ['wh-question'], end: '?',
        explain: "Câu hỏi có từ để hỏi: Wh- + trợ động từ/be + chủ ngữ + động từ...?" },
    wh3: { wrong: [[0, 2, 1], [1, 0, 2], [1, 2, 0]], tags: ['wh-question'], end: '?',
        explain: "Câu hỏi có từ để hỏi: Wh- + be + chủ ngữ?" },
    cont: { wrong: [[0, 2, 1, 3, 4], [0, 1, 3, 2, 4], [2, 0, 1, 3, 4]], tags: ['present-continuous'],
        explain: "Hiện tại tiếp diễn: S + am/is/are + V-ing + ..." },
    adjN: { wrong: [[0, 1, 3, 2, 4], [0, 1, 2, 4, 3], [0, 2, 1, 3, 4]], tags: ['adjective-order'],
        explain: "Mạo từ đứng đầu cụm danh từ, tính từ đứng trước danh từ: a + adj + noun." },
    comp: { wrong: [[0, 1, 3, 2, 4], [0, 2, 1, 3, 4], [0, 1, 2, 4, 3]], tags: ['comparative'],
        explain: "So sánh hơn: S + be/V + adj-er/more adj + than + O." },
    there: { wrong: [[0, 2, 1, 3, 4], [0, 1, 2, 4, 3], [2, 0, 1, 3, 4]], tags: ['there-be'],
        explain: "Cấu trúc: There + be + danh từ + nơi chốn." },
    modal: { wrong: [[0, 2, 1, 3, 4], [0, 1, 3, 2, 4], [2, 0, 1, 3, 4]], tags: ['modal'],
        explain: "Động từ khuyết thiếu: S + modal + V nguyên mẫu + O." },
    neg: { wrong: [[0, 2, 1, 3, 4], [0, 1, 3, 2, 4], [2, 0, 1, 3, 4]], tags: ['negative'],
        explain: "Câu phủ định: S + trợ động từ + not + V nguyên mẫu + O." },
};

const WORDS = [
    ['freq', 'A1', 'medium', ['my father', 'almost always', 'drinks', 'coffee without sugar', 'before work']],
    ['freq', 'A1', 'medium', ['she', 'hardly ever', 'eats', 'fast food', 'during the week']],
    ['freq', 'A1', 'medium', ['we', 'usually', 'play', 'badminton', 'after school']],
    ['freq', 'A1', 'medium', ['Lan', 'often', 'walks', 'to school', 'with her friends']],
    ['freq', 'A1', 'medium', ['my brother', 'sometimes', 'cooks', 'dinner', 'for the family']],
    ['freq', 'A1', 'medium', ['I', 'rarely', 'go', 'to bed', 'before midnight']],
    ['freq', 'A2', 'medium', ['they', 'seldom', 'watch', 'TV', 'on weekdays']],
    ['freqBe', 'A1', 'medium', ['he', 'is', 'always', 'late', 'for class']],

    ['svo', 'A2', 'medium', ['I', 'unexpectedly met', 'my former teacher', 'at the market yesterday']],
    ['svo', 'A2', 'medium', ['she', 'carefully chose', 'a less expensive dress', 'for the interview']],
    ['svo', 'A1', 'easy', ['we', 'have', 'English class', 'on Monday mornings']],
    ['svo', 'A1', 'easy', ['my mother', 'cooks', 'dinner', 'every evening']],
    ['svo', 'A2', 'easy', ['the students', 'cleaned', 'the classroom', 'after the lesson']],
    ['svo', 'A1', 'medium', ['Nam', 'plays', 'the guitar', 'very well']],
    ['svo', 'A2', 'easy', ['they', 'will visit', 'Hue', 'next month']],
    ['svo', 'A1', 'easy', ['he', 'reads', 'the newspaper', 'every morning']],

    ['wh', 'A1', 'easy', ['where', 'do', 'you', 'live']],
    ['wh', 'A1', 'medium', ['what time', 'does', 'the last bus', 'leave for Can Tho']],
    ['wh', 'A1', 'medium', ['why', 'is', 'your little brother', 'crying outside']],
    ['wh', 'A1', 'easy', ['how often', 'do', 'you', 'go swimming']],
    ['wh', 'A2', 'medium', ['what', 'did', 'you', 'buy at the market']],
    ['wh3', 'A1', 'easy', ['who', 'is', 'your English teacher']],
    ['wh', 'A1', 'medium', ['how much', 'does', 'this T-shirt', 'cost']],
    ['wh', 'A2', 'medium', ['where', 'did', 'your family', 'go last summer']],
    ['wh', 'A1', 'easy', ['what', 'are', 'you', 'doing now']],
    ['wh', 'A2', 'medium', ['when', 'will', 'the concert', 'start']],

    ['cont', 'A1', 'medium', ['my sister', 'is', 'still reading', 'the book I lent her', 'in her room']],
    ['cont', 'A1', 'medium', ['the children', 'are', 'playing', 'football', 'in the park']],
    ['cont', 'A1', 'medium', ['I', 'am', 'waiting', 'for the bus', 'now']],
    ['cont', 'A1', 'medium', ['we', 'are', 'having', 'dinner', 'at the moment']],
    ['cont', 'A1', 'medium', ['Mr. Long', 'is', 'teaching', 'English', 'in Room 201']],
    ['cont', 'A1', 'medium', ['they', 'are', 'watching', 'a movie', 'right now']],

    ['adjN', 'A1', 'medium', ['this is', 'a', 'very', 'interesting', 'book'], [[0, 1, 3, 2, 4], [0, 1, 4, 2, 3], [0, 2, 1, 3, 4]]],
    ['adjN', 'A2', 'hard', ['Hoa', 'has', 'long', 'black', 'hair'], [[0, 1, 3, 2, 4], [0, 1, 4, 2, 3], [0, 1, 2, 4, 3]],
        "Trật tự tính từ: kích thước/độ dài (long) đứng trước màu sắc (black): 'long black hair'."],
    ['adjN', 'A1', 'medium', ['he', 'lives in', 'a', 'beautiful', 'old house']],
    ['adjN', 'A1', 'medium', ['we', 'had', 'a', 'delicious', 'meal']],
    ['adjN', 'A2', 'hard', ['my uncle', 'drives', 'a', 'big', 'red car'], [[0, 1, 3, 2, 4], [0, 1, 2, 4, 3], [0, 1, 4, 3, 2]],
        "Mạo từ 'a' đứng đầu; kích thước (big) đứng trước màu sắc (red): 'a big red car'."],
    ['adjN', 'A2', 'hard', ['she', 'is wearing', 'a', 'beautiful', 'white dress'], [[0, 1, 3, 2, 4], [0, 1, 2, 4, 3], [0, 1, 4, 3, 2]],
        "Mạo từ 'a' đứng đầu; tính từ chỉ quan điểm (beautiful) đứng trước màu sắc (white): 'a beautiful white dress'."],

    ['comp', 'A2', 'medium', ['my brother', 'is', 'taller', 'than', 'our father']],
    ['comp', 'A2', 'hard', ['Hanoi', 'is', 'colder', 'than', 'Can Tho', 'in winter'], [[0, 1, 3, 2, 4, 5], [0, 2, 1, 3, 4, 5], [0, 1, 2, 4, 3, 5]]],
    ['comp', 'A2', 'medium', ['this phone', 'is', 'more expensive', 'than', 'that one']],
    ['comp', 'A2', 'medium', ['the Mekong River', 'is', 'longer', 'than', 'the Red River']],
    ['comp', 'A2', 'medium', ['my new job', 'is', 'more interesting', 'than', 'my old one']],
    ['comp', 'A2', 'medium', ['she', 'runs', 'faster', 'than', 'her brother']],

    ['there', 'A1', 'medium', ['there', 'are', 'thirty students', 'in', 'my class']],
    ['there', 'A1', 'medium', ['there', 'is', 'a big park', 'near', 'my house']],
    ['there', 'A1', 'medium', ['there', "isn't", 'any milk', 'in', 'the fridge']],
    ['there', 'A1', 'medium', ['there', 'are', 'many old buildings', 'in', 'Hoi An']],
    ['there', 'A2', 'hard', ['there', 'was', 'a lot of rain', 'in Can Tho', 'last night'], [[0, 2, 1, 3, 4], [2, 0, 1, 3, 4], [0, 1, 4, 3, 2]],
        "Cấu trúc: There + was + danh từ + nơi chốn + thời gian."],

    ['modal', 'A2', 'medium', ['you', 'should', 'drink', 'more water', 'every day']],
    ['modal', 'A2', 'medium', ['students', 'must', 'wear', 'uniforms', 'at school']],
    ['modal', 'A1', 'medium', ['my grandmother', 'can', 'speak', 'French', 'very well']],
    ['modal', 'A2', 'medium', ['we', 'have to', 'finish', 'the project', 'by Friday']],
    ['modal', 'A2', 'medium', ['you', "mustn't", 'park', 'your motorbike', 'here']],
    ['modal', 'A2', 'hard', ['I', 'could', 'swim', 'very well', 'when I was ten'], [[0, 2, 1, 3, 4], [2, 0, 1, 3, 4], [0, 1, 2, 4, 3]]],

    ['neg', 'A1', 'medium', ['my father', "doesn't", 'drink', 'coffee', 'at night']],
    ['neg', 'A2', 'medium', ['we', "didn't", 'go', 'to school', 'yesterday']],
    ['neg', 'A1', 'medium', ['Lan', "isn't", 'at home', 'right now'], [[0, 2, 1, 3], [2, 0, 1, 3], [0, 3, 2, 1]],
        "Câu phủ định với 'be': S + isn't + nơi chốn + thời gian."],

    ['modal', 'A2', 'medium', ['I', 'am going to', 'visit', 'my aunt', 'next week'], null,
        "Tương lai gần: S + am/is/are going to + V nguyên mẫu + O + thời gian.", ['going-to']],
    ['modal', 'A2', 'medium', ['they', 'are going to', 'buy', 'a new car', 'next year'], null,
        "Tương lai gần: S + am/is/are going to + V nguyên mẫu + O + thời gian.", ['going-to']],
];

for (const [key, level, difficulty, chunks, wrongOrders, explain, tags] of WORDS) {
    const p = PATTERNS[key];
    const q = orderWords({ chunks, wrongOrders: wrongOrders || p.wrong, end: p.end || '.' });
    const correct = q.options[q.answer];
    push('Word Order', level, difficulty, ['word-order', ...(tags || p.tags)], {
        ...q,
        explanation: `${explain || p.explain} → '${correct}'`,
    });
}

// ---------------------------------------------------------------- Sắp xếp hội thoại
const DIALOGUE_PROMPT = 'Put the lines in the correct order to make a conversation:';
const DIALOGUES = [
    ['A1', 'easy', 'Greetings', ["A: Hi, I'm Tuan. What's your name?", "B: I'm Lan. Nice to meet you.", 'A: Nice to meet you, too. Where are you from?', "B: I'm from Bac Lieu."]],
    ['A1', 'easy', 'Shopping', ['A: Can I help you?', 'B: Yes, how much is this hat?', "A: It's 120,000 dong.", "B: OK, I'll take it."]],
    ['A1', 'easy', 'Ordering food', ['A: Are you ready to order?', "B: Yes, I'd like a bowl of pho, please.", 'A: Anything to drink?', 'B: An iced tea, please.']],
    ['A1', 'medium', 'Directions', ["A: Excuse me, where's the nearest ATM?", "B: It's on Hai Ba Trung Street, next to the bank.", 'A: Is it far from here?', "B: No, it's about five minutes on foot."]],
    ['A1', 'medium', 'Invitations', ['A: Would you like to go to the cinema tonight?', "B: Sorry, I can't. I have to study.", 'A: What about tomorrow night?', 'B: Tomorrow is fine. What time?']],
    ['A2', 'medium', 'Telephone', ['A: Hello, may I speak to Mr. Binh, please?', "B: Sorry, he's in a meeting right now.", 'A: Can I leave a message?', 'B: Sure. Go ahead.']],
    ['A2', 'medium', 'Past events', ['A: What did you do last weekend?', 'B: I went to Phu Quoc with my family.', 'A: Really? How was it?', 'B: It was great. The beaches were beautiful.']],
    ['A2', 'medium', 'Advice', ["A: You look tired. What's wrong?", 'B: I have a bad headache.', 'A: You should take a break and drink some water.', 'B: Good idea. Thanks.']],
    ['A1', 'easy', 'Hobbies', ["A: What's your favorite sport?", 'B: Badminton. I play it every Sunday.', 'A: Who do you play with?', 'B: With my dad and my brother.']],
    ['A1', 'medium', 'Transportation', ['A: Excuse me, does this bus go to the university?', "B: No, it doesn't. You need bus number 9.", 'A: Where can I catch it?', 'B: At the bus stop across the street.']],
    ['A1', 'medium', 'Shopping', ['A: Can I try on this jacket?', 'B: Sure. The fitting room is over there.', "A: It's too big. Do you have a smaller one?", "B: Yes, here's a medium."]],
    ['A2', 'medium', 'Future plans', ['A: What are you going to do after graduation?', "B: I'm going to look for a job in Ho Chi Minh City.", 'A: What kind of job?', 'B: Something in marketing, I hope.']],
    ['A1', 'easy', 'Social', ['A: Hi Mai! Happy birthday!', 'B: Thank you! Come in, please.', 'A: This is a small gift for you.', 'B: Oh, how lovely! Thank you so much.']],
    ['A2', 'medium', 'Hotel', ["A: Excuse me, I'd like to check in. I have a reservation.", "B: Sure. What's your name, please?", 'A: Tran Thi Hoa.', 'B: Thank you. Your room is 305, on the third floor.']],
    ['A2', 'medium', 'Problems', ['A: Is everything OK? You look worried.', 'B: I lost my student card.', 'A: Did you check your bag?', "B: Yes, but it isn't there."]],
];

for (const [level, difficulty, topic, lines] of DIALOGUES) {
    const q = orderLines({ lines, prompt: DIALOGUE_PROMPT });
    push('Dialogue Order', level, difficulty, ['dialogue-order', topic.toLowerCase().replace(/[^a-z]+/g, '-')], {
        ...q,
        explanation: `Thứ tự đúng: ${q.options[q.answer]}. Hội thoại luân phiên A – B; mỗi câu trả lời phải đáp đúng câu ngay trước nó (${topic}).`,
    });
}

// ---------------------------------------------------------------- Sắp xếp câu thành đoạn văn
const PARAGRAPH_PROMPT = 'Put the sentences in the correct order to make a paragraph:';
const PARAGRAPHS = [
    ['A1', 'easy', 'Câu giới thiệu → buổi sáng → sau đó → buổi tối.', ['My name is Khoa, and I live in Can Tho.', 'Every morning, I get up at 6 a.m. and have breakfast.', 'After that, I ride my bike to the university.', 'In the evening, I do my homework and go to bed at 11.']],
    ['A2', 'easy', 'Kể theo trình tự thời gian: sáng sớm rời nhà → khi đến nơi → buổi tối về nhà.', ['Last Sunday, my family went to the beach.', 'We left home early in the morning.', 'When we arrived, we swam and played games on the sand.', 'In the evening, we drove home, tired but happy.']],
    ['A2', 'medium', "Câu nêu nguyên liệu đứng đầu, sau đó theo các từ nối 'First → Next → Finally'.", ['To make a cup of Vietnamese milk coffee, you need coffee, hot water and condensed milk.', 'First, put some condensed milk in a glass.', 'Next, put the coffee filter on the glass and add hot water.', 'Finally, wait for five minutes, then stir and enjoy.']],
    ['A2', 'medium', "Giới thiệu bạn → gặp nhau lần đầu → 'Now, seven years later' (bảy năm sau lần gặp đó) → 'still' (vẫn tiếp tục).", ['I have a best friend named Ngoc.', 'We met on our first day at secondary school.', 'Now, seven years later, we study at the same university in Can Tho.', 'We still meet for coffee every weekend.']],
    ['A2', 'easy', "Email: lời chào 'Dear...' → nội dung → lời kết và tên người viết.", ['Dear Ms. Lan,', 'Thank you for your English lessons this semester.', 'I learned a lot, especially in speaking.', 'Best wishes, Hung']],
    ['A2', 'medium', "Câu chủ đề đứng đầu, sau đó theo các từ nối 'First → Then → Finally'.", ['Yesterday was a terrible day for me.', 'First, I woke up late and missed the bus.', "Then, it started to rain, and I didn't have an umbrella.", 'Finally, when I got to class, I found out that my homework was at home.']],
    ['A1', 'medium', "Giới thiệu Cần Thơ → nổi tiếng với chợ nổi → chợ nổi nổi tiếng nhất ('The most famous one') → hoạt động ở đó ('there').", ['Can Tho is a big city in the Mekong Delta.', 'It is famous for its floating markets.', 'The most famous one is Cai Rang Floating Market.', 'Every morning, many boats sell fruit and vegetables there.']],
    ['A1', 'medium', "Giới thiệu chủ đề → nêu sở thích (taking photos) → 'them' thay cho 'photos' nên phải đứng sau → dự định tương lai ('In the future').", ['I want to tell you about my hobby.', 'I love taking photos.', 'I usually take them with my phone in the park near my house.', 'In the future, I hope to buy a real camera.']],
    ['A2', 'medium', "Giới thiệu cô Hoa → bài học vui → 'Because of this' (kết quả) → mong muốn ở cuối.", ['Ms. Hoa is my English teacher.', 'Her lessons are always fun because she uses games and songs.', 'Because of this, all the students in my class love her lessons.', 'I hope she will teach us again next year.']],
    ['A2', 'easy', "Câu chủ đề ('Here are some tips') → 'First → Then → Finally'.", ['Here are some tips for learning new English words.', 'First, write each new word in a small notebook.', 'Then, use the word in a sentence of your own.', 'Finally, review the notebook every evening before bed.']],
];

for (const [level, difficulty, why, lines] of PARAGRAPHS) {
    const q = orderLines({ lines, prompt: PARAGRAPH_PROMPT });
    push('Paragraph Order', level, difficulty, ['paragraph-order'], {
        ...q,
        explanation: `Thứ tự đúng: ${q.options[q.answer]}. ${why}`,
    });
}

// ---------------------------------------------------------------- Viết lại / nối câu
const choice = (category, level, difficulty, tags, question, [correct, ...distractors], explanation) =>
    push(category, level, difficulty, tags, mc({ type: 'choice', question, correct, distractors, explanation }));

choice('Sentence Combining', 'A1', 'medium', ['conjunction'],
    "Choose the best way to combine the sentences: <br><i>It was raining. We stayed at home.</i>",
    ['It was raining, so we stayed at home.', 'It was raining because we stayed at home.', 'Although it was raining, we stayed at home.', 'Because it was raining, so we stayed at home.'],
    "Vế sau là kết quả → 'so'. Không dùng 'because' và 'so' cùng lúc trong một câu.");
choice('Sentence Combining', 'A1', 'medium', ['conjunction'],
    "Choose the best way to combine the sentences: <br><i>Nam is tired. He worked late last night.</i>",
    ['Nam is tired because he worked late last night.', 'Nam is tired so he worked late last night.', 'Nam is tired but he worked late last night.', 'Because Nam is tired, he worked late last night.'],
    "Làm việc khuya là NGUYÊN NHÂN khiến Nam mệt → 'because' đặt trước nguyên nhân.");
choice('Sentence Combining', 'A2', 'medium', ['both'],
    "Choose the best way to combine the sentences: <br><i>I like coffee. My sister likes coffee, too.</i>",
    ['My sister and I both like coffee.', 'My sister and I both likes coffee.', 'Neither my sister nor I like coffee.', "I like coffee, but my sister doesn't."],
    "Hai người cùng thích → 'both'. Chủ ngữ 'My sister and I' số nhiều → 'like' (không thêm -s).");

choice('Sentence Transformation', 'A2', 'easy', ['comparative'],
    "Choose the sentence with the same meaning: <br><i>Lan is taller than Mai.</i>",
    ['Mai is shorter than Lan.', 'Mai is taller than Lan.', 'Lan is shorter than Mai.', 'Mai is as tall as Lan.'],
    "Lan cao hơn Mai ⇔ Mai thấp hơn Lan.");
choice('Sentence Transformation', 'A1', 'medium', ['have', 'there-be'],
    "Choose the sentence with the same meaning: <br><i>There are 30 students in my class.</i>",
    ['My class has 30 students.', 'My class are 30 students.', 'There is 30 students in my class.', 'My class has 30 student.'],
    "'There are 30 students in my class' ⇔ 'My class has 30 students' (danh từ số nhiều 'students').");
choice('Sentence Transformation', 'A2', 'medium', ['time'],
    "Choose the sentence with the same meaning: <br><i>The film started at 8 p.m. and finished at 10 p.m.</i>",
    ['The film lasted two hours.', 'The film lasted ten hours.', 'The film started two hours late.', 'The film finished at 8 p.m.'],
    "Từ 8 giờ đến 10 giờ tối → bộ phim kéo dài 2 tiếng.");
choice('Sentence Transformation', 'A2', 'medium', ['superlative'],
    "Choose the sentence with the same meaning: <br><i>Nobody in my class is taller than Huy.</i>",
    ['Huy is the tallest student in my class.', 'Huy is taller than every student outside my class.', 'Huy is not as tall as anyone in my class.', 'Only one student in my class is taller than Huy.'],
    "Không ai cao hơn Huy → Huy cao nhất lớp: 'the tallest'.");
choice('Sentence Transformation', 'A2', 'medium', ['should'],
    "Choose the sentence with the same meaning: <br><i>It's not a good idea to stay up late.</i>",
    ["You shouldn't stay up late.", 'You must stay up late.', 'You should stay up late.', 'You can stay up late.'],
    "'not a good idea' = không nên → 'shouldn't'.");
choice('Sentence Transformation', 'A2', 'hard', ['must', 'have-to'],
    "Choose the sentence with the same meaning: <br><i>Students are not allowed to use phones in the exam.</i>",
    ["Students mustn't use phones in the exam.", "Students don't have to use phones in the exam.", 'Students should use phones in the exam.', 'Students can use phones in the exam.'],
    "'not allowed' = bị cấm → 'mustn't'. 'don't have to' chỉ có nghĩa là không bắt buộc.");
choice('Sentence Transformation', 'A2', 'medium', ['suggestion'],
    "Choose the sentence with the same meaning: <br><i>How about going to the park?</i>",
    ["Let's go to the park.", "Let's going to the park.", 'Why do we go to the park?', 'We went to the park.'],
    "'How about + V-ing?' là lời gợi ý ⇔ 'Let's + V nguyên mẫu'.");
choice('Sentence Transformation', 'A2', 'hard', ['present-perfect'],
    "Choose the sentence with the same meaning: <br><i>I started learning English when I was 10. I am 20 now.</i>",
    ['I have learned English for 10 years.', 'I have learned English since 10 years.', 'I learned English for 10 years ago.', 'I am learning English 10 years ago.'],
    "Hành động bắt đầu trong quá khứ và còn tiếp tục → hiện tại hoàn thành + 'for' + khoảng thời gian: 'for 10 years'.");

choice('Question Formation', 'A1', 'easy', ['wh-question'],
    "Choose the correct question for this answer: <br><i>I live in Ninh Kieu District.</i>",
    ['Where do you live?', 'Where are you live?', 'Where you live?', 'What do you live?'],
    "Hỏi nơi ở → 'Where' + trợ động từ 'do' + chủ ngữ + V: 'Where do you live?'");
choice('Question Formation', 'A1', 'medium', ['wh-question'],
    "Choose the correct question for this answer: <br><i>She goes to work by bus.</i>",
    ['How does she go to work?', 'How is she going to work every day?', 'How she usually goes to work?', 'By what does she go to work?'],
    "Hỏi phương tiện → 'How'. Chủ ngữ 'she' → 'does' + V nguyên mẫu: 'How does she go...?'");
choice('Question Formation', 'A2', 'medium', ['wh-question', 'past-simple'],
    "Choose the correct question for this answer: <br><i>I bought it last Saturday.</i>",
    ['When did you buy it?', 'When do you buy it?', 'When did you bought it?', 'When you bought it?'],
    "Hỏi thời gian trong quá khứ → 'When did you + V nguyên mẫu?'");

choice('Email Writing', 'A2', 'medium', ['email'],
    "You are writing an email to your teacher. Choose the best closing.",
    ['Best regards,', 'See ya!', 'Love and kisses,', 'Bye bye!!!'],
    "Email trang trọng (gửi giáo viên) nên kết thúc bằng 'Best regards,' hoặc 'Kind regards,'.");

module.exports = items;
