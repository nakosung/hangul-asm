'use strict';

const _ = require('lodash');

module.exports = { encode, decode };

const FIRST_KORAEN_CHAR = '\uac00';
const LAST_KOREAN_CHAR = '\ud7af';
const KOREAN_UNICODE_DEFAULT_INDEX = parseInt('0xac00', 16);
///////////////////////////////////////
// 유니코드 한글은 0xAC00 으로부터 
// 초성 19개, 중상21개, 종성28개로 이루어지고
// 이들을 조합한 11,172개의 문자를 갖음
let h2Ascii = {};
let ascii2H = {};
{
    const mapping = (s, d) => { h2Ascii[s] = d; ascii2H[d] = s; }
    let DEFAULT_ASCII_INDEX = 48;
    for (let i = 0, l = 19; i < l; i++) mapping((parseInt('0x1100', 16) + i), (DEFAULT_ASCII_INDEX++))
    for (let i = 0, l = 21; i < l; i++) mapping((parseInt('0x1161', 16) + i), (DEFAULT_ASCII_INDEX++))
    for (let i = 0, l = 28; i < l; i++) mapping((parseInt('0x11A8', 16) + i), (DEFAULT_ASCII_INDEX++))
}
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
// @WARN : can't support all of ascii code set('{', '|', '}')
function encode(lines) {
    let korean_flag = false;
    let encoded_list = _.map(lines, char => {
        // @INFO : we need to convert only korean chracter!
        // @WARN : It doesn't vouch not perfact korean character (ex. 'ㄱ', 'ㅓ')
        if (LAST_KOREAN_CHAR >= char && char >= FIRST_KORAEN_CHAR) {
            let list = split_korean_char(char);
            list.unshift('|');
            if (!korean_flag) {
                list.unshift('{');
                korean_flag = true;
            }
            return list;
        }
        else {
            let list = [char];
            if ((char > ' ') && korean_flag) {
                korean_flag = false;
                list.unshift('}');
            }
            return list;
        }
    });
    if(korean_flag) encoded_list.push('}');
    
    return _.flatten(encoded_list).join('');
};

function decode(lines) {
    return lines.replace(/\{([^}]+)\}/g, (str, p1) => {
        p1 = p1.substr(1); // @INFO : remove garbage first character '|'
        return _.map(p1.split(/\|| /), t => (t == '') ? ' ' : merge_korean_char(t)).join('');
    });
};