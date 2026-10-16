'use strict';

const { BLANK, mc, U, X, findError } = require('../lib/builders');

const items = [];
const harder = difficulty => difficulty === 'easy' ? 'medium' : difficulty;
const err = (category, level, difficulty, tags, segs, explanation) =>
    items.push({ skill: 'completion_error', category, level, difficulty: harder(difficulty), tags: ['error', ...tags], ...findError({ segs, explanation }) });
const fill = (category, level, difficulty, tags, question, [correct, ...distractors], explanation) =>
    items.push({ skill: 'completion_error', category, level, difficulty: harder(difficulty), tags: ['completion', ...tags], ...mc({ question, correct, distractors, explanation }) });

// ---------------------------------------------------------------- Tìm lỗi sai
// Verb BE
err('Verb BE', 'A1', 'easy', ['be'],
    ['My sister, together with her two friends,', X('is', 'are'), U('responsible'), U('for'), 'the book club', U('this term'), '.'],
    "Sai ở ({L}) 'are'. Chủ ngữ chính là 'My sister' (số ít); cụm 'together with...' không làm chủ ngữ thành số nhiều → 'is'.");
err('Verb BE', 'A1', 'easy', ['be', 'there-be'],
    ['There', X('is', 'are'), U('a notebook and two pens'), U('on'), 'the teacher’s desk', U('near the window'), '.'],
    "Sai ở ({L}) 'are'. Trong cấu trúc 'There be', động từ thường hòa hợp với danh từ gần nhất; 'a notebook' số ít → 'There is'.");
err('Verb BE', 'A1', 'easy', ['be'],
    ['I', U('am'), 'from Can Tho, and my friends', X('are', 'is'), U('from'), 'Vinh Long. We', U('are'), 'classmates.'],
    "Sai ở ({L}) 'is'. Chủ ngữ 'my friends' số nhiều → 'are'.");
err('Verb BE', 'A1', 'medium', ['be', 'question'],
    [X('Are', 'Is'), 'your brothers', U('good'), U('at'), 'English', U('or'), 'math?'],
    "Sai ở ({L}) 'Is'. Chủ ngữ 'your brothers' số nhiều → câu hỏi bắt đầu bằng 'Are'.");

// Pronouns & Possessives
err('Pronouns & Possessives', 'A1', 'medium', ['pronoun'],
    [U('My'), 'sister and', X('I', 'me'), U('go'), 'to school', U('together'), 'every day.'],
    "Sai ở ({L}) 'me'. Ở vị trí chủ ngữ (trước động từ 'go') phải dùng đại từ chủ ngữ: 'My sister and I'.");
err('Pronouns & Possessives', 'A1', 'medium', ['possessive'],
    [U('Excuse me'), ',', U('is'), 'this pen', X('yours', 'your'), 'or', U("Lan's"), '?'],
    "Sai ở ({L}) 'your'. Không có danh từ theo sau → dùng đại từ sở hữu 'yours' (= your pen).");
err('Pronouns & Possessives', 'A1', 'medium', ['possessive'],
    ['The cat is eating', X('its', "it's"), 'food', U('in'), U('the'), 'kitchen', U('now'), '.'],
    "Sai ở ({L}) 'it's'. 'it's' = it is. Trước danh từ 'food' cần tính từ sở hữu 'its'.");
err('Pronouns & Possessives', 'A1', 'easy', ['object-pronoun'],
    ['Can you', U('tell'), X('them', 'they'), U('about'), 'the meeting', U('tomorrow'), '?'],
    "Sai ở ({L}) 'they'. Sau động từ 'tell' cần đại từ tân ngữ 'them'.");

// Simple Present
err('Simple Present', 'A1', 'easy', ['present-simple'],
    ['Neither my brother nor my sister', X('watches', 'watch'), U('TV'), U('before'), 'they', U('finish'), 'their homework.'],
    "Sai ở ({L}) 'watch'. Với 'neither...nor', động từ hòa hợp với chủ ngữ gần nhất 'my sister' (số ít) → 'watches'.");
