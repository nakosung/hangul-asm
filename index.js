"use strict"

let cho = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split('')
let jung = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split('')
let jong = "ㄱ/ㄲ/ㄱㅅ/ㄴ/ㄴㅈ/ㄴㅎ/ㄷ/ㄹ/ㄹㄱ/ㄹㅁ/ㄹㅂ/ㄹㅅ/ㄹㅌ/ㄹㅍ/ㄹㅎ/ㅁ/ㅂ/ㅂㅅ/ㅅ/ㅆ/ㅇ/ㅈ/ㅊ/ㅋ/ㅌ/ㅍ/ㅎ".split('/')

let _ = require('lodash')

function decompose(x) {
    if (x < 0xac00 || x > 0xd7af) return String.fromCharCode(x)
    x = x - 0xac00
    let y = x / 28 | 0
    let z = x % 28
    x = y / 21 | 0
    y = y % 21
    let zz = z ? jong[z-1].split('') : null
    return _.compact(_.flatten([cho[x],jung[y],zz]))
}
function test(str) {
    return _.flatten(Array.prototype.map.call(str,x => x.charCodeAt(0)).map(decompose)).join('')
}
function compose(memo,x) {
    let y = String.fromCharCode(x)
    if (x < 0x3130 || x > 0x318E) {
        if (memo.buf) {
            memo.$ += memo.buf.$
            memo.buf = null    
        }
        memo.$ += y
        return memo
    } else {
        let $$
        if (memo.buf && memo.buf.length == 3) {
            if (jong.indexOf(cho[memo.lastCho] + y) < 0) {
                memo.$ += memo.buf.$
                $$ = memo.buf.$$
                memo.buf = null    
            } else {
                memo.buf[2] = jong.indexOf(cho[memo.lastCho] + y)
                memo.lastCho = cho.indexOf(y)
            }
        }
        if (memo.buf) {
            if (memo.buf.length == 1) {
                let yy = jung.indexOf(y)
                if (yy < 0) {
                       
                } else {
                    memo.buf.push(yy)    
                }
            } else if (memo.buf.length == 2) {
                let yy = jong.indexOf(y)
                if (yy < 0) {
                    
                } else {
                    memo.lastCho = cho.indexOf(y)
                    memo.buf.push(yy)   
                }
            }
        } else {
            if (jung.indexOf(y) < 0) {
                let yy = cho.indexOf(y)
                if (yy < 0) {
                    
                } else {
                    memo.buf = [ yy ]    
                }
            } else if (memo.lastCho && $$) {
                memo.$ = memo.$.substr(0,memo.$.length-1) + $$
                memo.buf = [ memo.lastCho, jung.indexOf(y) ]
            } else {
                return memo
            }
        }
        memo.buf.$$ = memo.buf.$
        memo.buf.$ = String.fromCharCode(0xac00 + ((memo.buf[0] * 21 ) + memo.buf[1] ) * 28 + ((memo.buf[2]+1) || 0))
        
        return memo
    }
}
function detest(str) {
    let o = _.reduce(Array.prototype.map.call(str,x => x.charCodeAt(0)),compose,{$:''})
    if (o.buf) {
        return o.$ + o.buf.$
    } else {
        return o.$
    }
}

let H = _.uniq(_.flatten([cho,jung,_.flatten(jong.map(x => x.split('')))]))
let A = _.range(0,H.length).map(x => String.fromCharCode((x < 26 ? 65 : 97) +x%26))
let HtoA = {}
let AtoH = {}
_.each(H,(h,i) => HtoA[h] = A[i])
_.each(A,(h,i) => AtoH[h] = H[i])

function detest2(str) {
    str = Array.prototype.map.call(str,x => desafe(x)).join('')
    return detest(str)
}

function desafe(x) {
    return AtoH[x] || x
}

function safe(x) {
    return HtoA[x] || x
}

function test2(str) {
    str = test(str)
    return Array.prototype.map.call(str,x => safe(x)).join('')
}

module.exports = {
    decode: detest2,
    encode: line => test2(line.replace(/[^\uac00-\ud7af \.\?!\n]+/g,'#'))
}

