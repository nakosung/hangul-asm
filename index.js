'use strict';

const _ = require('lodash');

module.exports = { option, encode, decode };

const FIRST_KORAEN_CHAR = '\uac00';
const LAST_KOREAN_CHAR = '\ud7af';
const KOREAN_UNICODE_DEFAULT_INDEX = parseInt('0xac00', 16);
///////////////////////////////////////
function option(config) {
    if (config.INT_PRINT) {
        USING_CHARCODE = true;
        init();
    }
}
///////////////////////////////////////
// 유니코드 한글은 0xAC00 으로부터 
// 초성 19개, 중상21개, 종성28개로 이루어지고
// 이들을 조합한 11,172개의 문자를 갖음
const DEFAULT_IMT_ARR = [19, 21, 28];
let USING_CHARCODE = false;
let DEFAULT_ASCII_INDEX = 128; // @WARN : '48' is not vouch to convert all of ascii code
const REGEX = new RegExp(`([\\x${DEFAULT_ASCII_INDEX.toString(16)}-\\x${(DEFAULT_ASCII_INDEX + _.sum(DEFAULT_IMT_ARR)).toString(16)}]+)`, 'g');
const T_INDEX = (DEFAULT_ASCII_INDEX + DEFAULT_IMT_ARR[0] + DEFAULT_IMT_ARR[1]);

let h2Ascii = {}, ascii2H = {};
function init() {
    let ascii_idx = DEFAULT_ASCII_INDEX;
    h2Ascii = {}, ascii2H = {};
    const mapping = (s, d) => { h2Ascii[s] = d; ascii2H[d] = s; }
    for (let i = 0, l = DEFAULT_IMT_ARR[0]; i < l; i++) mapping((parseInt('0x1100', 16) + i), (ascii_idx++))
    for (let i = 0, l = DEFAULT_IMT_ARR[1]; i < l; i++) mapping((parseInt('0x1161', 16) + i), (ascii_idx++))
    for (let i = 0, l = DEFAULT_IMT_ARR[2]; i < l; i++) mapping((parseInt('0x11A8', 16) + i), (ascii_idx++))
}
init();
///////////////////////////////////////
const CONV_FUNC_TABLE = {
    conv_i_a2b: (c) => parseInt(((c.charCodeAt(0) - KOREAN_UNICODE_DEFAULT_INDEX) / 28) / 21),
    conv_m_a2b: (c) => parseInt(((c.charCodeAt(0) - KOREAN_UNICODE_DEFAULT_INDEX) / 28) % 21),
    conv_t_a2b: (c) => parseInt((c.charCodeAt(0) - KOREAN_UNICODE_DEFAULT_INDEX) % 28) - 1,

    conv_i_adv: (c) => c + parseInt('0x1100', 16),
    conv_m_adv: (c) => c + parseInt('0x1161', 16),
    conv_t_adv: (c) => c + parseInt('0x11A8', 16),

    conv_i_b2a: (i) => (i - parseInt('0x1100', 16)) * 588,
    conv_m_b2a: (i) => (i - parseInt('0x1161', 16)) * 28,
    conv_t_b2a: (i) => i - parseInt('0x11A8', 16) + 1,
};

function split_korean_char(char) {
    return _([
        CONV_FUNC_TABLE.conv_i_a2b(char),
        CONV_FUNC_TABLE.conv_m_a2b(char),
        CONV_FUNC_TABLE.conv_t_a2b(char)
    ]).filter(c => c > -1) // @INFO : valid check
        .map((c, idx) => [
            CONV_FUNC_TABLE.conv_i_adv,
            CONV_FUNC_TABLE.conv_m_adv,
            CONV_FUNC_TABLE.conv_t_adv
        ][idx](c))
        .map(c => h2Ascii[c])
        .map(c => String.fromCharCode(c))
        .value();
};

function merge_korean_char(chars) {
    let code_korean_char = KOREAN_UNICODE_DEFAULT_INDEX;
    _.map([
        CONV_FUNC_TABLE.conv_i_b2a,
        CONV_FUNC_TABLE.conv_m_b2a,
        CONV_FUNC_TABLE.conv_t_b2a,
    ], (f, idx) => {
        if (chars[idx]) code_korean_char += f.call(undefined, ascii2H[chars[idx].charCodeAt(0)]);
    })
    return String.fromCharCode(code_korean_char);
};
///////////////////////////////////////
function encode(lines) {
    let encoded_list = _.flatten(_.map(lines, char => {
        // @INFO : we need to convert only korean chracter!
        if (LAST_KOREAN_CHAR >= char && char >= FIRST_KORAEN_CHAR) return split_korean_char(char);
        else return char;
    }));
    if (USING_CHARCODE) return _.map(encoded_list, c => c.charCodeAt(0));
    else return encoded_list.join('');
};

function decode(lines) {
    if (USING_CHARCODE) lines = _.map(lines, c => String.fromCharCode(c)).join('');
    return lines.replace(REGEX, (str, p1) => {
        let list = [];
        for (let i = 0, l = p1.length; i < l;) {
            const t_idx = (i + 2);
            if (t_idx < l && p1[t_idx].charCodeAt(0) >= T_INDEX) {
                list.push(merge_korean_char(p1.substring(i, i += 3)));
            } else {
                list.push(merge_korean_char(p1.substring(i, i += 2)));
            }
        }
        return list.join('');
    });
};