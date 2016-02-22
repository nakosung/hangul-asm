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
