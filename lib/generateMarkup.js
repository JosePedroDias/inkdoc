'use strict';

/**
 * @module generateMarkup
 */


var fs     = require('fs'),
    hb     = require('handlebars'),
    marked = require('marked');

// https://github.com/wycats/handlebars.js/
// http://handlebarsjs.com/



var escapeHash = function(hash) {
    return hash.replace(/\./g, '_');
};



// generate hashes and parent links for modules, classes and methods
var visitNode = function(parent, el) {
    var collection, k;

    // set parent links
    if (parent) {
        el.parent = parent;
    }

    var ommitPrivates = true;
    var treatUnderscorePrefixesAsPrivates = true;
    
    el.hash = escapeHash( parent ? parent.hash + '.' + el.name : el.name );

    //console.log('visiting node ' + el.hash);
    


    // process markdown
    if (el.text) {
        el.text = marked(el.text);
    }

    if (el.description) {
        el.description = marked(el.description);
    }


    /*collection = el.examples;
    if (collection) {
        for (var i = 0, f = collection.length; i < f; ++i) {
            collection[i] = marked(collection[i]);
        }
    }*/



    // recurse
    collection = el.modules;
    for (k in el.modules) {
        visitNode(el, collection[k]);
    }

    collection = el.classes;
    for (k in el.classes) {
        visitNode(el, collection[k]);
    }

    collection = el.functions;
    for (k in el.functions) {
        if ( ommitPrivates && (collection[k].private ||
                               (treatUnderscorePrefixesAsPrivates && k[0] === '_') ) ) {
            delete el.functions[k];
            continue;
        }
        visitNode(el, collection[k]);
    }

    collection = el.attributes;
    for (k in el.attributes) {
        if ( ommitPrivates && (collection[k].private ||
                               (treatUnderscorePrefixesAsPrivates && k[0] === '_') ) ) {
            delete el.attributes[k];
            continue;
        }
        visitNode(el, collection[k]);
    }
};


/**
 * handlebars.compile('{{#ifvalue type value="test"}} blah {{/ifvalue}} ')({type:'test'})
 */
hb.registerHelper('ifvalue', function(conditional, options) {
    if (options.hash.value === conditional) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// load templates
var templates = ['examples', 'attribute', 'function', 'class', 'module', 'index'];
var tpl, tmp, i, f, mainTpl;
for (i = 0, f = templates.length; i < f; ++i) {
    tpl = templates[i];
    tmp = fs.readFileSync( [__dirname, '/../templates/single-page/', tpl, '.hbs'].join('') ).toString();
    tmp = hb.compile(tmp);
    
    if (tpl === 'index') {
        mainTpl = tmp;
    }
    else {
        hb.registerPartial(tpl, tmp);
    }
}



/**
 * @function generateMarkup
 * @param  {Object}    root
 * @param  {Object}   [options]
 * @param  {Object}   [options.themeDir]
 * @param  {Function}  cb
 * @async
 */
var generateMarkup = function(root, cb) {
    root.name = '';
    visitNode(undefined, root);

    var markup = mainTpl(root);
    cb(null, markup);
};



module.exports = generateMarkup;
