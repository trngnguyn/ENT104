'use strict';

const { mc } = require('../lib/builders');

// Mỗi dòng: [level, difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
const BANK = {
    'Greetings & Introductions': [
        ['A1', 'medium', "A: Hi, I'm Lan. I don't think we've met before. <br>B: ______ I'm Huy, from class 10A.", ['Nice to meet you.', "I'm fine, thank you.", 'See you yesterday.', "You're welcome."], "Khi hai người lần đầu tự giới thiệu, 'Nice to meet you' là đáp lời phù hợp; các câu còn lại không nối được với phần giới thiệu."],
        ['A1', 'medium', "A: You look tired today. Are you all right? <br>B: ______ I didn't sleep well last night.", ["I'm a little tired, thanks.", "I'm 19 years old.", "I'm a student.", 'Nice to meet you.'], "A hỏi tình trạng hiện tại và nhận thấy B mệt; câu trả lời phải nói về sức khỏe/cảm giác và khớp với lý do mất ngủ."],
        ['A1', 'medium', "A: Do you work at the clinic, or are you a patient here? <br>B: ______ I started working here last month.", ["I'm a nurse.", "I'm doing my homework.", "I'm fine.", 'I visit every day.'], "Chi tiết 'started working here' cho thấy B là nhân viên; 'I'm a nurse' trả lời đúng nghề nghiệp và bối cảnh phòng khám."],
        ['A1', 'medium', "A: I hear a different accent. Where are you from originally? <br>B: ______, but I'm studying in Can Tho now.", ["I'm from Da Nang", "I'm at home", "I'm going to Hanoi", 'From 8 to 5'], "'Where are you from originally?' hỏi quê quán; phần sau nói nơi đang học hiện tại nên 'I'm from Da Nang' tạo đối chiếu hợp lý."],
        ['A1', 'medium', "A: I have an early class, so I'm going to bed now. Good night, Mom. <br>B: ______", ['Good night. Sleep well.', 'Good morning. Hurry up.', 'Nice to meet you.', 'How do you do?'], "Trong ngữ cảnh đi ngủ, đáp 'Good night. Sleep well' vừa chào vừa chúc ngủ ngon."],
        ['A1', 'medium', "A: ______ <br>B: It's N-A-M.", ['How do you spell your name?', 'How are you?', 'Where are you from?', 'How old are you?'], "Câu trả lời là đánh vần tên (N-A-M) → câu hỏi 'How do you spell your name?'"],
        ['A1', 'easy', "A: Lan, this is my friend, Huy. <br>B: ______", ['Hi, Huy. Nice to meet you.', 'Hi, Lan. Nice to meet you.', 'Goodbye, Huy.', "I'm fine, thank you."], "Lan được giới thiệu với Huy → Lan chào Huy: 'Hi, Huy. Nice to meet you.'"],
        ['A1', 'medium', "A: I'll bring the notes to class tomorrow. See you then! <br>B: ______ Thanks for remembering them.", ['See you!', 'Nice to meet you!', 'How are you?', "You're welcome!"], "'See you!' đáp lại lời tạm biệt; câu cảm ơn sau đó phù hợp với việc A hứa mang ghi chú."],
        ['A1', 'easy', "A: What's your last name? <br>B: ______", ["It's Nguyen.", "I'm twenty.", "It's in Can Tho.", "I'm a student."], "'last name' = họ → 'It's Nguyen.'"],
        ['A1', 'medium', "A: Are you a new student here? <br>B: ______", ['Yes, I am. I started last week.', 'Yes, I do. I started last week.', 'Yes, it is.', "No, I don't."], "Câu hỏi với 'Are you...?' → trả lời 'Yes, I am.'"],
        ['A1', 'easy', "A: How old is your sister? <br>B: ______", ["She's sixteen.", "She's fine.", "She's a student.", "She's tall."], "'How old' hỏi tuổi → 'She's sixteen.'"],
        ['A1', 'easy', "A: What's your phone number? <br>B: ______", ["It's 0912 345 678.", "It's Nguyen Van Lan.", "I'm at home.", "It's on the table."], "Hỏi số điện thoại → trả lời một dãy số: 'It's 0912 345 678.'"],
        ['A1', 'medium', "A: Excuse me, are you Mr. Tuan? <br>B: ______", ['Yes, I am. Can I help you?', 'Yes, he is.', 'Yes, you are.', 'Yes, I do.'], "Câu hỏi 'Are you...?' → trả lời về bản thân 'Yes, I am.'"],
        ['A2', 'medium', "A: Long time no see! How have you been? <br>B: ______", ['Pretty good, thanks.', "I've been to Hanoi.", 'Nice to meet you.', "I'm 20 years old."], "'How have you been?' hỏi thăm dạo này thế nào → 'Pretty good, thanks.'"],
        ['A1', 'medium', "A: I'm leaving now. Have a nice weekend, and enjoy the concert! <br>B: ______", ['Thanks. You too!', 'Yes, I have.', "It's Saturday.", 'Nice to meet you.'], "Đáp lại lời chúc bằng lời cảm ơn và chúc lại: 'Thanks. You too!'."],
    ],
    'Invitations': [
        ['A1', 'easy', "A: Would you like to go to the movies tonight? <br>B: ______", ["I'd love to. What time?", 'Yes, I like movies.', "No, I don't.", 'Yes, I would like.'], "Nhận lời mời 'Would you like to...?' → 'I'd love to.'"],
        ['A1', 'medium', "A: We both have a free hour before class. Let's have lunch together. <br>B: ______ Do you know a quiet place nearby?", ['Good idea!', "You're welcome.", 'Yes, I have.', 'Never mind.'], "B hỏi tiếp về địa điểm nên đã đồng ý với đề nghị; 'Good idea!' phù hợp nhất."],
        ['A1', 'easy', "A: Do you want to come to my birthday party on Saturday? <br>B: ______", ["Sure, I'd love to come.", 'Happy birthday!', "I'm sorry to hear that.", 'Yes, I came.'], "Nhận lời mời dự tiệc → 'Sure, I'd love to come.'"],
        ['A1', 'medium', "A: Would you like to join us for dinner? <br>B: ______", ["I'm sorry, I can't. I have to work.", "No, I don't like.", "Yes, I'd love.", "You're welcome."], "Từ chối lịch sự kèm lý do → 'I'm sorry, I can't. I have to work.'"],
        ['A1', 'medium', "A: It's too hot to play football. How about going swimming instead? <br>B: ______ I'll bring my swimsuit.", ['That sounds great!', 'Yes, I am.', "I'm fine, thanks.", "It's at the pool."], "Việc B sẽ mang đồ bơi cho thấy B đồng ý; 'That sounds great!' đáp lại lời gợi ý tự nhiên."],
        ['A1', 'medium', "A: ______ <br>B: Sure. What time should we meet?", ['Would you like to play badminton tomorrow?', 'Did you play badminton yesterday?', 'Do you like badminton?', 'Where do you play badminton?'], "'Sure. What time should we meet?' là lời nhận lời mời → câu trước phải là lời mời."],
        ['A1', 'easy', "A: Are you free on Friday evening? <br>B: ______", ['Yes, I am. Why?', "Yes, it's free.", 'Yes, I do.', "It's Friday."], "Câu hỏi 'Are you free...?' → 'Yes, I am.'"],
        ['A2', 'medium', "A: Why don't we go to the beach this weekend? <br>B: ______", ["That's a good idea.", "Because it's hot.", "Yes, we don't.", "I don't know why."], "'Why don't we...?' là lời gợi ý (không phải câu hỏi lý do) → 'That's a good idea.'"],
        ['A1', 'easy', "A: Can you come to my house for dinner tomorrow? <br>B: ______", ["Thanks for inviting me. I'd love to.", 'Yes, I can cook.', "You're welcome.", 'Here you are.'], "Nhận lời mời và cảm ơn → 'Thanks for inviting me. I'd love to.'"],
        ['A1', 'medium', "A: I'm having a party on Sunday. Can you come? <br>B: ______", ["Sorry, I'm busy on Sunday.", "Sorry, I was busy yesterday.", 'Yes, I came.', "Yes, it's Sunday."], "Từ chối lịch sự, đúng thì → 'Sorry, I'm busy on Sunday.'"],
        ['A2', 'medium', "A: Shall we meet at 7 o'clock? <br>B: ______", ['OK. See you then.', "It's 7 o'clock now.", 'Yes, we met.', "No, I'm not."], "'Shall we...?' là lời đề nghị → đồng ý 'OK. See you then.'"],
        ['A1', 'easy', "A: Let's go to the new café on Tran Phu Street. <br>B: ______", ["OK, let's go!", 'Me neither.', 'Nice to meet you.', "You're welcome."], "Đồng ý với đề nghị 'Let's...' → 'OK, let's go!'"],
        ['A1', 'medium', "A: Would you like some more cake? <br>B: ______", ["No, thank you. I'm full.", "Yes, I'd like.", "No, I wouldn't like.", 'Yes, I do.'], "Từ chối lời mời đồ ăn lịch sự → 'No, thank you.'"],
        ['A1', 'easy', "A: We're going to the concert tonight. Do you want to come with us? <br>B: ______", ["Yes, please! Who's playing?", "No, I'm fine.", 'Yes, I went.', 'Congratulations!'], "Nhận lời mời → 'Yes, please!'"],
        ['A1', 'easy', "A: Thanks for inviting me to your party. <br>B: ______", ["You're welcome. I'm glad you came.", 'Yes, please.', 'No, thanks.', "I'm sorry."], "Đáp lại lời cảm ơn → 'You're welcome.'"],
    ],
    'Requests & Permission': [
        ['A1', 'medium', "A: My pen has run out of ink. Could I borrow yours to sign this form? <br>B: ______", ['Sure. Here you are.', 'Yes, I can.', "No, you don't.", 'Thank you.'], "A nêu lý do và xin mượn bút; 'Sure. Here you are' vừa cho phép vừa đưa bút."],
        ['A1', 'medium', "A: It's getting warm in here. Would you mind opening the window a little? <br>B: ______", ['Not at all.', 'Yes, I opened it yesterday.', "No, it isn't.", "You're welcome."], "Với 'Would you mind + V-ing?', đồng ý làm giúp bằng 'Not at all' (không phiền)."],
        ['A2', 'hard', "A: Do you mind if I sit here? <br>B: ______", ['No, not at all. Please sit down.', 'Yes, please sit down.', 'Yes, I do. Sit down.', "I'm fine."], "'Do you mind if...?' = Bạn có phiền không? → đồng ý thì trả lời 'No, not at all' (không phiền)."],
        ['A1', 'easy', "A: May I use your phone? <br>B: ______", ['Sure, go ahead.', 'Yes, you may not.', "I'm sorry to hear that.", 'Thank you very much.'], "Cho phép → 'Sure, go ahead.'"],
        ['A1', 'medium', "A: This box is too heavy for me to lift alone. Could you give me a hand? <br>B: ______ Where should I put it?", ['Sure, no problem.', "You're welcome.", 'Yes, I am.', 'Nice to meet you.'], "'give me a hand' = giúp một tay; câu hỏi tiếp theo cho thấy B đồng ý giúp."],
        ['A1', 'medium', "A: ______ <br>B: Sorry, I'm using it right now.", ['Can I use your laptop for a minute?', 'Do you have a laptop?', 'Where is your laptop?', 'How much is your laptop?'], "'Sorry, I'm using it right now' là lời từ chối một yêu cầu mượn đồ."],
        ['A1', 'easy', "A: Could you speak more slowly, please? <br>B: ______", ['Sure. Sorry about that.', 'Yes, I speak slowly every day.', "No, I can't hear.", 'Here you are.'], "Đồng ý với lời nhờ → 'Sure. Sorry about that.'"],
        ['A1', 'easy', "A: Excuse me, could you take a photo of us? <br>B: ______", ['Sure. Say cheese!', 'Yes, I took.', "No, I'm not.", "It's my camera."], "Đồng ý chụp ảnh giúp → 'Sure. Say cheese!'"],
        ['A1', 'easy', "A: Can I have the bill, please? <br>B: ______", ['Of course. Just a moment.', 'Yes, you have.', "No, it isn't.", "I'd like some tea."], "Đáp lại yêu cầu thanh toán → 'Of course. Just a moment.'"],
        ['A1', 'medium', "A: Could you turn down the music? I'm trying to study. <br>B: ______", ["Oh, sorry. I'll turn it down.", 'Thanks a lot.', 'Yes, I can hear it.', 'Turn left at the corner.'], "Xin lỗi và làm theo yêu cầu → 'Oh, sorry. I'll turn it down.'"],
        ['A1', 'medium', "A: Can you lend me 50,000 dong? I forgot my wallet. <br>B: ______", ['Sure, here you go.', 'Yes, I borrowed it.', "You're welcome.", "I'm fine, thank you."], "Đồng ý cho mượn tiền → 'Sure, here you go.'"],
        ['A2', 'medium', "A: Is it OK if I leave class early today? I have a doctor's appointment. <br>B: ______", ["Yes, that's fine.", "Yes, I'm OK.", "No, I'm not sick.", 'Congratulations!'], "Cho phép → 'Yes, that's fine.'"],
        ['A1', 'easy', "A: Could you tell me your email address? <br>B: ______", ["Sure. It's lan.nguyen@gmail.com.", "Sure, I'll tell him.", 'Yes, I could.', 'I sent an email.'], "Đáp lại bằng thông tin được hỏi (địa chỉ email)."],
        ['A1', 'easy', "A: Can you pass me the salt, please? <br>B: ______", ['Here you are.', "You're welcome.", 'Yes, I can pass.', "It's salty."], "Khi đưa đồ cho ai → 'Here you are.'"],
        ['A2', 'hard', "A: Would you mind closing the door? <br>B: ______", ['No problem.', 'Yes, I would close.', 'Yes, I mind.', 'It was closed yesterday.'], "'Would you mind + V-ing?' là lời nhờ lịch sự → đồng ý: 'No problem.' / 'Not at all.'"],
    ],
    'Advice': [
        ['A2', 'easy', "A: I have a headache. <br>B: ______", ['You should take some medicine and rest.', 'You should listen to loud music.', "You shouldn't sleep.", 'You should drink more coffee.'], "Lời khuyên hợp lý khi đau đầu → nghỉ ngơi và uống thuốc."],
        ['A2', 'easy', "A: I'm always tired in the morning. <br>B: ______", ['You should go to bed earlier.', 'You should stay up late.', "You shouldn't sleep.", 'You should drink coffee at night.'], "Lời khuyên hợp lý → đi ngủ sớm hơn."],
        ['A2', 'medium', "A: I want to improve my English speaking. <br>B: ______", ["Why don't you join an English club?", 'Why do you join an English club?', 'Because I join an English club.', "You shouldn't practice."], "'Why don't you...?' dùng để đưa ra lời khuyên/gợi ý."],
        ['A2', 'easy', "A: My English test is next week and I'm worried. <br>B: ______", ["Don't worry. You should study a little every day.", 'You should worry more.', "Don't study.", 'You should forget about it.'], "Lời khuyên hợp lý và trấn an → 'Don't worry. You should study a little every day.'"],
        ['A2', 'easy', "A: I'd like to lose weight. What should I do? <br>B: ______", ['You should eat less fast food and exercise more.', 'You should eat more sweets.', "You shouldn't exercise.", 'You should sleep all day.'], "Lời khuyên giảm cân hợp lý → ăn ít đồ ăn nhanh, tập thể dục nhiều hơn."],
        ['A2', 'medium', "A: I lost my wallet! <br>B: ______", ['You should call the bank and cancel your cards.', 'Congratulations!', 'Good idea!', 'You should buy more things.'], "Lời khuyên hợp lý khi mất ví → gọi ngân hàng khoá thẻ."],
        ['A2', 'medium', "A: It's raining heavily. <br>B: ______", ["You'd better take an umbrella.", "You'd better wear sunglasses.", "You'd better go swimming.", 'You had better took an umbrella.'], "'had better + V nguyên mẫu' = nên. Trời mưa → mang ô."],
        ['A2', 'easy', "A: I have a toothache. <br>B: ______", ['You should see a dentist.', 'You should see a mechanic.', 'You should eat more candy.', 'You should see a movie.'], "Đau răng → nên gặp nha sĩ (dentist)."],
        ['A2', 'easy', "A: Can you give me some advice? I can't sleep at night. <br>B: ______", ["Don't drink coffee in the evening.", 'Drink coffee before bed.', 'Watch scary movies at night.', 'Use your phone in bed.'], "Lời khuyên hợp lý khi mất ngủ → không uống cà phê buổi tối."],
        ['A2', 'easy', "A: What should I wear to the job interview? <br>B: ______", ['You should wear a shirt and a tie.', 'You should wear shorts and sandals.', 'You wore a suit.', "I'm wearing jeans."], "Trang phục lịch sự cho buổi phỏng vấn → áo sơ mi và cà vạt."],
        ['A2', 'medium', "A: I don't understand this lesson. <br>B: ______", ["Why don't you ask the teacher?", "Because I don't understand.", 'You should not ask anyone.', 'Why do you ask the teacher?'], "'Why don't you...?' đưa ra lời khuyên → hỏi giáo viên."],
        ['A2', 'medium', "A: I'm going to Da Lat next week. Any advice? <br>B: ______", ["Bring a warm jacket. It's cold at night.", 'You went to Da Lat last year.', "Yes, I'm going.", 'No, thanks.'], "Người nói xin lời khuyên → đưa ra lời khuyên cụ thể."],
    ],
    'Shopping': [
        ['A1', 'easy', "A: Can I help you? <br>B: ______", ["Yes, I'm looking for a jacket.", 'Yes, I can.', "No, I'm not.", "Yes, you're welcome."], "Nhân viên hỏi 'Can I help you?' → nói mình cần gì."],
        ['A1', 'easy', "A: How much is this T-shirt? <br>B: ______", ["It's 150,000 dong.", "It's medium.", "It's red.", "It's cotton."], "'How much' hỏi giá → '150,000 dong'."],
        ['A1', 'easy', "A: What size do you wear? <br>B: ______", ['Medium.', 'Red, please.', 'Cash.', '200,000 dong.'], "Hỏi cỡ (size) → 'Medium'."],
        ['A1', 'easy', "A: Can I try it on? <br>B: ______", ['Sure. The fitting room is over there.', "Sure. It's 100,000 dong.", "No, it's on sale.", 'Yes, I tried.'], "Hỏi thử đồ → chỉ phòng thử đồ."],
        ['A1', 'medium', "A: How would you like to pay? <br>B: ______", ['By credit card, please.', "Yes, I'd like.", "It's cheap.", "I'd like a large size."], "Hỏi phương thức thanh toán → 'By credit card'."],
        ['A1', 'medium', "A: Do you have this shirt in blue? <br>B: ______", ['Sorry, we only have it in white and black.', "Yes, it's a shirt.", "No, I don't like blue.", "It's 200,000 dong."], "Hỏi về màu sắc → trả lời về các màu đang có."],
        ['A1', 'medium', "A: ______ <br>B: They're 500,000 dong.", ['How much are these shoes?', 'How much is this shoe?', 'What size are these shoes?', 'What color are these shoes?'], "'They're 500,000 dong' → hỏi giá của vật số nhiều: 'How much are these shoes?'"],
        ['A1', 'easy', "A: This shirt is too small. Do you have a bigger one? <br>B: ______", ["Yes, here's a large.", "Yes, here's a small.", "No, it's too big.", "Yes, it's cheap."], "Cần cỡ lớn hơn → 'Here's a large.'"],
        ['A1', 'easy', "A: I'll take it. <br>B: ______", ["Great. That's 300,000 dong, please.", "You're welcome.", "I'll take it too.", "Sorry, I'm busy."], "'I'll take it' = Tôi mua cái này → người bán báo giá."],
        ['A1', 'easy', "A: Excuse me, where can I find the milk? <br>B: ______", ["It's in aisle 5, next to the cheese.", "It's 30,000 dong.", 'I like milk.', 'Yes, you can.'], "Hỏi vị trí → trả lời vị trí trong cửa hàng."],
        ['A2', 'medium', "A: Is this bag on sale? <br>B: ______", ["Yes, it's 20% off today.", 'Yes, I sell it.', "No, it's a bag.", "Yes, it's my bag."], "'on sale' = giảm giá → 'It's 20% off.'"],
        ['A1', 'medium', "A: Can I pay in cash? <br>B: ______", ['Of course.', "Yes, you're welcome.", "It's too expensive.", "I'd like it in black."], "Đồng ý cho trả tiền mặt → 'Of course.'"],
        ['A1', 'easy', "A: Here's your change. <br>B: ______", ['Thank you.', "You're welcome.", 'Here you are.', 'How much?'], "Nhận tiền thối lại → cảm ơn: 'Thank you.' ('You're welcome' là lời đáp lại lời cảm ơn.)"],
        ['A2', 'medium', "A: I'd like to return this shirt. It has a hole. <br>B: ______", ["I'm sorry. Do you have the receipt?", "Great! It's very nice.", "OK. That's 200,000 dong.", 'Congratulations!'], "Khách đổi trả hàng lỗi → xin lỗi và hỏi hoá đơn."],
        ['A2', 'medium', "A: These jeans don't fit me. <br>B: ______", ["Let's try a different size.", 'They suit you.', "They're cheap.", "Let's buy them now."], "'don't fit' = không vừa → thử cỡ khác."],
    ],
    'Ordering Food': [
        ['A1', 'easy', "A: Are you ready to order? <br>B: ______", ["Yes. I'd like the chicken soup, please.", "Yes, I'm ready to cook.", 'Yes, I like chickens.', "Yes, here's your change."], "Gọi món → 'I'd like ..., please.'"],
        ['A1', 'easy', "A: What would you like to drink? <br>B: ______", ['An iced coffee, please.', 'A sandwich, please.', 'Yes, I would.', 'Very good, thanks.'], "Hỏi đồ uống → trả lời một loại đồ uống: 'An iced coffee, please.'"],
        ['A1', 'easy', "A: Would you like anything else? <br>B: ______", ["No, that's all, thanks.", "Yes, that's all.", "No, I'd like.", 'Here you are.'], "Không gọi thêm → 'No, that's all, thanks.'"],
        ['A2', 'medium', "A: For here or to go? <br>B: ______", ['To go, please.', 'Here you are.', 'Yes, please.', 'Go there.'], "'For here or to go?' = Ăn tại chỗ hay mang đi? → 'To go, please.'"],
        ['A2', 'medium', "A: How would you like your steak? <br>B: ______", ['Medium, please.', 'Very much.', 'Yes, I would.', 'Large, please.'], "Hỏi độ chín của bít tết → 'Medium' (chín vừa)."],
        ['A1', 'easy', "A: Can I see the menu, please? <br>B: ______", ['Sure. Here you are.', "Sure. It's delicious.", 'Yes, I can see.', "No, it's my menu."], "Đưa thực đơn → 'Here you are.'"],
        ['A2', 'medium', "A: ______ <br>B: The fish is very good today.", ['What do you recommend?', 'Do you like fish?', 'Where is the fish?', 'How much is the fish?'], "Người phục vụ giới thiệu món → câu hỏi xin gợi ý 'What do you recommend?'"],
        ['A1', 'medium', "A: Excuse me, this soup is cold. <br>B: ______", ["I'm so sorry. I'll bring you another one.", "Yes, it's delicious.", "You're welcome.", 'Enjoy your meal.'], "Khách phàn nàn → xin lỗi và khắc phục."],
        ['A1', 'easy', "A: Could we have the check, please? <br>B: ______", ["Sure. I'll be right back.", 'Sure. Enjoy your meal.', 'Yes, we could.', 'Check it, please.'], "'the check' = hoá đơn → 'Sure. I'll be right back.'"],
        ['A1', 'easy', "A: Is the pho spicy? <br>B: ______", ['No, but you can add some chili.', "Yes, it's sweet.", "It's 40,000 dong.", "No, it's a soup."], "Hỏi món có cay không → trả lời về độ cay."],
        ['A1', 'easy', "A: Table for two? <br>B: ______", ['Yes, please. Near the window if possible.', 'Yes, two coffees.', "Two o'clock.", 'No, it is a table.'], "Nhân viên hỏi bàn cho 2 người → 'Yes, please.'"],
        ['A1', 'easy', "A: Enjoy your meal! <br>B: ______", ['Thank you.', "You're welcome.", 'Here you are.', 'Same to me.'], "Đáp lại lời chúc ngon miệng → 'Thank you.'"],
        ['A2', 'medium', "A: I'm a vegetarian. Do you have any dishes without meat? <br>B: ______", ['Yes, we have vegetable fried rice and tofu soup.', 'Yes, we have beef noodles.', 'Yes, chicken is good.', 'No, we have meat.'], "'vegetarian' = người ăn chay → gợi ý món chay."],
        ['A1', 'easy', "A: How was your meal? <br>B: ______", ['It was delicious, thank you.', 'It was 200,000 dong.', 'It is a meal.', 'It was at 7.'], "Hỏi cảm nhận về bữa ăn → 'It was delicious.'"],
        ['A1', 'easy', "A: Can I get you something to drink while you wait? <br>B: ______", ['Just water, please.', 'Just waiting.', "Yes, I'm waiting.", 'Here you are.'], "Hỏi đồ uống → 'Just water, please.'"],
    ],
    'Asking for Directions': [
        ['A1', 'easy', "A: Excuse me, where's the post office? <br>B: ______", ["Go straight and turn left. It's next to the bank.", "It's open at 8 a.m.", 'I send letters there.', "Yes, it's a post office."], "Hỏi đường → chỉ đường."],
        ['A1', 'easy', "A: Is there a pharmacy near here? <br>B: ______", ["Yes, there's one across the street.", "Yes, it's medicine.", "No, I'm not sick.", 'Yes, I have one.'], "'Is there...?' → 'Yes, there's one...'"],
        ['A1', 'medium', "A: How do I get to the train station? <br>B: ______", ['Take bus number 5 and get off at the last stop.', "It's a big station.", 'I got there by train.', "It's at 6 p.m."], "'How do I get to...?' hỏi cách đi → chỉ cách đi."],
        ['A1', 'easy', "A: Is the museum far from here? <br>B: ______", ["No, it's only a five-minute walk.", "No, it's old.", "Yes, it's beautiful.", "It's open today."], "Hỏi khoảng cách → 'only a five-minute walk'."],
        ['A1', 'medium', "A: ______ <br>B: It's on the corner of Le Loi Street and Hai Ba Trung Street.", ["Where's the bookstore?", 'When does the bookstore open?', "What's the bookstore's name?", 'How big is the bookstore?'], "Câu trả lời là vị trí → câu hỏi 'Where...?'"],
        ['A1', 'easy', "A: Excuse me, can you tell me the way to the hospital? <br>B: ______", ['Sure. Walk to the end of this street and turn right.', "Sure. It's a big hospital.", 'Yes, I can tell you.', "Sorry, I'm not sick."], "Hỏi đường → chỉ đường cụ thể."],
        ['A1', 'medium', "A: How far is it to the airport? <br>B: ______", ['About 10 kilometers.', "About 10 o'clock.", 'About 10 people.', 'About 10 times.'], "'How far' hỏi khoảng cách → 'About 10 kilometers.'"],
        ['A1', 'medium', "A: Excuse me, I'm lost. Where are we on this map? <br>B: ______", ["We're here, near the river.", "It's a map.", "I'm fine, thanks.", 'Turn off the light.'], "Hỏi vị trí trên bản đồ → chỉ vị trí."],
        ['A1', 'easy', "A: Which bus goes to Ninh Kieu Wharf? <br>B: ______", ['Number 11.', "At 11 o'clock.", '11,000 dong.', 'For 11 minutes.'], "'Which bus' hỏi tuyến xe → 'Number 11.'"],
        ['A2', 'medium', "A: How long does it take to walk there? <br>B: ______", ['About fifteen minutes.', 'About two kilometers.', 'By bus.', 'Every fifteen minutes.'], "'How long does it take' hỏi thời gian → 'About fifteen minutes.'"],
        ['A1', 'medium', "A: Excuse me, is this the way to the bus station? <br>B: ______", ["No, you're going the wrong way. It's behind you.", "No, it's a bus.", "Yes, I'm going to work.", 'The bus is late.'], "Xác nhận đường đi → 'you're going the wrong way'."],
        ['A1', 'easy', "A: Thanks for your help! <br>B: ______", ['No problem. Have a nice day!', 'Yes, I helped.', 'Excuse me.', 'Turn right.'], "Đáp lại lời cảm ơn → 'No problem.'"],
    ],
    'Arrangements & Schedules': [
        ['A1', 'easy', "A: What time does the movie start? <br>B: ______", ['At 7:45.', 'For two hours.', 'On the second floor.', "It's a comedy."], "'What time' hỏi giờ → 'At 7:45.'"],
        ['A1', 'easy', "A: When is your next English class? <br>B: ______", ['On Wednesday morning.', 'In Room 302.', 'For 90 minutes.', 'With Ms. Hoa.'], "'When' hỏi thời gian → 'On Wednesday morning.'"],
        ['A1', 'medium', "A: Are you free on Saturday afternoon? <br>B: ______", ['Sorry, I have a part-time job on Saturdays.', "Yes, it's free.", "No, it's Saturday.", "I'm sorry to hear that."], "Từ chối kèm lý do hợp lý."],
        ['A2', 'medium', "A: Let's meet at the library at 2 p.m. <br>B: ______", ['Can we make it 3 p.m.? I have class until 2:30.', 'I met you at 2 p.m.', 'The library is big.', "Yes, I'm in the library."], "Đề nghị đổi giờ hẹn → 'Can we make it 3 p.m.?'"],
        ['A2', 'medium', "A: How long is the trip from Can Tho to Ho Chi Minh City by bus? <br>B: ______", ['About three and a half hours.', 'At 3:30.', 'Every three hours.', 'By bus.'], "'How long' hỏi thời lượng → 'About three and a half hours.'"],
        ['A2', 'medium', "A: I'm sorry, I can't come to the meeting tomorrow. <br>B: ______", ["That's OK. Let's reschedule for Friday.", 'Great! See you there.', 'Congratulations!', 'Yes, I can come.'], "Người kia không đến được → hẹn lại ('reschedule')."],
        ['A1', 'easy', "A: What day is it today? <br>B: ______", ["It's Tuesday.", "It's 10 o'clock.", "It's sunny.", "It's in Can Tho."], "'What day' hỏi thứ → 'It's Tuesday.'"],
        ['A1', 'easy', "A: What's the date today? <br>B: ______", ["It's October 14th.", "It's Wednesday.", "It's 2 p.m.", "It's hot."], "'What's the date' hỏi ngày tháng → 'It's October 14th.'"],
        ['A2', 'medium', "A: How often does the shuttle bus run? <br>B: ______", ['Every 20 minutes.', 'For 20 minutes.', 'In 20 minutes.', '20 kilometers.'], "'How often' hỏi tần suất → 'Every 20 minutes.'"],
        ['A2', 'medium', "A: What are you doing this weekend? <br>B: ______", ["I'm visiting my grandparents in Long An.", 'I visited my grandparents.', "Yes, I'm free.", 'I was at home.'], "Hỏi kế hoạch cuối tuần → hiện tại tiếp diễn chỉ kế hoạch: 'I'm visiting...'"],
        ['A2', 'medium', "A: Can you come at 9 instead of 10? <br>B: ______", ['Sure, 9 is fine.', "Sure, it's 10 now.", 'No, I came at 9.', 'Yes, instead.'], "Đồng ý đổi giờ → 'Sure, 9 is fine.'"],
        ['A2', 'medium', "A: When is the assignment due? <br>B: ______", ['Next Monday, before midnight.', "It's about the environment.", "It's 5 pages long.", 'Ms. Hoa gave it.'], "'due' = hạn nộp → trả lời thời hạn: 'Next Monday, before midnight.'"],
        ['A1', 'medium', "A: Is the bank open on Sundays? <br>B: ______", ["No, it's only open from Monday to Saturday.", "Yes, it's closed on Sundays.", "It's a big bank.", 'The bank is next to the school.'], "Trả lời đúng trọng tâm câu hỏi về Chủ nhật."],
        ['A1', 'medium', "A: What time should we leave for the airport? <br>B: ______", ["Let's leave at 6. The flight is at 8:30.", 'We left at 6 yesterday.', 'The airport is very big.', "I'm leaving the airport."], "Bàn giờ xuất phát → đề xuất 'Let's leave at 6.'"],
        ['A1', 'medium', "A: Sorry I'm late. The traffic was terrible. <br>B: ______", ["Don't worry. The meeting hasn't started yet.", 'Congratulations!', "You're welcome.", 'Nice to meet you.'], "Đáp lại lời xin lỗi → 'Don't worry.'"],
    ],
    'Telephone': [
        ['A2', 'medium', "A: Hello, may I speak to Lan, please? <br>B: ______", ["Speaking. Who's calling?", 'Yes, you may speak English.', "I'm Lan's phone.", 'Lan is a student.'], "Khi chính mình là người được tìm → 'Speaking.' (Tôi đây)."],
        ['A2', 'medium', "A: Can I take a message? <br>B: ______", ['Yes, please tell her to call me back.', "Yes, I'll take a photo.", "No, I don't have a phone.", 'Speaking.'], "Đồng ý để lại lời nhắn → 'Please tell her to call me back.'"],
        ['A2', 'medium', "A: Hello, is this 0909 123 456? <br>B: ______", ['Sorry, you have the wrong number.', "Yes, I'm 0909.", "Hello, I'm fine.", "Sorry, it's broken."], "'wrong number' = nhầm số."],
        ['A2', 'medium', "A: Can you hold on a moment? <br>B: ______", ["Sure, I'll wait.", "Sure, I'll hang up.", "No, I'm holding a bag.", 'Yes, a moment ago.'], "'hold on' = chờ máy → 'Sure, I'll wait.'"],
        ['A1', 'easy', "A: I'm sorry, Mr. Tuan isn't here right now. <br>B: ______", ['OK. Can I leave a message?', "OK. I'm here.", 'Good, thank you.', 'Yes, he is.'], "Người cần gặp vắng mặt → xin để lại lời nhắn."],
        ['A1', 'easy', "A: Hello, this is Nam. Is Huy there? <br>B: ______", ["Just a moment. I'll get him.", 'Yes, this is Nam.', "He's twenty years old.", 'Yes, he is a student.'], "Đồng ý gọi người nghe máy → 'Just a moment. I'll get him.'"],
        ['A1', 'medium', "A: Sorry, I can't hear you. The line is bad. <br>B: ______", ["I'll call you back in a minute.", 'Speak more quietly, please.', "You're welcome.", "I'm fine, thanks."], "Đường truyền kém → 'I'll call you back.'"],
        ['A1', 'medium', "A: Could you ask him to call me back? <br>B: ______", ["Sure. What's your number?", 'Sure. He called you.', "No, he's back.", "Yes, I'm calling."], "Nhận lời nhắn gọi lại → hỏi số điện thoại để ghi lại: 'Sure. What's your number?'"],
        ['A1', 'easy', "A: Thanks for calling. Bye! <br>B: ______", ['Bye! Talk to you soon.', 'Hello!', "Who's calling?", 'Speaking.'], "Kết thúc cuộc gọi → 'Bye! Talk to you soon.'"],
        ['A1', 'medium', "A: ______ <br>B: It's Linh. I'm calling about the homework.", ["Who's calling, please?", 'Where are you calling?', 'What are you calling?', 'How are you calling?'], "Câu trả lời 'It's Linh' → câu hỏi 'Who's calling?'"],
    ],
    'Social Responses': [
        ['A1', 'medium', "A: Thanks for explaining the bus route; I understand where to change buses now. <br>B: ______", ["You're welcome.", 'Yes, please.', 'Excuse me.', 'Here you are.'], "'You're welcome' là cách đáp lại lời cảm ơn; các lựa chọn khác dùng trong yêu cầu hoặc khi đưa đồ."],
        ['A1', 'medium', "A: I'm really sorry I broke the cup you bought in Hue. <br>B: ______ It was an accident.", ["Don't worry about it.", "You're welcome.", 'Congratulations!', 'Thank you very much.'], "B trấn an vì đó là tai nạn, nên 'Don't worry about it' là cách chấp nhận lời xin lỗi phù hợp."],
        ['A1', 'medium', "A: I finally passed my driving test after failing twice! <br>B: ______ You worked hard for it.", ['Congratulations!', "I'm sorry to hear that.", 'Never mind.', 'Bless you!'], "Đây là tin vui sau nhiều cố gắng, nên dùng 'Congratulations!' để chúc mừng."],
        ['A1', 'medium', "A: My grandfather is in the hospital. <br>B: ______", ["I'm sorry to hear that. I hope he gets better soon.", 'Congratulations!', "That's great!", 'Have fun!'], "Tin buồn → 'I'm sorry to hear that.'"],
        ['A1', 'medium', "A: Happy birthday, Lan! I hope you like the book we chose. <br>B: ______ I've wanted to read it for months.", ['Thank you!', "You're welcome.", 'Excuse me.', 'Me too.'], "Người nhận lời chúc và quà đáp bằng 'Thank you'; câu sau cho thấy sự cảm kích."],
        ['A1', 'medium', "A: Excuse me, is this seat taken? <br>B: ______", ["No, it's free. Please sit down.", 'Yes, please sit down.', 'Yes, I took it yesterday.', 'No, thank you.'], "'Is this seat taken?' = Ghế này có ai ngồi chưa? → 'No, it's free.'"],
        ['A1', 'easy', "A: Achoo! <br>B: ______", ['Bless you!', 'Congratulations!', 'Cheers!', 'Good luck!'], "Khi ai đó hắt xì → 'Bless you!'"],
        ['A1', 'medium', "A: I have my final exam tomorrow, and I'm a little nervous. <br>B: ______ You've prepared carefully.", ['Good luck!', 'Congratulations!', 'Bless you!', 'Cheers!'], "'Good luck!' dùng để chúc may mắn trước một việc khó; câu sau còn mang tính động viên."],
        ['A1', 'easy', "A: I'm going to Phu Quoc for my vacation! <br>B: ______", ['Have a great trip!', 'Get well soon!', 'Sorry to hear that.', 'Bless you!'], "Chúc chuyến đi vui vẻ → 'Have a great trip!'"],
        ['A1', 'easy', "A: I don't feel well. I have a fever. <br>B: ______", ['Oh no! You should see a doctor.', 'Great! Have fun!', 'Congratulations!', 'Good job!'], "Người kia bị sốt → khuyên đi khám bác sĩ."],
        ['A1', 'easy', "A: Merry Christmas! <br>B: ______", ['Merry Christmas to you too!', "Thank you, you're welcome.", 'Happy birthday!', 'Good luck!'], "Đáp lại lời chúc Giáng sinh → 'Merry Christmas to you too!'"],
        ['A1', 'medium', "A: Which would you like, tea or coffee? <br>B: ______", ['Coffee, please.', 'Yes, I would.', 'Yes, please.', 'I like it.'], "Câu hỏi lựa chọn 'Which...?' (tea hay coffee) → phải chọn một: 'Coffee, please.' Không trả lời Yes/No."],
        ['A1', 'easy', "A: I love your new haircut! <br>B: ______", ['Thanks! I got it yesterday.', "You're welcome.", 'Sorry about that.', 'Me neither.'], "Đáp lại lời khen → 'Thanks!'"],
        ['A2', 'medium', "A: I don't like horror movies. <br>B: ______", ['Me neither.', 'Me too.', 'So do I.', "Neither don't I."], "Đồng ý với câu PHỦ ĐỊNH → 'Me neither.' (Neither do I)."],
        ['A2', 'medium', "A: I love Vietnamese coffee. <br>B: ______", ['Me too!', 'Me neither.', 'Neither do I.', "I don't too."], "Đồng ý với câu KHẲNG ĐỊNH → 'Me too!' (So do I)."],
        ['A1', 'easy', "A: Sorry I'm late. <br>B: ______", ["That's OK. Come in.", "You're welcome.", 'Congratulations!', 'Thanks a lot.'], "Đáp lại lời xin lỗi vì đến muộn → 'That's OK.'"],
        ['A1', 'medium', "A: Can you speak Chinese? <br>B: ______", ['Just a little.', 'Yes, I do speak.', "No, I don't.", "Yes, I'm speaking."], "Câu hỏi với 'Can you...?' → trả lời bằng 'can/can't' hoặc 'Just a little'."],
        ['A1', 'easy', "A: What's the weather like today? <br>B: ______", ["It's sunny and hot.", 'I like sunny weather.', "It's Tuesday.", "It's like a cloud."], "'What's the weather like?' hỏi thời tiết → 'It's sunny and hot.'"],
        ['A2', 'medium', "A: What does your brother look like? <br>B: ______", ["He's tall and has short black hair.", 'He likes football.', "He's friendly and funny.", "He's a student."], "'look like' hỏi ngoại hình → miêu tả chiều cao, tóc..."],
        ['A2', 'medium', "A: What's your brother like? <br>B: ______", ["He's very friendly and funny.", 'He likes playing football.', "He's twenty-two.", "He's a nurse."], "'What is he like?' hỏi tính cách → 'friendly and funny'."],
        ['A2', 'medium', "A: Would you mind if I opened the window? <br>B: ______", ['Not at all. Go ahead.', 'Yes, open it.', 'Yes, I would. Go ahead.', 'You are welcome.'], "'Would you mind if...?' → đồng ý thì trả lời 'Not at all' (không phiền)."],
    ],
    'Telling the Time': [
        ['A1', 'easy', "A: What time is it? (The clock shows 7:30.) <br>B: ______", ["It's half past seven.", "It's half past eight.", "It's seven past half.", "It's thirty to seven."], "7:30 → 'half past seven' (bảy giờ rưỡi)."],
        ['A1', 'medium', "A: What time is it? (The clock shows 8:15.) <br>B: ______", ["It's a quarter past eight.", "It's a quarter to eight.", "It's fifteen to eight.", "It's eight past fifteen."], "8:15 → 'a quarter past eight' (8 giờ 15 phút)."],
        ['A1', 'medium', "A: What time is it? (The clock shows 9:45.) <br>B: ______", ["It's a quarter to ten.", "It's a quarter to nine.", "It's a quarter past ten.", "It's forty-five to nine."], "9:45 → còn 15 phút nữa là 10 giờ → 'a quarter to ten'."],
        ['A1', 'medium', "A: What time is it? (The clock shows 11:50.) <br>B: ______", ["It's ten to twelve.", "It's ten past eleven.", "It's ten to eleven.", "It's fifty past twelve."], "11:50 → còn 10 phút nữa là 12 giờ → 'ten to twelve'."],
        ['A1', 'easy', "A: What time is it? (The clock shows 6:05.) <br>B: ______", ["It's five past six.", "It's five to six.", "It's six past five.", "It's five past five."], "6:05 → 'five past six' (6 giờ 5 phút)."],
    ],
};

