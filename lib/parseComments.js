'use strict';

/*
 * @module parseComments
 *
 * @author jose.pedro.dias AT gmail.com
 * @since July 2013
 */

var fs      = require('fs'),
    esprima = require('esprima');



var pending = 0;



var root = {
    kind:       'module',
    modules:    {},
    classes:    {},
    functions:  {},
    attributes: {}
};



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



var wRgx = /^( \t)*\*\/$/m;
var beautify = function(t) {
    t = t.split('\n');
    var l = t.length;

    var T = t[0];
    if (T === '/**') { t.shift(); --l; }
    else { t[0] = T.substring(3); }

    T = t[l-1];
    if (wRgx.test(T)) { t.pop(); --l; }
    else { t[l-1] = T.substring(0, T.length - 2); }

    for (var i = 0; i < l; ++i) {
        t[i] = removeCommentLineStart(t[i]);
    }
    return t.join('\n');
    //return '[' + t.join(']\n[') + ']';
};



var tRgx = /(@[a-zA-Z]+)/gm;
var tokenifyComment = function(s) {
    /*jshint boss:true */
    var t = [];
    var m, token;
    var i = 0;
    tRgx.lastIndex = 0;
    while (m = tRgx.exec(s)) {
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
    fs.readFile(sourcePath, {encoding:'utf8'}, function(err, source) {
        if (err) { return cb(err); }

        // request comment toekns from esprima
        var tmp = esprima.parse(
            source.toString('utf8'), 
            {
                tokens:  true,
                comment: true,
                loc:     true
            }
        ).comments;

        // get only the block comments, keeping track of starting line number
        var i, f, t, tokens = [];
        for (i = 0, f = tmp.length; i < f; ++i) {
            t = tmp[i];
            if (t.type !== 'Block' || t.value[0] !== '*') { continue; }
            tokens.push({
                value: ['/*', t.value, '*/'].join(''),
                line:  t.loc.start.line
            });
        }

        // tokenify stuff based on tag presence
        var I, F, text, tokens2 = [], newTokens;
        for (i = 0, f = tokens.length; i < f; ++i) {
            t = tokens[i];
            text = beautify( t.value ); // remove asterisks and irrelevant whitespace
            newTokens = tokenifyComment(text); // split based on tags or not
            for (I = 0, F = newTokens.length; I < F; ++I) { // recover line information
                newTokens[I] = {
                    value: newTokens[I],
                    line:  t.line
                };
            }
            tokens2 = tokens2.concat(newTokens);
        }

        cb(null, tokens2);
    });
};



var identRgx = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;
var composedIdentRgx = /^([a-zA-Z$_][a-zA-Z0-9$_]*)(\.([a-zA-Z$_][a-zA-Z0-9$_]*))*$/;

var paramRgx = /^(\{[^\}]*\})?\s*(\S+)\s*(.*)$/m;
var returnRgx = /^(\{[^\}]*\})?\s*(.*)$/m;
var paramNameRgx = /^([^=]+)(=(.+))?$/;

var tagAliases = {
    'method':      'function',
    'property':    'attribute',
    'returns':     'return',
    'variable':    'attribute'
};



