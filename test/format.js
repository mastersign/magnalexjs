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