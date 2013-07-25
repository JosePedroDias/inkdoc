'use strict';



var generateMarkup = require('../lib/generateMarkup');



// read metadata JSON from STDIN
process.stdin.resume();
process.stdin.setEncoding('utf8');

var data = [];

process.stdin.on('data', function(chunk) {
    data.push( chunk.toString() );
});

process.stdin.on('end', function() {
    data = data.join('');
    var root = JSON.parse(data);

    generateMarkup(root, function(err, markup) {
        if (err) { return console.log(err); }

        process.stdout.write(markup);
    });
});
