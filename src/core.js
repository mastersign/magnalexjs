const os = require('os')
const _ = require('lodash')

/**
 * The name of a bible book in a certain language.
 */
class BookName {

	/**
	 * @param {string} id        - The technical ID of the book
	 * @param {string} shortName - A short name of the book in the given language
	 * @param {string} name      - The full name of the book in the given language
	 * @param {string} langTag   - The language of the book name as IETF language tag
	 */
	constructor(id, shortName, name, langTag) {
		/**
		 * The technical ID of the book
		 * @type {string}
		 */
		this.id = id
		/**
		 * A short name of the book in the given language
		 * @type {string}
		 */
		this.shortName = shortName
		/**
		 * The full name of the book in the given language
		 * @type {string}
		 */
		this.name = name
		/**
		 * The language of the book name as IETF language tag
		 * @type {string}
		 */
		this.langTag = langTag
	}

	/**
	 * @return {string} The short name of the book
	 */
	toString() {
		return this.shortName
	}

	/**
	 * Format the book name in the given language.
	 *
	 * @param {Language} language - The language to use
	 * @return {string}
	 */
	format(language) {
		const d = language.delimiters
		return `${d.bookBegin}${this.shortName}${d.bookEnd}`
	}
}

/**
 * The name of a bible translation in a certain language.
 */
class Translation {

	/**
	 * @param {string} shortName - A short name of the translation, which is used to identify it
	 * @param {string} name      - The full name of the translation
	 * @param {string} langTag   - The language of the translation as IETF language tag
	 */
	constructor(shortName, name, langTag) {
		/**
		 * A short name of the translation, which is used to identify it.
		 * @type {string}
	     */
		this.shortName = shortName
		/**
		 * The full name of the translation.
		 * @type {string}
		 */
		this.name = name
		/**
		 * The language of the translation as IETF language tag.
		 * @type {string}
		 */
		this.langTag = langTag
	}

	/**
	 * @return {string} The short name of the translation in brackets
	 */
	toString() {
		return `[${this.shortName}]`
	}

	/**
	 * Format the translation in the given language.
	 *
	 * @param {Language} language - The language to use
	 * @return {string} The short name of the translation
	 */
	format(language) {
		const d = language.delimiters
		return `${d.translationBegin}${this.shortName}${d.translationEnd}`
	}
}

/**
 * The location of a verse without the context of a bible book.
 */
class VerseLocation {

	/**
	 * @param {number}      chapterNo - The number of the chapter (one-based)
	 * @param {number|null} verseNo   - The number of the verse (one-based), or null if he whole chapter is referenced
	 */
	constructor(chapterNo, verseNo) {
		/**
		 * @prop {number} chapterNo - The number of the chapter (one-based)
		 */
		this.chapterNo = chapterNo
		/**
		 * @prop {number|null} verseNo - The number of the verse (one-based), or null if he whole chapter is referenced
		 */
		this.verseNo = verseNo
	}

	/**
	 * Checks whether the chapterNo matches the reference.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @return {bool} true if this reference is pointing at the given chapter; otherwise false
	 */
	isChapterMatch(chapterNo) {
		return this.chapterNo === chapterNo
	}

	/**
	 * Checks whether the given chapterNo and verseNo matches the verse location.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @param {number} verseNo   - The number of the verse in question
	 * @return {bool} true if the given chapterNo and verseNo matches the location; otherwise false
	 */
	isVerseMatch(chapterNo, verseNo) {
		return (this.chapterNo === chapterNo) && (this.verseNo == null || this.verseNo === verseNo)
	}

	/**
	 * @return {string} The verse location in one string
	 */
	toString() {
		return this.verseNo ? `${this.chapterNo}:${this.verseNo}` : `${this.chapterNo}`
	}

	/**
	 * Format the verse location in the given language.
	 *
	 * @param {Language} language - The language to use
	 * @return {string}
	 */
	format(language) {
		const d = language.delimiters
		return this.verseNo ? `${this.chapterNo}${d.chapterToVerse}${this.verseNo}` : `${this.chapterNo}`
	}
}

/**
 * A reference to a verse in a bible translation.
 *
 * @extends VerseLocation
 */
class Reference extends VerseLocation {

