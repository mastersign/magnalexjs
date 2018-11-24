/** globals require */

const path = require('path')
const fs = require('fs')
const del = require('del').sync

const packageInfo = require('../package.json')
const projectName = packageInfo.name
const version = packageInfo.version

const docsRoot = path.join(__dirname, '..', 'docs')
const docsSource = path.join(docsRoot, projectName)
const srcDir = path.join(docsSource, version)
const trgDir = path.join(docsRoot, version)
const redirectFile = path.join(docsRoot, 'index.html')

if (fs.existsSync(trgDir)) del(trgDir)

if (!fs.existsSync(srcDir)) {
	console.log('Source directory not found:')
	console.log('  ' + srcDir)
	exit(1)
}

fs.renameSync(srcDir, trgDir)
del(docsSource)

const redirect = '<!DOCTYPE html>\n<html><head><meta http-equiv="refresh" content="0;url=\'' + version + '/index.html\'"></head><body></body></html>'
fs.writeFileSync(redirectFile, redirect)
