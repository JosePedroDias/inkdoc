'use strict';



var parseComments  = require('./parseComments'),
    generateMarkup = require('./generateMarkup');



module.exports = {
    parseComments:  parseComments,
    generateMarkup: generateMarkup,
    defaultConfiguration: {
        templatesDir:                      __dirname + '/../templates',
        outputDir:                         '.',
        sourceDir:                         undefined,

        jsonFile:                          'docs.json',
        markupFile:                        'docs.html',

        sourceFiles:                       [],
        title:                             'Documentation',
        template:                          'single-page',
        sortChildren:                      true,
        ommitPrivates:                     true,
        treatUnderscorePrefixesAsPrivates: true,
        skipJSON:                          false,
        skipMarkup:                        false
    }
};
