'use strict';

const { mc } = require('../lib/builders');

// Mỗi dòng: [level, difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
const BANK = {
    'Family': [
        ['A1', 'medium', "My father's brother is my ______, and his daughter is my ______.", ['uncle / cousin', 'uncle / niece', 'cousin / sister', 'aunt / cousin'], "Anh/em trai của bố là 'uncle'; con gái của chú/bác là 'cousin' (chị/em họ) của người nói."],
        ['A1', 'medium', "Mai is visiting her mother's sister and that woman's son. She is visiting her ______ and her ______.", ['aunt / cousin', 'uncle / nephew', 'aunt / brother', 'niece / cousin'], "Chị/em gái của mẹ là 'aunt'; con của cô/dì là 'cousin' của Mai."],
        ['A1', 'medium', "My aunt's children are my ______.", ['cousins', 'nephews', 'brothers', 'grandchildren'], "'cousins' = anh chị em họ (con của cô/dì/chú/bác)."],
        ['A1', 'medium', "The old man in the photo is my father's father, so he is my ______, not my ______.", ['grandfather / uncle', 'uncle / grandfather', 'grandson / father', 'father-in-law / cousin'], "Bố của bố là 'grandfather' (ông), không phải 'uncle' (chú/bác/cậu)."],
        ['A2', 'medium', "My sister's son is my ______.", ['nephew', 'niece', 'cousin', 'uncle'], "'nephew' = cháu trai (con trai của anh/chị/em). 'niece' = cháu gái."],
        ['A2', 'medium', "My brother's daughter is my ______.", ['niece', 'nephew', 'cousin', 'aunt'], "'niece' = cháu gái (con gái của anh/chị/em)."],
        ['A1', 'medium', "My parents have three children: my two brothers and me. I don't have any ______.", ['sisters', 'brothers', 'parents', 'children'], "Gia đình có 3 người con: 2 anh/em trai và 'tôi' → 'tôi' không có chị/em gái nào ('sisters')."],
        ['A2', 'hard', "After I married Minh, his mother became my ______, while my mother became his ______.", ['mother-in-law / mother-in-law', 'stepmother / aunt', 'grandmother / mother-in-law', 'aunt / stepmother'], "'mother-in-law' chỉ mẹ chồng hoặc mẹ vợ; quan hệ này đúng theo cả hai chiều trong câu."],
        ['A1', 'medium', "Linh and Lan are sisters. They were born on the same day. They are ______.", ['twins', 'cousins', 'neighbors', 'parents'], "'twins' = anh chị em sinh đôi."],
        ['A1', 'medium', "My grandparents have five ______: my brother, my three cousins and me.", ['grandchildren', 'children', 'nephews', 'parents'], "'grandchildren' = các cháu (của ông bà)."],
        ['A2', 'medium', "Nam doesn't have a wife or a girlfriend. He is ______.", ['single', 'married', 'engaged', 'a husband'], "'single' = độc thân."],
        ['A1', 'medium', "Both my mom and dad work late, so my ______ usually have dinner after 8 p.m.", ['parents', 'cousins', 'grandparents', 'children'], "'parents' = bố mẹ; 'both my mom and dad' cho biết đang nói về cả hai người."],
        ['A2', 'easy', "Lan and Huy got ______ last year. Their wedding was beautiful.", ['married', 'marry', 'single', 'wedding'], "'get married' = kết hôn; 'got married' là quá khứ. 'wedding' (đám cưới) là danh từ, không đi sau 'got'."],
        ['A1', 'medium', "Mr. and Mrs. Tran have one son and no other children, so he is an only ______ and has no ______.", ['child / siblings', 'children / cousins', 'son / parents', 'brother / relatives'], "'an only child' = con một; vì không có người con nào khác nên cậu ấy không có 'siblings' (anh/chị/em ruột)."],
        ['A1', 'medium', "My father has two sisters. They are my ______, and their children are my ______.", ['aunts / cousins', 'uncles / nephews', 'cousins / aunts', 'nieces / siblings'], "Chị/em gái của bố là 'aunts'; con của họ là 'cousins' của người nói."],
    ],
    'School': [
        ['A1', 'easy', "We do experiments in the science ______.", ['lab', 'classroom', 'library', 'workshop'], "'lab' (laboratory) = phòng thí nghiệm; classroom, library và workshop cũng là địa điểm học tập nhưng không chuyên dùng để làm thí nghiệm khoa học."],
        ['A1', 'easy', "You can borrow books from the ______.", ['library', 'bookstore', 'reading room', 'classroom'], "'library' = thư viện (mượn sách). 'bookstore' = hiệu sách (mua sách); reading room là phòng đọc và classroom là phòng học."],
        ['A1', 'easy', "Students eat lunch in the school ______.", ['canteen', 'library', 'lab', 'office'], "'canteen' = căng tin."],
        ['A1', 'easy', "History, math and English are school ______.", ['subjects', 'teachers', 'classrooms', 'uniforms'], "'subjects' = môn học."],
        ['A1', 'easy', "I made a mistake in pencil. Can I borrow your ______?", ['eraser', 'ruler', 'stapler', 'calculator'], "'eraser' = cục tẩy (dùng để xoá lỗi viết bằng bút chì)."],
        ['A1', 'easy', "Use a ______ to draw a straight line.", ['ruler', 'eraser', 'scissors', 'stapler'], "'ruler' = thước kẻ."],
        ['A1', 'easy', "The teacher wrote the new words on the ______.", ['board', 'floor', 'door', 'window'], "'board' = bảng."],
        ['A2', 'medium', "I studied hard, so I ______ the exam with a high score.", ['passed', 'failed', 'lost', 'missed'], "'pass an exam' = thi đỗ. 'fail' = thi trượt (mâu thuẫn với 'high score')."],
        ['A1', 'medium', "Our English teacher gives us a lot of ______. We have to do it every evening.", ['homework', 'housework', 'classroom', 'timetable'], "'homework' = bài tập về nhà. 'housework' = việc nhà."],
        ['A1', 'easy', "The ______ shows what classes we have each day.", ['timetable', 'textbook', 'notebook', 'menu'], "'timetable' = thời khoá biểu."],
        ['A2', 'medium', "Lan got 10 out of 10 on her test. She got a perfect ______.", ['score', 'price', 'sum', 'level'], "'score' = điểm số. 'a perfect score' = điểm tuyệt đối."],
        ['A2', 'medium', "In a ______, students sit and listen to a teacher talk about a topic for a long time.", ['lecture', 'break', 'holiday', 'uniform'], "'lecture' = bài giảng (ở đại học)."],
        ['A1', 'easy', "I'm a first-year ______ at a university in Can Tho.", ['student', 'classroom', 'lesson', 'subject'], "'student' = sinh viên. 'a first-year student' = sinh viên năm nhất."],
        ['A1', 'easy', "We have a 15-minute ______ between classes, so we can buy a snack.", ['break', 'lesson', 'term', 'homework'], "'break' = giờ giải lao."],
        ['A2', 'medium', "You must not look at other students' papers during the test. That's ______.", ['cheating', 'helping', 'studying', 'sharing'], "'cheating' = gian lận (trong thi cử)."],
    ],
    'Jobs': [
        ['A1', 'medium', "Hoa works night shifts at a hospital, where she checks patients and gives them medicine. She is a ______.", ['nurse', 'pilot', 'chef', 'farmer'], "'nurse' = y tá/điều dưỡng; các nhiệm vụ chăm sóc bệnh nhân và cho uống thuốc phù hợp với nghề này."],
        ['A1', 'medium', "The ______ prepares the meals in the kitchen, while the ______ carries them to customers' tables.", ['chef / waiter', 'waiter / chef', 'cashier / dentist', 'driver / chef'], "'chef' nấu ăn trong bếp; 'waiter' mang món ra bàn cho khách."],
        ['A1', 'medium', "Our ______ explained the menu, took our order, and brought the food to our table.", ['waiter', 'chef', 'cashier', 'pilot'], "'waiter' = nhân viên phục vụ bàn, người nhận món gọi và mang thức ăn ra bàn."],
        ['A1', 'medium', "Before the plane took off, the ______ welcomed the passengers and checked the controls.", ['pilot', 'driver', 'mechanic', 'sailor'], "'pilot' = phi công; người điều khiển máy bay và kiểm tra hệ thống trước khi cất cánh."],
        ['A1', 'medium', "The car would not start, so a ______ checked the engine while a ______ drove us home.", ['mechanic / taxi driver', 'doctor / pilot', 'chef / cashier', 'lawyer / sailor'], "'mechanic' sửa động cơ; 'taxi driver' lái taxi đưa hành khách về nhà."],
        ['A1', 'medium', "When my tooth began to hurt, I made an appointment with a ______ instead of going to a ______.", ['dentist / pharmacy', 'lawyer / hospital', 'farmer / dentist', 'artist / mechanic'], "'dentist' = nha sĩ, người khám răng; 'pharmacy' là hiệu thuốc chứ không phải người khám."],
        ['A1', 'medium', "Mr. Ba grows rice and vegetables, and his daughter takes customers' money at the market. He is a ______, and she is a ______.", ['farmer / cashier', 'cashier / farmer', 'pilot / lawyer', 'lawyer / pilot'], "Người trồng lúa và rau là 'farmer' (nông dân); người nhận tiền của khách là 'cashier' (thu ngân)."],
        ['A2', 'medium', "An ______ designs buildings and houses.", ['architect', 'mechanic', 'accountant', 'electrician'], "'architect' = kiến trúc sư (bắt đầu bằng nguyên âm nên đi với 'An')."],
        ['A1', 'medium', "After scanning our groceries, the ______ told us the total and gave us a receipt.", ['cashier', 'chef', 'pilot', 'mechanic'], "'cashier' = thu ngân; người quét hàng, nhận tiền và đưa biên lai."],
        ['A2', 'medium', "A ______ writes news stories for newspapers or websites.", ['journalist', 'pharmacist', 'engineer', 'receptionist'], "'journalist' = nhà báo."],
        ['A2', 'medium', "A ______ welcomes guests and answers the phone at a hotel.", ['receptionist', 'journalist', 'pilot', 'farmer'], "'receptionist' = lễ tân."],
        ['A2', 'medium', "A ______ writes computer programs.", ['programmer', 'plumber', 'cashier', 'chef'], "'programmer' = lập trình viên."],
        ['A2', 'hard', "My sister works in a hospital. She ______ sick people.", ['takes care of', 'takes off', 'takes after', 'takes up'], "'take care of' = chăm sóc. 'take off' = cởi/cất cánh, 'take after' = giống (ai đó), 'take up' = bắt đầu (sở thích)."],
        ['A1', 'medium', "Nam is looking for a ______. He wants to work in a hotel.", ['job', 'work', 'working', 'employ'], "'a job' = một công việc. 'work' (công việc) là danh từ không đếm được nên không dùng 'a work'."],
        ['A1', 'medium', "A: What do you ______? <br>B: I'm an accountant.", ['do', 'work', 'job', 'make'], "'What do you do?' = Bạn làm nghề gì?"],
    ],
    'Daily Routines': [
        ['A1', 'easy', "I ______ up at 6 a.m. every day.", ['wake', 'get', 'stay', 'sit'], "'wake up' = thức giấc. Các động từ get, stay và sit đều có thể đi với 'up' trong ngữ cảnh khác nhưng không diễn tả việc thức giấc."],
        ['A1', 'easy', "After I get up, I ______ my teeth.", ['brush', 'comb', 'wear', 'cook'], "'brush my teeth' = đánh răng. 'comb' dùng cho tóc."],
        ['A1', 'easy', "I ______ a shower before breakfast.", ['take', 'do', 'make', 'go'], "'take a shower' = tắm vòi sen."],
        ['A1', 'medium', "My father ______ dressed and leaves for work at 7.", ['gets', 'puts', 'makes', 'does'], "'get dressed' = mặc quần áo."],
        ['A1', 'easy', "In the evening, I ______ the dishes after dinner.", ['wash', 'make', 'take', 'cook'], "'wash the dishes' = rửa bát."],
        ['A1', 'easy', "I usually ______ to bed at 11 p.m.", ['go', 'sleep', 'take', 'make'], "'go to bed' = đi ngủ."],
        ['A1', 'easy', "My mother ______ breakfast for the family every morning.", ['makes', 'does', 'takes', 'plays'], "'make breakfast' = làm bữa sáng."],
        ['A1', 'easy', "I ______ my homework in the evening.", ['do', 'make', 'take', 'play'], "'do homework' = làm bài tập về nhà."],
        ['A2', 'medium', "I'm always tired in the afternoon, so I ______ a nap after lunch.", ['take', 'do', 'make', 'go'], "'take a nap' = chợp mắt, ngủ trưa."],
        ['A1', 'easy', "Lan ______ the bus to school at 6:45.", ['catches', 'goes', 'drives', 'walks'], "'catch the bus' = bắt xe buýt."],
        ['A1', 'easy', "On Sundays, I get up ______ because I don't have class.", ['late', 'early', 'soon', 'fast'], "'get up late' = dậy muộn (vì không phải đi học)."],
        ['A1', 'medium', "After class, I go ______ and have dinner.", ['home', 'to home', 'at home', 'in home'], "'go home' – không dùng giới từ 'to' trước 'home'."],
        ['A1', 'easy', "My brother ______ the house every weekend: he sweeps the floor and cleans the windows.", ['cleans', 'cooks', 'makes', 'takes'], "'clean the house' = dọn dẹp nhà cửa."],
        ['A2', 'medium', "I ______ my alarm clock for 5:30 because I have an early flight.", ['set', 'put', 'make', 'do'], "'set the alarm (clock)' = đặt chuông báo thức."],
        ['A1', 'easy', "I always ______ breakfast at 7 o'clock.", ['have', 'drink', 'take', 'go'], "'have breakfast' = ăn sáng."],
    ],
    'Hobbies & Free Time': [
        ['A1', 'easy', "My brother likes ______ chess with his friends.", ['playing', 'doing', 'making', 'going'], "'play chess' = chơi cờ vua."],
        ['A1', 'easy', "Lan goes ______ every Saturday at the pool.", ['swimming', 'shopping', 'fishing', 'camping'], "'go swimming' = đi bơi (ở hồ bơi)."],
        ['A1', 'easy', "I ______ yoga three times a week.", ['do', 'play', 'go', 'make'], "'do yoga' = tập yoga."],
        ['A1', 'easy', "Huy loves taking ______. He has a new camera.", ['photos', 'songs', 'books', 'games'], "'take photos' = chụp ảnh."],
        ['A1', 'easy', "My hobby is collecting ______. I have more than 200 from different countries.", ['stamps', 'songs', 'sports', 'meals'], "'collect stamps' = sưu tầm tem."],
        ['A1', 'easy', "I like ______ to music in my free time.", ['listening', 'hearing', 'watching', 'playing'], "'listen to music' = nghe nhạc."],
        ['A2', 'medium', "Nam goes ______ in the mountains every summer.", ['hiking', 'sailing', 'surfing', 'diving'], "'go hiking' = đi bộ đường dài (leo núi)."],
        ['A1', 'easy', "My sister plays the ______ in a band.", ['guitar', 'football', 'chess', 'tennis'], "'play the guitar' (nhạc cụ có 'the')."],
        ['A1', 'easy', "In my ______ time, I watch movies and read comics.", ['free', 'busy', 'empty', 'open'], "'free time' = thời gian rảnh."],
        ['A1', 'medium', "Do you want to ______ out tonight? There's a new café near the river.", ['go', 'make', 'do', 'take'], "'go out' = đi chơi."],
        ['A1', 'easy', "My grandmother loves growing flowers. Her hobby is ______.", ['gardening', 'cooking', 'painting', 'dancing'], "'gardening' = làm vườn."],
        ['A2', 'medium', "I'm a big ______ of Korean dramas. I watch them every night.", ['fan', 'friend', 'player', 'star'], "'be a big fan of' = rất hâm mộ."],
        ['A1', 'medium', "Huy is very good ______ drawing.", ['at', 'in', 'on', 'for'], "'be good at + V-ing/N' = giỏi về..."],
        ['A1', 'medium', "Linh is interested ______ learning Japanese.", ['in', 'on', 'at', 'about'], "'be interested in' = quan tâm, thích thú với..."],
        ['A1', 'easy', "My friends and I often play ______ in the park on Sunday mornings.", ['badminton', 'swimming', 'cooking', 'jogging'], "'play badminton' = chơi cầu lông. Các hoạt động còn lại không đi với 'play'."],
    ],
    'Food & Drink': [
        ['A1', 'easy', "I'm ______. Can I have a glass of water?", ['thirsty', 'hungry', 'tired', 'full'], "'thirsty' = khát."],
        ['A1', 'easy', "I'm ______. Let's get something to eat.", ['hungry', 'thirsty', 'full', 'sleepy'], "'hungry' = đói."],
        ['A2', 'medium', "No more, thanks. I'm ______.", ['full', 'hungry', 'empty', 'thirsty'], "'full' = no (không ăn thêm được nữa)."],
        ['A1', 'easy', "This soup has too much salt. It's very ______.", ['salty', 'sweet', 'sour', 'spicy'], "'too much salt' (quá nhiều muối) → 'salty' = mặn."],
        ['A1', 'easy', "Lemons taste ______.", ['sour', 'sweet', 'salty', 'spicy'], "Chanh có vị chua → 'sour'. ('sweet' = ngọt, 'salty' = mặn, 'spicy' = cay)"],
        ['A1', 'easy', "Chili peppers are very ______.", ['spicy', 'sweet', 'sour', 'salty'], "Ớt có vị cay → 'spicy'. ('sweet' = ngọt, 'sour' = chua, 'salty' = mặn)"],
        ['A1', 'medium', "Can I have a ______ of rice, please?", ['bowl', 'bottle', 'slice', 'can'], "'a bowl of rice' = một bát cơm."],
        ['A1', 'easy', "I'd like a ______ of pizza.", ['slice', 'bottle', 'glass', 'bowl'], "'a slice of pizza' = một lát/miếng pizza."],
        ['A1', 'easy', "Please buy a ______ of milk on your way home.", ['bottle', 'slice', 'bar', 'loaf'], "'a bottle of milk' = một chai sữa. 'a loaf' dùng cho bánh mì, 'a bar' cho sô-cô-la."],
        ['A1', 'easy', "______ is the meal you eat in the morning.", ['Breakfast', 'Lunch', 'Dinner', 'Dessert'], "'breakfast' = bữa sáng."],
        ['A2', 'medium', "After dinner, we had ice cream for ______.", ['dessert', 'breakfast', 'desert', 'drink'], "'dessert' = món tráng miệng. Chú ý: 'desert' = sa mạc."],
        ['A2', 'medium', "Pho is a famous Vietnamese ______ made with rice noodles.", ['dish', 'cup', 'menu', 'kitchen'], "'dish' = món ăn."],
        ['A1', 'easy', "Carrots, onions and cabbages are ______.", ['vegetables', 'fruits', 'drinks', 'desserts'], "'vegetables' = rau củ."],
        ['A1', 'easy', "Mangoes, bananas and durians are ______.", ['fruits', 'vegetables', 'meats', 'drinks'], "'fruits' = trái cây."],
        ['A2', 'medium', "A: How would you like your coffee? <br>B: With milk, but no ______, please. I don't like sweet drinks.", ['sugar', 'salt', 'ice', 'pepper'], "'sugar' = đường (làm đồ uống ngọt)."],
    ],
    'Shopping & Clothes': [
        ['A1', 'easy', "These jeans are too ______. I need a bigger size.", ['small', 'big', 'large', 'long'], "'too small' = quá nhỏ → cần cỡ lớn hơn."],
        ['A1', 'easy', "It's cold today. Wear a ______.", ['jacket', 'T-shirt', 'pair of shorts', 'pair of sandals'], "'jacket' = áo khoác (mặc khi trời lạnh)."],
        ['A1', 'easy', "I need new ______ for running.", ['sneakers', 'ties', 'earrings', 'belts'], "'sneakers' = giày thể thao."],
        ['A2', 'medium', "Can I ______ on this shirt?", ['try', 'get', 'take', 'wear'], "'try on' = mặc thử (trước khi mua)."],
        ['A2', 'medium', "This T-shirt is on ______. It's 50% off today.", ['sale', 'sell', 'shop', 'price'], "'on sale' = đang giảm giá."],
        ['A2', 'medium', "Excuse me, where is the ______ room? I want to try on these pants.", ['fitting', 'living', 'dining', 'waiting'], "'fitting room' = phòng thử đồ."],
        ['A1', 'easy', "I'd like to pay by credit ______.", ['card', 'money', 'cash', 'bill'], "'credit card' = thẻ tín dụng."],
        ['A1', 'easy', "That dress is too ______. I only have 200,000 dong, so I can't buy it.", ['expensive', 'cheap', 'free', 'small'], "'expensive' = đắt."],
        ['A1', 'easy', "My mother buys fresh fish and vegetables at the ______ every morning.", ['market', 'bank', 'pharmacy', 'post office'], "'market' = chợ."],
        ['A1', 'easy', "You can buy medicine at a ______.", ['pharmacy', 'bakery', 'bookstore', 'gas station'], "'pharmacy' = hiệu thuốc."],
        ['A1', 'easy', "You can buy bread and cakes at a ______.", ['bakery', 'pharmacy', 'bank', 'bookstore'], "'bakery' = tiệm bánh."],
        ['A2', 'medium', "Can I have a ______, please? I may need to return this item.", ['receipt', 'recipe', 'ticket', 'menu'], "'receipt' = hoá đơn/biên lai. 'recipe' = công thức nấu ăn."],
        ['A1', 'easy', "Huy wears a ______ and a tie to work.", ['suit', 'skirt', 'swimsuit', 'dress'], "'suit' = bộ com-lê."],
        ['A2', 'medium', "These shoes don't ______ me. They're too small.", ['fit', 'match', 'wear', 'put'], "'fit' = vừa (kích cỡ)."],
        ['A1', 'medium', "A: Can I help you? <br>B: No, thanks. I'm just ______.", ['looking', 'seeing', 'watching', 'buying'], "'I'm just looking' = Tôi chỉ xem thôi (câu quen thuộc khi mua sắm)."],
    ],
    'Travel': [
        ['A2', 'medium', "A ______ is an official document you need to travel to another country.", ['passport', 'map', 'menu', 'receipt'], "'passport' = hộ chiếu."],
        ['A1', 'easy', "We stayed in a ______ near the beach for three nights.", ['hotel', 'restaurant', 'museum', 'hospital'], "'hotel' = khách sạn (nơi ở lại qua đêm)."],
        ['A2', 'medium', "I'd like to ______ a room for two nights, please.", ['book', 'buy', 'pay', 'make'], "'book a room' = đặt phòng."],
        ['A1', 'easy', "Don't forget to pack your ______. It's going to be sunny.", ['sunglasses', 'umbrella', 'gloves', 'scarf'], "'sunglasses' = kính râm (dùng khi trời nắng)."],
        ['A2', 'medium', "Our flight was ______ because of the storm, so we left five hours later.", ['delayed', 'early', 'on time', 'fast'], "'delayed' = bị hoãn/trễ."],
        ['A2', 'medium', "Ha Long Bay is a famous tourist ______ in Vietnam.", ['attraction', 'station', 'office', 'ticket'], "'tourist attraction' = điểm du lịch hấp dẫn."],
        ['A2', 'medium', "Let's take a ______ of the old town. A guide will show us around.", ['tour', 'travel', 'journey', 'flight'], "'take a tour of' = đi tham quan."],
        ['A1', 'easy', "I put all my clothes in my ______ before going to the airport.", ['suitcase', 'wallet', 'purse', 'pocket'], "'suitcase' = va li."],
        ['A2', 'medium', "We went ______ in Hue last summer and saw the old citadel.", ['sightseeing', 'sight', 'travel', 'tour'], "'go sightseeing' = đi ngắm cảnh, tham quan."],
        ['A2', 'medium', "A ______ ticket lets you go to a place and come back.", ['round-trip', 'one-way', 'single', 'free'], "'round-trip ticket' = vé khứ hồi. 'one-way' = vé một chiều."],
        ['A1', 'medium', "Excuse me, what time does the plane ______ off?", ['take', 'get', 'go', 'leave'], "'take off' = (máy bay) cất cánh."],
        ['A2', 'medium', "We need to ______ in at the hotel before 2 p.m.", ['check', 'get', 'go', 'come'], "'check in' = làm thủ tục nhận phòng."],
        ['A1', 'medium', "Last year we went on ______ to Phu Quoc Island.", ['vacation', 'travel', 'trip', 'journey'], "'go on vacation' = đi nghỉ mát. 'trip/journey' là danh từ đếm được nên cần 'a'."],
        ['A1', 'easy', "The weather was perfect, so we spent all day at the ______, swimming in the sea.", ['beach', 'mountain', 'desert', 'museum'], "'beach' = bãi biển."],
        ['A1', 'easy', "Many tourists come to Can Tho to visit the floating ______.", ['market', 'hotel', 'station', 'airport'], "'floating market' = chợ nổi."],
    ],
    'Transportation': [
        ['A1', 'easy', "I ride my ______ to school every day.", ['motorbike', 'plane', 'train', 'ship'], "'ride a motorbike' = đi xe máy."],
        ['A1', 'easy', "A ______ travels on rails.", ['train', 'bus', 'taxi', 'ship'], "'train' = tàu hoả (chạy trên đường ray)."],
        ['A1', 'easy', "The bus ______ is in front of the school. Wait for the bus there.", ['stop', 'line', 'ticket', 'driver'], "'bus stop' = trạm/điểm dừng xe buýt."],
        ['A1', 'medium', "There's a lot of ______ in the city center at 5 p.m. Cars can't move.", ['traffic', 'passengers', 'parking', 'tickets'], "'traffic' = giao thông, xe cộ (không đếm được)."],
        ['A2', 'medium', "Please fasten your seat ______.", ['belt', 'bag', 'line', 'card'], "'seat belt' = dây an toàn."],
        ['A1', 'easy', "I missed the bus, so I took a ______.", ['taxi', 'ticket', 'walk', 'station'], "'take a taxi' = đi taxi."],
        ['A1', 'medium', "Be careful when you ______ the street.", ['cross', 'across', 'through', 'along'], "'cross' (động từ) = băng qua. 'across' là giới từ."],
        ['A2', 'medium', "How long does it ______ to get from Can Tho to Ho Chi Minh City by bus?", ['take', 'spend', 'cost', 'need'], "'How long does it take...?' = Mất bao lâu...?"],
        ['A1', 'medium', "Get ______ the bus at the third stop.", ['off', 'out', 'down', 'away'], "'get off the bus' = xuống xe buýt. 'get on' = lên xe."],
        ['A2', 'medium', "You can't park here. It's a no-______ zone.", ['parking', 'park', 'stop', 'driving'], "'no-parking zone' = khu vực cấm đỗ xe."],
        ['A1', 'easy', "The bus ______ helped me with my heavy bags.", ['driver', 'rider', 'passenger', 'pilot'], "'bus driver' = tài xế xe buýt."],
        ['A1', 'easy', "Ferries and ships travel by ______.", ['sea', 'air', 'road', 'rail'], "'by sea' = bằng đường biển."],
        ['A2', 'medium', "My brother is learning to drive. He wants to get his driver's ______ next month.", ['license', 'card', 'paper', 'ticket'], "'driver's license' = giấy phép lái xe."],
        ['A1', 'easy', "There are 40 ______ on the bus.", ['passengers', 'drivers', 'pilots', 'tickets'], "'passengers' = hành khách."],
        ['A1', 'easy', "You need a ______ to fly from Hanoi to Can Tho.", ['plane', 'ship', 'train', 'bike'], "'plane' = máy bay (dùng để bay)."],
    ],
    'Directions & Places': [
        ['A1', 'easy', "Go ______ for two blocks, then turn left.", ['straight', 'across', 'between', 'opposite'], "'go straight' = đi thẳng."],
        ['A1', 'medium', "The post office is ______ the bank. They're face to face across the street.", ['opposite', 'next to', 'behind', 'between'], "'opposite' = đối diện."],
        ['A1', 'medium', "The café is on the ______ of Hoa Binh Street and Tran Phu Street.", ['corner', 'middle', 'side', 'center'], "'on the corner of A and B' = ở góc giao nhau của đường A và B."],
        ['A1', 'easy', "You can see a doctor at the ______.", ['hospital', 'bank', 'bakery', 'museum'], "'hospital' = bệnh viện."],
        ['A1', 'easy', "You can send letters at the ______.", ['post office', 'police station', 'gas station', 'library'], "'post office' = bưu điện."],
        ['A1', 'easy', "You can watch new movies at the ______.", ['movie theater', 'museum', 'stadium', 'pharmacy'], "'movie theater' = rạp chiếu phim."],
        ['A1', 'easy', "You can see old paintings and historical objects at the ______.", ['museum', 'stadium', 'gas station', 'supermarket'], "'museum' = bảo tàng."],
        ['A2', 'medium', "My car needs fuel. Is there a ______ near here?", ['gas station', 'bus station', 'fire station', 'police station'], "'gas station' = trạm xăng."],
        ['A1', 'easy', "A: Excuse me, is there an ATM ______ here? <br>B: Yes, there's one on Le Loi Street.", ['near', 'next', 'far', 'between'], "'near here' = gần đây."],
        ['A1', 'medium', "Walk ______ the bridge and the museum is on your left.", ['across', 'between', 'among', 'opposite'], "'walk across' = đi băng qua (cây cầu)."],
        ['A1', 'easy', "The supermarket is ______ the bank and the bookstore.", ['between', 'among', 'next', 'through'], "'between A and B' = ở giữa A và B."],
        ['A2', 'medium', "It's too far to walk. You should take a bus. It's about ten ______ from here.", ['kilometers', 'centimeters', 'grams', 'liters'], "'kilometers' = ki-lô-mét (đơn vị khoảng cách xa)."],
        ['A1', 'medium', "I'm lost. Can you show me the ______ to the train station?", ['way', 'trip', 'travel', 'walk'], "'the way to...' = đường đến..."],
        ['A1', 'easy', "Go to the end of the street and turn left. The library is the second building ______ the right.", ['on', 'in', 'at', 'to'], "'on the right/left' = ở bên phải/trái."],
        ['A1', 'easy', "A ______ is a big open area with trees and grass where people relax.", ['park', 'parking lot', 'prison', 'factory'], "'park' = công viên."],
    ],
    'Adjectives': [
        ['A1', 'medium', "The first bag is cheap enough for me, but the leather one is too ______ to buy.", ['expensive', 'easy', 'early', 'empty'], "'expensive' = đắt; được dùng để đối lập với 'cheap' và phù hợp với 'too ... to buy'."],
        ['A1', 'medium', "The café was too noisy to study in, so we found a ______ corner in the library.", ['quiet', 'quick', 'quite', 'busy'], "'quiet' = yên tĩnh, đối lập với 'noisy'. 'quite' là trạng từ nghĩa là khá."],
        ['A1', 'medium', "This bottle was ______ when we left home, but now it is empty.", ['full', 'heavy', 'dirty', 'wide'], "'full' = đầy, đối lập với 'empty'; ngữ cảnh cho thấy nước trong chai đã được dùng hết."],
        ['A1', 'medium', "The old bridge looked dangerous, so we chose the newer, ______ route.", ['safe', 'dirty', 'strong', 'smooth'], "'safe' = an toàn, đối lập với 'dangerous' và phù hợp với 'route'."],
        ['A2', 'hard', "The main road is wide enough for buses, but this side street is so ______ that only motorbikes can enter.", ['narrow', 'light', 'quiet', 'soft'], "'narrow' = hẹp; chỉ xe máy đi vào được là dấu hiệu cho thấy con đường không rộng."],
        ['A1', 'easy', "This room is very ______. Please clean it.", ['dirty', 'clean', 'tidy', 'neat'], "'dirty' = bẩn → cần dọn."],
        ['A2', 'medium', "My new phone is very ______. It weighs only 150 grams.", ['light', 'heavy', 'dark', 'loud'], "Chỉ nặng 150 gram → 'light' = nhẹ (trái nghĩa với 'heavy' = nặng)."],
        ['A1', 'easy', "The movie was so ______ that I fell asleep.", ['boring', 'exciting', 'interesting', 'scary'], "'boring' = nhàm chán (khiến buồn ngủ)."],
        ['A2', 'medium', "I feel ______ about my exam tomorrow. I'm worried.", ['nervous', 'relaxed', 'bored', 'happy'], "'nervous' = lo lắng, hồi hộp."],
        ['A1', 'easy', "Huy is very ______. He always helps other people.", ['kind', 'rude', 'lazy', 'selfish'], "'kind' = tốt bụng."],
        ['A2', 'medium', "Lan is ______. She feels uncomfortable when she meets new people.", ['shy', 'friendly', 'outgoing', 'talkative'], "'shy' = nhút nhát."],
        ['A1', 'easy', "My grandfather is 85, but he is still very ______. He walks 5 km every day.", ['healthy', 'sick', 'weak', 'tired'], "'healthy' = khoẻ mạnh."],
        ['A1', 'easy', "It's ______ today. Take your raincoat.", ['rainy', 'sunny', 'dry', 'hot'], "'rainy' = có mưa → mang áo mưa (raincoat)."],
        ['A1', 'easy', "The test was ______. Everybody got a high score.", ['easy', 'difficult', 'hard', 'impossible'], "Mọi người đều được điểm cao → bài kiểm tra 'easy' (dễ)."],
        ['A1', 'easy', "Be careful! The soup is very ______.", ['hot', 'cold', 'cool', 'frozen'], "'hot' = nóng → cần cẩn thận."],
    ],
    'Common Verbs': [
        ['A2', 'medium', "Can you ______ me your pen? I'll give it back in five minutes.", ['lend', 'borrow', 'keep', 'steal'], "'lend sb sth' = cho ai mượn. 'borrow' = mượn (của ai)."],
        ['A2', 'medium', "Can I ______ your dictionary for a minute?", ['borrow', 'lend', 'give', 'show'], "'borrow' = mượn."],
        ['A1', 'easy', "Please ______ the light. It's too dark.", ['turn on', 'turn off', 'look at', 'take off'], "'turn on' = bật (đèn)."],
        ['A1', 'easy', "______ off your shoes before you go into the house.", ['Take', 'Put', 'Turn', 'Get'], "'take off (shoes)' = cởi (giày)."],
        ['A1', 'easy', "I ______ my keys. I can't find them anywhere.", ['lost', 'found', 'kept', 'won'], "'lose' (quá khứ 'lost') = làm mất."],
        ['A1', 'easy', "It's cold and windy. Please ______ the window.", ['close', 'open', 'wash', 'cook'], "Trời lạnh và có gió → 'close the window' (đóng cửa sổ). 'open' = mở."],
        ['A1', 'medium', "I ______ my friend at the café yesterday. We talked for two hours.", ['met', 'knew', 'made', 'became'], "'meet' (quá khứ 'met') = gặp."],
        ['A1', 'easy', "Don't ______ to bring your homework tomorrow.", ['forget', 'remember', 'lose', 'miss'], "'Don't forget to...' = Đừng quên..."],
        ['A1', 'easy', "I ______ for the bus for 30 minutes this morning.", ['waited', 'stayed', 'spent', 'stopped'], "'wait for' = chờ đợi → 'waited for the bus'."],
        ['A2', 'medium', "Could you ______ me the way to the station?", ['tell', 'say', 'speak', 'talk'], "'tell sb sth' = nói/chỉ cho ai điều gì. 'say' không có tân ngữ chỉ người trực tiếp."],
        ['A2', 'medium', "She ______ a lot of money on clothes every month.", ['spends', 'pays', 'buys', 'costs'], "'spend money on sth' = tiêu tiền vào việc gì."],
        ['A1', 'medium', "How much does this bag ______?", ['cost', 'pay', 'spend', 'buy'], "'How much does it cost?' = Nó giá bao nhiêu?"],
        ['A2', 'medium', "My mother ______ me to clean my room every Sunday.", ['asks', 'says', 'speaks', 'talks'], "'ask sb to do sth' = yêu cầu ai làm gì."],
        ['A1', 'easy', "I want to ______ English well so I can work abroad.", ['learn', 'teach', 'tell', 'say'], "Muốn giỏi tiếng Anh để làm việc ở nước ngoài → 'learn' (học). 'teach' = dạy."],
        ['A1', 'easy', "Please ______ quiet in the library.", ['be', 'do', 'make', 'have'], "Cụm 'be quiet' = giữ yên lặng."],
    ],
    'Collocations & Phrases': [
        ['A1', 'easy', "I need to ______ a phone call.", ['make', 'do', 'play', 'go'], "'make a phone call' = gọi điện thoại."],
        ['A2', 'medium', "Can you ______ me a favor?", ['do', 'make', 'give', 'take'], "'do sb a favor' = giúp ai một việc."],
        ['A1', 'easy', "Let's ______ a break. We've been studying for two hours.", ['take', 'do', 'go', 'play'], "'take a break' = nghỉ giải lao."],
        ['A1', 'medium', "Don't ______ a noise. The baby is sleeping.", ['make', 'do', 'take', 'give'], "'make a noise' = gây ồn."],
        ['A1', 'medium', "I always ______ my best in exams.", ['do', 'make', 'take', 'go'], "'do my best' = cố gắng hết sức."],
        ['A1', 'medium', "He ______ a mistake on the test.", ['made', 'did', 'took', 'gave'], "'make a mistake' = mắc lỗi (quá khứ: 'made a mistake'). Không nói 'do a mistake'."],
        ['A1', 'easy', "Let's ______ shopping this afternoon.", ['go', 'make', 'play', 'take'], "'go shopping' = đi mua sắm."],
        ['A1', 'easy', "I usually ______ the housework on Saturdays.", ['do', 'make', 'go', 'take'], "'do the housework' = làm việc nhà."],
        ['A1', 'easy', "Excuse me, can I ______ a question?", ['ask', 'say', 'make', 'tell'], "'ask a question' = đặt câu hỏi."],
        ['A2', 'medium', "My best friend and I always ______ the truth to each other.", ['tell', 'say', 'speak', 'talk'], "'tell the truth' = nói sự thật."],
        ['A2', 'medium', "Please ______ attention to the teacher.", ['pay', 'take', 'make', 'do'], "'pay attention to' = chú ý đến."],
        ['A1', 'easy', "I'm going to ______ a party for my birthday.", ['have', 'do', 'go', 'take'], "'have a party' = tổ chức tiệc."],
        ['A2', 'hard', "It ______ me two hours to finish the report.", ['took', 'spent', 'made', 'had'], "'It takes sb + thời gian + to V' = ai mất bao lâu để làm gì. Câu kể chuyện đã xong → quá khứ 'took'."],
        ['A1', 'easy', "Nice to ______ you!", ['meet', 'make', 'take', 'get'], "'Nice to meet you' = Rất vui được gặp bạn (lần đầu gặp mặt)."],
        ['A1', 'easy', "It's late. I have to ______ home now.", ['go', 'make', 'do', 'take'], "'go home' = về nhà."],
    ],
    'Word Groups': [
        ['A1', 'medium', "For the picnic, Lan packed carrots, potatoes, onions, and a ______ because the evening might be cold. Which word completes a different word group?", ['jacket', 'tomato', 'cabbage', 'cucumber'], "'jacket' là quần áo; các lựa chọn còn lại đều là rau củ."],
        ['A1', 'medium', "At the family dinner, my uncle, aunt, and cousin sat together, but our ______ came over only to return a key.", ['neighbor', 'nephew', 'grandmother', 'sister'], "'neighbor' = hàng xóm, không phải quan hệ gia đình; các lựa chọn còn lại đều chỉ người thân."],
        ['A1', 'medium', "We can travel by bus, train, or taxi, but we must buy a ______ before getting on the train.", ['ticket', 'coach', 'motorbike', 'ferry'], "'ticket' = vé, không phải phương tiện; các lựa chọn còn lại đều là phương tiện giao thông."],
        ['A1', 'medium', "The forecast says it will be sunny, rainy, and windy this week; after walking in that weather, we may feel ______.", ['hungry', 'cloudy', 'stormy', 'dry'], "'hungry' mô tả cảm giác của người; các lựa chọn còn lại mô tả thời tiết."],
        ['A1', 'medium', "Math, history, and chemistry are on today's timetable, and we will eat lunch in the ______.", ['canteen', 'classroom', 'laboratory', 'library'], "'canteen' là nơi ăn uống trong trường; ba lựa chọn còn lại cũng là địa điểm, nhưng ngữ cảnh 'eat lunch' xác định rõ căng tin."],
    ],
};