	/**
	 * @param {Translation} translation - The referenced bible translation
	 * @param {BookName}    bookName    - The name of the bible book
	 * @param {number}      chapterNo   - The number of the chapter (one-based)
	 * @param {number}      verseNo     - The number of the verse (one-based)
	 */
	constructor(translation, bookName, chapterNo, verseNo) {
		super(chapterNo, verseNo)
		/**
		 * @prop {Translation} translation - The bible translation the reference is pointing at
		 */
		this.translation = translation
		/**
		 * @prop {BookName} bookName - The bible book this reference is pointing at
		 */
		this.bookName = bookName
	}

	/**
	 * Checks whether the reference spans over more than one chapter
	 *
	 * @return {bool} true if the reference spans more than one chapter; otherwise false
	 */
	multiChapter() {
		return false
	}

	/**
	 * @return {string} A text representation of the reference
	 */
	toString() {
		return `${this.bookName} ${super.toString()} ${this.translation}`
	}

	/**
	 * Format the reference in the given language.
	 *
	 * @param {Language} language - The language to use
	 * @return {string} A short text representation of the reference
	 */
	format(language) {
		return `${this.bookName.format(language)} ${super.format(language)} ${this.translation.format(language)}`
	}
}

/**
 * The reference to a range of verses in a bible translation.
 *
 * A range of verses can only span over verses in one bible book.
 */
class ReferenceRange {

	/**
	 * @param {Translation}   translation - The referenced bible translation
	 * @param {BookName}      bookName    - The name of the bible book
	 * @param {VerseLocation} from        - The location of the first verse in the range
	 * @param {VerseLocation} to          - The location of the last verse in the range, or null if the range is open
	 */
	constructor(translation, bookName, from, to) {
		/**
		 * @prop {Translation} translation - The bible translation the reference is pointing at
		 */
		this.translation = translation
		/**
		 * @prop {BookName} bookName - The bible book this reference is pointing at
		 */
		this.bookName = bookName
		/**
		 * @prop {VerseLocation} from - The location of the first chapter or verse
		 */
		this.from = from
		/**
		 * @prop {VerseLocation|null} to - The location of the last chapter or verse, or null if the range is open
		 */
		this.to = to
	}

	/**
	 * Checks whether the reference spans over more than one chapter
	 *
	 * @return {bool} true if the reference spans more than one chapter; otherwise false
	 */
	multiChapter() {
		if (this.to == null && this.from.verseNo == null) return true
		return this.to != null && this.to.chapterNo > this.from.chapterNo
	}

	/**
	 * Checks whether the chapterNo matches the reference.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @return {bool} true if this reference is pointing at the given chapter; otherwise false
	 */
	isChapterMatch(chapterNo) {
		return chapterNo >= this.from.chapterNo && (this.to == null || chapterNo <= this.to.chapterNo)
	}

	/**
	 * Checks whether the given chapterNo and verseNo matches the reference.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @param {number} verseNo   - The number of the verse in question
	 * @return {bool} true if the given chapterNo and verseNo matches the reference; otherwise false
	 */
	isVerseMatch(chapterNo, verseNo) {
		if (chapterNo < this.from.chapterNo)
			return false
		if (chapterNo === this.from.chapterNo) {
			if (this.to == null || chapterNo < this.to.chapterNo)
				return this.from.verseNo == null || verseNo >= this.from.verseNo
			if (chapterNo === this.to.chapterNo)
				return (this.from.verseNo == null || verseNo >= this.from.verseNo) &&
					(this.to.verseNo == null || verseNo <= this.to.verseNo)
			return false
		}
		if (this.to == null)
			return true
		if (chapterNo < this.to.chapterNo)
			return true
		if (chapterNo === this.to.chapterNo)
			return this.to.verseNo == null || verseNo <= this.to.verseNo
		return false
	}

	/**
	 * @return {string} A text representation of this reference range
	 */
	toString() {
		let vr = null
		if (this.to == null)
			vr = `${this.from}+`
		else if (this.from.chapterNo === this.to.chapterNo)
			vr = `${this.from.chapterNo}:${this.from.verseNo}-${this.to.verseNo}`
		else
			vr = `${this.from} - ${this.to}`

		return `${this.bookName} ${vr} ${this.translation}`
	}

