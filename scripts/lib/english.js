'use strict';

// Hình thái động từ / chủ ngữ tiếng Anh dùng để sinh đáp án và phương án nhiễu theo quy tắc.

const IRREGULAR = {
    be: ['was', 'been'], become: ['became', 'become'], begin: ['began', 'begun'], break: ['broke', 'broken'],
    bring: ['brought', 'brought'], build: ['built', 'built'], buy: ['bought', 'bought'], catch: ['caught', 'caught'],
    choose: ['chose', 'chosen'], come: ['came', 'come'], cost: ['cost', 'cost'], cut: ['cut', 'cut'],
    do: ['did', 'done'], draw: ['drew', 'drawn'], drink: ['drank', 'drunk'], drive: ['drove', 'driven'],
    eat: ['ate', 'eaten'], fall: ['fell', 'fallen'], feel: ['felt', 'felt'], find: ['found', 'found'],
    fly: ['flew', 'flown'], forget: ['forgot', 'forgotten'], get: ['got', 'gotten'], give: ['gave', 'given'],
    go: ['went', 'gone'], grow: ['grew', 'grown'], have: ['had', 'had'], hear: ['heard', 'heard'],
    keep: ['kept', 'kept'], know: ['knew', 'known'], leave: ['left', 'left'], lend: ['lent', 'lent'],
    lose: ['lost', 'lost'], make: ['made', 'made'], meet: ['met', 'met'], pay: ['paid', 'paid'],
    put: ['put', 'put'], read: ['read', 'read'], ride: ['rode', 'ridden'], ring: ['rang', 'rung'],
    run: ['ran', 'run'], say: ['said', 'said'], see: ['saw', 'seen'], sell: ['sold', 'sold'],
    send: ['sent', 'sent'], sing: ['sang', 'sung'], sit: ['sat', 'sat'], sleep: ['slept', 'slept'],
    speak: ['spoke', 'spoken'], spend: ['spent', 'spent'], swim: ['swam', 'swum'], take: ['took', 'taken'],
    teach: ['taught', 'taught'], tell: ['told', 'told'], think: ['thought', 'thought'], wake: ['woke', 'woken'],
    wear: ['wore', 'worn'], win: ['won', 'won'], write: ['wrote', 'written'], understand: ['understood', 'understood'],
};

const DOUBLE_FINAL = new Set(['stop', 'plan', 'shop', 'swim', 'run', 'sit', 'get', 'begin', 'chat', 'jog',
    'put', 'cut', 'win', 'hit', 'drop', 'forget', 'set', 'skip', 'hug', 'prefer']);

function split(verb) {
    const i = verb.indexOf(' ');
    return i < 0 ? [verb, ''] : [verb.slice(0, i), verb.slice(i)];
}

function sForm(verb) {
    const [h, t] = split(verb);
    let r;
    if (h === 'have') r = 'has';
    else if (h === 'be') r = 'is';
    else if (/(s|x|z|ch|sh|o)$/.test(h)) r = h + 'es';
    else if (/[^aeiou]y$/.test(h)) r = h.slice(0, -1) + 'ies';
    else r = h + 's';
    return r + t;
}

function ingForm(verb) {
    const [h, t] = split(verb);
    let r;
    if (h === 'be') r = 'being';
    else if (/ie$/.test(h)) r = h.slice(0, -2) + 'ying';
    else if (/[^aeiou]e$/.test(h)) r = h.slice(0, -1) + 'ing';
    else if (DOUBLE_FINAL.has(h)) r = h + h.slice(-1) + 'ing';
    else r = h + 'ing';
    return r + t;
}

function regularPast(h) {
    if (/e$/.test(h)) return h + 'd';
    if (/[^aeiou]y$/.test(h)) return h.slice(0, -1) + 'ied';
    if (DOUBLE_FINAL.has(h)) return h + h.slice(-1) + 'ed';
    return h + 'ed';
}

function pastForm(verb) {
    const [h, t] = split(verb);
    return (IRREGULAR[h] ? IRREGULAR[h][0] : regularPast(h)) + t;
}

function ppForm(verb) {
    const [h, t] = split(verb);
    return (IRREGULAR[h] ? IRREGULAR[h][1] : regularPast(h)) + t;
}

/** Lỗi phổ biến của người học: quy tắc hoá động từ bất quy tắc (goed, buyed...). */
function wrongRegularPast(verb) {
    const [h, t] = split(verb);
    return regularPast(h) + t;
}

const isIrregular = verb => Boolean(IRREGULAR[split(verb)[0]]);