const harderDifficulty = (difficulty, question) => {
    const blanks = (question.match(/______/g) || []).length;
    const complexity = question.length + (blanks > 1 ? 35 : 0);
    if (difficulty === 'easy' && complexity >= 50) return 'medium';
    if (difficulty === 'medium' && complexity >= 105) return 'hard';
    return difficulty;
};

// Các câu A1 ngắn được đặt trong một mini-dialogue theo chủ đề. Cách này buộc
// người học đọc ngữ cảnh thay vì chỉ nhận ra một cụm từ rời rạc, đồng thời giữ
// nguyên số câu và cấu trúc dữ liệu nguồn.
const A1_DIALOGUE_PROMPTS = {
    Family: 'A: Which family word or relationship completes the description?<br>B: ',
    School: 'A: Which school word best completes the situation below?<br>B: ',
    Jobs: 'A: Which work-related word makes the whole description correct?<br>B: ',
    'Daily Routines': 'A: Which everyday expression completes this routine naturally?<br>B: ',
    'Hobbies & Free Time': 'A: Which free-time word or phrase fits this situation best?<br>B: ',
    'Food & Drink': 'A: Which food or drink word completes the speaker’s meaning?<br>B: ',
    'Shopping & Clothes': 'A: Which shopping or clothing word fits the customer’s situation?<br>B: ',
    Travel: 'A: Which travel word or phrase completes this situation naturally?<br>B: ',
    Transportation: 'A: Which transport word or phrase fits both clues in the situation?<br>B: ',
    'Directions & Places': 'A: Which place or direction word completes these instructions?<br>B: ',
    Adjectives: 'A: Which adjective matches the evidence in the second clause?<br>B: ',
    'Common Verbs': 'A: Which verb completes the action described in this situation?<br>B: ',
    'Collocations & Phrases': 'A: Which common phrase completes the speaker’s sentence naturally?<br>B: ',
    'Word Groups': 'A: Which topic word completes the description and its word group?<br>B: ',
};