err('Simple Present', 'A1', 'medium', ['present-simple', 'question'],
    [U('Does'), 'your mother', X('like', 'likes'), U('spicy'), 'food', U('or'), 'sweet food?'],
    "Sai ở ({L}) 'likes'. Trong câu hỏi có 'Does', động từ chính ở dạng nguyên mẫu: 'like'.");
err('Simple Present', 'A1', 'easy', ['present-simple', 'negative'],
    ['Lan', X("doesn't", "don't"), U('drink'), 'coffee', U('because'), 'it', U('makes'), 'her nervous.'],
    "Sai ở ({L}) 'don't'. Chủ ngữ 'Lan' số ít → phủ định dùng 'doesn't'.");
err('Simple Present', 'A1', 'easy', ['present-simple'],
    ['We', U('usually'), X('go', 'goes'), 'to the market', U('on'), U('Sunday'), 'mornings.'],
    "Sai ở ({L}) 'goes'. Chủ ngữ 'We' → động từ giữ nguyên mẫu 'go'.");
err('Simple Present', 'A1', 'easy', ['present-simple'],
    ['The list of items we need', X('is', 'are'), U('on'), 'the kitchen table, but', U('the keys'), U('are'), U('beside'), 'the door.'],
    "Sai ở ({L}) 'are'. Chủ ngữ chính là 'The list' (số ít), không phải 'items' → 'is'.");
err('Simple Present', 'A1', 'medium', ['present-simple', 'negative'],
    ['My father', U("doesn't"), X('work', 'works'), U('on'), 'Saturdays, so he', U('often'), 'plays tennis.'],
    "Sai ở ({L}) 'works'. Sau 'doesn't', động từ ở dạng nguyên mẫu: 'doesn't work'.");

// Adverbs of Frequency
err('Adverbs of Frequency', 'A1', 'medium', ['frequency-adverb', 'be'],
    ['She', X('is never', 'never is'), 'late', U('for'), 'class because she', U('always'), U('gets up'), 'early.'],
    "Sai ở ({L}) 'never is'. Trạng từ tần suất đứng SAU động từ 'be': 'is never'.");
err('Adverbs of Frequency', 'A1', 'medium', ['frequency-adverb', 'question'],
    [U('How often'), X('do', 'are'), 'you', U('go'), 'swimming', U('in'), 'the summer?'],
    "Sai ở ({L}) 'are'. Câu hỏi với động từ thường 'go' ở hiện tại đơn dùng trợ động từ 'do': 'How often do you go...?'");
err('Adverbs of Frequency', 'A1', 'medium', ['frequency-adverb'],
    ['Tom', X('often plays', 'plays often'), U('badminton'), U('with'), 'his friends', U('after'), 'school.'],
    "Sai ở ({L}) 'plays often'. Trạng từ tần suất đứng TRƯỚC động từ thường: 'often plays'.");

// Present Continuous
err('Present Continuous', 'A1', 'easy', ['present-continuous'],
    [U('Look'), '! Those boys', X('are swimming', 'are swim'), U('in'), U('the'), 'river.'],
    "Sai ở ({L}) 'are swim'. Hiện tại tiếp diễn: be + V-ing → 'are swimming'.");
err('Present Continuous', 'A1', 'medium', ['present-continuous'],
    [U('Please'), "don't make noise. My brother", X('is studying', 'studying'), U('for'), U('his'), 'exam.'],
    "Sai ở ({L}) 'studying'. Hiện tại tiếp diễn cần động từ 'be': 'My brother is studying'.");
err('Present Continuous', 'A1', 'easy', ['present-continuous', 'question'],
    ['What', U('are'), 'you', X('doing', 'do'), U('at'), 'the moment?', U('I'), 'need your help.'],
    "Sai ở ({L}) 'do'. 'are you ... at the moment' là hiện tại tiếp diễn → 'What are you doing?'");
err('Present Continuous', 'A2', 'hard', ['stative-verb'],
    ['I', X('want', 'am wanting'), 'a new phone', U('because'), 'my old one', U('is'), U('broken'), '.'],
    "Sai ở ({L}) 'am wanting'. 'want' là động từ chỉ trạng thái, không dùng ở dạng tiếp diễn → 'I want'.");