// Mỗi câu có một dòng tình huống bằng tiếng Anh trước hội thoại. Ngoài việc làm rõ
// vai người nói, dòng này buộc người học đọc ngữ cảnh thay vì chỉ ghép một cặp
// hỏi--đáp máy móc. Các tình huống được dùng cho cả A1 và A2 để độ dài và cách
// trình bày nhất quán trong toàn bộ phần Communication.
const SITUATIONS = {
    'Greetings & Introductions': 'At a school event, two people are meeting or sharing personal information for the first time.',
    Invitations: 'Two friends are making plans together, and one of them needs to respond politely before they continue.',
    'Requests & Permission': 'In an everyday situation, one person needs help or permission and asks the other person politely.',
    Advice: 'A friend describes a real problem and waits for a useful, caring suggestion about what to do next.',
    Shopping: 'A customer and a shop assistant are talking in a busy store while choosing or paying for an item.',
    'Ordering Food': 'At a café or restaurant, a customer and a server are discussing the order and what is needed.',
    'Asking for Directions': 'A visitor does not know the area well and asks a local person for clear travel information.',
    'Arrangements & Schedules': 'Two people are checking a plan or timetable because they need to agree on the correct details.',
    Telephone: 'During a phone call, the speakers cannot see each other and must make the purpose of the call clear.',
    'Social Responses': 'In an everyday conversation, one speaker shares news or says something that needs a polite response.',
    'Telling the Time': 'A student is checking the time before the next activity and asks a classmate to read the clock.',
};

