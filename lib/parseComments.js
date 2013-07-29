'use strict';

/**
 * @module parseComments
 */

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
        var text = beautify(c.text);
        var newTokens = tokenifyComment(text);
        for (var i = 0, f = newTokens.length; i < f; ++i) {
            newTokens[i] = {
                value: newTokens[i],
                line:  c.line + 1
            };
        }
        tokens = tokens.concat(newTokens);
    });

    cs.on('end', function() {
        cb(null, tokens);
    });
};



var tokenError = function(t, error) {
    return [t.file, ' line ', t.line, ': Token @', t.tagName, ' ', error].join('');
};



// {type} [name] desc
var paramrgx = /(\{[^\}]*\})?\s*(\S+)\s*(.*)/;
var paramnamergx = /([^=]+)(=(.+))?/;
var returnrgx = /(\{[^\}]*\})?\s*(.*)/;

var tagAliases = {
    'constructor': 'function',
    'method':      'function',
    'property':    'attribute',
    'returns':     'return',
    'variable':    'attribute'
};


var booleanTag = function(parent, tokens, tIdx) {
    var t = tokens.splice(tIdx, 1)[0];
    parent[ t.value ] = true;
};

var propertyTag = function(parent, tokens, tIdx) {
    var t = tokens.splice(tIdx, 1)[0];
    parent[ t.value ] = t.text.trim();
};


/**
 * a strategy receives an array of tokens it changes in-place, the cursor position and length
 */
var strategy = {
    'module': function(parent, tokens, tIdx) {
        var i, t, start, end, name, text;


        // get text
        text = tokens[tIdx - 1];
        text = (!text || text.kind !== 'text') ? undefined : text.value.trim();


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
            throw tokenError(t, 'without name?');
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
            text: text,
            file: t.file,
            classes: {},
            functions: {},
            attributes: {}
        };
        parent.modules[ name ] = o;


        // parse children
        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, ['author', 'version', 'since']);
        }.bind(o, tokensToProcess));

        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, 'class', 'function', 'attribute');
        }.bind(o, tokensToProcess));
    },

    'class': function(parent, tokens, tIdx) {
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
            throw tokenError(t, 'without name?');
        }
        name = t.value.trim();


        // until end or other class
        i = tIdx;
        do {
            ++i;
            t = tokens[i];
        } while (t && !(t.kind === 'tag' && (t.value === 'class' || t.value === 'module'))); 
        end = i - 1;


        // remove children from tokens
        var tokensToProcess = tokens.splice(start, end - start + 1);

        
        // create token
        t = reqTokens[0];
        var o = {
            kind: 'class',
            name: name,
            text: text,
            file: t.file,
            functions: {},
            attributes: {}
        };
        parent.classes[ name ] = o;


        // parse children
        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, ['example', 'function', 'attribute']);
        }.bind(o, tokensToProcess));
    },

    'function': function(parent, tokens, tIdx) {
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
            throw tokenError(t, 'without name?');
        }
        name = t.value.trim();


        // until end or other class
        i = tIdx;
        do {
            ++i;
            t = tokens[i];
        } while (t && !(t.kind === 'tag' && (t.value === 'function' || t.value === 'class' || t.value === 'module'))); 
        end = i - 1;


        // remove children from tokens
        var tokensToProcess = tokens.splice(start, end - start + 1);

        
        // create token
        var o = {
            kind: 'function',
            name: name,
            text: text,
            params: []
        };
        parent.functions[ name ] = o;


        // parse children
        process.nextTick(function(tokens) {
            ++pending;
            reduceTokens(this, tokens, ['example', 'param', 'return', 'async']);
        }.bind(o, tokensToProcess));
    },

    'param': function(parent, tokens, tIdx) {
        var t, stuff;


        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw tokenError(t, 'without content?');
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
            throw tokenError(t, 'without content?');
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

    'attribute': function(parent, tokens, tIdx) {
        var t, stuff;


        // extract own tag and its name
        var reqTokens = tokens.splice(tIdx, 2);
        t = reqTokens[1];
        if (!t || t.kind !== 'text') {
            throw tokenError(t, 'without content?');
        }
        stuff = t.value.trim();
        stuff = paramrgx.exec(stuff);
        var type = stuff[1] || undefined;
        var desc = stuff[3] || undefined;
        stuff = paramnamergx.exec(stuff[2]);
        var name = stuff[1];
        var defaultValue = stuff[3] || undefined;
        

        // create token
        var o = {
            kind:        'attribute',
            name:         name,
            type:         type,
            defaultValue: defaultValue,
            description:  desc
        };
        parent.attributes[name] = o;
    },

    'example': function(parent, tokens, tIdx) {
        if (!('examples' in parent)) {
            parent.examples = [];
        }

        var reqTokens = tokens.splice(tIdx, 2);
        var markup = reqTokens[1].value;
        parent.examples.push(markup);
    },

    // booleans
    'async': booleanTag,

    // properties
    'author': propertyTag,
    'since': propertyTag,
    'version': propertyTag
};



var reduceTokens = function reduceTokens(parent, tokens, tokenValue) {
    var t, i;

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



var parseComments = function(sourcePath, cb) {
    tokenizeFile(sourcePath, function(err, tokens) {
        if (err) { return cb(err); }


        //console.log(tokens); return;


        // basic classification of tokens
        var i, f, t, t2, tagName;
        for (i = 0, f = tokens.length; i < f; ++i) {
            t = tokens[i];
            var v = t.value;
            if (v[0] === '@') {
                tagName = v.substring(1);
                t.tagName = tagName;

                // replace aliases
                t2 = tagAliases[tagName];
                t.value = t2 ? t2 : tagName;

                t.kind = 'tag';
            }
            else {
                t.kind = 'text';
            }
            t.file = sourcePath;
        }


        // group property tags first
        var propertyTags = ['author', 'example', 'since', 'version'];
        for (i = 0; i < f; ++i) {
            t = tokens[i];
            if (t.kind === 'tag' && propertyTags.indexOf(t.value) !== -1) {
                t2 = tokens[i+1];
                if (t2.kind !== 'text') {
                    throw tokenError(t, ' without content?');
                }
                t.text = t2.value;
                tokens.splice(i+1, 1);
                --f;
            }
        }


        //console.log(tokens); return;
       
        
        ++pending;
        reduceTokens(root, tokens, 'module');


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
