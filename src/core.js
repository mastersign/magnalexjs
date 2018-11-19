const os = require('os')
const _ = require('lodash')

/**
 * @typedef Delimiters
 * @type {Object}
 * @prop {string} bookBegin - A prefix before a book name
 * @prop {string} bookEnd - A suffix after a book name
 * @prop {string} longBookBegin - A prefix before a full book name
 * @prop {string} longBookEnd - A prefix after a full book name
 * @prop {string} altBookSeparator - A binder between primary and alternative book name
 * @prop {string} altBookBegin - A prefix before an alternative book name
 * @prop {string} altBookEnd - A suffix after an alternative book name
 * @prop {string} altLongBookBegin - A prefix before an alternative full book name
 * @prop {string} altLongBookEnd - A prefix after an alternative full book name
 * @prop {string} chapterToVerse - The binder between a chapter number and the verse number(s)
 * @prop {string} chapterRange - The binder between the chapter numbers in a range
 * @prop {string} chapterList - The binder between enumerated chapter numbers
 * @prop {string} verseRange - The binder between verse numbers in a range
 * @prop {string} verseList - The binder between enumerated verse numbers
 * @prop {string} range - The binder between one chapter-verse-reference and another in a range
 * @prop {string} andFollowing - A symbol, meaning "and following" after a chapter or verse number
 * @prop {string} translationBegin - A prefix before a translation name
 * @prop {string} translationEnd - A suffix after a translation name
 */

/**
 * @typedef Vocabulary
 * @type {Object}
 * @prop {string} verse - A translation for the english word "verse"
 * @prop {string} verses - A translation for the english word "verses"
 * @prop {string} chapter - A translation for the english word "chapter"
 * @prop {string} chapters - A translation for the english word "chapters"
 */

/**
 * @typedef FormatOptions
 * @type {Object}
 * @prop {string}  language               - The language to use for formatting as IETF tag
 * @prop {boolean} verseNewLine           - A switch to control whether every verse starts on its own line or not
 * @prop {boolean} fullBookName           - A switch to control whether the short or the full book name should be used
 * @prop {boolean} useOriginalBookName    - A switch to control whether the original book name should be used
 * @prop {boolean} translateBookName      - A switch to control whether a translated book name should be added
 * @prop {boolean} showTranslation        - A switch to control if the translation should be included in references
 * @prop {boolean} hideDefaultTranslation - A switch to control whether the translation is ommited, if it is the default translation
 * @prop {boolean} fullTranslationName    - A switch to control whether the short ID or the full name of a bible translation should be used
 * @prop {string}  cssClass               - The CSS class to apply to the outermost HTML element
 * @prop {string}  texQuoteEnvironment    - The TeX environment to use for block quotes
 */

const defaultFormat = {
	language: null,
	verseNewLine: false,
	fullBookName: false,
	useOriginalBookName: true,
	translateBookName: false,
	showTranslation: true,
	hideDefaultTranslation: false,
	fullTranslationName: false,
	cssClass: 'mdbible',
	texQuoteEnvironment: 'quote',
}

function formatCfg(opt, propName) {
	return _.get(opt, propName, _.get(defaultFormat, propName))
}

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
	 * Format the book name.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 * @param {boolean=}      alt     - A switch to activate formatting for an alternative book name
	 *
	 * @return {string} The formatted name of the book
	 */
	format(library, opt, alt) {
		const language = library.getLanguage(formatCfg(opt, 'language'))
		const d = language.delimiters
		const fullBookName = formatCfg(opt, 'fullBookName')
		if (alt)
			if (fullBookName)
				return d.altLongBookBegin + this.name + d.altLongBookEnd
			else
				return d.altBookBegin + this.shortName + d.altBookEnd
		else
			if (fullBookName)
				return d.longBookBegin + this.name + d.longBookEnd
			else
				return d.bookBegin + this.shortName + d.bookEnd
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
	 * Format the translation.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} The formatted name of the translation
	 */
	format(library, opt) {
		const language = library.getLanguage(formatCfg(opt, 'language'))
		const d = language.delimiters
		const fullTranslationName = formatCfg(opt, 'fullTranslationName')
		return `${d.translationBegin}${fullTranslationName ? this.name : this.shortName}${d.translationEnd}`
	}
}

/**
 * The location of a verse without the context of a bible book.
 */
class VerseLocation {