// Nhiễu cũng phải là lời thoại tự nhiên. Mỗi nhóm lấy lời nói hợp lý trong một
// tình huống khác (gọi món, hỏi đường, hẹn giờ...), thay vì dùng câu sai ngữ pháp.
// Nhờ vậy cả bốn lựa chọn đều là speech acts có thật, nhưng chỉ đáp án đúng tiếp
// nối được hội thoại đang cho.
const DISTRACTOR_POOLS = {
    'Greetings & Introductions': [
        "I'd like the chicken soup, please.",
        'Turn left at the next traffic lights.',
        "I'm sorry, but I can't come on Friday.",
        'Could you pass me the salt, please?',
        'The shop closes at six this evening.',
        'Congratulations on your new job!',
    ],
    Invitations: [
        'The bus leaves from platform three.',
        "I'd like to pay by card, please.",
        'Go straight and the bank is on your right.',
        "I'm sorry to hear about your accident.",
        'Could you spell your last name, please?',
        'The meeting starts at half past eight.',
    ],
    'Requests & Permission': [
        'That sounds like a great plan for Saturday.',
        'The train arrives at nine fifteen.',
        "I'd like a table for two, please.",
        'Congratulations! You worked hard for it.',
        'The pharmacy is across from the bank.',
        "I'm sorry to hear that you're unwell.",
    ],
    Advice: [
        'Of course. Here you are.',
        "I'd like an orange juice, please.",
        'Go straight and turn right at the corner.',
        'The appointment is at ten tomorrow.',
        'Thank you. That was very kind of you.',
        'Sorry, this shirt is not available in blue.',
    ],
    Shopping: [
        "I'm sorry to hear that. I hope you feel better.",
        'The next bus comes in ten minutes.',
        "I'd love to join you for dinner.",
        'Turn right after the post office.',
        'Could you call me back this afternoon?',
        'Congratulations on passing your exam!',
    ],
    'Ordering Food': [
        'The museum opens at nine tomorrow.',
        'Take bus number six and get off at the market.',
        'Congratulations! That is wonderful news.',
        'Could I leave a message for Ms. Hoa?',
        "I'm sorry, but I have class this evening.",
        'This jacket is available in a larger size.',
    ],
    'Asking for Directions': [
        "I'd like the vegetable noodles, please.",
        'Congratulations on your new position!',
        'Could you ask him to call me back?',
        'This shirt is twenty percent off today.',
        "I'm sorry, but I can't attend the party.",
        'Thank you for helping me with my homework.',
    ],
    'Arrangements & Schedules': [
        "I'd like a cup of tea without sugar, please.",
        'Walk past the bank and turn left.',
        "I'm sorry to hear about your grandfather.",
        'Could I try this jacket on, please?',
        'Congratulations on winning the competition!',
        'Please ask Lan to call me back.',
    ],
    Telephone: [
        'The fitting room is beside the cashier.',
        "I'd like the fish and a glass of water.",
        'Go across the bridge and turn right.',
        'The lesson finishes at four thirty.',
        "I'm sorry to hear that you lost your bag.",
        'Congratulations on your excellent result!',
    ],
    'Social Responses': [
        'The shop closes at six this evening.',
        "I'd like a glass of water, please.",
        'Turn left at the traffic lights.',
        "Sorry, I can't come on Friday.",
        'Could I leave a message for Mr. Nam?',
        'The train departs from platform two.',
    ],
    'Telling the Time': [
        "I'm sorry to hear that you are ill.",
        'This sweater is available in green.',
        "I'd like a bowl of chicken soup, please.",
        'Go straight past the supermarket.',
        'Could you call me again tomorrow?',
        'Congratulations on your new job!',
    ],
};