err('Present Continuous', 'A1', 'medium', ['present-continuous', 'spelling'],
    ['She', U('is'), X('writing', 'writeing'), 'an email', U('to'), 'her teacher', U('right now'), '.'],
    "Sai ở ({L}) 'writeing'. Động từ tận cùng bằng -e câm: bỏ 'e' rồi thêm -ing → 'writing'.");

// Simple Past
err('Simple Past', 'A2', 'easy', ['past-simple', 'irregular'],
    ['While we', U('were waiting'), 'for the bus, it', X('started', 'was starting'), U('to rain'), U('without'), 'warning.'],
    "Sai ở ({L}) 'was starting'. Hành động ngắn xen vào hành động đang diễn ra dùng quá khứ đơn: 'started'; 'were waiting' là hành động nền.");
err('Simple Past', 'A2', 'medium', ['past-simple', 'question'],
    [U('Did'), 'you', X('see', 'saw'), U('the'), 'football match', U('last night'), '?'],
    "Sai ở ({L}) 'saw'. Sau 'Did', động từ trở về nguyên mẫu: 'Did you see...?'");
err('Simple Past', 'A2', 'easy', ['past-simple', 'was-were'],
    ['The concert', X('was', 'were'), U('very'), 'good, and', U('the'), 'tickets were', U('cheap'), '.'],
    "Sai ở ({L}) 'were'. Chủ ngữ 'The concert' số ít → 'was'. ('the tickets' số nhiều nên 'were' ở vế sau là đúng.)");
err('Simple Past', 'A2', 'medium', ['past-simple', 'irregular'],
    ['She', U('bought'), 'a new dress', U('and'), X('wore', 'weared'), 'it', U('to'), 'the party.'],
    "Sai ở ({L}) 'weared'. 'wear' là động từ bất quy tắc, quá khứ là 'wore'.");
err('Simple Past', 'A2', 'medium', ['past-simple', 'spelling'],
    ['They', X('studied', 'studyed'), U('English'), U('for'), 'two hours', U('yesterday'), '.'],
    "Sai ở ({L}) 'studyed'. Động từ tận cùng bằng phụ âm + y: đổi 'y' thành 'i' rồi thêm -ed → 'studied'.");
err('Simple Past', 'A2', 'medium', ['past-simple', 'negative'],
    ['I', X("didn't go", "didn't went"), U('to'), 'school', U('yesterday'), 'because I', U('was'), 'sick.'],
    "Sai ở ({L}) 'didn't went'. Sau 'didn't', động từ ở dạng nguyên mẫu: 'didn't go'.");
err('Simple Past', 'A2', 'easy', ['past-simple', 'question'],
    ['Where', X('did', 'do'), 'you', U('buy'), 'that', U('beautiful'), 'bag', U('last week'), '?'],
    "Sai ở ({L}) 'do'. Có 'last week' → quá khứ đơn, câu hỏi dùng 'did'.");
err('Simple Past', 'A2', 'easy', ['past-simple', 'was-were'],
    ['The weather', X('was', 'were'), U('very'), 'bad, so we', U('stayed'), U('at home'), '.'],
    "Sai ở ({L}) 'were'. 'The weather' là danh từ số ít → 'was'.");

// Future
err('Future', 'A2', 'easy', ['will'],
    ['I think it', X('will rain', 'will rains'), U('tomorrow'), ', so', U('take'), U('an'), 'umbrella.'],
    "Sai ở ({L}) 'will rains'. Sau 'will', động từ ở dạng nguyên mẫu: 'will rain'.");
err('Future', 'A2', 'easy', ['going-to'],
    ['My sister', X('is going to', 'are going to'), U('study'), U('in'), 'Australia', U('next year'), '.'],
    "Sai ở ({L}) 'are going to'. Chủ ngữ 'My sister' số ít → 'is going to'.");
err('Future', 'A2', 'medium', ['will', 'question'],
    [U('Will'), 'you', X('help', 'helping'), 'me', U('with'), 'my homework', U('tonight'), '?'],
    "Sai ở ({L}) 'helping'. Sau 'Will', động từ ở dạng nguyên mẫu: 'Will you help...?'");
