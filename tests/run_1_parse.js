'use strict';



var inkdoc = require('../lib/index');



var files = [
    '../lib/parseComments.js',
    '../lib/generateMarkup.js'
];

/*var files = [
    './test1.js'
];*/



inkdoc.parseComments(files, function(err, root) {
    if (err) { return console.log(err); }

    console.log( JSON.stringify(root, null, '\t') );
});
