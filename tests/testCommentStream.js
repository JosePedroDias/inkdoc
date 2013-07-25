var CommentStream = require('../lib/CommentStream'),
    fs            = require('fs');


var rs = fs.createReadStream('./testCsSampleDoc.js', {flags:'r'});
var cs = CommentStream(rs);
//var cs = CommentStream(rs, '/**');



cs.on('comment', function(c) {
    console.log(['\nCOMMENT @ L', c.line+1, ', C', c.column+1, ' (I', c.index, '):\n', c.text].join(''));
});
cs.on('non-comment', function(c) {
    console.log(['\nNON-COMMENT @ L', c.line+1, ', C', c.column+1, ' (I', c.index, '):\n', c.text].join(''));
});
cs.on('end', function() {
    console.log('END');
});