	/**
	 * @param {number}      chapterNo - The number of the chapter (one-based)
	 * @param {?number} verseNo   - The number of the verse (one-based), or null if he whole chapter is referenced
	 */
	constructor(chapterNo, verseNo) {
		/**
		 * @prop {number} chapterNo - The number of the chapter (one-based)
		 */
		this.chapterNo = chapterNo
		/**
		 * @prop {?number} verseNo - The number of the verse (one-based), or null if he whole chapter is referenced
		 */
		this.verseNo = verseNo
	}

	/**
	 * Checks whether the chapterNo matches the reference.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @return {boolean} true if this reference is pointing at the given chapter; otherwise false
	 */
	isChapterMatch(chapterNo) {
		return this.chapterNo === chapterNo
	}

	/**
	 * Checks whether the given chapterNo and verseNo matches the verse location.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @param {number} verseNo   - The number of the verse in question
	 * @return {boolean} true if the given chapterNo and verseNo matches the location; otherwise false
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
	 * Format the verse location.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} The formatted verse location
	 */
	format(library, opt) {
		const language = library.getLanguage(formatCfg(opt, 'language'))
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
	 * @param {?Translation} translation - The referenced bible translation
	 * @param {BookName}     bookName    - The name of the bible book
	 * @param {number}       chapterNo   - The number of the chapter (one-based)
	 * @param {number}       verseNo     - The number of the verse (one-based)
	 */
	constructor(translation, bookName, chapterNo, verseNo) {
		super(chapterNo, verseNo)
		/**
		 * @prop {?Translation} translation - The bible translation the reference is pointing at
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
	 * @return {boolean} true if the reference spans more than one chapter; otherwise false
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
	 * Format the reference.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} The formatted reference
	 */
	format(library, opt) {
		const language = library.getLanguage(formatCfg(opt, 'language'))
		const d = language.delimiters
		const primaryBookName = opt.primaryBookName || this.bookName
		const secondaryBookName = opt.secondaryBookName

		// book name(s)
		let txt = primaryBookName.format(library, opt)
		if (secondaryBookName)
			txt += d.altBookSeparator + secondaryBookName.format(library, opt, true)

		// verse location
		txt += ' ' + super.format(library, opt)

		// translation
		if (formatCfg(opt, 'showTranslation') && this.translation)
			txt += ' ' + this.translation.format(library, opt)

		return txt
	}
}

/**
 * The reference to a range of verses in a bible translation.
 *
 * A range of verses can only span over verses in one bible book.
 */
class ReferenceRange {

	/**
	 * @param {?Translation}  translation - The referenced bible translation
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
		 * @prop {?VerseLocation} to - The location of the last chapter or verse, or null if the range is open
		 */
		this.to = to
	}

	/**
	 * Checks whether the reference spans over more than one chapter
	 *
	 * @return {boolean} true if the reference spans more than one chapter; otherwise false
	 */
	multiChapter() {
		if (this.to == null && this.from.verseNo == null) return true
		return this.to != null && this.to.chapterNo > this.from.chapterNo
	}

	/**
	 * Checks whether the chapterNo matches the reference.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @return {boolean} true if this reference is pointing at the given chapter; otherwise false
	 */
	isChapterMatch(chapterNo) {
		return chapterNo >= this.from.chapterNo && (this.to == null || chapterNo <= this.to.chapterNo)
	}

	/**
	 * Checks whether the given chapterNo and verseNo matches the reference.
	 *
	 * @param {number} chapterNo - The number of the chapter in question
	 * @param {number} verseNo   - The number of the verse in question
	 * @return {boolean} true if the given chapterNo and verseNo matches the reference; otherwise false
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
	 * Format the reference range.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} The formatted reference range
	 */
	format(library, opt) {
		const language = library.getLanguage(formatCfg(opt, 'language'))
		const d = language.delimiters
		const primaryBookName = opt.primaryBookName || this.bookName
		const secondaryBookName = opt.secondaryBookName

		// book name(s)
		let txt = primaryBookName.format(library, opt)
		if (secondaryBookName) txt += d.altBookSeparator + secondaryBookName.format(library, opt, true)

		// verse location
		txt += ' '
		if (this.to == null)
			txt += this.from.format(library, opt) + d.andFollowing
		else if (this.from.chapterNo === this.to.chapterNo)
			txt += this.from.chapterNo + d.chapterToVerse + this.from.verseNo + d.verseRange + this.to.verseNo
		else
			txt += this.from.format(library, opt) + ' ' + d.chapterRange + ' ' + this.to.format(library, opt)

		// translation
		if (formatCfg(opt, 'showTranslation'))
			txt += ' ' + this.translation.format(library, opt)

		return txt
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
	 * Format the verse with reference and text.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} The formatted reference and the text of the verse
	 */
	format(library, opt) {
		return this.reference.format(library, opt) + ': ' + this.text
	}
}

/**
 * A bible chapter.
 */
class Chapter {
	/**
	 * @param {Reference} reference - The reference to this chapter
	 * @param {Array.<Verse>}    verses    - The verses in this chapter
	 */
	constructor(reference, verses) {
		/**
		 * @prop {Reference} reference - A reference to this chapter
		 */
		this.reference = reference
		/**
		 * @prop {Array.<Verse>} verses - An array with all verses in this chapter
		 */
		this.verses = verses
	}

