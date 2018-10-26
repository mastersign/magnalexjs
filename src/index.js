/**
 * The MagnaLex module defines a set of classes to represent
 * bible translations with its books, chapters and verses.
 *
 * Additionally it provides an interface to register bible sources for loading bible translations.
 *
 * There are different variations of verse numbering throughout the bible translations.
 * Therefore, MagnaLex always couples a book-chapter-verse reference with a translation
 * to be precise about the verse numbering.
 *
 * @module magnalex
 */

const fs = require('fs')
const core = require('./core')
const _ = require('lodash')

/**
 * Creates a {@link BibleSource} capable of loading XML bible translations in node packages from the given root directory.
 *
 * Every translation resides in a folder called `xmlbible-<Translation ID>`.
 * Its `package.json` has an attribute `xmlbible` with the following structure:
 *
 * ```
 * {
 *    "name": "<Full name of the bible translation>",
 *    "shortName": "<ID of the bible translation>",
 *    "language": "<IETF language tag of the translation>",
 *    "rootPath": "<Relative path to the folder with XML files>"
 * }
 * ```
 *
 * @param {string} id        - An ID for the bible source
 * @param {string} sourceDir - The root dir to search for bible translations
 * @function
 */
const xmlBibleSource = require('./xmlBibleSource')

/**
 * Create a new library with bible translations.
 *
 * @param {string=} rootPath - The root directory for XML Bible node packages.
 * @return {Library}
 */
function library (rootPath) {
	const lib = new core.Library()
	const libPath = rootPath || 'node_modules'
	if (fs.existsSync(libPath)) {
		const source = xmlBibleSource('default', libPath)
		lib.registerSource(source)
	}
	return lib
}

module.exports = _.merge({
	library: library,
	xmlBibleSource: xmlBibleSource,
}, core)