err('Future', 'A2', 'medium', ['will'],
    ["Don't worry. I", X('will', 'am'), 'call you', U('as soon as'), 'I', U('arrive'), U('home'), '.'],
    "Sai ở ({L}) 'am'. 'am call' sai cấu trúc. Lời hứa/quyết định tức thời dùng 'will + V': 'I will call you'.");

// Modal Verbs
err('Modal Verbs', 'A2', 'easy', ['must'],
    ['You', U('must'), X('wear', 'wearing'), 'a helmet', U('when'), 'you', U('ride'), 'a motorbike.'],
    "Sai ở ({L}) 'wearing'. Sau động từ khuyết thiếu 'must', động từ ở dạng nguyên mẫu: 'must wear'.");
err('Modal Verbs', 'A1', 'easy', ['can'],
    ['She', X('can speak', 'can speaks'), U('three'), 'languages', U('very'), U('well'), '.'],
    "Sai ở ({L}) 'can speaks'. Sau 'can', động từ ở dạng nguyên mẫu, không thêm -s: 'can speak'.");
err('Modal Verbs', 'A2', 'medium', ['must'],
    ['Visitors', X("mustn't", "don't must"), U('touch'), 'the paintings', U('in'), 'this', U('museum'), '.'],
    "Sai ở ({L}) 'don't must'. Phủ định của 'must' là 'mustn't' (must not), không dùng 'don't'.");
err('Modal Verbs', 'A1', 'medium', ['could', 'request'],
    [U('Could'), 'you', X('open', 'to open'), 'the window,', U('please'), "? It's", U('hot'), 'in here.'],
    "Sai ở ({L}) 'to open'. Sau 'Could', động từ ở dạng nguyên mẫu không 'to': 'Could you open...?'");
err('Modal Verbs', 'A2', 'medium', ['have-to'],
    ['We', X("don't have to", "doesn't have to"), U('get up'), 'early', U('on'), U('Sundays'), '.'],
    "Sai ở ({L}) 'doesn't have to'. Chủ ngữ 'We' → phủ định dùng 'don't have to'.");

// Quantifiers & Nouns
err('Quantifiers & Nouns', 'A1', 'easy', ['much-many'],
    ['How', X('much', 'many'), 'sugar', U('do'), 'you', U('want'), U('in'), 'your coffee?'],
    "Sai ở ({L}) 'many'. 'sugar' là danh từ không đếm được → 'How much'.");
err('Quantifiers & Nouns', 'A1', 'medium', ['some-any'],
    ['I', U('would like'), X('some', 'any'), U('water'), ',', U('please'), '.'],
    "Sai ở ({L}) 'any'. Khi yêu cầu/đề nghị lịch sự ('I would like...'), dùng 'some'.");
err('Quantifiers & Nouns', 'A1', 'easy', ['plural'],
    ['There are two', X('children', 'childrens'), U('playing'), U('in'), 'the', U('park'), '.'],
    "Sai ở ({L}) 'childrens'. 'children' đã là dạng số nhiều bất quy tắc của 'child', không thêm -s.");
err('Quantifiers & Nouns', 'A1', 'medium', ['uncountable', 'article'],
    ['We', U('need'), X('some', 'a'), U('rice'), 'and', U('two'), 'eggs.'],
    "Sai ở ({L}) 'a'. 'rice' là danh từ không đếm được, không dùng 'a' → 'some rice'.");
err('Quantifiers & Nouns', 'A2', 'medium', ['a-few-a-little'],
    ['She has', X('a few', 'a little'), U('friends'), U('in'), U('Hanoi'), '.'],
    "Sai ở ({L}) 'a little'. 'friends' là danh từ đếm được số nhiều → 'a few'.");
err('Quantifiers & Nouns', 'A2', 'medium', ['a-few-a-little'],
    [U('There is'), X('a little', 'a few'), U('milk'), 'left', U('in'), 'the fridge.'],
    "Sai ở ({L}) 'a few'. 'milk' là danh từ không đếm được → 'a little'.");