	/**
	 * Format the reference in the given language.
	 *
	 * @param {Language} language - The language to use
	 * @return {string} A short text representation of the reference
	 */
	format(language) {
		const d = language.delimiters
		let vr = null
		if (this.to == null)
			vr = `${this.from.format(language)}${d.andFollowing}`
		else if (this.from.chapterNo === this.to.chapterNo)
			vr = `${this.from.chapterNo}${d.chapterToVerse}${this.from.verseNo}${d.verseRange}${this.to.verseNo}`
		else
			vr = `${this.from.format(language)} ${d.chapterRange} ${this.to.format(language)}`

		return `${this.bookName.format(language)} ${vr} ${this.translation.format(language)}`
	}
}

/**
 * A bible verse.
 */
class Verse {
	/**
	 * @param {Reference} reference - The reference to this verse
	 * @param {string}    text      - The text of this verse
	 */
	constructor(reference, text) {
		/**
		 * @prop {Reference} reference - A reference to this verse
		 */
		this.reference = reference
		/**
		 * @prop {string} text - The text of this verse
		 */
		this.text = text
	}

	/**
	 * @param {Language} language - The language to use for formatting the reference
	 * @return {string} The reference and the text of the verse
	 */
	format(language) {
		return `${this.reference.format(language)}: ${this.text}`
	}
}

/**
 * A bible chapter.
 */
class Chapter {
	/**
	 * @param {Reference} reference - The reference to this chapter
	 * @param {Vers[]}    verses    - The verses in this chapter
	 */
	constructor(reference, verses) {
		/**
		 * @prop {Reference} reference - A reference to this chapter
		 */
		this.reference = reference
		/**
		 * @prop {Verse[]} verses - An array with all verses in this chapter
		 */
		this.verses = verses
	}

	/**
	 * @param {Language} language - The language to use formatting the reference, defaults to the translations language
	 * @return {string} A short description of the chapter
	 */
	format(language) {
		return `${this.reference.format(language)} (${_.size(this.verses)} ${language.vocabulary.verses})`
	}
}

/**
 * A bible book.
 */
class Book {
	/**
	 * @param {Translation} translation - The bible translation this book is from
	 * @param {BookName}    bookName    - The name of the bible book
	 * @param {Chapter[]}   chapters    - The chapters in this book
	 */
	constructor(translation, bookName, chapters) {
		/**
		 * @prop {Translation} translation - The bible translation, the books belongs to
		 */
		this.translation = translation
		/**
		 * @prop {BookName} name - The name of the bible book
		 */
		this.name = bookName
		/**
		 * @prop {Chapter[]} chapters - An array with all chapters in the book
		 */
		this.chapters = chapters
	}

	/**
	 * @param {Language} language - The language to use formatting the reference, defaults to the translations language
	 * @return {string} A short description of the bible book
	 */
	format(language) {
		return `${this.name.format(language)} ${this.translation.format(language)} (${_.size(this.chapters)} ${language.vocabulary.chapters})`
	}
}

/**
 * A source to load bible books with their text content from.
 *
 * @abstract
 */
class BibleSource {

	constructor(id, name) {
		this.id = id
		this.name = name
	}

	/**
	 * Returns all translations, the source can load.
	 *
	 * @abstract
	 * @return {Translation[]} An array with the translations
	 */
	getTranslations() {
		throw new TypeError("The abstract method getTranslations is not implemented.")
	}

	/**
	 * Checks whether the source can load the given bible translation
	 *
	 * @abstract
	 * @param {string} translationShortName - The short name of the translation
	 * @return {bool} true if the translation is available in the source; otherwise false
	 */
	hasTranslation() {
		throw new TypeError("The abstract method hasTranslation is not implemented.")
	}

	/**
	 * Checks whether the source can load the given bible book
	 *
	 * @abstract
	 * @param {string} translationShortName - The short name of the translation
	 * @param {string} bookId               - The technical ID of the book
	 * @return {bool} true if the book is available in the source; otherwise false
	 */
	hasBook() {
		throw new TypeError("The abstract method hasBook is not implemented.")
	}

	/**
	 * Loads the specified bible book from the specified translation
	 *
	 * @abstract
	 * @param {Translation} translation - The translation to load the bible book from
	 * @param {BookName}    bookname    - The name of the bible book to load
	 * @return {Book} the loaded bible book
	 */
	loadBook() {
		throw new TypeError("The abstract method loadBook is not implemented.")
	}
}

