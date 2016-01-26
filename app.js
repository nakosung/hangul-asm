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
                memo.buf.push(jung.indexOf(y))
            } else if (memo.buf.length == 2) {
                memo.lastCho = cho.indexOf(y)
                memo.buf.push(jong.indexOf(y))
            }
        } else {
            if (jung.indexOf(y) < 0) {
                memo.buf = [ cho.indexOf(y) ]    
            } else {
                memo.$ = memo.$.substr(0,memo.$.length-1) + $$
                memo.buf = [ memo.lastCho, jung.indexOf(y) ]
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

let readline = require('readline')
let process = require('process')
let rl = readline.createInterface({
    input:process.stdin,
    terminal:false
})

let H = _.uniq(_.flatten([cho,jung,_.flatten(jong.map(x => x.split('')))]))
let A = _.range(0,H.length).map(x => String.fromCharCode((x < 26 ? 65 : 97) +x%26))
let HtoA = {}
let AtoH = {}
_.each(H,(h,i) => HtoA[h] = A[i])
_.each(A,(h,i) => AtoH[h] = H[i])

function detest2(str) {
    str = Array.prototype.map.call(str,x => desafe(x)).join('')
    console.log(str)
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

if (process.argv[2] == 'decode') {
    rl.on('line',line => console.log(detest2(line)))    
} else {
    rl.on('line',line => console.log(test2(line.replace(/[^\uac00-\ud7af \.\?!\n]+/g,'#'))))
}

function T() {
    let text = `이번 강추위는 북극 주변의 찬 공기를 가둬놓던 제트기류가 지구 온난화로 인해 약화하면서 '북극 한기'가 남쪽으로 이동한 것이 근본 원인이다.
    북극 상공의 찬 기류를 '폴라 보텍스'(polar vortex)라고 부른다. 강한 바람대인 제트기류는 평소 북극 주변을 빠르게 돌면서 이 찬 기류를 막아두는 역할을 한다. 
    그런데 최근 온난화로 인해 북극 해빙이 녹아 북극 상층의 온도가 올라가고 제트기류가 약해지자 북극 한기가 남하해 중위도 지역인 한반도까지 영향을 준 것이다.
    <최강한파> 제주 '섬 속의 섬' 우도도 '눈세상' (제주=연합뉴스) 전지혜 기자 = 1월 24일 제주 전역에 기록적인 폭설이 내린 가운데 관광객들이 많이 찾는 제주 '섬 속의 섬' 우도에도 눈이 하얗게 쌓여 있다. << 우도면사무소 제공 >> atoz@yna.co.kr
    온난화로 인해 '한파 울타리'가 느슨해져 오히려 혹독한 추위가 엄습하는 '온난화의 역설'인 셈이다. 
    대설의 경우 중국 북부지방에서 찬 대륙고기압이 확장하면서 상대적으로 따뜻한 서해상을 중심으로 눈구름이 만들어져 바람을 타고 육상으로 유입돼 발생했다.`

    //text = '북극 주변'
    console.log((test(text)))
    console.log(detest(test(text)))    
}
