'use strict';



var fs     = require('fs'),
    hb     = require('handlebars'),
    fse    = require('fs-extra')/*,
    tidy   = require('htmltidy').tidy*/;



//var writeTidy = fs.writeFile;



/*var tidyOpts = {
    doctype:      'html5',
    hideComments: true,
    indent:       true
};

writeTidy = function(fileName, content, cb) {
    tidy(content, tidyOpts, function(err, tidyContent) {
        if (err) {
            return cb(err);
        }
        fs.writeFile(fileName, tidyContent, cb);
    });
};*/



/**
 * Expands handlebars templates in templatesDir/template usin root as context.
 * Starts at index.hbs, loading remaining .hbs files as partials
 *
 * @function generateMarkup
 * @param {Object} root                   root data context
 * @param {Object} options
 * @param {String} options.templatesDir   path to the directory where templates reside
 * @param {String} options.template       name of template to use (also a directory)
 * @param {String} options.markupFile     name of the main output file (remaining ones' names come fore handlebars file helper argument)
 * @param {Function(err)}                 cb
 */
var generateMarkup = function(root, cfg, cb) {
    var templateDir = [cfg.templatesDir, '/', cfg.template].join('');
    var contentFiles = {};
    var templates = [];
    var staticResources = [];
    var mainTpl;


    var writeTidy = function(fileName, content, cb) {
        if (cfg.debug) {
            console.log('< generated ' + fileName);
        }

        fs.writeFile(fileName, content, cb);
    };



    // DEFINE HELPERS

    /*
     * handlebars.compile('{{#ifvalue type value="test"}} blah {{/ifvalue}} ')({type:'test'})
     */
    hb.registerHelper('ifvalue', function(conditional, options) {
        if (options.hash.value === conditional) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    // http://stackoverflow.com/questions/11479094/conditional-on-last-item-in-array-using-handlebars-js-template
    hb.registerHelper('foreach', function(arr, options) {
        if (options.inverse && !arr.length) {
            return options.inverse(this);
        }

        return arr.map(function(item, index) {
            item.$index = index;
            item.$first = index === 0;
            item.$last  = index === arr.length - 1;
            return options.fn(item);
        }).join('');
    });

    // stores content into auxiliary structure (to output to different files)
    hb.registerHelper('file', function(fileName, options) {
        contentFiles[fileName] = options.fn(this).toString();
    });



    // DETERMINE TEMPLATES IN TEMPLATE DIR

    var tmp = fs.readdirSync(templateDir);
    tmp.map(function(f) {
        if (f.substr(-4) === '.hbs') {
            templates.push( f.substring(0, f.length - 4) );
        }
        else {
            staticResources.push( f );
        }
    });



    // LOAD TEMPLATES

    templates.forEach(function(tpl) {
        tmp = fs.readFileSync( [cfg.templatesDir, '/', cfg.template, '/', tpl, '.hbs'].join('') ).toString();
        tmp = hb.compile(tmp);

        if (tpl === 'index') {
            mainTpl = tmp;
        }
        else {
            hb.registerPartial(tpl, tmp);
        }
    });



    // EXPAND TEMPLATES

    var mainOutput = mainTpl(root);

    var left = Object.keys(contentFiles).length + staticResources.length;



    // SAVE RESULTS
    var aggregateCb = function(err) {
        if (err) {
            return cb(err);
        }

        --left;

        if (left === 0) {
            cb(null);
        }
    };

    writeTidy([cfg.outputDir, cfg.markupFile].join('/'), mainOutput, aggregateCb);

    for (var fileName in contentFiles) {

        // TODO HACKY FIX
        //if (!contentFiles.hasOwnProperty(fileName)) { continue; }
        if (!fileName) {
            //console.log('xxx');
            tmp = contentFiles[''];
            tmp = tmp.trim();
            if (tmp) {
                console.log('ignoring:');
                console.log(contentFiles['']);
            }
            continue;
        }
        writeTidy([cfg.outputDir, fileName + '.' + cfg.markupExtension].join('/'), contentFiles[fileName], aggregateCb);
    }

    staticResources.forEach(function(f) {
        // https://github.com/jprichardson/node-fs-extra#copysrc-dest-callback

        if (cfg.debug) {
            console.log('< copying ' + [cfg.outputDir, f].join('/'));
        }

        fse.copy(
            [cfg.templatesDir, cfg.template, f].join('/'), // src
            [cfg.outputDir, f].join('/'), // dst
            aggregateCb // cb
        );
    });
};



module.exports = generateMarkup;