/**
 * An implementation of {@linkcode BibleSource} using three functions
 * to do the actual work.
 *
 * Comes with an integrated cache for the loaded books,
 * so that no book has to be loaded twice.
 *
 * @extends BibleSource
 */
class FunctionalBibleSource extends BibleSource {

	/**
	 * @param {string}   id             - An ID for the bible source
	 * @param {string}   name           - An explanatory name for the bible source
	 * @param {function} hasTranslation - The implementation for the method {@linkcode hasTranslation()}
	 * @param {function} hasBook        - The implementation for the method {@linkcode hasBook()}
	 * @param {function} loadBook       - The implementation for the method {@linkcode loadBook()}
	 */
	constructor(id, name, getTranslations, hasTranslation, hasBook, loadBook) {
		super(id, name)
		this.getTranslationsFn = getTranslations
		this.hasTranslationFn = _.memoize(hasTranslation, (translationShortName, bookId) => `${bookId} [${translationShortName}]`)
		this.hasBookFn = _.memoize(hasBook)
		this.loadBookFn = _.memoize(loadBook, (translation, book) => `${book.id} [${translation.shortName}]`)
		this.bookCache = {}
	}

	/**
	 * Returns all translations, the source can load.
	 *
	 * @return {Translation[]} An array with the translations
	 */
	getTranslations() {
		return this.getTranslationsFn()
	}

	/**
	 * Checks whether the source can load the given bible translation
	 *
	 * @param {string} translationShortName - The short name of the translation
	 * @return {bool} true if the translation is available in the source; otherwise false
	 */
	hasTranslation(translationShortName) {
		return this.hasTranslationFn(translationShortName)
	}

	/**
	 * Checks whether the source can load the given bible book
	 *
	 * @param {string} translationShortName - The short name of the translation
	 * @param {string} bookId               - The technical ID of the book
	 * @return {bool} true if the book is available in the source; otherwise false
	 */
	hasBook(translationShortName, bookId) {
		return this.hasBookFn(translationShortName, bookId)
	}

	/**
	 * Loads the specified bible book from the specified translation
	 *
	 * @param {Translation} translation - The translation to load the bible book from
	 * @param {BookName}    bookname    - The name of the bible book to load
	 * @return {Book} the loaded bible book
	 */
	loadBook(translation, bookname) {
		return this.loadBookFn(translation, bookname)
	}
}

/**
 * Represents a natural language for bible translations and reference parsing/formatting.
 */
class Language {

	/**
	 * @param {string} langTag    - The IETF tag of the language
	 * @param {object} delimiters - A map of delimiter strings
	 * @param {object} vocabulary - A map of word translations
	 * @param {object} books      - A map of BookName objects, indexed by their short names
	 */
	constructor(langTag, delimiters, vocabulary, books) {
		this.langTag = langTag
		this.delimiters = delimiters
		this.vocabulary = vocabulary
		this.books = books
		this.referencePatterns = buildReferencePatterns(delimiters, books)
	}
}

/**
 * Represents a library for bible translations.
 */
class Library {

	/**
	 * Initialize a new bible library.
	 */
	constructor() {
		this.languages = {}
		this.translations = {}
		/**
		 * An array with all registered bible sources
		 * @type {BibleSource[]}
		 */
		this.sources = []
		this.defaults = {}
		this.registerPackagedLanguage('en')
		this.registerPackagedLanguage('de')
		this.setDefaultLanguage('en')
	}

	/**
	 * Register a language with its reference delimiters and book names.
	 *
	 * @param {string}   langTag    - The IETF language tag of the language.
	 * @param {object}   delimiters - An object with the reference delimiters
	 * @param {object}   vocabulary - An object with word translations
	 * @param {Object[]} books      - An array of objects representing the books with the attributes `id`, `shortName`, and `name`
	 */
	registerLanguage(langTag, delimiters, vocabulary, books) {
		this.languages[langTag] = new Language(
			langTag,
			delimiters,
			vocabulary,
			_.keyBy(
				_.map(
					books,
					book => new BookName(book.id, book.shortName, book.name, langTag)),
				'shortName'))
	}

	registerPackagedLanguage(langTag) {
		const langData = require(`./langs/${langTag}.json`)
		this.registerLanguage(langTag, langData.delimiters, langData.vocabulary, langData.books)
	}

	/**
	 * Sets the default language for parsing references.
	 *
	 * @param {string} langTag - An IETF language tag of a registered language
	 */
	setDefaultLanguage(langTag) {
		this.defaults.langTag = langTag
	}

