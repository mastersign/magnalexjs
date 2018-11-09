/** globals describe, it */

const assert = require('assert')
const _ = require('lodash')
const magnalex = require('../src/index.js')

describe('MagnaLex', () => {

	it('contains constructor functions for classes', () => {
		assert(_.isFunction(magnalex.Library))
		assert(_.isFunction(magnalex.Book))
		assert(_.isFunction(magnalex.Chapter))
		assert(_.isFunction(magnalex.Verse))
		assert(_.isFunction(magnalex.BookName))
		assert(_.isFunction(magnalex.Translation))
		assert(_.isFunction(magnalex.Reference))
		assert(_.isFunction(magnalex.ReferenceRange))
	})

	describe('library()', () => {
		it('should create default library', () => {
			const lib = magnalex.library()
			assert(lib, 'Library was not created.')
		})
		it('should have one default source', () => {
			const lib = magnalex.library()
			assert.equal(_.size(lib.sources), 1)
		})
	})

	describe('Library.getLanguage()', () => {
		it('should return default language', () => {
			const lib = magnalex.library()
			const l = lib.getLanguage()
			assert.equal(l.langTag, 'en')
		})
		it('should return changed default language', () => {
			const lib = magnalex.library()
			lib.setDefaultLanguage('de')
			const l = lib.getLanguage()
			assert.equal(l.langTag, 'de')
		})
	})

	describe('Library.parseReference()', () => {
		it('should parse simple german reference', () => {
			const lib = magnalex.library()
			const r = lib.parseReference('Joh 3, 16 [LUT1912]', 'de')
			assert(r.translation, 'No translation in reference')
			assert(r.bookName, 'No book name in reference')
			assert(r.chapterNo, 'No chapter number in referenec')
			assert(r.verseNo, 'No verse number in reference')
			assert.equal(r.translation.shortName, 'LUT1912')
			assert.equal(r.bookName.name, 'Johannes')
			assert.equal(r.chapterNo, 3)
			assert.equal(r.verseNo, 16)
		})
		it('should parse simple english reference', () => {
			const lib = magnalex.library()
			const r = lib.parseReference('Joh 3:16 [KJV]', 'en')
			assert(r.translation, 'No translation in reference')
			assert(r.bookName, 'No book name in reference')
			assert(r.chapterNo, 'No chapter number in referenec')
			assert(r.verseNo, 'No verse number in reference')
			assert.equal(r.translation.shortName, 'KJV')
			assert.equal(r.bookName.name, 'John')
			assert.equal(r.chapterNo, 3)
			assert.equal(r.verseNo, 16)
		})
	})

	describe('Library.findTranslation()', () => {
		it('should have translation KJV', () => {
			const lib = magnalex.library()
			const bib = lib.findTranslation('KJV')
			assert(bib)
		})
		it('should have translation LUT1912', () => {
			const lib = magnalex.library()
			const bib = lib.findTranslation('LUT1912')
			assert(bib)
		})
	})

	describe('Library.loadVerses()', () => {
		it('should load one verse from KJV', () => {
			const lib = magnalex.library()
			const ref = lib.parseReference('Joh 3:16 [KJV]', 'en')
			assert(ref)
			const verses = lib.loadVerses(ref)
			assert(_.isArray(verses), 'Result from Library.loadVerses() is no array')
			assert.equal(_.size(verses), 1, 'Did not load one verse')
			const v = verses[0]
			assert.equal(v.reference.translation, ref.translation, 'Verse reference has wrong translation')
			assert.equal(v.reference.bookName, ref.bookName, 'Verse reference has wrong book name')
			assert.equal(v.reference.chapterNo, 3, 'Verse reference has wrong chapter number')
			assert.equal(v.reference.verseNo, 16, 'Verse reference has wrong verse number')
			assert(_.isString(v.text), 'Verse contains no text')
		})
		it('should load one verse from LUT1912', () => {
			const lib = magnalex.library()
			const ref = lib.parseReference('Joh 3, 16 [LUT1912]', 'de')
			assert(ref)
			const verses = lib.loadVerses(ref)
			assert(_.isArray(verses), 'Result from Library.loadVerses() is no array')
			assert.equal(_.size(verses), 1, 'Did not load one verse')
			const v = verses[0]
			assert.equal(v.reference.translation, ref.translation, 'Verse reference has wrong translation')
			assert.equal(v.reference.bookName, ref.bookName, 'Verse reference has wrong book name')
			assert.equal(v.reference.chapterNo, 3, 'Verse reference has wrong chapter number')
			assert.equal(v.reference.verseNo, 16, 'Verse reference has wrong verse number')
			assert(_.isString(v.text), 'Verse contains no text')
		})

	})
})
