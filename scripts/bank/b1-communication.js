'use strict';

const { mc } = require('../lib/builders');

// Trình độ B1. Mỗi dòng: [difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
const BANK = {
    'Opinions & Agreement': [
        ['easy', "A: I think online classes are better than face-to-face classes. <br>B: ______ I learn more when I can talk to the teacher directly.", ["I'm not so sure about that.", "I couldn't agree more.", 'Me too.', "You're welcome."], "B đưa ra lý do ngược lại (học trực tiếp hiệu quả hơn) → không đồng ý một cách lịch sự: 'I'm not so sure about that.'"],
        ['easy', "A: What do you think of the new shopping mall? <br>B: ______", ["In my opinion, it's too crowded.", 'I think so, too.', 'Yes, I think of it.', "No, I don't think."], "A hỏi ý kiến ('What do you think of...?') → nêu quan điểm: 'In my opinion, ...'."],
        ['medium', "A: Students should wear uniforms at university. <br>B: ______ Uniforms are cheap, and students don't have to think about what to wear.", ['I totally agree with you.', "I'm afraid I disagree.", "That's not true at all.", 'It depends on the weather.'], "Lý do B đưa ra ủng hộ ý của A → đồng ý: 'I totally agree with you.'"],
        ['medium', "A: Do you think it will rain this afternoon? <br>B: ______ Look at those dark clouds.", ["I'm afraid so.", "I'm afraid not.", "I don't think so.", "No, it won't."], "Có mây đen → nghĩ là sẽ mưa (điều không mong muốn): 'I'm afraid so.' (e rằng là có)."],
        ['medium', "A: Living in the city is much more exciting than living in the countryside. <br>B: ______ but it's also more stressful.", ["That's true,", 'I disagree,', 'Not at all,', 'Me neither,'], "B đồng ý một phần rồi bổ sung ý trái chiều với 'but... also' → 'That's true, but...'."],
        ['hard', "A: I don't think Lan will come to the party. <br>B: ______ She said she was very busy.", ['Neither do I.', 'So do I.', 'Me too.', 'I think so.'], "Đồng ý với một câu phủ định ('I don't think...') → 'Neither do I.' ('So do I' chỉ dùng để đồng ý với câu khẳng định)."],
        ['easy', "A: What's your opinion on using phones in class? <br>B: ______", ["Personally, I think they're useful for looking up words.", 'Yes, it is my opinion.', 'I use my phone every day.', 'I have a new phone.'], "Được hỏi ý kiến → trả lời bằng quan điểm cá nhân: 'Personally, I think...'."],
    ],
    'Suggestions': [
        ['medium', "A: We have a long weekend. ______ <br>B: Great idea! I've always wanted to see Ha Long Bay.", ['Why don\'t we take a trip to Quang Ninh?', "Why didn't we go to Quang Ninh?", 'Did you go to Quang Ninh?', 'Where is Quang Ninh?'], "B trả lời 'Great idea!' → A vừa đưa ra một lời gợi ý: 'Why don't we...?'"],
        ['easy', "A: I can't decide what to give my mother for her birthday. <br>B: ______", ['How about some flowers and a card?', 'Happy birthday to your mother!', 'She was born in May.', 'I gave her a card yesterday.'], "A cần lời gợi ý → 'How about + danh từ/V-ing?' là cách gợi ý."],
        ['easy', "A: If I were you, I'd talk to the teacher about it. <br>B: ______", ["Good idea. I'll do that after class.", 'Yes, you are me.', "No, I wasn't.", "You're welcome."], "'If I were you, I'd...' là lời khuyên → đáp lại: 'Good idea. I'll do that...'."],
        ['medium', "A: Shall I book a table for dinner? <br>B: ______ It's always busy on Saturday night.", ["Yes, that's a good idea.", "No, you shan't.", 'Yes, I shall.', "No, it isn't."], "'Shall I...?' là lời đề nghị giúp đỡ → đồng ý: 'Yes, that's a good idea.'"],
        ['easy', "A: The traffic is terrible today. <br>B: ______", ["Maybe we'd better take another road.", 'Yes, I like it very much.', "No, it wasn't.", "You're right. I'm fine."], "Đáp lại một vấn đề bằng lời gợi ý: 'Maybe we'd better...' (có lẽ chúng ta nên...)."],
    ],
    'Complaints & Apologies': [
        ['easy', "A: Hello, I'm calling because my internet hasn't worked since yesterday. <br>B: ______", ["I'm sorry for the trouble. Let me check your connection.", "Great! I'm glad it works.", 'You can pay online.', 'Yes, I used it yesterday.'], "Nhân viên nhận lời phàn nàn → xin lỗi và đưa ra hướng giải quyết: 'I'm sorry for the trouble. Let me check...'."],
        ['easy', "A: I'm sorry, but I won't be able to come to your party on Saturday. <br>B: ______", ["That's a shame. Maybe next time.", 'Great! See you there.', "You're welcome.", "Yes, it's on Saturday."], "Bạn từ chối lời mời kèm lời xin lỗi → bày tỏ tiếc nuối: 'That's a shame. Maybe next time.'"],
        ['easy', "A: I'd like to make a complaint. The phone I bought here yesterday doesn't work. <br>B: ______", ["I'm sorry about that. Do you have the receipt?", "Great! I'm glad you like it.", 'Yes, it works very well.', 'You can pay by card.'], "Nhận lời phàn nàn của khách → xin lỗi và hỏi hoá đơn: 'I'm sorry about that. Do you have the receipt?'"],
        ['easy', "A: I'm really sorry. I broke your favorite cup. <br>B: ______", ['Never mind. It was an old one anyway.', "You're welcome.", 'Yes, please.', 'Congratulations!'], "Đáp lại lời xin lỗi → 'Never mind.' (Đừng bận tâm)."],
        ['medium', "A: Excuse me, but you're sitting in my seat. <br>B: ______", ["Oh, I'm so sorry. I didn't realize.", 'Yes, I am. Thank you.', "You're welcome.", "It's a comfortable seat."], "Bị nhắc ngồi nhầm chỗ → xin lỗi: 'Oh, I'm so sorry. I didn't realize.'"],
        ['medium', "A: ______ <br>B: I'm sorry. I'll turn it down right away.", ["Excuse me, could you keep the noise down? It's after midnight.", 'Could you turn on the music, please?', 'What kind of music do you like?', 'I love this song!'], "B xin lỗi và hứa vặn nhỏ → A đã phàn nàn về tiếng ồn: 'could you keep the noise down?'"],
        ['easy', "A: I'm afraid there's a mistake on my bill. I didn't order dessert. <br>B: ______", ["Let me check. Oh, you're right. I'm very sorry.", 'Would you like some dessert?', "Here's the menu.", 'Yes, the dessert is delicious.'], "Khách báo hoá đơn bị sai → kiểm tra và xin lỗi: 'Let me check... I'm very sorry.'"],
    ],
    'Requests & Offers': [
        ['medium', "A: I was wondering if you could help me with my CV. <br>B: ______", ["Of course. Send it to me and I'll take a look.", 'Yes, I was wondering too.', "No, I don't wonder.", 'It is my CV.'], "'I was wondering if you could...' là lời nhờ rất lịch sự → đồng ý: 'Of course...'."],
        ['easy', "A: Would you like me to carry that bag for you? <br>B: ______", ["That's very kind of you. Thanks.", 'Yes, I would like to carry it.', "No, I don't like.", "You're welcome."], "'Would you like me to...?' là lời đề nghị giúp đỡ → nhận lời và cảm ơn: 'That's very kind of you.'"],
        ['medium', "A: Do you need a hand with those boxes? <br>B: ______", ["Yes, please. They're quite heavy.", 'No, I have two hands.', 'Yes, I need two hands.', "No, they aren't."], "'Do you need a hand?' = Bạn có cần giúp không? → 'Yes, please.'"],
        ['medium', "A: Would it be possible to change my appointment to Thursday? <br>B: ______", ['Let me see... Yes, Thursday at 10 a.m. is available.', 'Yes, it was possible.', "No, it isn't Thursday.", "I'm sorry to hear that."], "Yêu cầu đổi lịch hẹn → kiểm tra và đưa ra giờ còn trống: 'Thursday at 10 a.m. is available.'"],
        ['medium', "A: I'll give you a lift to the station if you like. <br>B: ______", ['Thanks, that would be great.', "Yes, I'd like to give you a lift.", "No, I don't like stations.", "It's very heavy."], "'give somebody a lift' = cho ai đi nhờ xe → nhận lời: 'Thanks, that would be great.'"],
        ['easy', "A: Could you possibly lend me your notes from yesterday's lecture? <br>B: ______", ["Sure. I'll bring them tomorrow.", 'Yes, I could possibly.', "No, I didn't borrow them.", 'Yes, the lecture was boring.'], "Đồng ý cho mượn → 'Sure. I'll bring them tomorrow.'"],
    ],
    'Work & Interviews': [
        ['easy', "Interviewer: Why do you want to work for our company? <br>Candidate: ______", ["Because I'd like to develop my skills in an international company.", "Because I'm 22 years old.", 'I worked there yesterday.', 'Yes, I want.'], "Câu hỏi 'Why...?' về động lực làm việc → trả lời lý do hợp lý: 'Because I'd like to develop my skills...'."],
        ['medium', "Interviewer: What are your strengths? <br>Candidate: ______", ["I'm hard-working, and I work well in a team.", "I'd like a high salary.", 'I graduated in 2025.', 'I live near your office.'], "'strengths' = điểm mạnh → nêu phẩm chất tốt: 'I'm hard-working, and I work well in a team.'"],
        ['medium', "Interviewer: Do you have any questions for us? <br>Candidate: ______", ['Yes. What training do new staff receive?', "No, I don't have any answers.", 'Yes, I asked a question.', "I'm fine, thank you."], "Nhà tuyển dụng mời ứng viên đặt câu hỏi → hỏi một câu liên quan đến công việc."],
        ['easy', "A: Could you send me the sales report by Friday? <br>B: ______", ["No problem. I'll email it to you on Thursday.", 'Yes, I sent it last Friday.', 'The sales were good.', "Yes, it's Friday."], "Đồng ý với yêu cầu và hứa hoàn thành trước hạn: 'No problem. I'll email it to you on Thursday.'"],
        ['easy', "A: Hello, I'm calling about the job advertisement on your website. <br>B: ______", ['Thank you. Which position are you interested in?', 'Thank you for your order.', "Here's your change.", 'Nice to meet you, too.'], "Người gọi hỏi về quảng cáo tuyển dụng → hỏi lại vị trí họ quan tâm: 'Which position are you interested in?'"],
        ['easy', "A: Congratulations on your promotion! <br>B: ______", ["Thanks! I'm really excited about it.", 'Never mind.', "I'm sorry to hear that.", 'Yes, please.'], "Đáp lại lời chúc mừng → cảm ơn: 'Thanks! I'm really excited about it.'"],
    ],
    'Health & Sympathy': [
        ['easy', "A: I failed my driving test again. <br>B: ______", ["Oh no, bad luck! You'll pass next time.", 'Congratulations!', 'Well done!', "That's great news."], "Bạn bè gặp chuyện không may → an ủi, động viên: 'Bad luck! You'll pass next time.'"],
        ['easy', "Doctor: What seems to be the problem? <br>Patient: ______", ["I've had a terrible cough for three days.", "I'm a teacher.", 'The problem is number 3.', "I'm fine, thank you."], "Bác sĩ hỏi bệnh → bệnh nhân mô tả triệu chứng: 'I've had a terrible cough for three days.'"],
        ['medium', "A: I didn't get the scholarship I applied for. <br>B: ______", ['What a shame! I know how hard you worked for it.', 'Congratulations! You deserve it.', "That's a relief.", "Never mind. It's my fault."], "Nghe tin không vui → bày tỏ sự cảm thông: 'What a shame! I know how hard you worked for it.'"],
        ['medium', "A: I've got a sore throat. <br>B: ______", ["Why don't you drink some warm water with honey?", 'Why did you drink warm water with honey?', "You'd better sing loudly tonight.", "That's good news."], "Đưa ra lời khuyên phù hợp khi bị đau họng: 'Why don't you drink some warm water with honey?'"],
        ['easy', "A: How are you feeling today? <br>B: ______", ['Much better, thanks. The medicine really helped.', "I'm a nurse.", "Yes, I'm feeling.", "I'll feel it on Monday."], "Hỏi thăm tình trạng sức khoẻ → 'Much better, thanks.'"],
    ],
    'Travel & Services': [
        ['easy', "Receptionist: Could I see your passport, please? <br>Guest: ______", ['Of course. Here you are.', 'Yes, you could.', "No, it isn't mine.", 'I see. Thank you.'], "Lễ tân yêu cầu xem hộ chiếu → đưa ra: 'Of course. Here you are.'"],
        ['medium', "A: Excuse me, would you mind keeping an eye on my bag for a minute? <br>B: ______", ['Not at all. Go ahead.', "Yes, I'd mind. Go ahead.", 'My eyes are fine, thanks.', "It's a nice bag."], "'keep an eye on' = trông chừng giúp. Đồng ý với 'Would you mind...?' → 'Not at all' (không phiền gì)."],
        ['medium', "A: I'd like to check out, please. Room 412. <br>B: ______", ['Certainly. Did you enjoy your stay?', 'Sure. How many nights would you like to stay?', 'Your room is on the fourth floor.', "Here's your room key. Enjoy your stay."], "'check out' = trả phòng → lễ tân xác nhận và hỏi thăm: 'Did you enjoy your stay?'"],
        ['medium', "A: Our flight has been delayed by two hours. <br>B: ______", ["Oh no! Let's get something to eat while we wait.", "Hurry up! We'll miss it.", 'Great! It left on time.', 'Yes, we arrived early yesterday.'], "Chuyến bay bị hoãn 2 tiếng → phải chờ: 'Let's get something to eat while we wait.'"],
        ['easy', "A: Could you recommend a good place to eat near here? <br>B: ______", ["Sure. There's a nice seafood restaurant just around the corner.", 'Yes, I ate a lot.', "I'm not hungry, thanks.", 'The bill, please.'], "Được nhờ giới thiệu chỗ ăn → gợi ý một nhà hàng gần đó."],
    ],
    'Clarifying & Checking': [
        ['medium', "A: The meeting has been moved to Room 305. <br>B: Sorry, ______ Did you say Room 305 or 315?", ["I didn't catch that.", "I don't agree.", "I'm afraid so.", "I didn't go there."], "Nghe không rõ, muốn hỏi lại → 'Sorry, I didn't catch that.' (tôi nghe không kịp)."],
        ['medium', "A: ______ <br>B: I mean that we need to finish the project two days earlier than planned.", ['What do you mean exactly?', 'What do you want to eat?', 'When did you finish?', 'How are you?'], "B giải thích 'I mean that...' → A đã hỏi lại ý: 'What do you mean exactly?'"],
        ['hard', "A: So you want me to send the documents today, ______? <br>B: Yes, before 5 p.m., please.", ['is that right', "isn't it", 'are you', 'do I'], "Kiểm tra lại thông tin vừa nghe → thêm 'is that right?' ở cuối câu (đúng không?)."],
        ['medium', "A: Could you say that again, please? The line is bad. <br>B: ______", ['Sure. I said the meeting starts at nine.', 'Yes, the line is long.', "No, I'm not bad.", "I'll call you yesterday."], "Được nhờ nhắc lại vì đường truyền kém → lặp lại thông tin: 'Sure. I said...'."],
    ],
};

module.exports = Object.entries(BANK).flatMap(([category, rows]) =>
    rows.map(([difficulty, question, [correct, ...distractors], explanation]) => ({
        skill: 'communication',
        category,
        level: 'B1',
        difficulty,
        tags: ['communication', category.toLowerCase().replace(/[^a-z]+/g, '-')],
        ...mc({ type: 'choice', question, correct, distractors, explanation }),
    })));
