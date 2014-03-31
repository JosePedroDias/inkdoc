'use strict';



var parseComments    = require('./parseComments'),
    prepareStructure = require('./prepareStructure'),
    generateMarkup   = require('./generateMarkup');



module.exports = {
    parseComments:    parseComments,
    prepareStructure: prepareStructure,
    generateMarkup:   generateMarkup,

    defaultConfiguration: {
        templatesDir:                      __dirname + '/../templates',
        outputDir:                         '.',
        sourceDir:                         '.',

        jsonFile:                          'docs.json',
        markupFile:                        'index.html',
        identifiersFile:                   'identifiers.json',

        sourceFiles:                       [],
        title:                             'Documentation',
        template:                          'single-page',

        debug:                             true,
        sortChildren:                      true,
        ommitPrivates:                     true,
        treatUnderscorePrefixesAsPrivates: true,
        skipJSON:                          false,
        skipMarkup:                        false,
        skipIdentifiers:                   false
    }
};