	/**
	 * Finds a language description by its IETF tag.
	 * If no language tag is given, the default language is returned.
	 *
	 * @param {string=} langTag - The IETF language tag
	 */
	getLanguage(langTag) {
		return this.languages[langTag || this.defaults.langTag]
	}

	/**
	 * Register a bible translation.
	 *
	 * @param {object} translation - An object with the attributes `shortName`, `name`, `langTag`
	 */
	registerTranslation(translation) {
		this.translations[translation.shortName] =
			new Translation(translation.shortName, translation.name, translation.langTag)
	}

	/**
	 * Sets the default translation for parsing references.
	 *
	 * @param {string} translation - The short name of a registered translation
	 */
	setDefaultTranslation(translation) {
		this.defaults.translation = translation
	}

	/**
	 * Register a new bible source for loading bible books
	 *
	 * @param {BibleSource} source - The bible source to register
	 */
	registerSource(source) {
		this.sources.push(source)
		_.forEach(source.getTranslations(), t => this.registerTranslation(t))
	}

	/**
	 * Gets a bible book name in a registered language.
	 * If no language tag is given, the libraries default language is used.
	 *
	 * @param {string}  bookId  - The technical bible book ID
	 * @param {string=} langTag - The IETF language tag
	 * @return {BookName|null} The book name or `null` if the book is unknown in the given language
	 */
	findBookName(bookId, langTag) {
		const l = this.getLanguage(langTag)
		if (l == null) return null
		return _.find(_.values(l.books), book => book.id === bookId) || null
	}

	/**
	 * Finds a registered translation by its short name
	 *
	 * @param {string} shortName - The short name of the translation
	 * @return {Translation|null} The translation object or null if the translation is unknown
	 */
	findTranslation(shortName) {
		return this.translations[shortName] || null
	}

	/**
	 * Parses a string as a bible reference.
	 * Uses the given language or the default language, if no language tag is given.
	 *
	 * @param {string}  s       - A string representing a verse or verse range reference
	 * @param {string=} langTag - The IETF tag of the language to use for parsing
	 * @return {Reference|ReferenceRange|null}
	 */
	parseReference(s, langTag) {
		const l = this.getLanguage(langTag)
		const patterns = l.referencePatterns
		const books = l.books
		let m = patterns.chapter.exec(s)
		if (m) {
			return new Reference(
				this.findTranslation(m[4] || this.defaults.translation),
				books[m[1]],
				parseInt(m[2]),
				null
			)
		}
		m = patterns.chapterAndFollowing.exec(s)
		if (m) {
			return new ReferenceRange(
				this.findTranslation(m[3] || this.defaults.translation),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), null),
				null
			)
		}
		m = patterns.chapterRange.exec(s)
		if (m) {
			return new ReferenceRange(
				this.findTranslation(m[4] || this.defaults.translation),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), null),
				new VerseLocation(parseInt(m[3]), null)
			)
		}
		m = patterns.verse.exec(s)
		if (m) {
			return new Reference(
				this.findTranslation(m[4] || this.defaults.translation),
				books[m[1]],
				parseInt(m[2]),
				parseInt(m[3])
			)
		}
		m = patterns.verseAndFollowing.exec(s)
		if (m) {
			return new ReferenceRange(
				this.findTranslation(m[4] || this.defaults.translation),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), parseInt(m[3])),
				null
			)
		}
		m = patterns.verseRange.exec(s)
		if (m) {
			return new ReferenceRange(
				this.findTranslation(m[5] || this.defaults.translation),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), parseInt(m[3])),
				new VerseLocation(parseInt(m[2]), parseInt(m[4]))
			)
		}
		m = patterns.range.exec(s)
		if (m) {
			return new ReferenceRange(
				this.findTranslation(m[6] || this.defaults.translation),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), parseInt(m[3])),
				new VerseLocation(parseInt(m[4]), parseInt(m[5]))
			)
		}
		return null
	}

	/**
	 * @param {Translation} translation
	 * @param {BookName} bookName
	 * @return {Book|null}
	 */
	loadBook(translation, bookName) {
		if (translation == null) return null
		if (bookName == null) return null
		const source = _.find(this.sources, s => s.hasBook(translation.shortName, bookName.id))
		if (source == null) return null
		return source.loadBook(translation, bookName)
	}

	/**
	 * Load the referenced verses
	 *
	 * @param {Reference|ReferenceRange} reference - The reference to load the verses for
	 * @return {Verse[]}
	 */
	loadVerses(reference) {
		const book = this.loadBook(
			this.findTranslation(reference.translation.shortName),
			this.findBookName(reference.bookName.id, reference.translation.langTag))
		if (book == null) return null
		const chapters = _.filter(book.chapters, c => reference.isChapterMatch(c.reference.chapterNo))
		return _.filter(
			_.flatten(_.map(chapters, c => c.verses)),
			v => reference.isVerseMatch(v.reference.chapterNo, v.reference.verseNo))
	}

	/**
	 * @param {Reference|ReferenceRange} reference - The reference, which was used to load the verses
	 * @param {Verse[]}                  verses    - The verses to format
	 * @param {string=}                  langTag   - The language to use for formatting as IETF tag
	 * @return {string} The verses as citation block in Pandoc-Markdown
	 */
	toMarkdown(reference, verses, langTag) {
		if (_.isEmpty(verses)) return null
		const l = this.getLanguage(langTag || verses[0].reference.translation.langTag)
		const lines = []
		let cNo = _.size(_.groupBy(verses, v => v.reference.chapterNo)) > 1 ? null : verses[0].reference.chapterNo
		_.forEach(verses, function (v) {
			const r = v.reference
			if (cNo !== r.chapterNo) {
				cNo = r.chapterNo
				lines.push('**' + l.vocabulary.chapter + ' ' + cNo + '**')
				lines.push('')
			}
			lines.push('^' + r.verseNo + '^ ' + v.text.trim())
		});
		lines.push('')
		lines.push('_' + reference.format(l) + '_')
		return _.join(_.map(lines, l => '> ' + l), os.EOL)
	}

}


