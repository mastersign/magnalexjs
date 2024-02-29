# MagnaLex JS

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

See <https://mastersign.github.io/magnalexjs/> for the API documentation.

## Abstractions

### Library

Main entrance for the API and collection of bible sources with bible translations.

To instantiate a _Library_ with a default _Bible Source_ for XML bibles
you can use the module function `library()`.
XML bibles follow the [Zefania XML](https://de.wikipedia.org/wiki/Zefania_XML) format,
but are stored in a specific layout with each book in its own XML file.

The XML bible source is parameterized with a root directory.
It expects sub directories named `xmlbible-*` with an XML bible each.
If no root directory is specified, `node_modules` is used as default.

```js
const lib = magnalex.library()
```

To use a custom root directory with XML bibles, pass the path to the `library()` function.

```js
const lib = magnalex.library("./bibles")
```

### Bibel Source

The way a bible text is loaded.

Usually, if only one XML bible source is used,
it is not necessary to create a _Bible Source_ directly.
It is however possible to implement a subclass of `BibleSource`
or use `FunctionalBibleSource` to implement a custom source to load bible translations.

```js
// create a XML bible source with a root directory
const xmlBibleSource = magnalex.xmlBibleSource("./bibles")

// create a custom bible source
const customSource = magnalex.FunctionBibelSource(
    // id, name, getTranslations, hasTranslation, hasBook, loadBook
    ...
)

// create a library without any bible sources
const lib = new magnalex.Library()

// register the bible sources in the library
lib.registerSource(xmlBibleSource)
lib.registerSource(customSource)
```

### Language

Localized vocabulary, delimiters for bible references, names for the books of the bible.

A language is identified by an IETF tag.
Currently supported are English with ID `en` and German with ID `de`.

You set the default Language of a library with `lib.setDefaultLanguage(langTag)`.
This sets the syntax for parsing bible references and the localization
for formatted bible references and text.

You can add a _Language_ to a _Library_ with `lib.registerLanguage(langTag, delimiters, vocabulary, books)`.
You can find examples for the required values in the source files `src/lang/en.json` and `src/lang/de.json`.

### Book Name

The ID, a short name, and a long name of a book from the bible in a specific _Language_.

The ID of a the bible books originates in the German XMLBIBLE pseudo standard.
Therefore, they are a short version of the German book names.

```js
const john = lib.getBookName('1Mo') // with default language set to English
console.log(john.shortName + ", " + john.name) // Gen, Genesis

const johnInGerman = lib.getBookName('1Mo', 'de')
console.log(johnInGerman.shortName + ", " + johnInGerman.name) // 1. Mo, 1. Mose
```

### Translation

Short name, long name and language of a bible translation.

A _Translation_ is a descriptor for a bible translation.

You can set the default _Translation_ of a library with `lib.setDefaultTranslation(name)`.
The default translation is used for all bible references that do not contain an explicit translation.

To lookup a _Translation_ from a library you can use `lib.findTranslation(shortName)`.

### Reference, Reference Range

A reference to a single or multiple chapters or verses in a bible book.

To create a reference, you can instantiate the classes `Reference` and `ReferenceRange` directly.
But more often you will use `lib.parseReference(s, langTag)`, where the language tag is optional.

For the supported reference syntax see the section _Bible Reference Syntax_ below.

### Book, Chapter, Verse

The content of a bible translation.

Books and verses are loaded with `lib.loadBook(translation, bookName)`
and `lib.loadVerses(reference)`.

## Bible Reference Syntax

The syntax for the bible references is defined in language files.
Currently English and German are supported.

* Single chapter
    + English: `Gen 2`
    + German: `1. Mo 2`
* Chapter and following:
    + English: `Gen 2+ [NKJ]`
    + German: `1. Mo ff`
* Chapter range:
    + English: `Gen 2-3`
    + German: `1. Mo 2-3`
* Single Verse:
    + English: `Gen 2:3`
    + German: `1. Mo 2,3`
* Verse and following:
    + English: `Gen 2:3+`
    + German: `1. Mo 2, 3ff`
* Verse range:
    + English: `Gen 2:3-4`
    + German: `1. Mo 2, 3-4`
* Range:
    + English: `Gen 2:21 - 3:17`
    + German: `1. Mo 2,21 - 3,17`

The translation can be given at the end of a reference:

* English: `Gen 1:1 [NKJ]`
* German: `1. Mo 1, 1 [LUT1912]`

## Formatting

A list of verses can be formatted in the following formats:

* Markdown: `lib.toMarkdown(reference, verses, opt)`
* HTML: `lib.toHTML(reference, verses, opt)`
* LaTeX: `lib.toLaTeX(reference, verses, opt)`

For the supported formatting options, see the type definition `FormatOptions`
in the section _Global_ of the [API documentation](https://mastersign.github.io/magnalexjs/).

## License

This project is licensed under the MIT license.

Copyright (c) 2018 Tobias Kiertscher <dev@mastersign.de>

[npm-image]: https://badge.fury.io/js/magnalexjs.svg
[npm-url]: https://npmjs.org/package/magnalexjs
[travis-image]: https://travis-ci.org/mastersign/magnalexjs.svg?branch=master
[travis-url]: https://travis-ci.org/mastersign/magnalexjs
[daviddm-image]: https://david-dm.org/mastersign/magnalexjs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/mastersign/magnalexjs