const TIME_SITUATIONS = [
    'Before breakfast, a student checks the kitchen clock so the family will not miss the early bus.',
    'During a morning break, Mai checks the classroom clock because her next lesson begins soon.',
    'At the station, Nam reads the large clock while his friend checks how long they have to wait.',
    'After an evening class, two students check the hall clock before the last bus leaves.',
    'Early in the morning, Lan looks at her bedroom clock to decide when to leave for school.',
];

const hardenQuestion = (category, question, rowIndex) => {
    const situation = category === 'Telling the Time'
        ? TIME_SITUATIONS[rowIndex]
        : SITUATIONS[category];
    return `Situation: ${situation}<br>${question}`;
};

// Giữ 57 câu A1 vốn được soạn ở mức easy và hạ thêm 13 câu medium đầu tiên.
// Như vậy bản publish có đúng 70 câu COMM-A1 mà vẫn giữ nguyên các stem đã làm khó.
const A1_MEDIUM_TO_EASY = 13;
let a1MediumMadeEasy = 0;

const harderDifficulty = (level, difficulty) => {
    // A1 kiểm tra chức năng giao tiếp cơ bản; ngữ cảnh dài hơn không tự làm ngôn
    // ngữ thành B1. Giữ nhóm easy đủ lớn để boundaryLevel không chuyển toàn bộ
    // câu A1 sang A1-A2; các câu còn lại vẫn ở medium.
    if (level === 'A1' && difficulty === 'easy') return 'easy';
    if (level === 'A1' && difficulty === 'medium' && a1MediumMadeEasy++ < A1_MEDIUM_TO_EASY) return 'easy';
    if (level === 'A1' && difficulty !== 'hard') return 'medium';
    if (level === 'A2' && difficulty === 'easy') return 'medium';
    return difficulty;
};

module.exports = Object.entries(BANK).flatMap(([category, rows]) =>
    rows.map(([level, difficulty, question, [correct], explanation], rowIndex) => {
        const pool = DISTRACTOR_POOLS[category];
        const start = rowIndex % pool.length;
        const distractors = [0, 1, 2].map(offset => pool[(start + offset) % pool.length]);
        return {
            skill: 'communication',
            category,
            level,
            difficulty: harderDifficulty(level, difficulty),
            tags: ['communication', category.toLowerCase().replace(/[^a-z]+/g, '-')],
            ...mc({
                type: 'choice',
                question: hardenQuestion(category, question, rowIndex),
                correct,
                distractors,
                explanation: `${explanation} Các phương án còn lại là lời thoại tự nhiên nhưng không phù hợp với tình huống này.`,
            }),
        };
    }));
