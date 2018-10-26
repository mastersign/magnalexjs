const path = require('path')
const fs = require('fs')
const _ = require('lodash')
const xmldom = require('xmldom')
const core = require('./core')

const NODE_TYPE_TEXT = 3

function isDirectory(source) {
	return fs.lstatSync(source).isDirectory()
}

function getSubFolders(folderPath) {
  	return _.filter(
  		_.map(fs.readdirSync(folderPath), name => path.join(folderPath, name)),
  		isDirectory)
}

module.exports = function(id, sourceDir) {

	let cachedTranslations;

	const loadXmlBibleInfo = _.memoize(function(packagePath) {
		const jsonText = fs.readFileSync(path.join(packagePath, 'package.json'), {encoding: 'utf-8',})
		const packageInfo = JSON.parse(jsonText)
		return packageInfo.xmlbible
	})

	function getTranslationInfos() {
		return _.filter(
			_.map(
				_.filter(
					getSubFolders(sourceDir),
					d => path.basename(d).startsWith('xmlbible-')),
				loadXmlBibleInfo))
	}

	function getTranslations() {
		if (cachedTranslations == null) {
			cachedTranslations = _.map(
				getTranslationInfos(),
				info => new core.Translation(info.shortName, info.name, info.language))
		}
		return cachedTranslations
	}

	function translationPath(translationShortName) {
		const packagePath = path.join(sourceDir, 'xmlbible-' + _.toLower(translationShortName))
		const info = loadXmlBibleInfo(packagePath)
		return path.join(packagePath, info.rootPath)
	}

	function bookPath(translationShortName, bookId) {
		return path.join(translationPath(translationShortName), bookId + '.xml')
	}

	function hasTranslation(translationShortName) {
		return fs.existsSync(translationPath(translationShortName))
	}

	function hasBook(translationShortName, bookId) {
		return fs.existsSync(bookPath(translationShortName, bookId))
	}

	function loadBook(translation, bookName) {
		const filename = bookPath(translation.shortName, bookName.id)
		const xmltext = fs.readFileSync(filename, {encoding: 'utf-8',})
		const dom = new xmldom.DOMParser().parseFromString(xmltext, 'text/xml')

		const eBible = dom.documentElement
		const books = eBible.getElementsByTagName('BIBLEBOOK')
		if (books.length !== 1) {
			console.log("WARNING: XML Bible Book file contains more than one book.")
			console.log("    " + filename)
			return null
		}
		const eBook = books.item(0)

		function buildVerse(chapterRef, eVerse) {
			const text = _.join(
				_.map(
					_.filter(
						eVerse.childNodes,
						n => n.nodeType === NODE_TYPE_TEXT),
					n => n.textContent),
				' ')
			const verseNo = parseInt(eVerse.getAttribute('vnumber'))
			const verseRef = new core.Reference(
				chapterRef.translation, chapterRef.bookName, chapterRef.chapterNo, verseNo)
			return new core.Verse(verseRef,	text)
		}

		function buildChapter(translation, bookName, eChapter) {
			const chapterNo = parseInt(eChapter.getAttribute('cnumber'))
			const chapterRef = new core.Reference(translation, bookName, chapterNo, null)
			return new core.Chapter(
				chapterRef,
				_.sortBy(
					_.map(
						eChapter.getElementsByTagName('VERS'),
						eVerse => buildVerse(chapterRef, eVerse)),
					verse => verse.reference.verseNo))
		}

		return new core.Book(translation, bookName,
			_.sortBy(
				_.map(
					eBook.getElementsByTagName('CHAPTER'),
					eChapter => buildChapter(translation, bookName, eChapter)),
				chapter => chapter.reference.chapterNo))
	}

	return new core.FunctionalBibleSource(id, 'Node Package XML Bible Reader',
		getTranslations, hasTranslation, hasBook, loadBook)
}
