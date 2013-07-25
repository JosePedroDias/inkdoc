'use strict';

var fs            = require('fs'),
    CommentStream = require('./CommentStream');



//var originalTokens = {}; // by file



var root = {
    kind: 'root',
    modules: {}
};

var pending = 0;



var removeCommentLineStart = function(s) {
    var l = s.length;
    var c;
    for (var i = 0; i < l; ++i) {
        c = s[i];
        if (c !== ' ' && c !== '\t') { break; }
    }
    if (c !== '*') {
        return s.substring(i);
    }
    ++i;
    c = s[i];
    if (c === ' ') { ++i; }
    return s.substring(i);
};



var wrgx = /( \t)*\*\//;
var beautify = function(t) {
    t = t.split('\n');
    var l = t.length;

    var T = t[0];
    if (T === '/**') { t.shift(); --l; }
    else { t[0] = T.substring(3); }

    T = t[l-1];
    if (wrgx.test(T)) { t.pop(); --l; }
    else { t[l-1] = T.substring(0, T.length - 2); }

    for (var i = 0; i < l; ++i) {
        t[i] = removeCommentLineStart(t[i]);
    }
    return t.join('\n');
    //return '[' + t.join(']\n[') + ']';
};



var trgx = /(@[a-z]+)/gm;
var tokenifyComment = function(s) {
    /*jshint boss:true */
    var t = [];
    var m, token;
    var i = 0;
    trgx.lastIndex = 0;
    while (m = trgx.exec(s)) {
        token = m[1];
        if (i !== m.index) {
            t.push( s.substring(i, m.index) );
        }
        t.push(token);
        i = m.index + token.length;
        //console.log(m[1], m.index);
    }
    t.push( s.substring(i) );

    return t;
};



var tokenizeFile = function(sourcePath, cb) {
    var rs = fs.createReadStream(sourcePath, {flags:'r'});
    var cs = CommentStream(rs);

    var tokens = [];

    cs.on('error', function(err) {
        cb(err || 'error');
    });

    cs.on('comment', function(c) {
        if (c.text[2] !== '*') { return; }
        //console.log('-->');
        var t = beautify(c.text);
        //console.log( t );
        //console.log( tokenifyComment(t) );
        tokens = tokens.concat( tokenifyComment(t) );
    });

    cs.on('end', function() {
        cb(null, tokens);
    });
};



// {type} [name] desc
var paramrgx = /(\{[^\}]*\})?\s*(\S+)\s*(.*)/;
var paramnamergx = /([^=]+)(=(.+))?/;
var returnrgx = /(\{[^\}]*\})?\s*(.*)/;


var booleanTag = function(parent, tokens, tIdx) {
    var t = tokens[tIdx];
    parent[ t.value ] = true;
};

var propertyTag = function(parent, tokens, tIdx) {
    var reqTokens = tokens.splice(tIdx, 2);
    var prop = reqTokens[0].value;
    var value = reqTokens[1].value.trim();
    parent[ prop ] = value;
};

/**
 * a strategy receives an array of tokens it changes in-place, the cursor position and length
 */
var strategy = {
    module: function(parent, tokens, tIdx) {
        var i, t, start, end, name;


        // fetch previous tokens
        i = tIdx;
        do {
            --i;
            t = tokens[i];
        } while (t); 
        start = i + 1;

        
        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw 'module without name?';
        }
        name = t.value.trim();


        // until end or other module
        i = tIdx;
        do {
            ++i;
            t = tokens[i];
        } while (t && !(t.kind === 'tag' && t.value === 'module')); 
        end = i - 1;


        // remove children from tokens
        var tokensToProcess = tokens.splice(start, end - start + 1);


        // create token
        t = reqTokens[0];
        var o = {
            kind: 'module',
            name: name,
            file: t.file,
            classes: {}
        };
        parent.modules[ name ] = o;


        // parse children
        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, ['author', 'version', 'since']);
        }.bind(o, tokensToProcess));

        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, 'class');
        }.bind(o, tokensToProcess));

        /*process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens);
        }.bind(o, tokensToProcess));*/
    },

    class: function(parent, tokens, tIdx) {
        var i, t, start, end, name, text;


        // get text
        text = tokens[tIdx - 1];
        text = (!text || text.kind !== 'text') ? undefined : text.value.trim();


        // fetch previous text tokens
        i = tIdx;
        do {
            --i;
            t = tokens[i];
        } while (t && t.kind === 'text');
        start = i + 1;


        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw 'class without name?';
        }
        name = t.value.trim();


        // until end or other class
        i = tIdx;
        do {
            ++i;
            t = tokens[i];
        } while (t && !(t.kind === 'tag' && t.value === 'class')); 
        end = i - 1;


        // remove children from tokens
        var tokensToProcess = tokens.splice(start, end - start + 1);

        
        // create token
        t = reqTokens[0];
        var o = {
            kind: 'class',
            name: name,
            file: t.file,
            text: text,
            methods: {}
        };
        parent.classes[ name ] = o;


        // parse children
        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, ['example', 'method']);
        }.bind(o, tokensToProcess));
    },

    method: function(parent, tokens, tIdx) {
        var i, t, start, end, name, text;


        // get text
        text = tokens[tIdx - 1];
        text = (!text || text.kind !== 'text') ? undefined : text.value.trim();


        // fetch previous text tokens
        i = tIdx;
        do {
            --i;
            t = tokens[i];
        } while (t && t.kind === 'text');
        start = i + 1;


        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw 'method without name?';
        }
        name = t.value.trim();


        // until end or other class
        i = tIdx;
        do {
            ++i;
            t = tokens[i];
        } while (t && !(t.kind === 'tag' && t.value === 'method')); 
        end = i - 1;


        // remove children from tokens
        var tokensToProcess = tokens.splice(start, end - start + 1);

        
        // create token
        var o = {
            kind: 'method',
            name: name,
            text: text,
            params: []
        };
        parent.methods[ name ] = o;


        // parse children
        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, ['example', 'param', 'return', 'async']);
        }.bind(o, tokensToProcess));
    },

    param: function(parent, tokens, tIdx) {
        var t, stuff;


        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw 'param without content?';
        }
        stuff = t.value.trim();
        stuff = paramrgx.exec(stuff);
        var type = stuff[1] || undefined;
        var desc = stuff[3] || undefined;
        stuff = stuff[2];
        var isOptional = stuff[0] === '[';
        if (isOptional) {
            stuff = stuff.substring(1, stuff.length - 1);
        }
        stuff = paramnamergx.exec(stuff);
        var name = stuff[1];
        var defaultValue = stuff[3] || undefined;
        

        // create token
        var o = {
            kind:        'param',
            name:         name,
            type:         type,
            isOptional:   isOptional,
            defaultValue: defaultValue,
            description:  desc
        };
        parent.params.push(o);
    },

    'return': function(parent, tokens, tIdx) {
        var t, stuff;


        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw 'return without content?';
        }
        stuff = t.value.trim();
        stuff = returnrgx.exec(stuff);
        var type = stuff[1] || undefined;
        var desc = stuff[2] || undefined;

    
        // create token
        var o = {
            kind:        'return',
            type:         type,
            description:  desc
        };
        parent['return'] = o;
    },

    example: function(parent, tokens, tIdx) {
        if (!('examples' in parent)) {
            parent.examples = [];
        }

        var reqTokens = tokens.splice(tIdx, 2);
        //var markup = reqTokens[1].value.trim();
        var markup = reqTokens[1].value;
        parent.examples.push(markup);
    },

    // booleans
    async: booleanTag,

    // properties
    version: propertyTag,
    author: propertyTag,
    since: propertyTag
};