// Articles
err('Articles', 'A1', 'easy', ['article'],
    ['Her mother', U('works'), U('as'), X('a', 'an'), 'university librarian', U('in'), 'Can Tho.'],
    "Sai ở ({L}) 'an'. 'University' bắt đầu bằng âm /j/ như 'you', là phụ âm → 'a university librarian'.");
err('Articles', 'A1', 'medium', ['article'],
    ['In the morning,', X('the', 'a'), 'sun', U('rises'), U('in'), U('the'), 'east.'],
    "Sai ở ({L}) 'a'. Vật duy nhất (mặt trời) dùng mạo từ 'the': 'the sun'.");
err('Articles', 'A1', 'easy', ['article'],
    ['We', U('waited'), 'for', X('an', 'a'), U('hour'), 'before the doctor', U('called'), 'our name.'],
    "Sai ở ({L}) 'a'. Chữ 'h' trong 'hour' không được phát âm nên từ bắt đầu bằng nguyên âm /aʊ/ → 'an hour'.");

// Prepositions
err('Prepositions', 'A1', 'easy', ['preposition', 'time'],
    ['My birthday is', X('in', 'on'), U('March'), ", and my sister's birthday", U('is'), U('on'), U('May 5th'), '.'],
    "Sai ở ({L}) 'on'. Tháng (March) dùng 'in'; ngày cụ thể (May 5th) mới dùng 'on'.");
err('Prepositions', 'A1', 'medium', ['preposition', 'place'],
    ['We', U('arrived'), X('at', 'to'), 'the airport', U('at'), '6 a.m.', U('on'), 'Monday.'],
    "Sai ở ({L}) 'to'. 'arrive' đi với 'at' (nơi nhỏ, cụ thể như sân bay) hoặc 'in' (thành phố, quốc gia), không dùng 'arrive to'.");
err('Prepositions', 'A1', 'easy', ['preposition', 'time'],
    ['I', U('was'), 'born', X('in', 'on'), '2005', U('in'), U('a'), 'small village.'],
    "Sai ở ({L}) 'on'. Năm (2005) dùng giới từ 'in': 'in 2005'.");
err('Prepositions', 'A1', 'easy', ['preposition', 'transport'],
    ['He', U('goes'), 'to work', X('by', 'with'), 'bus', U('every'), U('day'), '.'],
    "Sai ở ({L}) 'with'. Phương tiện đi lại dùng 'by': 'by bus'.");

// Comparatives & Superlatives
err('Comparatives', 'A2', 'easy', ['comparative'],
    ['My brother is', X('taller', 'more tall'), U('than'), 'me, but I', U('am'), U('heavier'), '.'],
    "Sai ở ({L}) 'more tall'. 'tall' là tính từ ngắn → so sánh hơn thêm -er: 'taller'.");
err('Superlatives', 'A2', 'easy', ['superlative', 'irregular'],
    ['This is', X('the best', 'the goodest'), U('restaurant'), U('in'), U('town'), '.'],
    "Sai ở ({L}) 'the goodest'. 'good' có so sánh nhất bất quy tắc: 'the best'.");
err('Comparatives', 'A2', 'medium', ['comparative', 'spelling'],
    ['Ho Chi Minh City is', X('bigger', 'biger'), U('than'), 'Can Tho', U('and'), U('much'), 'busier.'],
    "Sai ở ({L}) 'biger'. 'big' kết thúc bằng 1 nguyên âm + 1 phụ âm → gấp đôi phụ âm: 'bigger'.");
err('Superlatives', 'A2', 'medium', ['superlative'],
    ['She is the', X('most beautiful', 'beautifulest'), U('girl'), U('in'), 'my', U('class'), '.'],
    "Sai ở ({L}) 'beautifulest'. 'beautiful' là tính từ dài → so sánh nhất: 'the most beautiful'.");

// Questions & Negatives
err('Questions & Negatives', 'A1', 'easy', ['wh-question'],
    [U('What'), 'time', X('does', 'do'), 'the train', U('leave'), U('for'), 'Hanoi?'],
    "Sai ở ({L}) 'do'. Chủ ngữ 'the train' số ít → câu hỏi hiện tại đơn dùng 'does'.");
