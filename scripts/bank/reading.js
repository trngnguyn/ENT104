'use strict';

const { mc } = require('../lib/builders');

// Mỗi câu hỏi: [focus, difficulty, question, [đáp án đúng, nhiễu 1, nhiễu 2, nhiễu 3], giải thích]
// focus: main_idea | detail | inference | vocabulary
const PASSAGES = [
    // ---------------------------------------------------------------- A1
    {
        id: 'RP01', level: 'A1', genre: 'Personal profile', title: 'Meet Minh Anh',
        text: `Hello! My name is Minh Anh. I am nineteen years old and I am a first-year student at a university in Can Tho. I study business. I live in a small apartment near the university with my cousin, Thu.

Every morning, I get up at six o'clock and ride my bike to school. My classes start at seven. In the afternoon, I work part-time at a bookstore. I love reading, so it is a great job for me.

On weekends, I visit my parents in Vinh Long. My mother is a teacher and my father is a farmer. I have one younger brother. His name is Bao and he is in grade 8.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ["Minh Anh's life and daily activities", 'How to find a part-time job', 'A bookstore in Can Tho', 'Farming in Vinh Long'], "Bài viết giới thiệu Minh Anh: tuổi, việc học, nơi ở, công việc, gia đình → cuộc sống hằng ngày của cô ấy."],
            ['detail', 'easy', 'How old is Minh Anh?', ['Nineteen', 'Eighteen', 'Twenty', 'Nine'], "'I am nineteen years old.'"],
            ['detail', 'easy', 'Who does Minh Anh live with?', ['Her cousin', 'Her parents', 'Her younger brother', 'A friend from her class'], "'I live in a small apartment ... with my cousin, Thu.'"],
            ['inference', 'medium', 'Why does Minh Anh like her part-time job?', ['Because she loves reading.', 'Because it is near Vinh Long.', 'Because her mother works there.', 'Because she works there in the morning.'], "'I love reading, so it is a great job for me.' – cô ấy làm ở hiệu sách."],
            ['detail', 'easy', "Where do Minh Anh's parents live?", ['In Vinh Long', 'In Can Tho', 'Near the university', 'In Ho Chi Minh City'], "'On weekends, I visit my parents in Vinh Long.'"],
        ],
    },
    {
        id: 'RP02', level: 'A1', genre: 'Email', title: "Nam's email from Da Lat",
        text: `Hi Huy,

I'm in Da Lat with my family now. We arrived yesterday afternoon. The weather here is cool and sunny, but it is cold at night, so I always wear a jacket. Our hotel is small but very clean, and it is near Xuan Huong Lake.

This morning, we walked around the lake and had breakfast at a market. The strawberries here are delicious! Tomorrow we are going to visit a flower garden. We are going home on Sunday.

See you soon,
Nam`,
        questions: [
            ['main_idea', 'easy', 'Why did Nam write this email?', ['To tell Huy about his trip to Da Lat', 'To invite Huy to Da Lat', 'To ask Huy about a hotel', 'To say sorry to Huy'], "Nam kể về chuyến đi Đà Lạt: thời tiết, khách sạn, hoạt động."],
            ['detail', 'easy', 'What is the weather like in Da Lat at night?', ['Cold', 'Hot', 'Rainy', 'Warm and sunny'], "'...but it is cold at night, so I always wear a jacket.'"],
            ['detail', 'easy', "Where is Nam's hotel?", ['Near Xuan Huong Lake', 'Next to a flower garden', 'In the market', 'Far from the lake'], "'...it is near Xuan Huong Lake.'"],
            ['detail', 'medium', 'What is Nam going to do tomorrow?', ['Visit a flower garden', 'Go home', 'Walk around the lake', 'Have breakfast at a market'], "'Tomorrow we are going to visit a flower garden.' (Đi dạo quanh hồ và ăn sáng ở chợ là việc 'this morning'.)"],
            ['vocabulary', 'easy', "In the email, the word 'delicious' means ______.", ['very tasty', 'very expensive', 'very cold', 'very small'], "'delicious' = rất ngon (very tasty)."],
        ],
    },
    {
        id: 'RP03', level: 'A1', genre: 'Notice', title: 'City Library notice',
        text: `CITY LIBRARY – NOTICE

Opening hours:
Monday to Friday: 8:00 a.m. – 8:00 p.m.
Saturday: 8:00 a.m. – 5:00 p.m.
Sunday: Closed

Rules:
- Please be quiet in the reading room.
- Do not eat or drink inside the library. You can use the café on the first floor.
- You can borrow up to 5 books for 2 weeks.
- You need a library card to borrow books. A new card costs 20,000 dong.
- Please return books on time. If a book is late, you pay 2,000 dong per day.`,
        questions: [
            ['main_idea', 'easy', 'Where can you see this notice?', ['In a library', 'In a café', 'In a bookstore', 'In a school canteen'], "Tiêu đề 'CITY LIBRARY – NOTICE' → thông báo của thư viện."],
            ['detail', 'easy', 'When is the library closed?', ['On Sunday', 'On Saturday morning', 'On Monday morning', 'Every day after 5 p.m.'], "'Sunday: Closed'."],
            ['detail', 'easy', 'How many books can you borrow at one time?', ['Five', 'Two', 'Twenty', 'Ten'], "'You can borrow up to 5 books for 2 weeks.'"],
            ['inference', 'medium', 'Lan wants to drink a coffee. What should she do?', ['Go to the café on the first floor', 'Drink it in the reading room', 'Drink it next to the books', 'Ask for a coffee at the library desk'], "'Do not eat or drink inside the library. You can use the café on the first floor.'"],
            ['inference', 'hard', 'Huy returns a book 3 days late. How much does he pay?', ['6,000 dong', '2,000 dong', '3,000 dong', '20,000 dong'], "Trễ 1 ngày trả 2,000 đồng → 3 ngày × 2,000 = 6,000 đồng."],
        ],
    },
    {
        id: 'RP04', level: 'A1', genre: 'Text messages', title: 'Mai and Linh',
        text: `Mai (4:15 p.m.): Hi Linh! Are you free this evening? Do you want to go to the night market with me?
Linh (4:20 p.m.): Hi Mai! I'd love to, but I have an English class until 7.
Mai (4:22 p.m.): No problem. Let's meet at 7:30, then.
Linh (4:25 p.m.): OK! Where should we meet?
Mai (4:26 p.m.): In front of the cinema on Hoa Binh Street. It's near the market.
Linh (4:27 p.m.): Great. See you there!`,
        questions: [
            ['main_idea', 'easy', 'What are Mai and Linh doing in these messages?', ['Making a plan to go out together', 'Doing English homework', 'Buying cinema tickets', 'Talking about a movie'], "Hai bạn hẹn giờ và địa điểm để đi chợ đêm."],
            ['detail', 'easy', "Why can't Linh go out before 7?", ['She has an English class.', 'She has to work.', 'She is at the cinema.', 'She is at the market.'], "'I have an English class until 7.'"],
            ['detail', 'easy', 'What time are they going to meet?', ['At 7:30 p.m.', 'At 4:15 p.m.', 'At 7:00 p.m.', 'At 4:30 p.m.'], "'Let's meet at 7:30, then.'"],
            ['detail', 'easy', 'Where are they going to meet?', ['In front of the cinema', 'At the night market', "At Linh's English class", "At Mai's house"], "'In front of the cinema on Hoa Binh Street.'"],
            ['inference', 'medium', 'Where will they probably go after they meet?', ['To the night market', 'To an English class', 'To see a movie', "To Linh's house"], "Mai rủ đi chợ đêm; họ chỉ gặp ở rạp phim vì 'It's near the market.'"],
        ],
    },
    {
        id: 'RP05', level: 'A1', genre: 'Description', title: 'Mr. Tam, the bus driver',
        text: `Mr. Tam is a bus driver in Can Tho. He is forty-five years old. He gets up at 4:30 every morning because his first bus leaves at 5:30. He drives bus number 7 from the city center to the university. He drives the same route eight times a day.

Mr. Tam likes his job because he meets a lot of people. Many students know him and say hello every morning. But his job is not easy. The traffic is often heavy, and he sometimes works on weekends.

He finishes work at 3 p.m. Then he picks up his daughter from school.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ["A bus driver's job and his day", 'The traffic in Can Tho', 'How to take a bus to the university', 'Students at a university'], "Bài viết kể về công việc và một ngày của tài xế xe buýt Mr. Tam."],
            ['detail', 'easy', "What time does Mr. Tam's first bus leave?", ['At 5:30 a.m.', 'At 4:30 a.m.', 'At 3:00 p.m.', 'At 7:00 a.m.'], "'...his first bus leaves at 5:30.' (4:30 là giờ ông thức dậy.)"],
            ['detail', 'easy', 'Why does Mr. Tam like his job?', ['He meets a lot of people.', 'He never works on weekends.', 'The traffic is light.', 'He drives many different routes.'], "'Mr. Tam likes his job because he meets a lot of people.'"],
            ['inference', 'medium', 'Which sentence is TRUE?', ['Mr. Tam drives the same route many times a day.', 'Mr. Tam never works on weekends.', 'Mr. Tam drives bus number 5.', 'Mr. Tam finishes work at 5:30.'], "'He drives the same route eight times a day.'"],
            ['vocabulary', 'medium', "In the text, 'the traffic is heavy' means ______.", ['there are a lot of cars and motorbikes on the road', 'the cars are very big', 'the roads are empty', 'the bus is very old'], "'heavy traffic' = giao thông đông đúc, nhiều xe."],
        ],
    },
    {
        id: 'RP06', level: 'A1', genre: 'Advertisement', title: 'Sunshine English Center',
        text: `SUNSHINE ENGLISH CENTER
Learn English with friendly teachers!

- Classes for adults and children
- Small classes: only 12 students in each class
- Speaking practice with native teachers every Friday
- Morning classes: 8:00 – 10:00
- Evening classes: 6:00 – 8:00 p.m. (Monday, Wednesday, Friday)
- Price: 1,500,000 dong per month
- Special offer: Sign up before June 1st and get 10% off!

Address: 25 Nguyen Trai Street. Phone: 0292 3888 999`,
        questions: [
            ['main_idea', 'easy', 'What is the purpose of this text?', ['To advertise an English center', 'To give information about a school trip', 'To find a new English teacher', 'To sell English books'], "Văn bản giới thiệu lớp học, giá, ưu đãi → quảng cáo trung tâm tiếng Anh."],
            ['detail', 'easy', 'How many students are there in one class?', ['12', '10', '8', '20'], "'only 12 students in each class'."],
            ['detail', 'easy', 'When can students practice speaking with native teachers?', ['Every Friday', 'Every morning', 'On Mondays and Wednesdays', 'Before June 1st'], "'Speaking practice with native teachers every Friday'."],
            ['inference', 'medium', 'Hung works from 8 a.m. to 5 p.m. on weekdays. Which classes are best for him?', ['Evening classes', 'Morning classes', "Children's classes", 'Lunchtime classes'], "Hung làm việc 8:00–17:00, trùng với lớp buổi sáng (8:00–10:00) → chỉ học được lớp tối (6:00–8:00 p.m.)."],
            ['inference', 'hard', 'Lan signs up on May 20th. How much does she pay for one month?', ['1,350,000 dong', '1,500,000 dong', '150,000 dong', '1,650,000 dong'], "Đăng ký trước 1/6 được giảm 10%: 1,500,000 − 150,000 = 1,350,000 đồng."],
        ],
    },
    {
        id: 'RP07', level: 'A1', genre: 'Menu', title: 'Green Leaf Café menu',
        text: `GREEN LEAF CAFÉ – MENU

Drinks
Black coffee ............ 20,000 dong
Milk coffee ............. 25,000 dong
Orange juice ............ 30,000 dong
Green tea ............... 15,000 dong

Food
Banh mi with egg ........ 20,000 dong
Banh mi with chicken .... 30,000 dong
Chicken salad ........... 45,000 dong
Fried rice .............. 40,000 dong

Open every day: 6:30 a.m. – 10:00 p.m.
Free Wi-Fi. Students get a free green tea with any food!`,
        questions: [
            ['detail', 'easy', 'Which drink is the cheapest?', ['Green tea', 'Black coffee', 'Milk coffee', 'Orange juice'], "Thực đơn ghi 'Green tea ............... 15,000 dong' – rẻ nhất (các đồ uống khác từ 20,000 đến 30,000 đồng)."],
            ['detail', 'easy', 'How much is a milk coffee?', ['25,000 dong', '20,000 dong', '30,000 dong', '15,000 dong'], "'Milk coffee ... 25,000 dong'."],
            ['inference', 'medium', 'Nam orders a banh mi with chicken and an orange juice. How much does he pay?', ['60,000 dong', '50,000 dong', '55,000 dong', '45,000 dong'], "30,000 (banh mi with chicken) + 30,000 (orange juice) = 60,000 đồng."],
            ['inference', 'medium', 'A student orders fried rice. What does she get for free?', ['A green tea', 'A black coffee', 'A banh mi with egg', 'An orange juice'], "'Students get a free green tea with any food!'"],
            ['detail', 'easy', 'When does the café close?', ['At 10 p.m.', 'At 6:30 a.m.', 'At 10 a.m.', 'It is closed on Sundays.'], "'Open every day: 6:30 a.m. – 10:00 p.m.'"],
        ],
    },
    {
        id: 'RP08', level: 'A1', genre: 'Description', title: "Thao's family",
        text: `My name is Thao. There are five people in my family: my parents, my grandmother, my older brother and me.

My father, Mr. Hai, is an engineer. He works for a big company in Ho Chi Minh City, so he is often away from home. My mother is a nurse at a hospital near our house. My grandmother is seventy years old. She cooks very well, and she makes lunch for us every day.

My brother, Khoa, is twenty-two. He is a computer programmer. He is very tall and funny. I am eighteen and I am a student. In the evening, we often have dinner together and watch TV.`,
        questions: [
            ['detail', 'easy', "How many people are there in Thao's family?", ['Five', 'Four', 'Six', 'Three'], "'There are five people in my family.'"],
            ['detail', 'easy', "What does Thao's mother do?", ['She is a nurse.', 'She is an engineer.', 'She is a cook.', 'She is a teacher.'], "'My mother is a nurse at a hospital near our house.'"],
            ['detail', 'easy', 'Who makes lunch for the family?', ["Thao's grandmother", "Thao's mother", "Thao's father", 'Thao'], "'My grandmother ... makes lunch for us every day.'"],
            ['inference', 'medium', "Why is Thao's father often away from home?", ['He works in another city.', 'He works at a hospital.', 'He is a student.', 'He visits his mother.'], "'He works for a big company in Ho Chi Minh City, so he is often away from home.'"],
            ['vocabulary', 'easy', "In the text, 'funny' means ______.", ['making people laugh', 'very tall', 'very busy', 'making people angry'], "'funny' = vui tính, hài hước (làm người khác cười)."],
        ],
    },
    {
        id: 'RP09', level: 'A1', genre: 'Timetable', title: 'Class EN01 timetable',
        text: `CLASS EN01 – WEEKLY TIMETABLE

Monday: 7:30 – 9:30 Listening & Speaking (Room 201, Ms. Hoa)
Tuesday: 13:00 – 15:00 Grammar (Room 105, Mr. Long)
Wednesday: 7:30 – 9:30 Reading (Room 201, Ms. Hoa)
Thursday: No class
Friday: 9:45 – 11:45 Writing (Room 303, Mr. Long)

Note: Please bring your student card to every class.`,
        questions: [
            ['detail', 'easy', 'Which day has no class?', ['Thursday', 'Tuesday', 'Friday', 'Wednesday'], "'Thursday: No class'."],
            ['detail', 'easy', 'Who teaches Grammar?', ['Mr. Long', 'Ms. Hoa', 'Ms. Lan', 'Mr. Nam'], "'Tuesday: 13:00 – 15:00 Grammar (Room 105, Mr. Long)'."],
            ['detail', 'easy', 'Where is the Writing class?', ['In Room 303', 'In Room 201', 'In Room 105', 'In Room 302'], "'Friday: ... Writing (Room 303, Mr. Long)'."],
            ['inference', 'medium', 'How many classes does Ms. Hoa teach each week?', ['Two', 'One', 'Three', 'Four'], "Ms. Hoa dạy thứ Hai (Listening & Speaking) và thứ Tư (Reading) → 2 buổi."],
            ['inference', 'medium', 'Which class is in the afternoon?', ['Grammar', 'Reading', 'Writing', 'Listening & Speaking'], "Grammar học 13:00 – 15:00 (buổi chiều); các lớp khác học buổi sáng."],
        ],
    },
    {
        id: 'RP10', level: 'A1', genre: 'Article', title: 'Hoi An',
        text: `Hoi An is a small old town in central Vietnam. It is about 30 kilometers from Da Nang. Many tourists visit Hoi An every year.

The town has old yellow houses, small streets and a famous bridge called the Japanese Bridge. In the evening, people put colorful lanterns on the river, and the town looks very beautiful. You can also eat many local dishes, such as cao lau and banh mi.

The best time to visit is from February to April because the weather is not too hot and it does not rain much. Hoi An is very busy in the summer, so hotels are more expensive then.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['A famous town for tourists in Vietnam', 'The history of Da Nang', 'How to cook cao lau', 'The weather in central Vietnam'], "Bài viết giới thiệu Hội An: vị trí, cảnh đẹp, món ăn, thời điểm nên đến."],
            ['detail', 'easy', 'How far is Hoi An from Da Nang?', ['About 30 kilometers', 'About 13 kilometers', 'About 300 kilometers', 'About 3 kilometers'], "'It is about 30 kilometers from Da Nang.'"],
            ['detail', 'easy', 'What can people see on the river in the evening?', ['Colorful lanterns', 'Old yellow houses', 'Fishing boats', 'Food markets'], "'In the evening, people put colorful lanterns on the river.'"],
            ['detail', 'medium', 'Why is February to April a good time to visit Hoi An?', ['It is not too hot and it does not rain much.', 'The hotels are free.', 'There are no tourists.', 'It is very hot and sunny.'], "'...because the weather is not too hot and it does not rain much.'"],
            ['inference', 'medium', 'Which sentence about hotels in Hoi An is TRUE?', ['They cost more in the summer.', 'They are always cheap.', 'They are closed in the summer.', 'They are all in Da Nang.'], "'Hoi An is very busy in the summer, so hotels are more expensive then.'"],
        ],
    },
    // ---------------------------------------------------------------- A2
    {
        id: 'RP11', level: 'A2', genre: 'Email', title: 'A job application',
        text: `Dear Ms. Trang,

I am writing to apply for the part-time sales assistant job at Sun Bookstore. I saw your advertisement on the store's Facebook page last week.

My name is Le Hoang Phuc, and I am a second-year student at Can Tho University. I am studying marketing. Last summer, I worked at a clothes shop for three months, so I have some experience with customers. I am friendly and hard-working, and I can speak English quite well.

I have classes every morning, but I am free in the afternoons from Monday to Friday and all day on weekends.

I have attached my CV. I look forward to hearing from you.

Yours sincerely,
Le Hoang Phuc`,
        questions: [
            ['main_idea', 'easy', 'Why did Phuc write this email?', ['To apply for a job', 'To buy some books', 'To complain about a bookstore', 'To ask about a marketing course'], "'I am writing to apply for the part-time sales assistant job...'"],
            ['detail', 'easy', 'How did Phuc find out about the job?', ["On the store's Facebook page", 'From a friend', 'In a newspaper', 'At Can Tho University'], "'I saw your advertisement on the store's Facebook page last week.'"],
            ['detail', 'medium', 'What work experience does Phuc have?', ['He worked at a clothes shop.', 'He worked at a bookstore.', 'He taught English.', 'He worked in marketing for three years.'], "'Last summer, I worked at a clothes shop for three months.'"],
            ['inference', 'medium', 'When is Phuc NOT free to work?', ['On weekday mornings', 'On Saturday afternoons', 'On Monday afternoons', 'On Sundays'], "'I have classes every morning, but I am free in the afternoons from Monday to Friday and all day on weekends.'"],
            ['vocabulary', 'medium', "In the email, 'I have attached my CV' means Phuc ______.", ['added his CV as a file to the email', 'wrote his CV by hand', 'sent his CV by post', 'forgot to send his CV'], "'attach' (email) = đính kèm tệp vào thư."],
        ],
    },
    {
        id: 'RP12', level: 'A2', genre: 'Notice', title: 'Green Campus Day',
        text: `GREEN CAMPUS DAY – Saturday, March 15th
Let's make our campus cleaner and greener!

Activities:
- 7:00 – 9:00: Picking up rubbish around the campus
- 9:00 – 10:30: Planting trees near the library
- 10:30 – 11:30: Workshop: "How to Use Less Plastic"

What to bring: a hat, a water bottle and gloves. Please do not bring plastic bags.
All volunteers will get a free T-shirt and lunch.

How to join: Register with the Student Union in Room A102 before March 10th.`,
        questions: [
            ['main_idea', 'easy', 'What is the notice about?', ['An event to clean the campus and plant trees', 'A sale of T-shirts', 'The opening of a new library', 'A cooking workshop'], "Thông báo về 'Green Campus Day': nhặt rác, trồng cây, hội thảo giảm nhựa."],
            ['detail', 'easy', 'What will volunteers do from 9:00 to 10:30?', ['Plant trees', 'Pick up rubbish', 'Go to a workshop', 'Have lunch'], "'9:00 – 10:30: Planting trees near the library'."],
            ['detail', 'easy', 'Which thing should volunteers NOT bring?', ['Plastic bags', 'A hat', 'Gloves', 'A water bottle'], "'Please do not bring plastic bags.'"],
            ['detail', 'easy', 'Where should students go to register?', ['Room A102', 'The library', 'The canteen', 'Room A201'], "'Register with the Student Union in Room A102.'"],
            ['inference', 'medium', 'Why does the notice ask people not to bring plastic bags?', ['Because the event is about protecting the environment', 'Because plastic bags are expensive', 'Because there is no rubbish on campus', 'Because volunteers get free bags'], "Sự kiện nhằm làm khuôn viên 'cleaner and greener' và có hội thảo 'How to Use Less Plastic' → bảo vệ môi trường."],
        ],
    },
    {
        id: 'RP13', level: 'A2', genre: 'Story', title: "Grandma's smartphone",
        text: `Last month, my grandmother turned seventy, and my parents gave her a smartphone. At first, she didn't like it. The screen was too small for her, and she didn't know how to use the apps. She said, "My old phone was better!"

So every evening, I sat with her and taught her one new thing. First, she learned how to make video calls. Then she learned how to take photos and send messages. I also made the letters on the screen bigger.

Now she loves her phone. She video-calls my aunt in Australia every Sunday and sends photos of her garden to our family group. Yesterday, she even sent me a funny sticker!`,
        questions: [
            ['main_idea', 'easy', 'What is the story mainly about?', ['How a grandmother learned to use a smartphone', 'Why old phones are better', 'A trip to Australia', 'How to grow a garden'], "Câu chuyện kể bà từ không thích đến thành thạo và yêu thích điện thoại thông minh."],
            ['detail', 'medium', "Why didn't the grandmother like the smartphone at first?", ['The screen was too small and the apps were difficult for her.', 'It was too expensive.', "It couldn't take photos.", "Her family didn't like it."], "'The screen was too small for her, and she didn't know how to use the apps.'"],
            ['detail', 'easy', 'What did she learn first?', ['How to make video calls', 'How to send messages', 'How to take photos', 'How to send stickers'], "'First, she learned how to make video calls.'"],
            ['detail', 'easy', 'Who does the grandmother video-call every Sunday?', ["The writer's aunt", "The writer's parents", 'Her friends', 'The writer'], "'She video-calls my aunt in Australia every Sunday.'"],
            ['inference', 'medium', 'How does the writer probably feel about the grandmother now?', ['Happy and proud', 'Angry', 'Bored', 'Worried'], "Bà giờ dùng điện thoại thành thạo, còn gửi sticker vui cho người viết → người viết vui và tự hào."],
        ],
    },
    {
        id: 'RP14', level: 'A2', genre: 'Story', title: 'A trip to Ha Giang',
        text: `Last October, my friends and I went on a four-day motorbike trip in Ha Giang, in the north of Vietnam. We flew from Can Tho to Hanoi and then took an overnight bus to Ha Giang city. There, we rented motorbikes and hired a local guide named Sung.

The roads were narrow and there were many mountains, so we drove slowly. The views were amazing, especially at Ma Pi Leng Pass. At night, we stayed in homestays and ate dinner with local families. On the third day, it rained heavily and we couldn't drive, so we stayed in the village and learned how to weave cloth from the local women.

It was a tiring trip, but it was the best trip of my life. I want to go back next year.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['A memorable motorbike trip in Ha Giang', 'How to rent a motorbike in Hanoi', 'The weather in the north of Vietnam', 'A job as a tour guide'], "Người viết kể về chuyến đi xe máy 4 ngày ở Hà Giang – 'the best trip of my life'."],
            ['detail', 'easy', 'How did they travel from Hanoi to Ha Giang city?', ['By overnight bus', 'By plane', 'By motorbike', 'By train'], "'...then took an overnight bus to Ha Giang city.'"],
            ['detail', 'medium', 'Why did they drive slowly?', ['The roads were narrow and there were many mountains.', 'Their motorbikes were old.', 'It rained every day.', 'They wanted to save petrol.'], "'The roads were narrow and there were many mountains, so we drove slowly.'"],
            ['detail', 'medium', 'What did they do on the rainy day?', ['They learned how to weave cloth.', 'They drove to Ma Pi Leng Pass.', 'They took a bus back to Hanoi.', 'They stayed in a hotel in Ha Giang city.'], "'...we stayed in the village and learned how to weave cloth from the local women.'"],
            ['inference', 'medium', 'How did the writer feel about the trip?', ['It was tiring but wonderful.', 'It was boring and too long.', 'It was easy and relaxing.', 'It was too dangerous to enjoy.'], "'It was a tiring trip, but it was the best trip of my life.'"],
        ],
    },
    {
        id: 'RP15', level: 'A2', genre: 'Email', title: 'Email to a teacher',
        text: `Dear Ms. Thu,

I am sorry, but I cannot come to class tomorrow, Thursday. I have a high fever, and the doctor told me to stay at home for two days.

Could you please tell me what homework we have? I don't want to fall behind. Also, I know we have a speaking test next Monday. Is it still on Monday? I will be ready for it.

My classmate, Vinh, will hand in my essay for me tomorrow morning.

Thank you for your understanding.

Best regards,
Tran Minh Khanh
Class EN02`,
        questions: [
            ['main_idea', 'easy', 'Why is Khanh writing to Ms. Thu?', ['To tell her that he will miss class', 'To ask for a new essay topic', 'To invite her to a party', 'To complain about the homework'], "'I am sorry, but I cannot come to class tomorrow.'"],
            ['detail', 'easy', 'What is wrong with Khanh?', ['He has a high fever.', 'He has a toothache.', 'He broke his leg.', 'He lost his essay.'], "'I have a high fever.'"],
            ['detail', 'medium', 'What does Khanh ask Ms. Thu about?', ['The homework and the date of the speaking test', 'The address of a doctor', 'A new topic for his essay', "Vinh's test score"], "'Could you please tell me what homework we have?' và 'Is it still on Monday?' (bài thi nói)."],
            ['detail', 'easy', "How will Khanh's essay get to Ms. Thu?", ['Vinh will give it to her.', 'Khanh will email it to her.', 'Khanh will bring it on Monday.', 'The doctor will send it.'], "'My classmate, Vinh, will hand in my essay for me tomorrow morning.'"],
            ['vocabulary', 'medium', "In the email, 'fall behind' means ______.", ['not keep up with the rest of the class', 'fall down', 'sit at the back of the class', 'arrive at class late'], "'fall behind' = bị tụt lại, không theo kịp bài vở."],
        ],
    },
    {
        id: 'RP16', level: 'A2', genre: 'Report', title: 'Student sleep survey',
        text: `STUDENT SLEEP SURVEY

Last month, the Student Union asked 200 students at our college about their sleep. Here are the results:

- 40% of students sleep less than 6 hours a night.
- 45% sleep 6 to 8 hours.
- Only 15% sleep more than 8 hours.
- 70% of students use their phones in bed before sleeping.
- The most common reasons for going to bed late are homework (35%), social media (30%) and part-time jobs (20%).

Doctors say young adults need 7 to 9 hours of sleep a night, so many students at our college do not get enough sleep. The Student Union suggests turning off phones 30 minutes before bedtime.`,
        questions: [
            ['main_idea', 'easy', 'What is the main topic of the text?', ["Students' sleeping habits", 'Part-time jobs for students', 'How to use social media', 'Homework at college'], "Báo cáo khảo sát về giấc ngủ của sinh viên."],
            ['detail', 'easy', 'How many students answered the survey?', ['200', '40', '70', '2,000'], "'...asked 200 students at our college about their sleep.'"],
            ['detail', 'easy', 'What is the most common reason for going to bed late?', ['Homework', 'Social media', 'Part-time jobs', 'Watching movies'], "'The most common reasons for going to bed late are homework (35%)' – bài tập về nhà có tỉ lệ cao nhất."],
            ['detail', 'medium', 'What percentage of students sleep more than 8 hours?', ['15%', '40%', '45%', '70%'], "'Only 15% sleep more than 8 hours.'"],
            ['inference', 'medium', 'What does the Student Union suggest?', ['Stop using phones 30 minutes before sleeping', 'Do less homework', 'Sleep less than 6 hours', 'Get a part-time job'], "'The Student Union suggests turning off phones 30 minutes before bedtime.'"],
        ],
    },
    {
        id: 'RP17', level: 'A2', genre: 'Advertisement', title: 'Room for rent',
        text: `ROOM FOR RENT

A large room in a quiet house on 30/4 Street, Ninh Kieu District.

- A 10-minute walk to Can Tho University
- 25 m², with a private bathroom and a balcony
- Air conditioner, bed and desk included
- Free Wi-Fi; electricity and water are not included
- Rent: 2,500,000 dong per month. Pay 2 months in advance.
- Only for female students. No pets. No smoking.

Contact Mrs. Nga: 0939 456 789 (please call after 5 p.m.)`,
        questions: [
            ['main_idea', 'easy', 'Who is this advertisement for?', ['Female students who are looking for a room', 'People who want to buy a house', 'Male students with pets', 'Tourists visiting Can Tho'], "'Only for female students.' – quảng cáo cho thuê phòng."],
            ['detail', 'medium', 'Which of these is NOT included in the rent?', ['Electricity', 'Wi-Fi', 'A bed', 'An air conditioner'], "'Free Wi-Fi; electricity and water are not included.'"],
            ['inference', 'hard', 'How much must a new renter pay at the beginning?', ['5,000,000 dong', '2,500,000 dong', '250,000 dong', '7,500,000 dong'], "'Pay 2 months in advance' → 2 × 2,500,000 = 5,000,000 đồng."],
            ['inference', 'medium', 'Who CANNOT rent this room?', ['A female student with a cat', 'A female student from Can Tho University', "A female student who doesn't smoke", 'A female student without a motorbike'], "'No pets.' → người có mèo không được thuê."],
            ['detail', 'easy', 'When should you call Mrs. Nga?', ['After 5 p.m.', 'Before 5 p.m.', 'Early in the morning', 'At any time'], "'please call after 5 p.m.'"],
        ],
    },
    {
        id: 'RP18', level: 'A2', genre: 'Story', title: "Tuan's first job interview",
        text: `Last Tuesday, I had my first job interview. It was for a receptionist job at a hotel. I was very nervous, so I prepared carefully. The night before, I read about the hotel on its website and practiced answering questions with my sister.

On the day of the interview, I wore a white shirt and black trousers, and I arrived fifteen minutes early. The manager, Ms. Lien, asked me about my studies, my English and my experience. I couldn't answer one question about computer software, but I was honest and said I could learn quickly.

Yesterday, Ms. Lien called me. I got the job! I start next Monday.`,
        questions: [
            ['main_idea', 'easy', 'What is the story about?', ["Tuan's first job interview", 'Working at a computer company', 'A holiday at a hotel', "Tuan's sister's new job"], "Tuan kể về buổi phỏng vấn xin việc đầu tiên của mình."],
            ['detail', 'medium', 'How did Tuan prepare for the interview?', ['He read about the hotel and practiced with his sister.', 'He bought a new suit.', 'He visited the hotel.', 'He called Ms. Lien.'], "'...I read about the hotel on its website and practiced answering questions with my sister.'"],
            ['detail', 'easy', 'When did Tuan arrive at the interview?', ['Fifteen minutes early', 'Fifteen minutes late', 'Exactly on time', 'One hour early'], "'...I arrived fifteen minutes early.'"],
            ['detail', 'medium', 'Which question was difficult for Tuan?', ['A question about computer software', 'A question about his English', 'A question about his studies', 'A question about his family'], "'I couldn't answer one question about computer software.'"],
            ['inference', 'hard', "What can we learn from Tuan's story?", ['Preparing well and being honest can help you in an interview.', 'You should never answer difficult questions.', 'Arriving late is not a problem.', 'You need many years of experience to get a job.'], "Tuan chuẩn bị kỹ, trung thực khi không trả lời được và vẫn được nhận → chuẩn bị tốt và trung thực rất có ích."],
        ],
    },
    {
        id: 'RP19', level: 'A2', genre: 'Timetable', title: 'Bus timetable: Can Tho – Ho Chi Minh City',
        text: `MEKONG EXPRESS – CAN THO TO HO CHI MINH CITY

Leaves Can Tho | Arrives in Ho Chi Minh City | Ticket price
05:00 | 08:30 | 165,000 dong
08:00 | 11:30 | 165,000 dong
12:30 | 16:00 | 165,000 dong
18:00 | 21:30 | 165,000 dong
23:00 | 02:30 | 190,000 dong (sleeper bus)

- Students with a student card get 10% off (not on the sleeper bus).
- Free water and Wi-Fi on all buses.
- Please arrive at the station 20 minutes before your bus leaves.`,
        questions: [
            ['detail', 'easy', 'How long does the trip take?', ['3 hours and 30 minutes', '3 hours', '4 hours', '2 hours and 30 minutes'], "Ví dụ dòng '05:00 | 08:30': đi lúc 05:00, đến lúc 08:30 → 3 tiếng 30 phút (các chuyến khác cũng vậy)."],
            ['inference', 'medium', 'Lan must be in Ho Chi Minh City before 12 p.m. Which is the latest bus she can take?', ['The 08:00 bus', 'The 05:00 bus', 'The 12:30 bus', 'The 18:00 bus'], "Chuyến 08:00 đến lúc 11:30 (trước 12 giờ trưa). Chuyến 12:30 đến lúc 16:00 – quá muộn."],
            ['inference', 'hard', 'Minh is a student with a student card. He takes the 12:30 bus. How much does he pay?', ['148,500 dong', '165,000 dong', '190,000 dong', '171,000 dong'], "Sinh viên giảm 10%: 165,000 − 16,500 = 148,500 đồng."],
            ['detail', 'easy', 'Which bus is more expensive than the others?', ['The 23:00 bus', 'The 05:00 bus', 'The 18:00 bus', 'The 12:30 bus'], "Chuyến 23:00 có giá '190,000 dong (sleeper bus)' (xe giường nằm); các chuyến khác 165,000 đồng."],
            ['inference', 'medium', "Huy's bus leaves at 18:00. What time should he arrive at the station?", ['At 17:40', 'At 18:00', 'At 18:20', 'At 17:00'], "'Please arrive at the station 20 minutes before your bus leaves.' → 18:00 − 20 phút = 17:40."],
        ],
    },
    {
        id: 'RP20', level: 'A2', genre: 'Article', title: 'How Long improved his English',
        text: `Hoang Long is a 21-year-old IT student. Two years ago, his English was very weak. He could read a little, but he couldn't speak at all. He wanted to work for an international company, so he decided to change.

First, he watched English videos about technology every day with English subtitles. Then he joined an English speaking club at his university. At the beginning, he was shy and only listened. After a few months, he started to talk more. He also practiced with a free app for 15 minutes before bed.

Now Long can have simple conversations in English, and last month he gave a short presentation in English in front of 50 people. His advice is: "Practice a little every day, and don't be afraid of making mistakes."`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['How Long improved his English', 'How to become an IT student', 'An international company', 'A free English app'], "Bài viết kể quá trình Long cải thiện tiếng Anh từ yếu đến giao tiếp được."],
            ['detail', 'easy', 'Why did Long want to improve his English?', ['He wanted to work for an international company.', 'He wanted to study abroad.', 'He wanted to teach English.', 'His teacher told him to.'], "'He wanted to work for an international company, so he decided to change.'"],
            ['detail', 'medium', 'What did Long do at the speaking club at the beginning?', ['He only listened.', 'He gave presentations.', 'He taught other students.', 'He watched videos.'], "'At the beginning, he was shy and only listened.'"],
            ['vocabulary', 'medium', "The word 'shy' in the text is closest in meaning to ______.", ['nervous about talking to people', 'very tired', 'very confident', 'angry'], "'shy' = nhút nhát, ngại nói chuyện với người khác."],
            ['inference', 'hard', 'Which advice would Long most likely give a friend?', ['Speak English even if you make mistakes.', 'Only study grammar from books.', 'Wait until your English is perfect before you speak.', 'Study for many hours once a week.'], "Lời khuyên của Long: 'Practice a little every day, and don't be afraid of making mistakes.'"],
        ],
    },
    // ---------------------------------------------------------------- A1-A2
    {
        id: 'RP21', level: 'A1-A2', genre: 'Message', title: "Vy's housewarming party",
        text: `Hi everyone!

I've finally moved into my new apartment! I'm having a small housewarming party on Saturday, November 8th, from 6 p.m. to 10 p.m. My new address is Apartment 1205, Block B, Sky Garden Building, 15 Ly Tu Trong Street.

I'm going to make Vietnamese spring rolls and hot pot, so please don't bring any food – but drinks are welcome!

There is free parking for motorbikes in the basement. Please take the lift to the 12th floor.

Can you let me know by Wednesday if you can come?

Love,
Vy`,
        questions: [
            ['main_idea', 'easy', 'Why did Vy write this message?', ['To invite friends to a party at her new home', 'To ask friends to help her move', 'To sell her old apartment', 'To ask for a recipe'], "'I'm having a small housewarming party on Saturday...' → mời bạn bè đến dự tiệc tân gia."],
            ['detail', 'easy', 'What is Vy going to cook?', ['Spring rolls and hot pot', 'Pizza and cake', 'Only hot pot', 'Nothing – the guests will bring food'], "'I'm going to make Vietnamese spring rolls and hot pot.'"],
            ['detail', 'medium', 'What does Vy say the guests CAN bring?', ['Drinks', 'Food', 'Spring rolls', 'Hot pot'], "'...please don't bring any food – but drinks are welcome!'"],
            ['detail', 'easy', "Which floor is Vy's apartment on?", ['The 12th floor', 'The 5th floor', 'The 15th floor', 'The 2nd floor'], "'Please take the lift to the 12th floor.'"],
            ['detail', 'medium', 'What does Vy want her friends to do by Wednesday?', ['Tell her if they can come', 'Come to the party', 'Buy drinks for her', 'Help her clean the apartment'], "'Can you let me know by Wednesday if you can come?'"],
        ],
    },
    {
        id: 'RP22', level: 'A1-A2', genre: 'Notice', title: 'Swimming pool rules',
        text: `BLUE WAVE SWIMMING POOL – RULES

Opening hours: 6:00 a.m. – 8:00 p.m. every day
(Closed for cleaning on Monday mornings until 11:00 a.m.)

1. Take a shower before you swim.
2. Wear a swimming cap.
3. Children under 10 must swim with an adult.
4. No running near the pool.
5. No food or glass bottles in the pool area.
6. Do not swim if you feel sick.

Tickets: Adults 40,000 dong; children under 12: 20,000 dong`,
        questions: [
            ['detail', 'easy', 'What must swimmers do before they swim?', ['Take a shower', 'Eat something', 'Buy a glass bottle', 'Run around the pool'], "'Take a shower before you swim.'"],
            ['inference', 'medium', 'When can you NOT swim at this pool?', ['At 9 a.m. on Monday', 'At 9 a.m. on Tuesday', 'At 7 p.m. on Monday', 'At 6 a.m. on Sunday'], "Hồ bơi đóng cửa để vệ sinh sáng thứ Hai đến 11:00 → 9 giờ sáng thứ Hai không bơi được."],
            ['inference', 'medium', 'An 8-year-old girl wants to swim. What must she do?', ['Swim with an adult', 'Swim alone', 'Pay 40,000 dong', 'Wear sunglasses'], "'Children under 10 must swim with an adult.' – bé 8 tuổi phải bơi cùng người lớn."],
            ['inference', 'hard', 'A father buys tickets for himself and his 11-year-old son. How much does he pay?', ['60,000 dong', '80,000 dong', '40,000 dong', '20,000 dong'], "Người lớn 40,000 + trẻ dưới 12 tuổi 20,000 = 60,000 đồng."],
            ['inference', 'medium', "Why does the pool have the rule 'No running near the pool'?", ['People can slip and fall.', 'Running is too noisy.', 'The pool is closed on Mondays.', 'Children must swim with adults.'], "Khu vực quanh hồ bơi trơn, chạy dễ bị trượt ngã → quy định vì an toàn."],
        ],
    },
    {
        id: 'RP23', level: 'A1-A2', genre: 'Article', title: 'Tet in Vietnam',
        text: `Tet, or Lunar New Year, is the most important holiday in Vietnam. It usually happens in late January or February.

Before Tet, people clean and decorate their houses with peach blossoms in the north or yellow apricot blossoms in the south. They also buy new clothes and cook special food such as banh chung or banh tet.

During Tet, families get together. Children wear new clothes and wish their grandparents good health. Then adults give them lucky money in red envelopes. People also visit relatives, friends and temples.

Many people who work in big cities travel back to their hometowns for Tet, so buses and trains are very crowded at this time.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['The Vietnamese Lunar New Year', 'Flowers in Vietnam', 'Traveling by bus', 'How to make banh chung'], "Bài viết giới thiệu Tết Nguyên đán: thời gian, chuẩn bị, hoạt động trong Tết."],
            ['detail', 'easy', 'Which flowers do people in the south usually use to decorate their houses?', ['Yellow apricot blossoms', 'Peach blossoms', 'Red roses', 'White lilies'], "'...peach blossoms in the north or yellow apricot blossoms in the south.'"],
            ['detail', 'easy', 'What do children get from adults during Tet?', ['Lucky money in red envelopes', 'New houses', 'Peach blossoms', 'Train tickets'], "'...adults give them lucky money in red envelopes.'"],
            ['inference', 'medium', 'Why are buses and trains crowded before Tet?', ['Many people go back to their hometowns.', 'People go to work in big cities.', 'Tickets are free at Tet.', 'Children go back to school.'], "'Many people who work in big cities travel back to their hometowns for Tet, so buses and trains are very crowded.'"],
            ['vocabulary', 'medium', "The word 'relatives' in the text means ______.", ['members of your family', 'people you work with', 'famous temples', 'special kinds of food'], "'relatives' = họ hàng, người thân trong gia đình."],
        ],
    },
    {
        id: 'RP24', level: 'A1-A2', genre: 'Group messages', title: 'Class EN03 group chat',
        text: `Ms. Hoa (7:05 a.m.): Good morning, class EN03. Today's class is in Room 405, not Room 204. The projector in Room 204 is broken.
Ms. Hoa (7:06 a.m.): We will start at 9:30 instead of 9:00 because I have a meeting.
Bao (7:15 a.m.): Thank you, Ms. Hoa. Do we need to bring the textbook today?
Ms. Hoa (7:20 a.m.): Yes, please. We will do the exercises on page 45. Also, don't forget to hand in your writing homework.
Ngan (7:32 a.m.): Ms. Hoa, I am sick today. Can I send my homework by email?
Ms. Hoa (7:40 a.m.): Sure, Ngan. Get well soon!`,
        questions: [
            ['detail', 'easy', 'Why is the class in Room 405 today?', ['The projector in Room 204 is broken.', 'Room 405 is bigger.', 'Ms. Hoa is sick.', 'Room 204 is closed for cleaning.'], "'The projector in Room 204 is broken.'"],
            ['detail', 'easy', 'What time will the class start today?', ['At 9:30', 'At 9:00', 'At 7:05', 'At 7:30'], "'We will start at 9:30 instead of 9:00.'"],
            ['detail', 'easy', 'Which page will the students work on?', ['Page 45', 'Page 405', 'Page 204', 'Page 54'], "'We will do the exercises on page 45.'"],
            ['inference', 'medium', 'How will Ngan give her homework to Ms. Hoa?', ['By email', 'In class', 'Bao will bring it', 'By post'], "Ngan hỏi 'Can I send my homework by email?' và cô Hoa đồng ý 'Sure, Ngan.'"],
            ['detail', 'medium', 'Why will the class start late?', ['Ms. Hoa has a meeting.', 'The projector is broken.', 'Ngan is sick.', 'The students need their textbooks.'], "'...instead of 9:00 because I have a meeting.' (Máy chiếu hỏng là lý do đổi phòng, không phải lý do bắt đầu muộn.)"],
        ],
    },
    {
        id: 'RP25', level: 'A1-A2', genre: 'Interview', title: 'An interview with a chef',
        text: `Interviewer: Chef Minh, how did you become a chef?
Chef Minh: When I was a child, I often helped my mother in her small restaurant. I loved watching her cook. After high school, I studied at a cooking school in Ho Chi Minh City for two years.
Interviewer: What is a normal day like for you?
Chef Minh: I go to the market at 5 a.m. to buy fresh fish and vegetables. Then I prepare the food with my team. The restaurant opens at 11, and we finish at about 10 p.m. It's a long day!
Interviewer: What's your favorite dish to cook?
Chef Minh: Canh chua – sour fish soup. It's simple, but it reminds me of my mother.
Interviewer: Do you have any advice for young people who want to be chefs?
Chef Minh: Be patient and work hard. And always use fresh ingredients.`,
        questions: [
            ['detail', 'easy', 'Where did Chef Minh first learn about cooking?', ["In his mother's restaurant", 'At a cooking school', 'At a market', 'In a hotel'], "'When I was a child, I often helped my mother in her small restaurant.'"],
            ['detail', 'easy', 'How long did he study at the cooking school?', ['Two years', 'Five years', 'One year', 'Ten years'], "'...I studied at a cooking school ... for two years.'"],
            ['detail', 'easy', 'Why does Chef Minh go to the market at 5 a.m.?', ['To buy fresh fish and vegetables', 'To open his restaurant', 'To meet his mother', 'To teach a cooking class'], "'I go to the market at 5 a.m. to buy fresh fish and vegetables.'"],
            ['inference', 'medium', 'Why is canh chua his favorite dish?', ['It makes him think of his mother.', 'It is very difficult to cook.', 'It is the most expensive dish.', 'Customers order it every day.'], "'It's simple, but it reminds me of my mother.'"],
            ['vocabulary', 'hard', "In the interview, the word 'patient' means ______.", ['able to wait calmly without getting angry', 'a sick person in a hospital', 'very fast', 'very famous'], "Trong câu 'Be patient and work hard', 'patient' là tính từ = kiên nhẫn (không phải danh từ 'bệnh nhân')."],
        ],
    },
    {
        id: 'RP26', level: 'A1-A2', genre: 'Diary', title: 'A Saturday diary',
        text: `Saturday, May 10th

Today was a busy but fun day. In the morning, I got up late, at 9 o'clock. After breakfast, I cleaned my room and washed my clothes. At 11, my best friend, Ha, came to my house, and we cooked lunch together. We made fried noodles, but we put too much salt in them!

In the afternoon, we went to the bookstore. Ha bought a novel, and I bought a dictionary for my English class. Then it started to rain, so we stayed in a café for two hours and talked.

In the evening, I watched a movie with my family. Now I'm tired, but I'm happy. Tomorrow I have to do my homework.`,
        questions: [
            ['detail', 'easy', 'What time did the writer get up?', ["At 9 o'clock", "At 11 o'clock", "At 7 o'clock", "At 10 o'clock"], "'I got up late, at 9 o'clock.'"],
            ['detail', 'easy', 'What was the problem with the fried noodles?', ['They were too salty.', 'They were too spicy.', 'They were cold.', 'They were too sweet.'], "'...we put too much salt in them!' → quá mặn."],
            ['detail', 'easy', 'What did the writer buy at the bookstore?', ['A dictionary', 'A novel', 'A notebook', 'A DVD'], "'Ha bought a novel, and I bought a dictionary.'"],
            ['inference', 'medium', 'Why did they stay in a café for two hours?', ['Because it was raining', 'Because the café was free', 'Because Ha was tired', 'Because they wanted to read the novel'], "'Then it started to rain, so we stayed in a café for two hours.'"],
            ['detail', 'easy', 'What does the writer have to do tomorrow?', ['Do homework', 'Go to the bookstore', 'Cook with Ha', 'Clean the room'], "'Tomorrow I have to do my homework.'"],
        ],
    },
    {
        id: 'RP27', level: 'A1-A2', genre: 'Notice', title: 'Lost backpack',
        text: `LOST: BLACK BACKPACK

I lost my backpack on Wednesday afternoon, October 8th, in the canteen of Building C.

It is a black backpack with a small red star on the front. Inside, there is a silver laptop, two English textbooks, a blue water bottle and my student card (name: Pham Gia Bao).

The laptop is very important to me because all my thesis work is on it.

If you find it, please call or text me at 0901 222 333, or bring it to the Student Office in Room C105.

Reward: 500,000 dong. Thank you!`,
        questions: [
            ['main_idea', 'easy', 'Why did Bao write this notice?', ['He wants to find his lost backpack.', 'He wants to sell his laptop.', 'He found a backpack.', 'He wants to buy a new backpack.'], "Tiêu đề 'LOST: BLACK BACKPACK' → Bảo tìm lại balo bị mất."],
            ['detail', 'easy', 'Where did Bao lose his backpack?', ['In the canteen of Building C', 'In Room C105', 'In the library', 'On the bus'], "'...in the canteen of Building C.' (Phòng C105 là nơi gửi trả đồ.)"],
            ['detail', 'easy', 'What does the backpack look like?', ['It is black with a small red star.', 'It is red with a small black star.', 'It is blue with a silver star.', 'It is silver with a blue star.'], "'It is a black backpack with a small red star on the front.'"],
            ['inference', 'medium', 'Why is the laptop so important to Bao?', ['His thesis work is on it.', 'It is brand new.', 'It was a birthday gift.', 'He needs it for his part-time job.'], "'The laptop is very important to me because all my thesis work is on it.'"],
            ['vocabulary', 'medium', "In the notice, the word 'reward' means ______.", ['money you get for helping someone', 'something you lost', 'a student card', 'a kind of bag'], "'reward' = tiền thưởng (cho người tìm thấy và trả lại đồ)."],
        ],
    },
    {
        id: 'RP28', level: 'A1-A2', genre: 'Personal essay', title: 'Ca Mau and Ho Chi Minh City',
        text: `I'm Duy. I grew up in Ca Mau, a small city in the far south of Vietnam, but now I study in Ho Chi Minh City. The two places are very different.

Ho Chi Minh City is much bigger and busier than Ca Mau. There are more shopping malls, more restaurants and more jobs. However, the traffic is worse and the air is more polluted. Life there is also more expensive: my small room costs three times more than a big room in Ca Mau.

Ca Mau is quieter and greener. People there are very friendly, and the seafood is the freshest I have ever eaten.

I like the big city because there are more opportunities, but after I graduate, I want to go back to Ca Mau and open a small business.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ['The differences between two places where Duy has lived', 'How to open a small business', 'Shopping malls in Ho Chi Minh City', 'Seafood in Ca Mau'], "'The two places are very different.' – Duy so sánh Cà Mau và TP.HCM."],
            ['detail', 'medium', 'According to Duy, which sentence about Ho Chi Minh City is TRUE?', ['The air is more polluted than in Ca Mau.', 'It is quieter than Ca Mau.', 'It has fewer jobs than Ca Mau.', 'Rooms there are cheaper than in Ca Mau.'], "'However, the traffic is worse and the air is more polluted.'"],
            ['detail', 'easy', 'What does Duy say about the seafood in Ca Mau?', ['It is the freshest he has ever eaten.', 'It is very expensive.', 'It is not very fresh.', 'It is the same as in Ho Chi Minh City.'], "'...the seafood is the freshest I have ever eaten.'"],
            ['inference', 'medium', "What is Duy's plan for the future?", ['To go back to Ca Mau and start a business', 'To stay in Ho Chi Minh City forever', 'To work in a shopping mall', 'To study in another country'], "'...after I graduate, I want to go back to Ca Mau and open a small business.'"],
            ['vocabulary', 'hard', "The word 'opportunities' in the text is closest in meaning to ______.", ['chances to do good things', 'problems', 'shopping malls', 'friends'], "'opportunities' = cơ hội (việc làm, học tập...)."],
        ],
    },
    {
        id: 'RP29', level: 'A1-A2', genre: 'Email', title: 'Order confirmation',
        text: `From: TechZone Online Store
To: Nguyen Thi Hong
Subject: Your order #TZ5821

Dear Ms. Hong,

Thank you for shopping with TechZone! We have received your order:
- 1 wireless mouse – 250,000 dong
- 1 laptop bag – 400,000 dong
Delivery: free
Total: 650,000 dong (pay on delivery)

Your order will arrive in 2–3 working days. Our delivery person will call you before arriving. If you are not happy with a product, you can return it within 7 days.

Best wishes,
TechZone Customer Service`,
        questions: [
            ['main_idea', 'easy', 'What is the purpose of this email?', ["To confirm a customer's order", 'To advertise new laptops', 'To ask a customer to return a product', 'To offer a job at TechZone'], "'We have received your order' → email xác nhận đơn hàng."],
            ['detail', 'easy', 'How much does the laptop bag cost?', ['400,000 dong', '250,000 dong', '650,000 dong', '150,000 dong'], "'1 laptop bag – 400,000 dong'."],
            ['inference', 'medium', 'When will Ms. Hong pay for her order?', ['When the products arrive', 'Before the products are sent', 'After 7 days', 'She does not need to pay.'], "'pay on delivery' = thanh toán khi nhận hàng."],
            ['detail', 'easy', 'What will the delivery person do before arriving?', ['Call Ms. Hong', 'Send her an email', 'Return the products', 'Open the laptop bag'], "'Our delivery person will call you before arriving.'"],
            ['inference', 'hard', 'Ms. Hong ordered on Monday. When will she probably get her order?', ['On Wednesday or Thursday', 'On Monday', 'Next Monday', 'In 7 days'], "'2–3 working days' tính từ thứ Hai → thứ Tư hoặc thứ Năm."],
        ],
    },
    {
        id: 'RP30', level: 'A1-A2', genre: 'Article', title: 'Quynh, the hospital volunteer',
        text: `Every Sunday morning, Quynh, a 20-year-old nursing student, volunteers at a children's hospital in Can Tho. She started two years ago because her little brother stayed in this hospital for a month when he was sick. She remembers that he was often bored and sad.

At the hospital, Quynh and the other volunteers read stories, draw pictures and play games with the children. Sometimes they sing songs together. The children call her "Sister Quynh".

Volunteering is not always easy. Some children are very sick, and Quynh feels sad. But she says the children's smiles make her happy. She also thinks the experience will help her become a better nurse in the future.`,
        questions: [
            ['main_idea', 'easy', 'What is the text mainly about?', ["A student who volunteers at a children's hospital", 'A sick boy in a hospital', 'How to become a nurse', 'Games for children'], "Bài viết kể về Quỳnh – sinh viên điều dưỡng làm tình nguyện ở bệnh viện nhi."],
            ['detail', 'easy', 'When does Quynh volunteer?', ['Every Sunday morning', 'Every evening', 'Once a month', 'On Saturday afternoons'], "'Every Sunday morning, Quynh ... volunteers at a children's hospital.'"],
            ['inference', 'medium', 'Why did Quynh start volunteering?', ['Her brother was bored and sad when he was in this hospital.', 'Her teacher asked her to.', 'She wanted to earn some money.', 'She was sick for a month.'], "'...because her little brother stayed in this hospital ... he was often bored and sad.'"],
            ['detail', 'easy', 'What do the volunteers do at the hospital?', ['They read stories and play games with the children.', 'They give the children medicine.', 'They clean the hospital rooms.', 'They teach the children English.'], "'...read stories, draw pictures and play games with the children.'"],
            ['inference', 'medium', 'How does volunteering help Quynh with her future?', ['It will help her become a better nurse.', 'It will help her find a job at a school.', 'It will help her earn more money.', 'It will help her become an artist.'], "'...the experience will help her become a better nurse in the future.'"],
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
