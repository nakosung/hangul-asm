# hangul-asm

Disassemble and assemble complex char-set of korean letters into/from serialized(disassembled) form. In this way Korean text can be fed into neural network just like English text.

```
$ node app
안녕하세요 한글 테스트입니다
LTCCZLSTJYLf STCAlF QYJlQlLnHCnDT

$ node app decode
LTCCZLSTJYLf STCAlF QYJlQlLnHCnDT
안녕하세요 한글 테스트입니다
```

```js
var lib = require('hangul-asm')
var encoded = lib.encode('한글 풀어쓰기')
var decoded = lib.decode(encoded)
```

## Natural representation for Hangul(Korean letter)
* `않다` --> `ㅇㅏㄴㅎㄷㅏ`
* `아니하다` --> `ㅇㅏㄴㅣㅎㅏㄷㅏ`
* `이걸` --> `ㅇㅣㄱㅓㄹ`
* `이것을` --> `ㅇㅣㄱㅓㅅㅇㅡㄹ`