function sRule(verb) {
    const [h] = split(verb);
    const s = sForm(verb);
    if (h === 'have') return "'have' → 'has' (bất quy tắc)";
    if (/(s|x|z|ch|sh|o)$/.test(h)) return `tận cùng -o, -s, -x, -ch, -sh thêm -es: '${s}'`;
    if (/[^aeiou]y$/.test(h)) return `tận cùng phụ âm + y → đổi y thành i rồi thêm -es: '${s}'`;
    return `thêm -s: '${s}'`;
}

function pastRule(verb) {
    const [h] = split(verb);
    const p = pastForm(verb);
    if (IRREGULAR[h]) return `'${h}' là động từ bất quy tắc, quá khứ (V2) là '${p}'`;
    if (/e$/.test(h)) return `'${h}' tận cùng bằng -e nên chỉ thêm -d: '${p}'`;
    if (/[^aeiou]y$/.test(h)) return `'${h}' tận cùng phụ âm + y → đổi y thành i rồi thêm -ed: '${p}'`;
    if (DOUBLE_FINAL.has(h)) return `'${h}' gấp đôi phụ âm cuối rồi thêm -ed: '${p}'`;
    return `'${h}' là động từ có quy tắc, thêm -ed: '${p}'`;
}

const PRONOUNS = {
    i: { be: 'am', was: 'was', third: false, obj: 'me', poss: 'my' },
    you: { be: 'are', was: 'were', third: false, obj: 'you', poss: 'your' },
    he: { be: 'is', was: 'was', third: true, obj: 'him', poss: 'his' },
    she: { be: 'is', was: 'was', third: true, obj: 'her', poss: 'her' },
    it: { be: 'is', was: 'was', third: true, obj: 'it', poss: 'its' },
    we: { be: 'are', was: 'were', third: false, obj: 'us', poss: 'our' },
    they: { be: 'are', was: 'were', third: false, obj: 'them', poss: 'their' },
};
const SINGULAR_S = new Set(['bus', 'class', 'news', 'boss', 'glass', 'address', 'james', 'thomas', 'physics',
    'math', 'campus', 'business', 'series']);
const IRREGULAR_PLURAL = new Set(['people', 'children', 'men', 'women', 'police', 'feet', 'teeth', 'mice']);
const DETERMINERS = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their', 'the', 'this', 'that', 'these',
    'those', 'a', 'an', 'every', 'each', 'some', 'most', 'all', 'everyone', 'someone', 'nobody', 'everybody',
    'water', 'it', 'he', 'she', 'we', 'they', 'you']);

function subject(text) {
    const low = text.toLowerCase();
    if (PRONOUNS[low]) return { ...PRONOUNS[low], text };
    const words = low.split(/\s+/);
    const last = words[words.length - 1];
    const plural = low.includes(' and ') || IRREGULAR_PLURAL.has(last)
        || (last.endsWith('s') && !last.endsWith("'s") && !SINGULAR_S.has(last));
    return plural
        ? { be: 'are', was: 'were', third: false, text }
        : { be: 'is', was: 'was', third: true, text };
}

/** Chủ ngữ khi đứng giữa câu (sau trợ động từ): "My brother" → "my brother", "Lan" giữ nguyên. */
function mid(text) {
    const first = text.split(' ')[0];
    if (first === 'I') return text;
    if (DETERMINERS.has(first.toLowerCase())) return first.toLowerCase() + text.slice(first.length);
    return text;
}

function describe(text) {
    const low = text.toLowerCase();
    if (low === 'i') return "chủ ngữ 'I'";
    if (low === 'you') return "chủ ngữ 'you'";
    return subject(text).third
        ? `chủ ngữ '${text}' là ngôi thứ ba số ít`
        : `chủ ngữ '${text}' là số nhiều`;
}

const doAux = s => (subject(s).third ? 'does' : 'do');
const dont = s => (subject(s).third ? "doesn't" : "don't");
const beNeg = s => ({ am: 'am not', is: "isn't", are: "aren't" })[subject(s).be];
const wasNeg = s => (subject(s).was === 'was' ? "wasn't" : "weren't");
const wrongBe = s => (subject(s).be === 'are' ? 'is' : 'are');
const wrongWas = s => (subject(s).was === 'was' ? 'were' : 'was');
const presentForm = (s, verb) => (subject(s).third ? sForm(verb) : verb);

module.exports = {
    sForm, ingForm, pastForm, ppForm, wrongRegularPast, isIrregular, sRule, pastRule,
    subject, mid, describe, doAux, dont, beNeg, wasNeg, wrongBe, wrongWas, presentForm,
};
