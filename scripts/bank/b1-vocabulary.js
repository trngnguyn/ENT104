'use strict';

const { mc } = require('../lib/builders');

// Trình độ B1. Mỗi dòng: [difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
const BANK = {
    'Work & Careers': [
        ['medium', "After graduating, Linh updated her ______ with her qualifications and sent it to several companies, hoping to get an interview.", ['CV', 'receipt', 'recipe', 'ticket'], "'CV' (curriculum vitae) = hồ sơ tóm tắt học vấn, kỹ năng và kinh nghiệm để xin việc."],
        ['medium', "The company is going to ______ ten new workers next month because it is growing fast.", ['hire', 'fire', 'retire', 'resign'], "'hire' = thuê, tuyển (người làm). Công ty đang phát triển nên cần tuyển thêm người."],
        ['medium', "My uncle worked as a teacher for 35 years. He ______ last year, and now he enjoys gardening.", ['retired', 'resigned', 'hired', 'promoted'], "'retire' = nghỉ hưu (sau nhiều năm làm việc). 'retired' là quá khứ."],
        ['medium', "Thanh works very hard, so her boss gave her a ______. She is now the team manager.", ['promotion', 'salary', 'deadline', 'colleague'], "'promotion' = sự thăng chức (lên làm trưởng nhóm)."],
        ['medium', "The client needs the report on Saturday, so our manager has set Friday afternoon as the ______.", ['deadline', 'salary', 'interview', 'application'], "'deadline' = hạn chót; thứ Sáu là thời điểm cuối cùng nhóm phải hoàn thành báo cáo."],
        ['medium', "My ______ are very friendly. We often have lunch together at the office.", ['colleagues', 'customers', 'employers', 'applicants'], "'colleagues' = đồng nghiệp (những người làm cùng nơi)."],
        ['medium', "Nam earns a good ______, but he has to work long hours.", ['salary', 'bill', 'fare', 'price'], "'salary' = tiền lương. 'earn a good salary' = có mức lương tốt."],
        ['hard', "Before the interview, you should ______ some information about the company.", ['find out', 'take off', 'give up', 'turn down'], "'find out' = tìm hiểu, khám phá (thông tin)."],
    ],
    'Education & Study': [
        ['medium', "Before applicants can enter the university, they must ______ an entrance exam and achieve a high score.", ['take', 'make', 'play', 'spend'], "Collocation 'take an exam' = dự/làm bài thi; không dùng 'make an exam' cho thí sinh."],
        ['medium', "Huy got a ______ to study in Australia, so he doesn't have to pay any fees.", ['scholarship', 'degree', 'certificate', 'salary'], "'scholarship' = học bổng (không phải trả học phí)."],
        ['medium', "After four years at university, Mai received her bachelor's ______ in economics.", ['degree', 'scholarship', 'grade', 'course'], "'bachelor's degree' = bằng cử nhân."],
        ['medium', "You must ______ your essay by Monday. Late essays will not be accepted.", ['hand in', 'hand out', 'give up', 'put off'], "'hand in' = nộp (bài). 'hand out' = phát (tài liệu)."],
        ['medium', "Lan studies very hard and always gets high ______ in her exams.", ['marks', 'notes', 'degrees', 'fees'], "'marks' = điểm số. 'get high marks' = đạt điểm cao."],
        ['hard', "The library is a good place to study because it's quiet and you can ______ on your work.", ['concentrate', 'consider', 'contain', 'connect'], "'concentrate on' = tập trung vào."],
        ['medium', "Our teacher asked us to do some ______ on climate change and present it to the class.", ['research', 'lecture', 'subject', 'course'], "'do research on' = nghiên cứu, tìm hiểu về một chủ đề."],
    ],
    'Health & Fitness': [
        ['medium', "Your ______ is 39°C, so you should stay in bed, drink water, and check it again later.", ['temperature', 'weight', 'height', 'headache'], "39°C là thân nhiệt cao; 'temperature' = nhiệt độ/thân nhiệt."],
        ['medium', "The doctor gave me a ______ for some medicine, and I took it to the pharmacy.", ['prescription', 'receipt', 'recipe', 'description'], "'prescription' = đơn thuốc (bác sĩ kê). 'recipe' = công thức nấu ăn."],
        ['medium', "Although Minh has an office job, he cycles every morning to keep ______ and reduce stress.", ['fit', 'fat', 'sick', 'tired'], "Collocation 'keep fit' = duy trì thể lực/sức khỏe tốt."],
        ['medium', "I ______ my ankle while I was playing football, so I can't walk properly.", ['twisted', 'washed', 'cured', 'treated'], "'twist one's ankle' = trẹo/bong gân mắt cá chân."],
        ['medium', "Eating too much sugar can damage your ______, even if the food seems harmless.", ['health', 'healthy', 'heal', 'healthily'], "Sau tính từ sở hữu 'your' cần danh từ 'health' (sức khỏe); 'healthy' là tính từ và 'healthily' là trạng từ."],
        ['medium', "My grandmother takes heart ______ every morning, but she never changes the amount without asking her doctor.", ['medicine', 'medical', 'menu', 'metal'], "'medicine' là danh từ chỉ thuốc; 'take medicine' = uống thuốc. 'Medical' là tính từ."],
        ['hard', "You should ______ fast food if you want to lose weight.", ['cut down on', 'look forward to', 'run out of', 'come up with'], "'cut down on' = cắt giảm (lượng ăn/dùng)."],
    ],
    'Environment & Weather': [
        ['medium', "Plastic bags cause a lot of ______ in our rivers and oceans.", ['pollution', 'population', 'solution', 'position'], "'pollution' = sự ô nhiễm. 'population' = dân số."],
        ['medium', "Instead of throwing paper, glass, and plastic away, the school collects them so they can be ______.", ['recycled', 'reminded', 'repeated', 'reviewed'], "'recycled' = được tái chế; câu bị động 'can be + V3' phù hợp với các vật liệu được thu gom."],
        ['medium', "According to tomorrow's weather ______, the morning will be sunny but heavy rain may arrive in the evening.", ['forecast', 'climate', 'season', 'temperature'], "'weather forecast' = bản tin/dự báo thời tiết; câu cung cấp dự đoán cho ngày mai."],
        ['easy', "Many animals are in danger because people are cutting down the ______.", ['forests', 'deserts', 'oceans', 'rivers'], "'cut down forests' = chặt phá rừng → động vật mất nơi sống."],
        ['medium', "There was a terrible ______ in the Mekong Delta last year, and many fields were under water.", ['flood', 'drought', 'earthquake', 'heatwave'], "'flood' = lũ lụt (đồng ruộng ngập nước). 'drought' = hạn hán."],
        ['medium', "The school hopes to save ______ by replacing old lights and switching computers off after class.", ['energy', 'weather', 'climate', 'pollution'], "Collocation 'save energy' = tiết kiệm năng lượng; cả đèn và máy tính đều sử dụng điện."],
        ['medium', "Global warming is causing the sea ______ to rise.", ['level', 'surface', 'wave', 'shore'], "'sea level' = mực nước biển. 'the sea level rises' = mực nước biển dâng."],
    ],
    'Technology & Media': [
        ['medium', "My laptop suddenly shut down because its ______ was almost dead, and I had left the charger at home.", ['battery', 'screen', 'keyboard', 'password'], "'battery' = pin; 'almost dead' nghĩa là gần hết pin, phù hợp với việc máy tắt."],
        ['medium', "To protect your account, choose a strong ______ and do not share it with anyone.", ['password', 'keyboard', 'screen', 'battery'], "'password' = mật khẩu dùng để bảo vệ và đăng nhập tài khoản."],
        ['medium', "This app is free. You can ______ it from the App Store.", ['download', 'upload', 'delete', 'print'], "'download' = tải xuống (về máy). 'upload' = tải lên."],
        ['medium', "I accidentally ______ my essay from the computer, so I have to write it again.", ['deleted', 'saved', 'printed', 'shared'], "'delete' = xoá. Bài bị xoá nên phải viết lại."],
        ['medium', "Many young people follow breaking news on social ______, although they should check whether each source is reliable.", ['media', 'press', 'papers', 'studio'], "'social media' = mạng xã hội; 'media' đi sau 'social' trong cụm cố định này."],
        ['medium', "The ______ of the newspaper article was 'Students clean up Ninh Kieu Park'.", ['headline', 'deadline', 'advertisement', 'channel'], "'headline' = tiêu đề (bài báo)."],
        ['easy', "Please ______ your phone before the film starts.", ['switch off', 'switch on', 'pick up', 'put on'], "'switch off' = tắt (thiết bị). 'switch on' = bật."],
    ],
    'Feelings & Personality': [
        ['medium', "Even after waiting for an hour, Huy remained calm and did not complain; he is remarkably ______.", ['patient', 'impatient', 'lazy', 'rude'], "'patient' = kiên nhẫn; việc bình tĩnh chờ lâu mà không phàn nàn thể hiện phẩm chất này."],
        ['medium', "My sister admitted that she had broken the vase even though nobody saw her do it. She is very ______.", ['honest', 'generous', 'jealous', 'shy'], "'honest' = trung thực; cô ấy nói thật dù có thể giấu lỗi."],
        ['medium', "Ngoc regularly shares her time and money with people who need help, so her friends describe her as ______.", ['generous', 'selfish', 'mean', 'nervous'], "'generous' = hào phóng, rộng lượng; đối lập với 'selfish/mean' trong ngữ cảnh."],
        ['medium', "I was really ______ when my best friend forgot my birthday.", ['disappointed', 'disappointing', 'excited', 'relaxed'], "Tính từ -ed chỉ cảm xúc của người: 'disappointed' = thất vọng. '-ing' miêu tả tính chất của sự việc."],
        ['medium', "The news about the flood was really ______. Many families lost their homes.", ['shocking', 'shocked', 'exciting', 'relaxing'], "Tính từ -ing miêu tả tính chất của sự việc: 'shocking' = gây sốc. '-ed' (shocked) chỉ cảm xúc của người."],
        ['easy', "Minh feels ______ when he has to speak in front of a lot of people.", ['nervous', 'calm', 'proud', 'generous'], "'nervous' = lo lắng, hồi hộp."],
        ['medium', "She was ______ of her son when he won the competition.", ['proud', 'ashamed', 'afraid', 'bored'], "'be proud of' = tự hào về."],
    ],
    'Phrasal Verbs': [
        ['medium', "While I am away, could you ______ my cat by feeding it twice a day and keeping its water bowl full?", ['look after', 'look for', 'look up', 'look like'], "'look after' = chăm sóc/trông nom; các việc cho ăn và thêm nước làm rõ nghĩa."],
        ['medium', "If you don't know a word, ______ it ______ in the dictionary.", ['look / up', 'look / for', 'take / off', 'turn / down'], "'look something up' = tra cứu (từ điển, thông tin)."],
        ['medium', "The first two exercises are difficult, but don't ______; ask for help and keep trying.", ['give up', 'take up', 'set up', 'pick up'], "'give up' = bỏ cuộc; đối lập với 'keep trying'."],
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
        ['medium', "We've been working without stopping for three hours, so let's ______ a short break before checking the report.", ['take', 'make', 'do', 'put'], "Collocation cố định 'take a break' = nghỉ giải lao."],
        ['medium', "It's important to ______ attention in class.", ['pay', 'make', 'do', 'keep'], "'pay attention' = chú ý, tập trung."],
    ],
    'Word Formation': [
        ['medium', "The ______ of the new bridge took three years.", ['construction', 'construct', 'constructive', 'constructed'], "Sau 'The' và trước 'of' cần danh từ → 'construction' (việc xây dựng)."],
        ['medium', "She understood the instructions and answered every question ______, without making a single mistake.", ['correctly', 'correct', 'correction', 'corrected'], "Bổ nghĩa cho động từ 'answered' cần trạng từ 'correctly' (một cách chính xác)."],
        ['medium', "Your ______ advice helped me compare the two courses and make a final decision.", ['useful', 'use', 'usefully', 'usage'], "Trước danh từ 'advice' cần tính từ 'useful' (hữu ích)."],
        ['medium', "The instructions were ______, so nobody knew what to do.", ['unclear', 'clearly', 'clearness', 'clarity'], "Sau 'were' cần tính từ; 'nobody knew what to do' → 'unclear' (không rõ ràng)."],
    ],
};

const harderDifficulty = (difficulty, question) => {
    if (difficulty === 'easy') return 'medium';
    const blanks = (question.match(/______/g) || []).length;
    if (difficulty === 'medium' && (question.length >= 105 || blanks > 1)) return 'hard';
    return difficulty;
};

module.exports = Object.entries(BANK).flatMap(([category, rows]) =>
    rows.map(([difficulty, question, [correct, ...distractors], explanation]) => ({
        skill: 'vocabulary',
        category,
        level: 'B1',
        difficulty: harderDifficulty(difficulty, question),
        tags: ['vocabulary', category.toLowerCase().replace(/[^a-z]+/g, '-')],
        ...mc({ type: 'choice', question, correct, distractors, explanation }),
    })));
