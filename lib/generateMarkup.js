'use strict';

/*
 * @module generateMarkup
 *
 * @author jose.pedro.dias AT gmail.com
 * @since July 2013
 */


var fs     = require('fs'),
    hb     = require('handlebars'),
    marked = require('marked');

// https://github.com/wycats/handlebars.js/
// http://handlebarsjs.com/


/**
 * Generates markup from the parsed metadata and template files.
 * The callback receives the generated markup.
 * 
 * @function generateMarkup
 * @param  {Object}                 root
 * @param  {Object}                 options
 * @param  {Boolean}                options.ommitPrivates                      if true, functions and attributes tagged private will not appear on the generated markup
 * @param  {Boolean}                options.treatUnderscorePrefixesAsPrivates  if true, functions and attributes prefixed with _ will be treated as privates too
 * @param  {String}                 options.templatesDir                       path to the directory where templates reside
 * @param  {String}                 options.template                           name of template to use
 * @param  {String}                 options.title                              project title
 * @param  {Function(err, markup)}  cb
 * @async
 */
var generateMarkup = function(root, cfg, cb) {



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

        if (el.description) {
            el.description = marked(el.description);
        }


        // recurse
        collection = el.modules;
        for (k in collection) {
            visitNode(el, collection[k]);
        }

        collection = el.classes;
        for (k in collection) {
            visitNode(el, collection[k]);
        }

        collection = el.functions;
        for (k in collection) {
            if ( cfg.ommitPrivates && (collection[k].private ||
                                       (cfg.treatUnderscorePrefixesAsPrivates && k[0] === '_') ) ) {
                delete collection[k];
                continue;
            }
            visitNode(el, collection[k]);
        }

        collection = el.attributes;
        for (k in collection) {
            if ( cfg.ommitPrivates && (collection[k].private ||
                                       (cfg.treatUnderscorePrefixesAsPrivates && k[0] === '_') ) ) {
                delete collection[k];
                continue;
            }
            visitNode(el, collection[k]);
        }
    };


    /*
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
        tmp = fs.readFileSync( [cfg.templatesDir, '/', cfg.template, '/', tpl, '.hbs'].join('') ).toString();
        tmp = hb.compile(tmp);
        
        if (tpl === 'index') {
            mainTpl = tmp;
        }
        else {
            hb.registerPartial(tpl, tmp);
        }
    }


    root.name = '';
    visitNode(undefined, root);
    root.title = cfg.title;

    var markup = mainTpl(root);
    cb(null, markup);
};



module.exports = generateMarkup;
