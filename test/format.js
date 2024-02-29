/** globals describe, it, before */
/* jshint trailingcomma: false */

const assert = require('assert')
const fs = require('fs')
const _ = require('lodash')
const magnalex = require('../src/index.js')


function assertText(actual, expected) {
	const actualLines = actual.match(/[^\r\n]+/g)
	const expectedLines = expected.match(/[^\r\n]+/g)
	assert.deepStrictEqual(actualLines, expectedLines, 'Formatted text does not match expected result.')
}

function formatRef(lib, ref, format, opt) {
	const verses = lib.loadVerses(ref)
	switch (format) {
		case 'md':
			return lib.toMarkdown(ref, verses, opt)
		case 'html':
			return lib.toHTML(ref, verses, opt)
		case 'tex':
			return lib.toLaTeX(ref, verses, opt)
		default:
			throw new Error('Unknown format: ' + format)
	}
}

function fileCase(name, lib, ref, format, opt) {
	const result = formatRef(lib, ref, format, opt)
	const language = _.get(opt, 'language', 'en')
	const expected = fs.readFileSync(`test/data/${name}_${language}.${format}`, {encoding: 'utf-8'})
	assertText(result, expected)
}

describe('MagnaLex.Library', () => {

	let ctx = { lib: null }

	beforeEach(() => {
		ctx.lib = magnalex.library()
	})

	function fileCasesForFormat(f) {

		it('should format single verse', () => {
			const ref = ctx.lib.parseReference('Joh 3:16 [KJV]', 'en')
			fileCase('single', ctx.lib, ref, f, {})
		})

		it('should format single verse in german', () => {
			const ref = ctx.lib.parseReference('Joh 3:16 [KJV]', 'en')
			fileCase('single', ctx.lib, ref, f, { language: 'de' })
		})

		it('should format single verse with unicode superscript', () => {
			const ref = ctx.lib.parseReference('Joh 3:16 [KJV]', 'en')
			fileCase('unicode_superscript', ctx.lib, ref, f, { unicodeSuperscript: true })
		})

		it('should format single verse with space after verse no', () => {
			const ref = ctx.lib.parseReference('Joh 3:16 [KJV]', 'en')
			fileCase('verse_no_space', ctx.lib, ref, f, { verseNoSpace: false })
		})

		it('should format verse range', () => {
			const ref = ctx.lib.parseReference('Joh 1:1-3 [KJV]', 'en')
			fileCase('range', ctx.lib, ref, f, {})
		})

		it('should format multi chapter range', () => {
			const ref = ctx.lib.parseReference('Joh 1:50-2:2 [KJV]', 'en')
			fileCase('crange', ctx.lib, ref, f, {})
		})

		it('should format multi chapter range in german', () => {
			const ref = ctx.lib.parseReference('Joh 1:50-2:2 [KJV]', 'en')
			fileCase('crange', ctx.lib, ref, f, { language: 'de' })
		})

		it('should show full book name', () => {
			const ref = ctx.lib.parseReference('Joh 3:16 [KJV]', 'en')
			fileCase('fullbookname', ctx.lib, ref, f, { fullBookName: true })
		})

		it('should show full translation name', () => {
			const ref = ctx.lib.parseReference('Joh 3:16 [KJV]', 'en')
			fileCase('fulltranslationname', ctx.lib, ref, f, { fullTranslationName: true })
		})
	}

	describe('toMarkdown()', () => {
		fileCasesForFormat('md')
	})

	describe('toHtml()', () => {
		fileCasesForFormat('html')
	})

	describe('toLaTeX()', () => {
		fileCasesForFormat('tex')
	})

})

describe('MagnaLex.Reference', () => {

	describe('format()', () => {

		let lib = null

		beforeEach(() => {
			lib = magnalex.library()
		})

		it('should use reference book name by default', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'Gen 12:23 [KJV]'
			const actual = ref.format(lib, { })
			assert.strictEqual(actual, expected, 'did not use reference book name')
		})

		it('should use primary book name', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'XYZ 12:23 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1 })
			assert.strictEqual(actual, expected, 'did not use primary book name')
		})

		it('should use full primary book name by option', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'XxYyZz 12:23 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, fullBookName: true })
			assert.strictEqual(actual, expected, 'did not use full primary book name')
		})

		it('should use primary and secondary book name', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'ABC', 'AaBbCc', 'de')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'XYZ (ABC) 12:23 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2 })
			assert.strictEqual(actual, expected, 'did not use primary and seoncdary book name')
		})

		it('should use full primary and secondary book name by option', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'ABC', 'AaBbCc', 'de')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'XxYyZz (AaBbCc) 12:23 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2, fullBookName: true })
			assert.strictEqual(actual, expected, 'did not use full primary and seoncdary book name')
		})

		it('should omit secondary book name if it equals the primary one', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'XYZ', 'AaBbCc', 'de')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'XYZ 12:23 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2 })
			assert.strictEqual(actual, expected, 'did use secondary book name despite its beeing equal to the primary')
		})

		it('should omit full secondary book name if it equals the primary one', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'ABC', 'XxYyZz', 'de')
			const ref = new magnalex.Reference(trl, bn, 12, 23)
			const expected = 'XxYyZz 12:23 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2, fullBookName: true })
			assert.strictEqual(actual, expected, 'did use full secondary book name despite its beeing equal to the primary')
		})

	})

})

describe('MagnaLex.ReferenceRange', () => {

	describe('ReferenceRange.format()', () => {

		let lib = null

		beforeEach(() => {
			lib = magnalex.library()
		})

		it('should use reference book name by default', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'Gen 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { })
			assert.strictEqual(actual, expected, 'did not use reference book name')
		})

		it('should use primary book name', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'XYZ 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1 })
			assert.strictEqual(actual, expected, 'did not use primary book name')
		})

		it('should use full primary book name by option', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'XxYyZz 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, fullBookName: true })
			assert.strictEqual(actual, expected, 'did not use full primary book name')
		})

		it('should use primary and secondary book name', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'ABC', 'AaBbCc', 'de')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'XYZ (ABC) 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2 })
			assert.strictEqual(actual, expected, 'did not use primary and seoncdary book name')
		})

		it('should use full primary and secondary book name by option', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'ABC', 'AaBbCc', 'de')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'XxYyZz (AaBbCc) 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2, fullBookName: true })
			assert.strictEqual(actual, expected, 'did not use full primary and seoncdary book name')
		})

		it('should omit secondary book name if it equals the primary one', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'XYZ', 'AaBbCc', 'de')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'XYZ 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2 })
			assert.strictEqual(actual, expected, 'did use secondary book name despite its beeing equal to the primary')
		})

		it('should omit full secondary book name if it equals the primary one', () => {
			const trl = lib.getTranslation('KJV')
			const bn = lib.findBookName('1Mo', 'en')
			const bn1 = new magnalex.BookName('Gen', 'XYZ', 'XxYyZz', 'en')
			const bn2 = new magnalex.BookName('Gen', 'ABC', 'XxYyZz', 'de')
			const ref = new magnalex.ReferenceRange(trl, bn,
				new magnalex.VerseLocation(1, 2), new magnalex.VerseLocation(2, 3))
			const expected = 'XxYyZz 1:2 - 2:3 [KJV]'
			const actual = ref.format(lib, { primaryBookName: bn1, secondaryBookName: bn2, fullBookName: true })
			assert.strictEqual(actual, expected, 'did use full secondary book name despite its beeing equal to the primary')
		})

	})

})