var parseComments = function(sourcePath, cb) {
    ++pending;

    tokenizeFile(sourcePath, function(err, tokens) {
        if (err) { return cb(err); }

        //try {

        //--pending; console.log(tokens); return;


        // basic classification of tokens
        var lastModule, lastClass, lastFunAttr, t;
        var i, f, t2, v, tagName;
        for (i = 0, f = tokens.length; i < f; ++i) {
            t = tokens[i];
            v = t.value;
            if (v[0] === '@') {
                tagName = v.substring(1);
                t.tagName = tagName;

                // replace aliases
                t2 = tagAliases[tagName];
                t.value = (t2 && typeof t2 !== 'function') ? t2 : tagName;

                t.kind = 'tag';
            }
            else {
                t.kind = 'text';
            }
            t.file = sourcePath;
        }


        var tokenError = function(error) {
            //console.log( JSON.stringify(t, null, '\t') );
            return [t.file, ' line ', t.line, ': Token @', t.tagName, ' ', error].join('');
        };


        // group property tags first
        var propertyTags = ['author', 'example', 'since', 'version'];
        for (i = 0; i < f; ++i) {
            t = tokens[i];
            if (t.kind === 'tag' && propertyTags.indexOf(t.value) !== -1) {
                t2 = tokens[i+1];
                if (t2.kind !== 'text') {
                    throw tokenError('without content?');
                }
                t.text = t2.value;
                tokens.splice(i+1, 1);
                --f;
            }
        }


        //--pending; console.log(tokens); return;


        var getText = function(delta) {
            var t = tokens[i + delta];
            if (!t || t.kind !== 'text') { return; }
            var text = t.value;
            tokens.splice(i + delta, 1);
            if (delta < 0) {
                --i;
            }
            --f;
            return text.trim();
        };


        var getName = function(isComposed, customError) {
            var name = getText(1);
            if (!name) {
                throw tokenError(customError || 'without name?');
            }
            if (isComposed === undefined) {
                return name;
            }
            var rgx = (isComposed ? composedIdentRgx : identRgx);
            if (!rgx.test(name)) {
                throw tokenError(customError || 'invalid name: "' + name + '"!');
            }
            return name;
        };


        // process stuff
        var o, name, stuff, parent, type, desc, defaultValue, isOptional, isConstructor;
        for (i = 0; i < f; ++i) {
            t = tokens[i];

            if (t.kind !== 'tag') { continue; }

            //console.log('-> ' + t.value);
            //console.log(t);

            switch (t.value) {


                // level 1 tags (module)
                case 'module':
                    name = getName(true);

                    o = {
                        kind:       'module',
                        name:       name,
                        text:       getText(-1),
                        file:       t.file,
                        classes:    {},
                        functions:  {},
                        attributes: {},
                        uses:       []
                    };
                    parent = root;
                    parent.modules[ name ] = o;

                    lastModule  = o;
                    lastClass   = undefined;
                    lastFunAttr = undefined;
                    break;


                // level 2 tags (class)
                case 'class':
                    name = getName(true);

                    o = {
                        kind:       'class',
                        name:       name,
                        text:       getText(-1),
                        file:       t.file,
                        functions:  {},
                        attributes: {}
                    };
                    parent = lastModule || root;
                    parent.classes[ name ] = o;

                    lastClass   = o;
                    lastFunAttr = undefined;
                    break;


                // level 3 tags (function (constructor), attribute)
                case 'function':
                case 'constructor':
                    parent = lastClass || lastModule || root;
                    isConstructor = (t.value === 'constructor');

                    if (isConstructor) {
                        if (parent !== lastClass) {
                            throw tokenError('should occurr after class definition!');
                        }
                        name = parent.name.split('.');
                        name = name.pop();
                        if (!name) {
                            throw tokenError('could not find constructor name from class!');
                        }
                    }
                    else {
                        name = getName(false);
                        if (!identRgx.test(name)) {
                            throw tokenError('invalid name: "' + name + '"!');
                        }
                    }

                    o = {
                        kind:          'function',
                        name:          name,
                        isConstructor: isConstructor || undefined, // or undefined - to trim generated JSON
                        text:          getText(-1),
                        params:        []
                    };
                    parent.functions[ name ] = o;

                    lastFunAttr = o;
                    break;


                case 'attribute':
                    stuff = getName(undefined, 'malformed tag!');
                    stuff = paramRgx.exec(stuff);
                    if (!stuff) {
                        throw tokenError('invalid format!');
                    }
                    type = stuff[1] || undefined;
                    desc = stuff[3] || undefined;
                    stuff = paramNameRgx.exec(stuff[2]);
                    name = stuff[1];
                    if (!identRgx.test(name)) {
                        throw tokenError('invalid name: "' + name + '"!');
                    }
                    defaultValue = stuff[3] || undefined;

                    o = {
                        kind:        'attribute',
                        name:         name,
                        text:         getText(-1),
                        type:         type,
                        defaultValue: defaultValue,
                        description:  desc
                    };
                    parent = lastClass || lastModule || root;
                    parent.attributes[name] = o;

                    lastFunAttr = o;
                    break;


                // function-related tags
                case 'param':
                    stuff = getName(undefined, 'malformed tag!');
                    stuff = paramRgx.exec(stuff);
                    if (!stuff) {
                        throw tokenError('invalid format!');
                    }
                    type = stuff[1] || undefined;
                    desc = stuff[3] || undefined;
                    stuff = stuff[2];
                    isOptional = stuff[0] === '[';
                    if (isOptional) {
                        stuff = stuff.substring(1, stuff.length - 1);
                    }
                    stuff = paramNameRgx.exec(stuff);
                    if (!stuff) {
                        throw tokenError('invalid format!');
                    }
                    name = stuff[1];
                    if (!composedIdentRgx.test(name)) {
                        throw tokenError('invalid name: "' + name + '"!');
                    }
                    defaultValue = stuff[3] || undefined;

                    o = {
                        kind:        'param',
                        name:         name,
                        type:         type,
                        isOptional:   isOptional || undefined, // or undefined - to trim generated JSON
                        defaultValue: defaultValue,
                        description:  desc
                    };
                    parent = lastFunAttr;
                    if (!parent || parent.kind !== 'function') {
                        throw tokenError('this token should be preceded by a function/method tag!');
                    }
                    parent.params.push(o);
                    break;


                case 'return':
                    stuff = getName(undefined, 'malformed tag!');
                    stuff = returnRgx.exec(stuff);
                    if (!stuff) {
                        throw tokenError('invalid format!');
                    }
                    type = stuff[1] || undefined;
                    desc = stuff[2] || undefined;

                    o = {
                        kind:        'return',
                        type:         type,
                        description:  desc
                    };
                    parent = lastFunAttr;
                    if (!parent || parent.kind !== 'function') {
                        throw tokenError('this token should be preceded by a function/method tag!');
                    }
                    parent['return'] = o;
                    break;


                // attribute-related tags
                case 'default':
                    parent = lastFunAttr;
                    if (!parent || parent.kind !== 'attribute') {
                        throw tokenError('this token should be preceded by an attribute/property tag!');
                    }
                    defaultValue = getName(undefined, 'malformed tag!');
                    parent.defaultValue = defaultValue;
                    break;


                case 'type':
                    parent = lastFunAttr;
                    if (!parent || parent.kind !== 'attribute') {
                        throw tokenError('this token should be preceded by an attribute/property tag!');
                    }
                    type = getName(undefined, 'malformed tag!');
                    if (type[0] === '{') {
                        type = type.split('');
                        type.shift();
                        type.pop();
                        type = type.join('');
                    }
                    parent.type = type;
                    break;


                case 'uses':
                    parent = lastModule;
                    if (!parent) {
                        throw tokenError('this token should be preceded by a module tag!');
                    }
                    stuff = getName(undefined, 'malformed tag!');
                    parent.uses.push(stuff);
                    break;


                // property tags (fetches next text token as value)
                case 'author':
                case 'example':
                case 'since':
                case 'version':
                    parent = lastFunAttr || lastClass || lastModule || root;

                    if (t.value === 'example') {
                        if (!parent.examples) { parent.examples = []; }
                        parent.examples.push( t.text );
                    }
                    else {
                        parent[ t.value ] = t.text.trim();
                    }
                    
                    break;


                // boolean tags
                case 'async':
                case 'deprecated':
                case 'private':
                case 'static':
                    parent = lastFunAttr || lastClass || lastModule || root;
                    parent[ t.value ] = true;
                    break;


                // ignored tags
                case 'public':
                case 'readOnly':
                    break;


                default:
                    console.log( tokenError('unsupported tag') );
            }
        }

        /*} catch (ex) {
            --pending;

            console.log('EXCEPTION AT ' + sourcePath + ': ' + ex);
            console.log()

            console.log('\nCONTEXT:' + ex);
            console.log('** module **');
            console.log(lastModule);
            console.log('** class **');
            console.log(lastClass);
            console.log('** fun/attr **');
            console.log(lastFunAttr);

            console.log('\nTOKENS:' + ex);
            console.log(tokens[i-1]);
            console.log(t);

            console.log('\nEX:' + ex);
            console.trace(ex);

            return cb(ex);
        }*/

        --pending;

        cb(null);
    });
};



/**
 * Reads source files and populated a shared object with the extracted metadata, which is sent to the callback
 * 
 * @function parseComments
 * @param  {String[]}             files  file paths of files to parse
 * @param  {Function(err, root)}  cb     called with regular err, root object syntax
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
