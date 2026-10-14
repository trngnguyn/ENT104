'use strict';

const { mc, U, X, findError } = require('../lib/builders');

// Trình độ B1.
const items = [];
const err = (category, difficulty, tags, segs, explanation) =>
    items.push({ skill: 'completion_error', category, level: 'B1', difficulty, tags: ['error', ...tags], ...findError({ segs, explanation }) });
const fill = (category, difficulty, tags, question, [correct, ...distractors], explanation) =>
    items.push({ skill: 'completion_error', category, level: 'B1', difficulty, tags: ['completion', ...tags], ...mc({ question, correct, distractors, explanation }) });

// ---------------------------------------------------------------- Tìm lỗi sai
// Present Perfect
err('Present Perfect', 'easy', ['present-perfect'],
    ['I', X('have lived', 'live'), 'in Can Tho', U('since'), 'I was', U('ten'), 'years old, so I', U('know'), 'the city well.'],
    "Sai ở ({L}) 'live'. Với 'since' + mốc thời gian, hành động kéo dài đến nay → hiện tại hoàn thành: 'have lived'.");
err('Present Perfect', 'medium', ['present-perfect'],
    ['She', U('has'), X('already', 'yet'), U('finished'), 'her report, so she', U('can'), 'go home early today.'],
    "Sai ở ({L}) 'yet'. Câu khẳng định dùng 'already' (đã... rồi) đứng giữa 'has' và V3. 'yet' dùng trong câu phủ định/câu hỏi và đứng cuối câu.");
err('Present Perfect', 'medium', ['past-simple', 'present-perfect'],
    ['We', X('went', 'have gone'), 'to Phu Quoc', U('last'), 'summer and', U('stayed'), 'there', U('for'), 'a week.'],
    "Sai ở ({L}) 'have gone'. 'last summer' là thời điểm xác định trong quá khứ → quá khứ đơn 'went'.");

// Past Perfect
err('Past Perfect', 'medium', ['past-perfect'],
    ['When I', U('got'), 'to the station, the train', X('had', 'has'), U('already'), 'left, so I', U('took'), 'a taxi.'],
    "Sai ở ({L}) 'has'. Tàu rời đi TRƯỚC khi tôi đến (quá khứ) → quá khứ hoàn thành 'had already left'.");

// Passive Voice
err('Passive Voice', 'easy', ['passive'],
    ['This pagoda', X('was built', 'built'), U('more than'), '200 years ago and', U('is visited'), 'by thousands of tourists', U('every'), 'year.'],
    "Sai ở ({L}) 'built'. Ngôi chùa 'được xây' (bị động) trong quá khứ → 'was built'.");
err('Passive Voice', 'medium', ['passive'],
    ['The exam results', X('will be announced', 'will announce'), U('on'), 'the school website', U('next'), 'Monday, so', U('please'), 'check it then.'],
    "Sai ở ({L}) 'will announce'. Kết quả thi 'được công bố' (bị động) trong tương lai → 'will be announced'.");
err('Passive Voice', 'medium', ['passive'],
    ['Smoking', X('is not allowed', 'is not allow'), U('anywhere'), U('in'), 'the hospital,', U('including'), 'the parking lot.'],
    "Sai ở ({L}) 'is not allow'. Bị động: be + V3 → 'is not allowed'.");

// Conditionals
err('Conditionals', 'easy', ['conditional'],
    ['If it', X('rains', 'will rain'), 'tomorrow, we', U('will'), U('stay'), 'at home and', U('watch'), 'a film.'],
    "Sai ở ({L}) 'will rain'. Câu điều kiện loại 1: mệnh đề 'if' dùng hiện tại đơn, không dùng 'will' → 'rains'.");
err('Conditionals', 'medium', ['conditional'],
    ['If I', X('had', 'have'), 'more money, I', U('would'), 'buy', U('a'), 'new laptop', U('for'), 'my studies.'],
    "Sai ở ({L}) 'have'. Mệnh đề chính có 'would' → câu điều kiện loại 2: If + quá khứ đơn → 'had'.");
err('Conditionals', 'hard', ['conditional'],
    ['If you', U('had'), X('told', 'tell'), 'me', U('about'), 'the problem, I', U('would have helped'), 'you.'],
    "Sai ở ({L}) 'tell'. Câu điều kiện loại 3: If + had + V3 → 'had told'.");

// Relative Clauses
err('Relative Clauses', 'medium', ['relative-clause'],
    ['I have a friend', X('whose', 'who'), U('father'), 'is a pilot, and she', U('has traveled'), 'to', U('many'), 'countries.'],
    "Sai ở ({L}) 'who'. Chỉ sự sở hữu (bố của người bạn), có danh từ 'father' theo sau → 'whose'.");
err('Relative Clauses', 'medium', ['relative-clause'],
    ['This is the café', X('where', 'which'), 'we', U('first'), 'met', U('three'), 'years', U('ago'), '.'],
    "Sai ở ({L}) 'which'. Thay cho nơi chốn ('the café'), sau đó là mệnh đề đầy đủ 'we first met' → 'where' (= in which).");

// Reported Speech
err('Reported Speech', 'medium', ['reported-speech'],
    ['Last week, Lan', U('told'), 'me that she', X('was', 'is'), U('too'), 'busy to', U('go'), 'out that evening.'],
    "Sai ở ({L}) 'is'. Câu tường thuật với 'told' (quá khứ) về một sự việc đã qua ('that evening') → lùi thì: 'was'.");
