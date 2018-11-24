@ECHO OFF
CALL jsdoc --configure "%~dp0..\jsdoc.conf.json"
CALL node "%~dp0movedocs.js"
