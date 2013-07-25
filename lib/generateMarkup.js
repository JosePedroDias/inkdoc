'use strict';

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
    
    el.hash = escapeHash( parent ? parent.hash + '.' + el.name : el.name );

    //console.log('visiting node ' + el.hash);
    
    // process markdown
    if (el.text) {
        el.text = marked(el.text);
    }

    collection = el.modules;
    for (k in el.modules) {
        visitNode(el, collection[k]);
    }

    collection = el.classes;
    for (k in el.classes) {
        visitNode(el, collection[k]);
    }

    collection = el.methods;
    for (k in el.methods) {
        if (k[0] === '_') { // ignore methods starting with underscore // TODO PRIVATE
            delete el.methods[k];
            continue;
        }
        visitNode(el, collection[k]);
    }

    /*collection = el.examples;
    if (collection) {
        for (var i = 0, f = collection.length; i < f; ++i) {
            collection[i] = marked(collection[i]);
        }
    }*/
};



// load templates
var templates = ['examples', 'method', 'class', 'module', 'index'];
var tpl, tmp, i, f, mainTpl;
for (i = 0, f = templates.length; i < f; ++i) {
    tpl = templates[i];
    tmp = fs.readFileSync( [__dirname, '/../templates/', tpl, '.hbs'].join('') ).toString();
    tmp = hb.compile(tmp);
    
    if (tpl === 'index') {
        mainTpl = tmp;
    }
    else {
        hb.registerPartial(tpl, tmp);
    }
}



var generateMarkup = function(root, cb) {
    root.name = '';
    visitNode(undefined, root);

    var markup = mainTpl(root);
    cb(null, markup);
};



module.exports = generateMarkup;