var reduceTokens = function reduceTokens(parent, tokens, tokenValue) {
    var t, i;

    /*if (typeof tokenValue === 'number') {
        var text = tokens[tokenValue];
        text = (!text || text.kind !== 'text') ? undefined : text.value.trim();
        if (text) {
            parent.text = text;
            --pending;
            return;
        }
    }*/

    if (tokenValue instanceof Array) {
        while (true) {
            for (i = 0; ; ++i) {
                t = tokens[i];
                if (!t) {
                    --pending;
                    return;
                }
                if (t.kind === 'tag' && tokenValue.indexOf(t.value) !== -1) {
                    strategy[t.value](parent, tokens, i);
                }
            }
        }
    }

    var strat = strategy[tokenValue];

    while (true) {
        for (i = 0; ; ++i) {
            t = tokens[i];
            if (!t) {
                --pending;
                return;
            }
            if (t.kind === 'tag' && t.value === tokenValue) {
                strat(parent, tokens, i);
            }
        }
    }
};



/*var countTokens = function(tokens) {
    var t;
    for (var i = 0, f = tokens.length; i < f; ++i) {
        t = tokens[i];
        var v;
        if (t[0] === '@') {
            v = root[t];
            root[t] = (!v) ? 1 : v + 1;
        }
    }
};*/



var parseComments = function(sourcePath, cb) {
    tokenizeFile(sourcePath, function(err, tokens) {
        if (err) { return cb(err); }


        //console.log(tokens); return;


        // count tokens
        //countTokens(tokens);



        // basic classification of tokens
        var i, f, t;
        for (i = 0, f = tokens.length; i < f; ++i) {
            t = tokens[i];
            var v;
            if (t[0] === '@') {
                v = {kind:'tag', value:t.substring(1), file:sourcePath, index:i};
            }
            else {
                v = {kind:'text', value:t, file:sourcePath};
            }
            tokens[i] = v;
        }



        //console.log(tokens); return;

        //originalTokens[sourcePath] = tokens.slice(); // to fetch text stuff afterwards
        //console.log(tokens);
        
        
        ++pending;
        reduceTokens(root, tokens, 'module');


        //console.log( JSON.stringify( root , null, '\t') );



        cb(null);
    });
};



/**
 * @function parseCommentsOfFilePaths
 * @param  {Array} files file paths of files to parse
 * @param  {Function} cb called with regular err, root object syntax
 * @async
 */
var parseCommentsOfFilePaths = function(files, cb) {

    var timer;

    var parseOneFile = function parseOneFile() {
        var sourcePath = files.shift();
        if (!sourcePath) {
            return;
        }

        //console.log('parsing ' + sourcePath + '...');
        parseComments(sourcePath, function(err) {
            if (err) {
                clearInterval(timer);
                return cb(err);
            }

            parseOneFile();
        });
    };



    timer = setInterval(function() {
        //console.log('TIMER', pending);
        if (pending === 0) {
            clearInterval(timer);
            //console.log( JSON.stringify(root, null, '\t') );
            
            //root = JSON.parse( JSON.stringify(root) );

            cb(null, root);
        }
    }, 100);



    parseOneFile();
};



module.exports = parseCommentsOfFilePaths;