err('Questions & Negatives', 'A1', 'medium', ['wh-question', 'be'],
    ['Why', X('are', 'do'), 'you', U('so'), 'tired', U('today'), '?', U('Did'), 'you sleep late?'],
    "Sai ở ({L}) 'do'. 'tired' là tính từ → câu hỏi dùng động từ 'be': 'Why are you so tired?'");
err('Questions & Negatives', 'A1', 'easy', ['wh-question'],
    [U('How many'), U('brothers'), X('do', 'does'), 'you', U('have'), '?'],
    "Sai ở ({L}) 'does'. Chủ ngữ 'you' → trợ động từ 'do': 'How many brothers do you have?'");

// Mixed Tenses
err('Mixed Tenses', 'A1-A2', 'medium', ['past-simple', 'time-marker'],
    ['When I', U('was'), 'a child, I', X('lived', 'live'), U('in'), 'a small village', U('near'), 'the river.'],
    "Sai ở ({L}) 'live'. 'When I was a child' chỉ quá khứ → quá khứ đơn 'lived'.");
err('Mixed Tenses', 'A1-A2', 'medium', ['present-continuous', 'time-marker'],
    ['Right now, my father', X('is cooking', 'cooks'), U('dinner'), 'and my mother', U('is reading'), U('a book'), '.'],
    "Sai ở ({L}) 'cooks'. 'Right now' → hành động đang diễn ra, dùng hiện tại tiếp diễn 'is cooking'.");
err('Mixed Tenses', 'A1-A2', 'medium', ['past-simple', 'time-marker'],
    ['Yesterday I', U('called'), 'Lan, but she', X("didn't answer", "doesn't answer"), U('her'), U('phone'), '.'],
    "Sai ở ({L}) 'doesn't answer'. 'Yesterday' → quá khứ đơn: 'didn't answer'.");
err('Mixed Tenses', 'A1-A2', 'medium', ['present-simple', 'time-marker'],
    ['Every morning, he', U('gets up'), 'at six and', X('has', 'had'), U('breakfast'), U('with'), 'his family.'],
    "Sai ở ({L}) 'had'. 'Every morning' chỉ thói quen và 'gets up' ở hiện tại → 'has'.");
err('Mixed Tenses', 'A1-A2', 'hard', ['past-simple', 'present-continuous'],
    ['Last night, Nam', X('watched', 'is watching'), 'a movie', U('with'), 'his friends', U('at'), U('the cinema'), '.'],
    "Sai ở ({L}) 'is watching'. 'Last night' chỉ quá khứ → quá khứ đơn 'watched'.");
err('Mixed Tenses', 'A1-A2', 'hard', ['future', 'time-marker'],
    ['Next weekend, my family', X('is going to visit', 'visited'), U('our'), 'relatives', U('in'), U('Long An'), '.'],
    "Sai ở ({L}) 'visited'. 'Next weekend' chỉ tương lai → 'is going to visit'.");
err('Mixed Tenses', 'A1-A2', 'hard', ['present-simple', 'past-simple'],
    ['My mother', U('usually'), X('drinks', 'drank'), 'tea, but', U('yesterday'), 'she', U('drank'), U('coffee'), '.'],
    "Sai ở ({L}) 'drank'. 'usually' chỉ thói quen hiện tại → 'drinks'. Vế sau có 'yesterday' mới dùng quá khứ 'drank'.");