	/**
	 * Format the chapter.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} A short description of the chapter
	 */
	format(library, opt) {
		const language = library.getLanguage(formatCfg(opt, 'language'))
		return this.reference.format(library, opt) + ' (' +
			_.size(this.verses) + ' '  + language.vocabulary.verses + ')'
	}
}

/**
 * A bible book.
 */
class Book {
	/**
	 * @param {Translation}     translation - The bible translation this book is from
	 * @param {BookName}        bookName    - The name of the bible book
	 * @param {Array.<Chapter>} chapters    - The chapters in this book
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
		 * @prop {Array.<Chapter>} chapters - An array with all chapters in the book
		 */
		this.chapters = chapters
	}

	/**
	 * Format the bible book.
	 *
	 * @param {Library}       library - The library to use for loading format resources
	 * @param {FormatOptions} opt     - An object with formatting options
	 *
	 * @return {string} A short description of the bible book
	 */
	format(library, opt) {
		return this.name.format(library, opt) + ' ' +
			this.translation.format(library, opt) + ' ' +
			_.size(this.chapters) + ' ' + language.vocabulary.chapters
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
	 * @return {Array.<Translation>} An array with the translations
	 */
	getTranslations() {
		throw new TypeError("The abstract method getTranslations is not implemented.")
	}

	/**
	 * Checks whether the source can load the given bible translation
	 *
	 * @abstract
	 * @param {string} translationShortName - The short name of the translation
	 * @return {boolean} true if the translation is available in the source; otherwise false
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
	 * @return {boolean} true if the book is available in the source; otherwise false
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
	 * @return {Array.<Translation>} An array with the translations
	 */
	getTranslations() {
		return this.getTranslationsFn()
	}

	/**
	 * Checks whether the source can load the given bible translation
	 *
	 * @param {string} translationShortName - The short name of the translation
	 * @return {boolean} true if the translation is available in the source; otherwise false
	 */
	hasTranslation(translationShortName) {
		return this.hasTranslationFn(translationShortName)
	}

	/**
	 * Checks whether the source can load the given bible book
	 *
	 * @param {string} translationShortName - The short name of the translation
	 * @param {string} bookId               - The technical ID of the book
	 * @return {boolean} true if the book is available in the source; otherwise false
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
	 * @param {string}                    langTag    - The IETF tag of the language
	 * @param {Delimiters}                delimiters - A map of delimiter strings
	 * @param {Vocabulary}                vocabulary - A map of word translations
	 * @param {Object.<string, BookName>} books      - A map of BookName objects, indexed by their short names
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
		 * @type {Array.<BibleSource>}
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
	 * @param {string}     langTag    - The IETF language tag of the language.
	 * @param {Delimiters} delimiters - An object with the reference delimiters
	 * @param {Vocabulary} vocabulary - An object with word translations
	 * @param {Array.<{id: string, shortName: string, name: string} >} - An array of objects representing the books with the attributes `id`, `shortName`, and `name`
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
	 * @param {{shortName: string, name: string, langTag: string}} translation - An object with the attributes `shortName`, `name`, `langTag`
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
	 * @return {?BookName} The book name or `null` if the book is unknown in the given language
	 */
	findBookName(bookId, langTag) {
		const l = this.getLanguage(langTag)
		if (l == null) return null
		return _.find(_.values(l.books), book => book.id === bookId) || null
	}

	/**
	 * Gets a registered translation by its short name
	 *
	 * @param {string} shortName - The short name of the translation
	 * @return {?Translation} The translation object or null if the translation is unknown
	 */
	getTranslation(shortName) {
		return this.translations[shortName] || null
	}

	/**
	 * Finds a registered translation by its short name.
	 * Returns the default translation if `shortName` is `null` or the given short name is unknown.
	 *
	 * @param {?string} shortName - The short name of the translation
	 * @return {Translation} The translation object or null if the translation is unknown
	 */
	findTranslation(shortName) {
		return this.translations[shortName] || this.translations[this.defaults.translation]
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
				this.getTranslation(m[4]),
				books[m[1]],
				parseInt(m[2]),
				null
			)
		}
		m = patterns.chapterAndFollowing.exec(s)
		if (m) {
			return new ReferenceRange(
				this.getTranslation(m[3]),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), null),
				null
			)
		}
		m = patterns.chapterRange.exec(s)
		if (m) {
			return new ReferenceRange(
				this.getTranslation(m[4]),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), null),
				new VerseLocation(parseInt(m[3]), null)
			)
		}
		m = patterns.verse.exec(s)
		if (m) {
			return new Reference(
				this.getTranslation(m[4]),
				books[m[1]],
				parseInt(m[2]),
				parseInt(m[3])
			)
		}
		m = patterns.verseAndFollowing.exec(s)
		if (m) {
			return new ReferenceRange(
				this.getTranslation(m[4]),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), parseInt(m[3])),
				null
			)
		}
		m = patterns.verseRange.exec(s)
		if (m) {
			return new ReferenceRange(
				this.getTranslation(m[5]),
				books[m[1]],
				new VerseLocation(parseInt(m[2]), parseInt(m[3])),
				new VerseLocation(parseInt(m[2]), parseInt(m[4]))
			)
		}
		m = patterns.range.exec(s)
		if (m) {
			return new ReferenceRange(
				this.getTranslation(m[6]),
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
	 * @return {?Book}
	 */
	loadBook(translation, bookName) {
		if (translation == null) return null
		if (bookName == null) return null
		const source = _.find(this.sources, s => s.hasBook(translation.shortName, bookName.id))
		if (source == null) return null
		return source.loadBook(translation, bookName)
	}

	/**
	 * Load the referenced verses.
	 * Returns `null` if the referenced translation and the default translation could not be found.
	 *
	 * @param {Reference|ReferenceRange} reference - The reference to load the verses for
	 * @return {?Array.<Verse>}
	 */
	loadVerses(reference) {
		const refTranslation = reference.translation ?
			reference.translation.shortName	:
			null
		const translation = this.findTranslation(refTranslation)
		if (!translation) {
			return null
		}
		const book = this.loadBook(translation,
			this.findBookName(reference.bookName.id, translation.langTag))
		if (book == null) return null
		const chapters = _.filter(book.chapters, c => reference.isChapterMatch(c.reference.chapterNo))
		return _.filter(
			_.flatten(_.map(chapters, c => c.verses)),
			v => reference.isVerseMatch(v.reference.chapterNo, v.reference.verseNo))
	}

	/**
	 * Creates tailored formatting options for formatting a reference as part of a quote
	 * @private
	 * @param {Reference|ReferenceRange} ref   - The requested reference
	 * @param {Reference}                exRef - An examplary reference from the loaded verses
	 * @param {Language}                 lang  - The language to use for formatting
	 * @param {FormatOptions=}           opt   - The formatting options from the caller
	 */
	setupQuoteSourceOptions(ref, exRef, lang, opt) {
		return {
			language: formatCfg(opt, 'language'),
			showTranslation: formatCfg(opt, 'showTranslation') &&
				(!formatCfg(opt, 'hideDefaultTranslation') || 
				 ref.translation.shortName !== exRef.translation.shortName),
			primaryBookName: formatCfg(opt, 'useOriginalBookName') ?
				exRef.bookName : this.findBookName(exRef.bookName.id, lang.langTag),
			secondaryBookName: exRef.bookName.langTag !== lang.langTag && formatCfg(opt, 'translateBookName') ?
				(formatCfg(opt, 'useOriginalBookName') ?
					this.findBookName(exRef.bookName.id, lang.langTag) :
					exRef.bookName) :
				null,
			fullBookName: formatCfg(opt, 'fullBookName'),
			fullTranslationName: formatCfg(opt, 'fullTranslationName'),
		}
	}

	/**
	 * @param {Reference|ReferenceRange} reference - The reference, which was used to load the verses
	 * @param {Array.<Verse>}            verses    - The verses to format
	 * @param {FormatOptions=}           opt       - An object with formatting options
	 * @return {string} The verses as citation block in Pandoc-Markdown
	 */
	toMarkdown(reference, verses, opt) {
		if (_.isEmpty(verses)) return null
		const exampleVerse = verses[0]
		const exampleReference = exampleVerse.reference
		const l = this.getLanguage(formatCfg(opt, 'language') || exampleReference.translation.langTag)
		const quoteSrcOpt = this.setupQuoteSourceOptions(reference, exampleReference, l, opt)
		const vnl = formatCfg(opt, 'verseNewLine')
		const lines = []
		let firstContent = true
		let cNo = _.size(_.groupBy(verses, v => v.reference.chapterNo)) > 1 ?
			 null :
			 exampleReference.chapterNo
		_.forEach(verses, function (v) {
			const r = v.reference
			if (cNo !== r.chapterNo) {
				cNo = r.chapterNo
				if (!firstContent) lines.push('')
				lines.push('**' + l.vocabulary.chapter + ' ' + cNo + '**')
				lines.push('')
			}
			lines.push('^' + r.verseNo + '^ ' + v.text.trim() + (vnl ? '  ' : ''))
			firstContent = false
		});
		lines.push('')
		lines.push('_' + reference.format(this, quoteSrcOpt) + '_')
		return _.join(_.map(lines, l => '> ' + l), os.EOL)
	}

	/**
	 * @param {Reference|ReferenceRange} reference - The reference, which was used to load the verses
	 * @param {Array.<Verse>}            verses    - The verses to format
	 * @param {FormatOptions=}           opt       - An object with formatting options
	 * @return {string} The verses as citation block in HTML5
	 */
	toHTML(reference, verses, opt) {
		if (_.isEmpty(verses)) return null
		const exampleVerse = verses[0]
		const exampleReference = exampleVerse.reference
		const l = this.getLanguage(formatCfg(opt, 'language') || exampleReference.translation.langTag)
		const quoteSrcOpt = this.setupQuoteSourceOptions(reference, exampleReference, l, opt)
		const vnl = formatCfg(opt, 'verseNewLine')
		const cssClass = formatCfg(opt, 'cssClass')
		const lines = []
		let cNo = _.size(_.groupBy(verses, v => v.reference.chapterNo)) > 1 ?
			null :
			exampleReference.chapterNo
		let firstContent = true
		let firstVerse = true
		if (cssClass) {
			lines.push('<blockquote class="' + cssClass + '">')
		} else {
			lines.push('<blockquote>')
		}
		_.forEach(verses, function (v) {
			const r = v.reference
			if (cNo !== r.chapterNo) {
				cNo = r.chapterNo
				if (!firstContent) lines.push('</p>')
				lines.push('<p class="mdbible-chapter-headline">')
				lines.push('<strong>' + l.vocabulary.chapter + ' ' + cNo + '</strong>')
				lines.push('</p>')
				if (!firstContent) lines.push('<p>')
				firstVerse = true
			}
			if (firstContent) {
				lines.push('<p>')
				firstContent = false
			}
			lines.push(((vnl && !firstVerse) ? '<br>' : '') +
				'<sup>' + r.verseNo + '</sup>' + v.text.trim())
			firstVerse = false
		})
		lines.push('</p>')
		lines.push('<cite>' + reference.format(this, quoteSrcOpt) + '</cite>')
		lines.push('</blockquote>')
		return _.join(lines, os.EOL)
	}

	/**
	 * @param {Reference|ReferenceRange} reference - The reference, which was used to load the verses
	 * @param {Array.<Verse>}            verses    - The verses to format
	 * @param {FormatOptions=}           opt       - An object with formatting options
	 * @return {string} The verses as citation block in LaTeX
	 */
	toLaTeX(reference, verses, opt) {
		if (_.isEmpty(verses)) return null
		const exampleVerse = verses[0]
		const exampleReference = exampleVerse.reference
		const l = this.getLanguage(formatCfg(opt, 'language') || exampleReference.translation.langTag)
		const quoteSrcOpt = this.setupQuoteSourceOptions(reference, exampleReference, l, opt)
		const vnl = formatCfg(opt, 'verseNewLine')
		const env = formatCfg(opt, 'texQuoteEnvironment')
		const lines = []
		let firstVerse = true
		let cNo = _.size(_.groupBy(verses, v => v.reference.chapterNo)) > 1 ?
			null :
			exampleReference.chapterNo
		lines.push('\\begin{' + env + '}')
		_.forEach(verses, function (v) {
			const r = v.reference
			if (cNo !== r.chapterNo) {
				cNo = r.chapterNo
				lines.push('\\textbf{' + l.vocabulary.chapter + ' ' + cNo + '}')
				lines.push('')
				firstVerse = true
			}
			lines.push(((vnl && !firstVerse) ? '\\newline' : '') +
				'\\textsuperscript{' + r.verseNo + '}' + v.text.trim())
			firstVerse = false
		})
		lines.push('')
		lines.push('\\begin{flushright}')
		lines.push('\\emph{' + reference.format(this, quoteSrcOpt) + '}')
		lines.push('\\end{flushright}')
		lines.push('\\end{' + env + '}')
		return _.join(lines, os.EOL)
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
