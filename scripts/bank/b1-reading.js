'use strict';

const { mc } = require('../lib/builders');

// Trình độ B1. Mỗi câu hỏi: [focus, difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
// focus: main_idea | detail | inference | vocabulary
const PASSAGES = [
    {
        id: 'RP31', level: 'B1', genre: 'Article', title: 'Food delivery apps: convenient, but at what cost?',
        text: `Ten years ago, if you wanted a bowl of pho at home, you had to go out and buy it yourself. Today, many people in Vietnamese cities simply open an app on their phone, choose a dish and wait for it to arrive at their door.

Food delivery apps have become extremely popular, especially among students and young office workers. In a survey of 400 young people in Can Tho, carried out by a group of university students, more than 60% of them said they order food online at least once a week. The main reason is convenience: people are busy, and the apps save them time.

However, not everyone is happy about this trend. Some small restaurant owners say the apps take up to 25% of the price of each order, so they earn much less money. Environmental groups are also worried about the huge number of plastic boxes, bags and spoons that are thrown away every day.

Some apps are now trying to solve this problem. Customers can choose "no plastic cutlery" when they order, and a few restaurants give a small discount to people who bring their own containers. It is a small step, but it shows that the industry is starting to listen.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['The popularity of food delivery apps and some problems they cause', 'How to cook pho at home', 'Why young people do not like eating out', 'How to open a small restaurant'], "Bài viết nói về sự phổ biến của ứng dụng giao đồ ăn, sau đó nêu các vấn đề (nhà hàng nhỏ bị thu phí cao, rác thải nhựa) và cách khắc phục."],
            ['detail', 'easy', 'According to the survey, how often do more than 60% of the young people order food online?', ['At least once a week', 'Every day', 'Once a month', 'Only at weekends'], "'more than 60% of them said they order food online at least once a week'."],
            ['detail', 'medium', 'Why are some small restaurant owners unhappy?', ['The apps take up to 25% of the price of each order.', 'Customers never come to their restaurants.', 'They have to deliver the food themselves.', 'They have to buy expensive plastic boxes.'], "'Some small restaurant owners say the apps take up to 25% of the price of each order, so they earn much less money.'"],
            ['inference', 'medium', "What is the main purpose of the \"no plastic cutlery\" option?", ['To reduce plastic waste', 'To make the food arrive faster', 'To help restaurants earn more money', 'To make customers pay more'], "Đoạn 4 nói các ứng dụng đang cố giải quyết 'this problem' – tức là vấn đề rác thải nhựa ở đoạn 3 → mục đích là giảm rác nhựa."],
            ['vocabulary', 'medium', "The word 'convenience' in paragraph 2 is closest in meaning to ______.", ['being easy and saving time', 'being cheap', 'being healthy', 'being delicious'], "'convenience' = sự tiện lợi. Câu sau giải thích: 'people are busy, and the apps save them time'."],
        ],
    },
    {
        id: 'RP32', level: 'B1', genre: 'Email', title: 'An internship inquiry',
        text: `Dear Ms. Pham,

My name is Tran Minh Khoa, and I am a third-year tourism student at a university in Can Tho. I saw on your company's website that Mekong Green Travel offers summer internships, and I am writing to ask whether there are still places available this year.

I am particularly interested in your eco-tours to the floating markets and fruit gardens. Last summer, I worked as a volunteer guide for a local festival, where I showed visitors around and answered their questions in English. This experience helped me improve my communication skills and taught me how to deal with unexpected problems.

I would be grateful if you could tell me how long the internship lasts and whether interns receive any payment. I am available from the beginning of June to the end of August. I have attached my CV and a reference letter from my English teacher.

Thank you for considering my request. I look forward to hearing from you.

Yours sincerely,
Tran Minh Khoa`,
        questions: [
            ['main_idea', 'easy', 'Why did Khoa write this email?', ['To ask about a summer internship', 'To book an eco-tour', 'To complain about a tour guide', 'To invite Ms. Pham to a festival'], "'I am writing to ask whether there are still places available this year' – Khoa hỏi về chương trình thực tập mùa hè."],
            ['detail', 'easy', 'What did Khoa do last summer?', ['He worked as a volunteer guide at a local festival.', 'He did an internship at Mekong Green Travel.', 'He taught English to tourists.', 'He worked in a fruit garden.'], "'Last summer, I worked as a volunteer guide for a local festival'."],
            ['detail', 'medium', 'What does Khoa want to know about the internship?', ['How long it lasts and whether it is paid', 'Where the office is and when it opens', 'How many students applied last year', 'Whether he needs to send a CV'], "'how long the internship lasts and whether interns receive any payment'."],
            ['detail', 'easy', 'What has Khoa sent with the email?', ['His CV and a reference letter', 'A photo and his passport', 'His exam results', 'A list of eco-tours'], "'I have attached my CV and a reference letter from my English teacher.'"],
            ['inference', 'hard', 'Which statement about Khoa is probably true?', ['He can communicate with foreign visitors in English.', 'He has worked for Mekong Green Travel before.', 'He is not free in July.', 'He does not want to be paid.'], "Khoa từng 'showed visitors around and answered their questions in English' → anh ấy có thể giao tiếp bằng tiếng Anh với khách nước ngoài. Anh rảnh từ tháng 6 đến hết tháng 8 (gồm cả tháng 7)."],
        ],
    },
    {
        id: 'RP33', level: 'B1', genre: 'Blog', title: 'My first semester in Busan',
        text: `When I arrived in Busan last September, I could only say "hello" and "thank you" in Korean. I had studied the language online for three months, but real conversations were much faster than the videos I had watched.

The first few weeks were difficult. I got lost on the subway twice, and once I ordered a very spicy dish because I couldn't read the menu. I also missed Vietnamese food and my family a lot, especially at dinner time.

Things got better when I joined the university's international students' club. Every Friday, we cook food from our home countries and share it. I have made friends from Japan, Indonesia and Mexico, and we usually speak English together. A Korean classmate, Jiwoo, also offered to help me with my Korean if I helped her with English. Now we meet twice a week at a café near the campus.

After four months, my Korean is still far from perfect, but I can take the bus, go shopping and chat with my neighbors without much trouble. My advice for anyone who wants to study abroad: don't be afraid of making mistakes, and say "yes" to every chance to meet new people.

– Ha My`,
        questions: [
            ['main_idea', 'easy', 'What is the blog post mainly about?', ["The writer's first months as a student abroad", 'How to cook Korean food', 'Why the writer chose to study English', 'The subway system in Busan'], "Bài blog kể về những khó khăn và thay đổi của Hà My trong học kỳ đầu tiên du học ở Busan."],
            ['detail', 'easy', 'How did the writer study Korean before she arrived?', ['Online, for three months', 'At a language school for a year', 'With Jiwoo at a café', 'She did not study it at all.'], "'I had studied the language online for three months'."],
            ['detail', 'medium', "What happens at the international students' club every Friday?", ['Members cook and share food from their countries.', 'Members take Korean exams.', 'Members go shopping together.', 'Members travel around Busan by subway.'], "'Every Friday, we cook food from our home countries and share it.'"],
            ['inference', 'medium', 'What kind of arrangement do the writer and Jiwoo have?', ['They help each other learn a language.', 'Jiwoo pays the writer for English lessons.', 'They share an apartment near the campus.', 'They work together at a café.'], "Jiwoo 'offered to help me with my Korean if I helped her with English' → hai bạn trao đổi ngôn ngữ, giúp nhau học."],
            ['inference', 'hard', "Which sentence best describes the writer's Korean now?", ['It is good enough for everyday situations, but not perfect.', 'It is perfect.', 'It is still too weak for her to take the bus.', 'It is better than her English.'], "'my Korean is still far from perfect, but I can take the bus, go shopping and chat with my neighbors without much trouble' → đủ dùng trong sinh hoạt hằng ngày nhưng chưa hoàn hảo."],
        ],
    },
    {
        id: 'RP34', level: 'B1', genre: 'Notice', title: 'Volunteers wanted: Summer English Camp',
        text: `VOLUNTEERS WANTED – SUMMER ENGLISH CAMP

The Mekong Youth Center is looking for volunteers to help at our free English camp for children aged 9 to 12 in rural areas of Hau Giang Province.

When: 6 – 17 July (Monday to Friday, 8:00 a.m. – 3:30 p.m.)
Where: Long My Primary School

What you will do:
- Lead games, songs and simple speaking activities
- Help children with reading and writing tasks
- Prepare materials before each day starts

Who can apply:
- University students aged 18 or over
- Good level of English (at least B1); experience with children is an advantage but not necessary

What we offer:
- Free accommodation and lunch every day
- A certificate of participation
- Training on 4 July before the camp begins

Volunteers must take part for the whole two weeks. To apply, fill in the online form on our website by 15 June. Successful applicants will be contacted by email within one week.`,
        questions: [
            ['main_idea', 'easy', 'What is the purpose of this notice?', ['To find volunteers for an English camp', 'To advertise English lessons for adults', 'To sell tickets for a summer festival', 'To find teachers for a full-time job'], "Tiêu đề 'VOLUNTEERS WANTED – SUMMER ENGLISH CAMP' → thông báo tuyển tình nguyện viên cho trại hè tiếng Anh."],
            ['detail', 'easy', 'Who is the camp for?', ['Children aged 9 to 12', 'University students', 'Teachers in Hau Giang', 'Children under 9'], "'free English camp for children aged 9 to 12'."],
            ['detail', 'medium', 'Which of the following is NOT offered to volunteers?', ['A salary', 'Free accommodation', 'A certificate', 'Training before the camp'], "Phần 'What we offer' gồm 'Free accommodation and lunch every day', 'A certificate of participation' và 'Training on 4 July before the camp begins' – không có lương."],
            ['inference', 'medium', 'Tuan has never worked with children, but his English is good. Can he apply?', ['Yes, because experience with children is not necessary.', 'No, because he needs experience with children.', 'No, because he must be a teacher.', 'Yes, but only for one week.'], "'experience with children is an advantage but not necessary' → không bắt buộc có kinh nghiệm."],
            ['inference', 'hard', 'A student who can only help during the first week should ______.', ['not apply, because volunteers must stay for two weeks', 'apply and work only from 6 to 10 July', 'contact the center by phone', 'apply after 15 June'], "'Volunteers must take part for the whole two weeks.' → người chỉ tham gia được một tuần thì không đủ điều kiện."],
        ],
    },
    {
        id: 'RP35', level: 'B1', genre: 'Review', title: 'A peaceful stay by the river',
        text: `★★★★☆ Reviewed by Lucy (UK)

My husband and I spent three nights at Bay Lan Homestay in Cai Be, and overall we had a lovely time. The homestay is a traditional wooden house surrounded by fruit trees, about ten minutes by boat from the town center.

The best thing about our stay was the family who run it. Mr. Bay and his wife treated us like their own children. On our second evening, they taught us how to make spring rolls, and we all had dinner together. The food was simple but delicious, and everything came from their own garden.

Our room was clean and comfortable, although it was a little hot at night because there was only a fan, not air conditioning. Also, if you are a light sleeper, be prepared: the roosters start crowing at about 4:30 every morning!

The price was very reasonable – 600,000 dong per night, including breakfast and a bicycle. I would definitely recommend this place to anyone who wants to experience real life in the Mekong Delta, but it might not suit travelers who need modern comforts.`,
        questions: [
            ['main_idea', 'easy', 'What is the main purpose of this text?', ['To share an opinion about a homestay', 'To advertise a cooking class', 'To explain how to get to Cai Be', "To complain about a hotel's prices"], "Đây là bài đánh giá (review) của khách: nêu điểm tốt và chưa tốt của homestay, cuối cùng đưa ra lời giới thiệu."],
            ['detail', 'easy', 'What did Mr. Bay and his wife teach the guests?', ['How to make spring rolls', 'How to drive a boat', 'How to grow fruit trees', 'How to speak Vietnamese'], "'they taught us how to make spring rolls'."],
            ['detail', 'medium', 'What was the problem with the room?', ['It was a bit hot at night.', 'It was dirty.', 'It was too far from the river.', 'It was too expensive.'], "'it was a little hot at night because there was only a fan, not air conditioning'."],
            ['vocabulary', 'medium', "The word 'reasonable' in the last paragraph is closest in meaning to ______.", ['not too expensive', 'very expensive', 'free', 'difficult to pay'], "'reasonable' (giá cả) = hợp lý, không quá đắt. Giá 600,000 đồng/đêm đã gồm bữa sáng và xe đạp."],
            ['inference', 'hard', 'Who would probably NOT enjoy this homestay?', ['Someone who needs air conditioning and quiet mornings', 'Someone who loves local food', 'Someone who wants to learn about local life', 'Someone traveling on a small budget'], "Phòng chỉ có quạt, gà gáy từ 4:30 sáng, và người viết nói 'it might not suit travelers who need modern comforts'."],
        ],
    },
    {
        id: 'RP36', level: 'B1', genre: 'Story', title: 'The lost wallet',
        text: `Last Tuesday, Phuc, a second-year engineering student, was riding his bike home from the library when he saw a brown wallet lying in the middle of the road. He stopped and picked it up. Inside, there were two million dong, a bank card and an ID card belonging to a woman called Nguyen Thi Thu.

At first, Phuc didn't know what to do. Two million dong was more than he earned in a month from his part-time job. But he thought about how worried the owner must be. "If I lost my wallet, I would want someone to return it," he said later.

The ID card showed an address in An Binh Ward, about three kilometers away. Phuc rode there immediately, but nobody was home. A neighbor told him that Mrs. Thu worked at a pharmacy nearby, so he went there and found her.

Mrs. Thu was so grateful that she started crying. She had been looking for the wallet all afternoon, because the money was for her son's school fees. She tried to give Phuc 500,000 dong as a reward, but he refused. "I just did what anyone should do," he said with a smile.`,
        questions: [
            ['main_idea', 'easy', 'What is the story mainly about?', ['A student who returned a lost wallet to its owner', 'A student who lost his wallet on the way home', 'A woman who works at a pharmacy', 'How to get a new ID card'], "Câu chuyện kể về Phúc nhặt được ví và tìm cách trả lại cho chủ."],
            ['detail', 'easy', 'What was inside the wallet?', ['Money, a bank card and an ID card', 'Only an ID card', 'A library card and some photos', 'A student card and some money'], "'there were two million dong, a bank card and an ID card'."],
            ['detail', 'medium', 'How did Phuc find Mrs. Thu?', ['A neighbor told him where she worked.', 'He called her phone number.', 'He took the wallet to the police.', 'She was waiting at her house.'], "'A neighbor told him that Mrs. Thu worked at a pharmacy nearby, so he went there and found her.'"],
            ['inference', 'medium', 'Why was Mrs. Thu so emotional?', ['The money was very important to her family.', 'Phuc asked her for a reward.', 'She did not like her job.', 'She had lost her son.'], "Số tiền đó rất quan trọng: 'the money was for her son's school fees'."],
            ['inference', 'hard', 'Which word best describes Phuc?', ['Honest', 'Lazy', 'Careless', 'Greedy'], "Phúc trả lại ví dù số tiền lớn hơn một tháng lương làm thêm, và từ chối nhận thưởng: 'I just did what anyone should do' → trung thực (honest)."],
        ],
    },
    {
        id: 'RP37', level: 'B1', genre: 'Interview', title: 'Green Cup: a café without plastic',
        text: `Reporter: Hoang Anh, when did you open Green Cup?
Hoang Anh: In March 2024, just after I graduated. I studied business, and I had always dreamed of running my own café.

Reporter: What makes Green Cup different from other cafés?
Hoang Anh: We don't use any single-use plastic. Drinks come in glass cups if you sit in, and if you want a takeaway, you can bring your own cup or borrow one of ours. You just return it next time.

Reporter: Do customers really return the cups?
Hoang Anh: Most of them do! In the first month, we lost about 30 cups, so I was worried. But now we lose fewer than five a month. People like the idea, and regular customers remind each other.

Reporter: What was the hardest part of starting the business?
Hoang Anh: Money, definitely. My parents lent me some, but I also had to borrow from a bank. For the first eight months, I didn't pay myself any salary at all.

Reporter: What advice would you give to young people who want to start a business?
Hoang Anh: Start small and listen to your customers. My first idea was to sell cakes too, but nobody bought them, so I stopped and focused on drinks.`,
        questions: [
            ['main_idea', 'easy', 'What is the interview mainly about?', ["A young business owner's experience of running an eco-friendly café", 'How to make coffee at home', 'Why plastic cups are cheaper than glass cups', 'A bank that lends money to students'], "Cuộc phỏng vấn nói về quán cà phê Green Cup không dùng nhựa một lần và những khó khăn khi khởi nghiệp của Hoàng Anh."],
            ['detail', 'easy', 'What can customers do if they want a takeaway drink?', ['Bring their own cup or borrow one from the café', 'Buy a plastic cup', 'Drink it in a glass outside', 'Order it online only'], "'you can bring your own cup or borrow one of ours'."],
            ['detail', 'medium', 'How many cups does the café lose each month now?', ['Fewer than five', 'About 30', 'More than 30', 'None'], "'now we lose fewer than five a month' (khoảng 30 chiếc là số bị mất trong tháng đầu tiên)."],
            ['inference', 'medium', "What can we infer about Green Cup's first eight months?", ['The café did not earn enough for Hoang Anh to take a salary.', 'The café was closed.', 'Hoang Anh earned a lot of money.', 'The bank refused to lend any money.'], "'For the first eight months, I didn't pay myself any salary at all.' → quán chưa đủ lợi nhuận để chủ quán nhận lương."],
            ['detail', 'medium', 'Why did Hoang Anh stop selling cakes?', ['Customers did not buy them.', 'They were too expensive to make.', 'The bank asked Hoang Anh to stop.', 'The kitchen was too small.'], "'nobody bought them, so I stopped and focused on drinks'."],
        ],
    },
    {
        id: 'RP38', level: 'B1', genre: 'Article', title: "Young volunteers clean up Can Tho's canals",
        text: `On the first Sunday of every month, about fifty young people meet at 6 a.m. beside a small canal in Ninh Kieu District. They wear gloves and boots, and they carry large bags. Their mission is simple: to remove as much rubbish from the water as possible.

The group, called "Clean Canal Can Tho", was started in 2023 by three university friends who were tired of seeing plastic bottles and bags floating past their homes. At first, only a few neighbors joined them. Today, the group has more than 400 members on social media, and local businesses donate water and breakfast for the volunteers.

In just one morning, the volunteers can collect up to 300 kilograms of rubbish. Most of it is plastic, but they have also found old shoes, a broken chair and even a motorbike tire. The rubbish is sorted, and anything that can be recycled is sold. The money is used to buy more equipment.

"Cleaning is only half of the job," says Thao, one of the founders. "If people keep throwing rubbish into the canals, we will never finish." That is why the group also visits local schools to teach children about waste and recycling. Thao believes that if children learn good habits early, they will also change their parents' behavior.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['A volunteer group that cleans canals and teaches people about waste', 'How to recycle plastic at home', 'A new canal in Ninh Kieu District', 'Why local businesses sell water'], "Bài viết giới thiệu nhóm 'Clean Canal Can Tho': dọn rác ở kênh, bán rác tái chế và dạy trẻ em về rác thải."],
            ['detail', 'easy', 'How often does the group clean the canals?', ['Once a month', 'Every Sunday', 'Every day', 'Once a year'], "'On the first Sunday of every month' → mỗi tháng một lần."],
            ['detail', 'medium', 'What happens to the rubbish that can be recycled?', ['It is sold, and the money buys more equipment.', 'It is given to local schools.', 'It is put back into the canal.', 'It is sent to local businesses for free.'], "'anything that can be recycled is sold. The money is used to buy more equipment.'"],
            ['vocabulary', 'medium', "The word 'donate' in paragraph 2 is closest in meaning to ______.", ['give for free', 'sell', 'borrow', 'collect'], "'donate' = quyên góp, tặng (không lấy tiền). Các doanh nghiệp tặng nước và bữa sáng cho tình nguyện viên."],
            ['inference', 'hard', 'Why does the group visit schools?', ['They hope fewer people will throw rubbish into the canals in the future.', 'They want children to clean the canals every day.', 'Schools pay them for their lessons.', "The children's parents asked them to come."], "'If people keep throwing rubbish into the canals, we will never finish.' → dạy trẻ em để thay đổi thói quen xả rác của cả gia đình về lâu dài."],
        ],
    },
    {
        id: 'RP39', level: 'B1', genre: 'Article', title: 'Are you getting enough sleep?',
        text: `Most experts agree that young adults need between seven and nine hours of sleep a night. However, when a university in the Mekong Delta asked 300 of its students about their sleeping habits, almost half of them said they sleep fewer than six hours on weekdays. The most common reasons were studying late, using their phones in bed, and working part-time in the evening.

Lack of sleep does more than make you feel tired. It can affect your memory, so it becomes harder to remember what you learned in class. It can also make you more likely to catch colds, because your body has less time to repair itself.

So what can you do? First, try to go to bed and get up at the same time every day, even at weekends. Second, put your phone away at least 30 minutes before bed – the light from the screen tells your brain that it is still daytime. Finally, avoid drinking coffee or tea after 4 p.m.

It may seem that staying up late gives you more time to study. In fact, a good night's sleep could be the easiest way to improve your grades.`,
        questions: [
            ['main_idea', 'easy', 'What is the main purpose of the text?', ['To explain why sleep is important and give advice', 'To sell a new kind of bed', 'To describe a part-time job', 'To compare coffee and tea'], "Bài viết nêu tình trạng sinh viên thiếu ngủ, tác hại của thiếu ngủ và đưa ra lời khuyên (First, Second, Finally)."],
            ['detail', 'easy', 'According to experts, how much sleep do young adults need?', ['Between seven and nine hours a night', 'Fewer than six hours a night', 'About five hours a night', 'At least ten hours a night'], "'young adults need between seven and nine hours of sleep a night'."],
            ['detail', 'medium', 'Which is NOT mentioned as a reason why students sleep too little?', ['Playing sports in the evening', 'Studying late', 'Using phones in bed', 'Working part-time in the evening'], "Các lý do được nêu: 'studying late, using their phones in bed, and working part-time in the evening' – không có chơi thể thao."],
            ['detail', 'medium', 'Why should you put your phone away before bed?', ['The light from the screen makes your brain think it is still daytime.', 'Your phone may get too hot at night.', 'Your friends may call you late at night.', 'Phones use too much electricity at night.'], "'the light from the screen tells your brain that it is still daytime'."],
            ['inference', 'hard', 'What does the writer suggest in the last paragraph?', ['Sleeping well may help students more than studying late.', 'Students should study all night before exams.', 'Grades are not important.', 'Students should drink coffee to study longer.'], "'a good night's sleep could be the easiest way to improve your grades' → ngủ đủ có thể giúp ích cho việc học hơn là thức khuya."],
        ],
    },
];

const FOCUS_CATEGORY = {
    main_idea: 'Main Idea',
    detail: 'Detail',
    inference: 'Inference',
    vocabulary: 'Vocabulary in Context',
};

const passages = PASSAGES.map(({ questions, ...p }) => p);

const questions = PASSAGES.flatMap(p => p.questions.map(([focus, difficulty, question, [correct, ...distractors], explanation]) => ({
    skill: 'reading',
    category: FOCUS_CATEGORY[focus],
    level: p.level,
    difficulty,
    passageId: p.id,
    tags: ['reading', focus.replace('_', '-'), p.genre.toLowerCase().replace(/[^a-z]+/g, '-')],
    ...mc({ type: 'choice', question, correct, distractors, explanation }),
})));

module.exports = { passages, questions };