// ---------------------------------------------------------------- Hoàn thành câu
const CONJ = 'Conjunctions';
[
    ["I wanted to buy the jacket, ______ I left it because it was too expensive.", ['but', 'so', 'because', 'although'], "Hai ý trái ngược: muốn mua nhưng cuối cùng không mua → 'but'. 'Although' cần mở đầu một mệnh đề phụ."],
    ["It was raining heavily, ______ the match continued as planned.", ['but', 'so', 'because', 'therefore'], "Mưa lớn nhưng trận đấu vẫn tiếp tục → quan hệ tương phản, dùng 'but'."],
    ["Lan went to bed early ______ she had worked late the night before.", ['because', 'so', 'although', 'but'], "Mệnh đề sau nêu nguyên nhân Lan đi ngủ sớm → 'because'."],
    ["You can take the early bus ______ wait for the cheaper one at noon.", ['or', 'but', 'so', 'because'], "Hai khả năng loại trừ nhau → dùng 'or'."],
    ["My brother likes football, ______ he doesn't like basketball.", ['but', 'so', 'or', 'because'], "Hai ý trái ngược (thích – không thích) → 'but'."],
    ["She can speak English ______ French. She learned both at school.", ['and', 'but', 'or', 'so'], "'She learned both' → cả hai ngôn ngữ → 'and'."],
    ["We didn't go to the beach ______ the weather was bad.", ['because', 'so', 'and', 'or'], "Vế sau là lý do không đi biển → 'because'."],
].forEach(([q, opts, exp], i) => fill(CONJ, 'A1', i < 4 ? 'easy' : 'medium', ['conjunction'], q.replace('______', BLANK), opts, exp));

const GI = 'Gerunds & Infinitives';
[
    ["I enjoy ______ to music while I am doing housework.", ['listening', 'to listen', 'listen', 'to listening'], "'enjoy + V-ing' → 'enjoy listening'; 'to listening' chỉ đúng khi 'to' là giới từ trong một cụm khác."],
    ["She decided ______ a new laptop after comparing several models.", ['to buy', 'buying', 'buy', 'to buying'], "'decide + to V' → 'decided to buy'."],
    ["Do you want ______ to the cinema, or would you rather stay home?", ['to go', 'going', 'go', 'to going'], "'want + to V' → 'want to go'; không nhầm với 'would rather + V' ở vế sau."],
    ["I'm good at ______ pictures.", ['drawing', 'draw', 'to draw', 'drew'], "Sau giới từ 'at' dùng V-ing → 'good at drawing'."],
    ["We hope ______ you again soon.", ['to see', 'seeing', 'see', 'saw'], "'hope + to V' → 'hope to see'."],
    ["Thank you for ______ me with my homework.", ['helping', 'help', 'to help', 'helped'], "Sau giới từ 'for' dùng V-ing → 'Thank you for helping'."],
    ["My father stopped ______ two years ago. Now he is much healthier.", ['smoking', 'smoke', 'smoked', 'smokes'], "'stop + V-ing' = ngừng hẳn một thói quen → 'stopped smoking' (vì vậy bây giờ khoẻ hơn)."],
].forEach(([q, opts, exp], i) => fill(GI, 'A2', i < 3 ? 'easy' : i < 6 ? 'medium' : 'hard', ['gerund-infinitive'], q.replace('______', BLANK), opts, exp));

const WF = 'Word Form';
[
    ['A2', "She is a very ______ driver. She never has accidents.", ['careful', 'carefully', 'care', 'carefulness'], "Trước danh từ 'driver' cần tính từ → 'careful'."],
    ['A2', "Please speak ______. The baby is sleeping.", ['quietly', 'quiet', 'quietness', 'quieting'], "Bổ nghĩa cho động từ 'speak' cần trạng từ → 'quietly'."],
    ['A1', "My brother is a good ______. He plays the guitar in a band.", ['musician', 'music', 'musical', 'musically'], "Sau 'a good' cần danh từ chỉ người → 'musician' (nhạc sĩ, người chơi nhạc)."],
    ['A2', "The movie was very ______. I almost fell asleep.", ['boring', 'bored', 'bore', 'boredom'], "Tính từ đuôi -ing miêu tả bản chất sự vật (bộ phim gây chán) → 'boring'. '-ed' miêu tả cảm xúc của người."],
    ['A2', "I was very ______ when I heard the good news.", ['excited', 'exciting', 'excite', 'excitement'], "Tính từ đuôi -ed miêu tả cảm xúc của người → 'I was excited'."],
].forEach(([level, q, opts, exp], i) => fill(WF, level, i < 3 ? 'medium' : 'hard', ['word-form'], q.replace('______', BLANK), opts, exp));

module.exports = items;
