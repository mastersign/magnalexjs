MagnaLex JS
===========

[![NPM version][npm-image]][npm-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Build Status][travis-image]][travis-url]

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

[npm-image]: https://badge.fury.io/js/magnalexjs.svg
[npm-url]: https://npmjs.org/package/magnalexjs
[travis-image]: https://travis-ci.org/mastersign/magnalexjs.svg?branch=master
[travis-url]: https://travis-ci.org/mastersign/magnalexjs
[daviddm-image]: https://david-dm.org/mastersign/magnalexjs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mastersign/magnalexjs