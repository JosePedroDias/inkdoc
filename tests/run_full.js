'use strict';



var fs      = require('fs'),
    inkdoc  = require('../lib/index');



var files = [
    '../lib/parseComments.js',
    '../lib/generateMarkup.js'
];

/*var files = [
    './test1.js'
];*/



console.log('parsing files into metadata...');
inkdoc.parseComments(files, function(err, root) {
    if (err) { return console.log(err); }

    console.log('generating markup...');

    fs.writeFile('docs.json', JSON.stringify(root, null, '\t'));
    
    inkdoc.generateMarkup(root, function(err, markup) {
        if (err) { return console.log(err); }

        fs.writeFile('docs.html', markup, function(err) {
            if (err) { return console.log(err); }

            console.log('all done.');
        });
    });
});