// Giữ một phần các mục A1 đơn giản nhất ở difficulty "easy" để bộ lọc A1
// vẫn có đủ câu. Việc chọn dựa trên độ dài stem gốc (và phạt câu nhiều ô
// trống), còn stem xuất bản vẫn được bọc trong ngữ cảnh bên dưới.
const A1_EASY_TARGET = 70;
const retainedA1EasyRows = new Set(
    Object.values(BANK)
        .flat()
        .filter(([level, difficulty]) => level === 'A1' && difficulty === 'easy')
        .map((row, index) => ({
            row,
            index,
            complexity: row[2].length + ((row[2].match(/______/g) || []).length > 1 ? 35 : 0),
        }))
        .sort((a, b) => a.complexity - b.complexity || a.index - b.index)
        .slice(0, A1_EASY_TARGET)
        .map(({ row }) => row),
);

const hardenA1Row = (category, row) => {
    const [level, difficulty, question, options, explanation] = row;
    if (level !== 'A1' || (difficulty !== 'easy' && question.length >= 70)) return row;
    return [
        level,
        retainedA1EasyRows.has(row) ? 'easy' : 'medium',
        A1_DIALOGUE_PROMPTS[category] + question,
        options,
        explanation,
    ];
};

module.exports = Object.entries(BANK).flatMap(([category, rows]) =>
    rows.map(row => hardenA1Row(category, row))
        .map(([level, difficulty, question, [correct, ...distractors], explanation]) => ({
        skill: 'vocabulary',
        category,
        level,
        // Các câu A1 được chọn ở trên phải vượt qua boundaryLevel dưới dạng
        // "easy"; không nâng lại chỉ vì tiền tố hội thoại làm stem dài hơn.
        difficulty: level === 'A1' && difficulty === 'easy'
            ? 'easy'
            : harderDifficulty(difficulty, question),
        tags: ['vocabulary', category.toLowerCase().replace(/[^a-z]+/g, '-')],
        ...mc({ type: 'choice', question, correct, distractors, explanation }),
    })));
