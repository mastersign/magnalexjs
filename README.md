MagnaLex JS
===========

> Load Bible text in a structural fashion.

## Usage

```sh
npm install --save magnalexjs
npm install --save xmlbible-kjv
```

```js
const magnalex = require('magnalexjs')
const lib = magnalex.library()
const ref = lib.parseReference('Joh 3:16 [KJV]')
const verses = lib.loadVerses(ref)

const formatOptions = {
    fullBookName: true
}
const html = lib.toHTML(ref, verses, formatOptions)
console.log(html)
```

## License

This project is licensed under the MIT license.

Copyright (c) 2018 Tobias Kiertscher <dev@mastersign.de>