err('Reported Speech', 'medium', ['reported-speech'],
    ['He', U('asked'), 'me', U('where'), X('I lived', 'did I live'), 'and what I', U('did'), 'for a living.'],
    "Sai ở ({L}) 'did I live'. Câu hỏi tường thuật dùng trật tự trần thuật (chủ ngữ + động từ), không có trợ động từ 'did' → 'where I lived'.");

// Gerunds & Infinitives
err('Gerunds & Infinitives', 'easy', ['gerund'],
    ['I am interested in', X('learning', 'learn'), 'Japanese because I', U('want'), U('to work'), 'in Japan', U('one day'), '.'],
    "Sai ở ({L}) 'learn'. Sau giới từ 'in' động từ ở dạng V-ing → 'interested in learning'.");
err('Gerunds & Infinitives', 'medium', ['infinitive'],
    ['My parents', U('want'), 'me', X('to study', 'study'), 'medicine, but I', U('prefer'), U('drawing'), 'and design.'],
    "Sai ở ({L}) 'study'. 'want' + tân ngữ + to V → 'want me to study'.");
err('Gerunds & Infinitives', 'medium', ['gerund'],
    ['She', U('finished'), X('writing', 'to write'), 'her essay', U('at'), 'midnight and', U('went'), 'to bed.'],
    "Sai ở ({L}) 'to write'. 'finish' + V-ing → 'finished writing'.");

// Used To
err('Used To', 'easy', ['used-to'],
    ['When I was a child, I', X('used to', 'use to'), U('walk'), 'to school', U('with'), 'my', U('older'), 'brother.'],
    "Sai ở ({L}) 'use to'. Thói quen trong quá khứ ở câu khẳng định → 'used to + V'.");

// Modal Verbs
err('Modal Verbs', 'easy', ['modal'],
    ['You', X('should', 'should to'), U('see'), 'a doctor', U('if'), 'your cough', U('gets'), 'worse.'],
    "Sai ở ({L}) 'should to'. Sau động từ khuyết thiếu 'should' là V nguyên mẫu không 'to' → 'should see'.");
err('Modal Verbs', 'hard', ['modal'],
    ['Students', X("don't have to", "mustn't"), U('wear'), 'uniforms on Fridays;', U('they'), 'can wear', U('whatever'), 'they like.'],
    "Sai ở ({L}) 'mustn't'. Vế sau 'they can wear whatever they like' → không bắt buộc (không phải bị cấm): 'don't have to'.");

// Comparatives
err('Comparatives', 'hard', ['comparative'],
    ['The', U('more'), 'you practice, the', X('better', 'more good'), 'your English', U('will'), U('become'), '.'],
    "Sai ở ({L}) 'more good'. So sánh hơn của 'good' là 'better': 'The more..., the better...'.");

// Conjunctions
err('Conjunctions', 'hard', ['conjunction'],
    [X('Although', 'Despite'), 'it was', U('raining'), 'heavily, the', U('football'), 'match', U('continued'), '.'],
    "Sai ở ({L}) 'Despite'. 'Despite' + danh từ/V-ing; trước một mệnh đề (it was raining) phải dùng 'Although'.");

// Word Form
err('Word Form', 'medium', ['word-form'],
    ['Minh', U('speaks'), 'English very', X('fluently', 'fluent'), U('because'), 'he lived in', U('Australia'), 'for five years.'],
    "Sai ở ({L}) 'fluent'. Bổ nghĩa cho động từ 'speaks' cần trạng từ → 'fluently'.");
err('Word Form', 'medium', ['word-form'],
    ['The', X('decision', 'decide'), 'to close the', U('factory'), U('was'), 'very', U('difficult'), 'for the manager.'],
    "Sai ở ({L}) 'decide'. Sau mạo từ 'The' cần danh từ → 'decision' (quyết định).");

// ---------------------------------------------------------------- Hoàn thành câu
fill('Conjunctions', 'medium', ['conjunction'], "______ she was very tired, she finished all her homework.",
    ['Although', 'Because', 'Despite', 'So'],
    "Hai vế trái ngược (mệt nhưng vẫn làm xong bài) và theo sau là mệnh đề → 'Although'. 'Despite' + danh từ/V-ing.");
fill('Conjunctions', 'medium', ['conjunction'], "The flight was delayed ______ the bad weather.",
    ['because of', 'because', 'although', 'so that'],
    "Theo sau là cụm danh từ ('the bad weather') → 'because of'. 'because' + mệnh đề.");
fill('Word Form', 'medium', ['word-form', 'adjective'], "We were ______ by the beautiful view from the top of the mountain.",
    ['amazed', 'amazing', 'amaze', 'amazement'],
    "Diễn tả cảm xúc của người ('We were...') → tính từ đuôi -ed: 'amazed' (kinh ngạc, thích thú).");
fill('Word Form', 'easy', ['word-form', 'adjective'], "It's ______ to cross this road. The traffic is very heavy.",
    ['dangerous', 'danger', 'dangerously', 'endanger'],
    "Sau 'It's' cần tính từ → 'dangerous' (nguy hiểm).");
fill('Gerunds & Infinitives', 'medium', ['gerund'], "Have you ever thought about ______ abroad?",
    ['studying', 'study', 'to study', 'studied'],
    "Sau giới từ 'about' động từ ở dạng V-ing → 'thought about studying'.");
fill('Present Perfect', 'easy', ['present-perfect'], "I haven't seen my cousins ______ last Lunar New Year.",
    ['since', 'for', 'ago', 'during'],
    "'since' + mốc thời gian ('last Lunar New Year') trong thì hiện tại hoàn thành.");

module.exports = items;
