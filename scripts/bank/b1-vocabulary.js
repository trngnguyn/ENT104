'use strict';

const { mc } = require('../lib/builders');

// Trình độ B1. Mỗi dòng: [difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
const BANK = {
    'Work & Careers': [
        ['easy', "After graduating, Linh sent her ______ to several companies, hoping to get an interview.", ['CV', 'receipt', 'recipe', 'ticket'], "'CV' (curriculum vitae) = sơ yếu lý lịch, hồ sơ xin việc."],
        ['medium', "The company is going to ______ ten new workers next month because it is growing fast.", ['hire', 'fire', 'retire', 'resign'], "'hire' = thuê, tuyển (người làm). Công ty đang phát triển nên cần tuyển thêm người."],
        ['medium', "My uncle worked as a teacher for 35 years. He ______ last year, and now he enjoys gardening.", ['retired', 'resigned', 'hired', 'promoted'], "'retire' = nghỉ hưu (sau nhiều năm làm việc). 'retired' là quá khứ."],
        ['medium', "Thanh works very hard, so her boss gave her a ______. She is now the team manager.", ['promotion', 'salary', 'deadline', 'colleague'], "'promotion' = sự thăng chức (lên làm trưởng nhóm)."],
        ['easy', "We need to finish this report by Friday. That's the ______.", ['deadline', 'salary', 'interview', 'application'], "'deadline' = hạn chót (thời hạn phải hoàn thành)."],
        ['medium', "My ______ are very friendly. We often have lunch together at the office.", ['colleagues', 'customers', 'employers', 'applicants'], "'colleagues' = đồng nghiệp (những người làm cùng nơi)."],
        ['medium', "Nam earns a good ______, but he has to work long hours.", ['salary', 'bill', 'fare', 'price'], "'salary' = tiền lương. 'earn a good salary' = có mức lương tốt."],
        ['hard', "Before the interview, you should ______ some information about the company.", ['find out', 'take off', 'give up', 'turn down'], "'find out' = tìm hiểu, khám phá (thông tin)."],
    ],
    'Education & Study': [
        ['easy', "To get into this university, you need to ______ an entrance exam.", ['take', 'make', 'play', 'spend'], "'take an exam' = dự thi, làm bài thi."],
        ['medium', "Huy got a ______ to study in Australia, so he doesn't have to pay any fees.", ['scholarship', 'degree', 'certificate', 'salary'], "'scholarship' = học bổng (không phải trả học phí)."],
        ['medium', "After four years at university, Mai received her bachelor's ______ in economics.", ['degree', 'scholarship', 'grade', 'course'], "'bachelor's degree' = bằng cử nhân."],
        ['medium', "You must ______ your essay by Monday. Late essays will not be accepted.", ['hand in', 'hand out', 'give up', 'put off'], "'hand in' = nộp (bài). 'hand out' = phát (tài liệu)."],
        ['medium', "Lan studies very hard and always gets high ______ in her exams.", ['marks', 'notes', 'degrees', 'fees'], "'marks' = điểm số. 'get high marks' = đạt điểm cao."],
        ['hard', "The library is a good place to study because it's quiet and you can ______ on your work.", ['concentrate', 'consider', 'contain', 'connect'], "'concentrate on' = tập trung vào."],
        ['medium', "Our teacher asked us to do some ______ on climate change and present it to the class.", ['research', 'lecture', 'subject', 'course'], "'do research on' = nghiên cứu, tìm hiểu về một chủ đề."],
    ],
    'Health & Fitness': [
        ['easy', "You have a high ______. You should stay in bed and drink a lot of water.", ['temperature', 'weight', 'height', 'headache'], "'have a high temperature' = bị sốt cao."],
        ['medium', "The doctor gave me a ______ for some medicine, and I took it to the pharmacy.", ['prescription', 'receipt', 'recipe', 'description'], "'prescription' = đơn thuốc (bác sĩ kê). 'recipe' = công thức nấu ăn."],
        ['easy', "Doing exercise regularly can help you stay ______ and healthy.", ['fit', 'fat', 'sick', 'tired'], "'stay fit' = giữ dáng, khoẻ mạnh."],
        ['medium', "I ______ my ankle while I was playing football, so I can't walk properly.", ['twisted', 'washed', 'cured', 'treated'], "'twist one's ankle' = trẹo/bong gân mắt cá chân."],
        ['easy', "Eating too much sugar is bad for your ______.", ['health', 'healthy', 'heal', 'healthily'], "Sau tính từ sở hữu 'your' cần danh từ → 'health' (sức khoẻ). 'healthy' là tính từ."],
        ['easy', "My grandmother has to take ______ every morning for her heart.", ['medicine', 'medical', 'menu', 'metal'], "'take medicine' = uống thuốc. 'medical' là tính từ (thuộc y tế)."],
        ['hard', "You should ______ fast food if you want to lose weight.", ['cut down on', 'look forward to', 'run out of', 'come up with'], "'cut down on' = cắt giảm (lượng ăn/dùng)."],
    ],
    'Environment & Weather': [
        ['medium', "Plastic bags cause a lot of ______ in our rivers and oceans.", ['pollution', 'population', 'solution', 'position'], "'pollution' = sự ô nhiễm. 'population' = dân số."],
        ['easy', "We should ______ paper, glass and plastic instead of throwing them away.", ['recycle', 'remind', 'repeat', 'review'], "'recycle' = tái chế."],
        ['easy', "The weather ______ says it will be sunny tomorrow.", ['forecast', 'climate', 'season', 'temperature'], "'weather forecast' = dự báo thời tiết."],
        ['easy', "Many animals are in danger because people are cutting down the ______.", ['forests', 'deserts', 'oceans', 'rivers'], "'cut down forests' = chặt phá rừng → động vật mất nơi sống."],
        ['medium', "There was a terrible ______ in the Mekong Delta last year, and many fields were under water.", ['flood', 'drought', 'earthquake', 'heatwave'], "'flood' = lũ lụt (đồng ruộng ngập nước). 'drought' = hạn hán."],
        ['easy', "Turn off the lights when you leave the room to save ______.", ['energy', 'weather', 'climate', 'pollution'], "'save energy' = tiết kiệm năng lượng."],
        ['medium', "Global warming is causing the sea ______ to rise.", ['level', 'surface', 'wave', 'shore'], "'sea level' = mực nước biển. 'the sea level rises' = mực nước biển dâng."],
    ],
    'Technology & Media': [
        ['easy', "I can't send you the file now. My laptop's ______ is almost dead.", ['battery', 'screen', 'keyboard', 'password'], "'battery' = pin. 'The battery is almost dead' = pin gần hết."],
        ['easy', "You need to enter your ______ to log in to your account.", ['password', 'keyboard', 'screen', 'battery'], "'password' = mật khẩu (dùng để đăng nhập)."],
        ['medium', "This app is free. You can ______ it from the App Store.", ['download', 'upload', 'delete', 'print'], "'download' = tải xuống (về máy). 'upload' = tải lên."],
        ['medium', "I accidentally ______ my essay from the computer, so I have to write it again.", ['deleted', 'saved', 'printed', 'shared'], "'delete' = xoá. Bài bị xoá nên phải viết lại."],
        ['easy', "Many young people get the news from social ______ like Facebook and TikTok.", ['media', 'press', 'papers', 'studio'], "'social media' = mạng xã hội."],
        ['medium', "The ______ of the newspaper article was 'Students clean up Ninh Kieu Park'.", ['headline', 'deadline', 'advertisement', 'channel'], "'headline' = tiêu đề (bài báo)."],
        ['easy', "Please ______ your phone before the film starts.", ['switch off', 'switch on', 'pick up', 'put on'], "'switch off' = tắt (thiết bị). 'switch on' = bật."],
    ],
    'Feelings & Personality': [
        ['easy', "Huy never gets angry when he has to wait. He is very ______.", ['patient', 'impatient', 'lazy', 'rude'], "'patient' = kiên nhẫn. 'impatient' = thiếu kiên nhẫn."],
        ['easy', "My sister always tells the truth. She is very ______.", ['honest', 'generous', 'jealous', 'shy'], "'honest' = trung thực."],
        ['easy', "Ngoc often gives money and presents to her friends. She's very ______.", ['generous', 'selfish', 'mean', 'nervous'], "'generous' = hào phóng, rộng rãi."],
        ['medium', "I was really ______ when my best friend forgot my birthday.", ['disappointed', 'disappointing', 'excited', 'relaxed'], "Tính từ -ed chỉ cảm xúc của người: 'disappointed' = thất vọng. '-ing' miêu tả tính chất của sự việc."],
        ['medium', "The news about the flood was really ______. Many families lost their homes.", ['shocking', 'shocked', 'exciting', 'relaxing'], "Tính từ -ing miêu tả tính chất của sự việc: 'shocking' = gây sốc. '-ed' (shocked) chỉ cảm xúc của người."],
        ['easy', "Minh feels ______ when he has to speak in front of a lot of people.", ['nervous', 'calm', 'proud', 'generous'], "'nervous' = lo lắng, hồi hộp."],
        ['medium', "She was ______ of her son when he won the competition.", ['proud', 'ashamed', 'afraid', 'bored'], "'be proud of' = tự hào về."],
    ],
    'Phrasal Verbs': [
        ['easy', "Can you ______ my cat while I'm on holiday?", ['look after', 'look for', 'look up', 'look like'], "'look after' = chăm sóc, trông nom."],
        ['medium', "If you don't know a word, ______ it ______ in the dictionary.", ['look / up', 'look / for', 'take / off', 'turn / down'], "'look something up' = tra cứu (từ điển, thông tin)."],
        ['easy', "Don't ______! You can do it if you keep trying.", ['give up', 'take up', 'set up', 'pick up'], "'give up' = bỏ cuộc."],
        ['medium', "We've ______ milk. Can you buy some on your way home?", ['run out of', 'run into', 'run away from', 'come up with'], "'run out of' = hết, cạn (thứ gì đó)."],
        ['medium', "The meeting was ______ until next week because the manager was sick.", ['put off', 'put on', 'taken off', 'turned on'], "'put off' = hoãn lại."],
        ['medium', "It took me two weeks to ______ the flu.", ['get over', 'get on', 'get up', 'get off'], "'get over' = khỏi (bệnh), vượt qua."],
        ['easy', "Could you ______ the TV? I can't hear the news.", ['turn up', 'turn down', 'turn off', 'turn into'], "'turn up' = vặn to (âm lượng). 'turn down' = vặn nhỏ."],
        ['hard', "My car ______ on the way to work, so I had to take a taxi.", ['broke down', 'broke up', 'broke into', 'broke out'], "'break down' = (máy móc, xe) bị hỏng. 'broke down' là quá khứ."],
    ],
    'Collocations': [
        ['medium', "Please be quiet. I'm trying to ______ a decision.", ['make', 'do', 'have', 'get'], "'make a decision' = đưa ra quyết định."],
        ['medium', "Linh ______ a lot of progress in English this semester.", ['has made', 'has done', 'has taken', 'has got'], "'make progress' = tiến bộ → 'has made a lot of progress'."],
        ['medium', "Could you ______ me a favor and carry this bag?", ['do', 'make', 'give', 'take'], "'do somebody a favor' = giúp ai một việc."],
        ['easy', "Let's ______ a break. We've been working for three hours.", ['take', 'make', 'do', 'put'], "'take a break' = nghỉ giải lao."],
        ['medium', "It's important to ______ attention in class.", ['pay', 'make', 'do', 'keep'], "'pay attention' = chú ý, tập trung."],
    ],
    'Word Formation': [
        ['medium', "The ______ of the new bridge took three years.", ['construction', 'construct', 'constructive', 'constructed'], "Sau 'The' và trước 'of' cần danh từ → 'construction' (việc xây dựng)."],
        ['easy', "She answered all the questions ______.", ['correctly', 'correct', 'correction', 'corrected'], "Bổ nghĩa cho động từ 'answered' cần trạng từ → 'correctly' (một cách chính xác)."],
        ['easy', "Thank you for your ______ advice. It really helped me.", ['useful', 'use', 'usefully', 'usage'], "Trước danh từ 'advice' cần tính từ → 'useful' (hữu ích)."],
        ['medium', "The instructions were ______, so nobody knew what to do.", ['unclear', 'clearly', 'clearness', 'clarity'], "Sau 'were' cần tính từ; 'nobody knew what to do' → 'unclear' (không rõ ràng)."],
    ],
};

module.exports = Object.entries(BANK).flatMap(([category, rows]) =>
    rows.map(([difficulty, question, [correct, ...distractors], explanation]) => ({
        skill: 'vocabulary',
        category,
        level: 'B1',
        difficulty,
        tags: ['vocabulary', category.toLowerCase().replace(/[^a-z]+/g, '-')],
        ...mc({ type: 'choice', question, correct, distractors, explanation }),
    })));