function buildReferencePatterns(delimiters, books) {
	const delims = _.mapValues(delimiters, _.escapeRegExp)
	const bookShortNames = _.map(books, book => _.escapeRegExp(book.shortName))

	function buildPattern(parts) { return '^' + _.join(_.filter(parts), '\\s*') + '$' }
	function buildReferencePattern(parts) {
		return buildPattern(_.concat(
			[delims.bookStart, '(' + _.join(bookShortNames, '|') + ')\\.?', delims.bookEnd,],
			parts,
			['(?:' + delims.translationBegin, '(\\w+)', delims.translationEnd + ')?',]))
	}

	return {
		// Mk 1 [NKJ]
		chapter: new RegExp(buildReferencePattern([
			'(\\d+)',
		])),
		// Mk 1+ [NKJ]
		chapterAndFollowing: new RegExp(buildReferencePattern([
			'(\\d+)' + delims.andFollowing,
		])),
		// Mk 1-3 [NKJ]
		chapterRange: new RegExp(buildReferencePattern([
			'(\\d+)',
			delims.chapterRange,
			'(\\d+)',
		])),
		// Mk 1:4 [NKJ]
		verse: new RegExp(buildReferencePattern([
			'(\\d+)',
			delims.chapterToVerse,
			'(\\d+)',
		])),
		// Mk 1:4+ [NKJ]
		verseAndFollowing: new RegExp(buildReferencePattern([
			'(\\d+)',
			delims.chapterToVerse,
			'(\\d+)' + delims.andFollowing,
		])),
		// Mk 1:4-20 [NKJ]
		verseRange: new RegExp(buildReferencePattern([
			'(\\d+)',
			delims.chapterToVerse,
			'(\\d+)',
			delims.verseRange,
			'(\\d+)',
		])),
		// Mk 1:20-2:3 [NKJ]
		range: new RegExp(buildReferencePattern([
			'(\\d+)',
			delims.chapterToVerse,
			'(\\d+)',
			delims.chapterRange,
			'(\\d+)',
			delims.chapterToVerse,
			'(\\d+)',
		])),
	}
}

module.exports = {
	Translation: Translation,
	BookName: BookName,
	VerseLocation: VerseLocation,
	Reference: Reference,
	ReferenceRange: ReferenceRange,
	Book: Book,
	Chapter: Chapter,
	Verse: Verse,
	BibleSource: BibleSource,
	FunctionalBibleSource: FunctionalBibleSource,
	Library: Library,
}
