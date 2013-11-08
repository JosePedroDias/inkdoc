
'use strict';

/*
 * @module prepareStructure
 *
 * @author jose.pedro.dias AT gmail.com
 * @since October 2013
 */


var fs     = require('fs'),
    marked = require('marked');



/**
 * Visits data and prepares it for templating
 * Extracts additional info
 *
 * @function generateMarkup
 * @param  {Object}                 root
 * @param  {Object}                 options
 * @param  {Boolean}                options.ommitPrivates                      if true, functions and attributes tagged private will not appear on the generated markup
 * @param  {Boolean}                options.treatUnderscorePrefixesAsPrivates  if true, functions and attributes prefixed with _ will be treated as privates too
 * @param  {String}                 options.title                              project title
 * @param  {Function(err, markup)}  cb
 * @async
 */
var generateMarkup = function(root, cfg, cb) {



    var escapeHash = function(hash) {
        if (hash[0] === '-') {
            hash = hash.substring(1);
        }
        return hash.replace(/\./g, '_');
    };



    /*var printArrNames = function(arr) {
        for (var i = 0, f = arr.length; i < f; ++i) {
            console.log('* ' + arr[i].name);
        }
    };*/

    var sortByName = function(a, b) {
        if (a.name === b.name) { return 0; }
        return (a.name < b.name) ? -1 : 1;
    };

    var sort = function(arr/*, el*/) {
        if (!cfg.sortChildren || arr.length === 0) { return; }

        var el0 = arr[0];
        var firstIsCtor = el0.isConstructor;

        if (firstIsCtor) {
            arr.shift();
        }

        arr.sort(sortByName);

        if (firstIsCtor) {
            arr.unshift(el0);
        }
    };



    // generate hashes and parent links for modules, classes and methods
    var visitNode = function(parent, el, fn) {
        var arr, i, el2;


        fn(parent, el);


        // recurse
        arr = el.modules;
        if (arr) {
            sort(arr, el);
            for (i = arr.length - 1; i >= 0; --i) {
                visitNode(el, arr[i], fn);
            }
        }

        arr = el.classes;
        if (arr) {
            sort(arr, el);
            for (i = arr.length - 1; i >= 0; --i) {
                visitNode(el, arr[i], fn);
            }
        }

        arr = el.functions;
        if (arr) {
            sort(arr, el);
            for (i = arr.length - 1; i >= 0; --i) {
                el2 = arr[i];
                if ( cfg.ommitPrivates && (el2.private ||
                                           (cfg.treatUnderscorePrefixesAsPrivates && el2.name[0] === '_') ) ) {
                    arr.splice(i, 1);
                }
                else {
                    visitNode(el, el2, fn);
                }
            }
        }

        arr = el.attributes;
        if (arr) {
            sort(arr, el);
            for (i = arr.length - 1; i >= 0; --i) {
                el2 = arr[i];
                if ( cfg.ommitPrivates && (el2.private ||
                                           (cfg.treatUnderscorePrefixesAsPrivates && el2.name[0] === '_') ) ) {
                    arr.splice(i, 1);
                }
                else {
                    visitNode(el, el2, fn);
                }
            }
        }
    };



    root.name = '';
    root.title = cfg.title;
    root.skipInkdocPromotion = cfg.skipInkdocPromotion;

    visitNode(undefined, root, function(parent, el) {
        // set parent links
        if (parent) {
            el.parent = parent;
        }

        el.hash = escapeHash( parent ? parent.hash + '-' + el.name : el.name );

        //console.log('visiting node ' + el.hash);


        // process markdown
        if (cfg.markupExtension !== 'md') {
            if (el.text) {
                el.text = marked(el.text);
            }

            if (el.description) {
                el.description = marked(el.description);
            }
        }
    });



    // extract identifiers (for autocomplete and stuff)

    var identifiers = [];
    if (!cfg.skipIdentifiers) {

        var getAncestors = function(el) {
            var res = [];
            el = el.parent;
            while (el && el.name) {
                res.unshift(el.name);
                el = el.parent;
            }
            return res;
        };

        var sortBy0th = function(a, b) { // name is [0]
            if (a[0] === b[0]) { return 0; }
            return (a[0] < b[0]) ? -1 : 1;
        };

        var sortBy1st = function(a, b) { // kind is [1]
            if (a[1] === b[1]) { return 0; }
            if (a[1] === 'm') { return -1; }
            if (b[1] === 'f') { return -1; }
            return 1;
        };

        var relevantKinds = ['module', 'class', 'function'];
        visitNode(undefined, root, function(parent, el) {
            if (relevantKinds.indexOf(el.kind) === -1) {
                return;
            }

            identifiers.push([
                el.name.toLowerCase(), // 0 identifier name in lower case
                el.kind[0], // 1 kind (m/c/f)
                el.name, // 2 identifier name
                el.file, // 3 file
                el.hash, // 4 hash
                getAncestors(el).join(' ') // 5 ancestors ([module [class]?]?)
            ]); // identifier, kind, where
        });

        identifiers.shift();
        identifiers.sort(sortBy0th); // sort by m/c/f as 1st criteria, alphabetically as 2nd
        identifiers.sort(sortBy1st);



        identifiers = JSON.stringify(identifiers);

        var identifiersPath = [cfg.outputDir, cfg.identifiersFile].join('/');
        if (cfg.debug) {
            console.log('< generated ' + identifiersPath);
        }
        return fs.writeFile(identifiersPath, identifiers, cb);
    }



    cb(null);
};



module.exports = generateMarkup;
