# inkdoc - a KISS JavaScript documentation engine



## summary

The engine is split into the following parts:

* comments parsing into JSON metadata `parseComments`
* HTML markup generation from JSON metadata `generateMarkup`

We make use of **esprima** to extract block comments from JavaScript source files.

We make use of **handlebars** templates for generating the expanded markup.

We make use of **marked** markdown library to parse markdown syntax.



## motivation

It shouldn't be THAT difficult to tame a documentation generation engine.

The rationale here is to have a generic-enough solution.

You can and probably will edit some of the internals and that's fine too!



## supported tags

### special tags

* module (top level at file)
* class (in modules)
* function/method, constructor (in modules and classes, only in classes)
* param, return (in function-like tags above)


## function-related tags

* param
* return


## attribute-related tags

* type
* default


### boolean tags

* async
* deprecated
* private
* static


### property tags

* author
* example
* since
* uses
* version


### ignored tags

* public
* readOnly



## install

`npm install -g inkdoc`

(sudo may be required depending on your system configuration)



## usage

This works like jshint, looking for a configuration JSON file from the current directory up to /.


### step 1

Create a file named `.inkdocrc` on the topmost directory of the project.

Edit the configuration options which need overriding, such as:

```
{
    "outputDir":  "/home/jdias/Work/inkjs/docs",
    "sourceDir":  "/home/jdias/Work/inkjs/Ink",
    "template":   "single-page",
    "markupFile": "index.html",
    "files": [
        "1/lib.js",
        "Net/Ajax/1/lib.js",
        "Net/JsonP/1/lib.js",
        "Dom/Css/1/lib.js",
        "Dom/Element/1/lib.js",
        "Dom/Event/1/lib.js",
        "Dom/Loaded/1/lib.js",
        "Dom/Selector/1/lib.js",
        "Dom/Browser/1/lib.js",
        "Util/Url/1/lib.js",
        "Util/Swipe/1/lib.js",
        "Util/String/1/lib.js",
        "Util/Dumper/1/lib.js",
        "Util/Date/1/lib.js",
        "Util/Cookie/1/lib.js",
        "Util/Array/1/lib.js",
        "Util/Validator/1/lib.js",
        "Util/BinPack/1/lib.js",
        "UI/Aux/1/lib.js",
        "UI/Modal/1/lib.js",
        "UI/ProgressBar/1/lib.js",
        "UI/SmoothScroller/1/lib.js",
        "UI/SortableList/1/lib.js",
        "UI/Spy/1/lib.js",
        "UI/Sticky/1/lib.js",
        "UI/Table/1/lib.js",
        "UI/Tabs/1/lib.js",
        "UI/ImageQuery/1/lib.js",
        "UI/TreeView/1/lib.js",
        "UI/FormValidator/1/lib.js",
        "UI/Droppable/1/lib.js",
        "UI/Draggable/1/lib.js",
        "UI/DatePicker/1/lib.js",
        "UI/Close/1/lib.js",
        "UI/Toggle/1/lib.js",
        "UI/Pagination/1/lib.js"
    ]
}
```

This only needs to be edited when you need to update your configuration.

**Advanced tip**: if you have several projects sharing some options, inkdoc reads all .inkdocrc files along the way, overriding iteratively. This can be helpful.


### step 2

run

    inkdoc



### default configuration

```
{
    templatesDir:                      __dirname + '/templates',
    outputDir:                         '.',
    sourceDir:                         undefined,

    jsonFile:                          'docs.json',
    markupFile:                        'docs.html',

    files:                             [],
    template:                          'single-page',
    ommitPrivates:                     true,
    treatUnderscorePrefixesAsPrivates: true,
    skipJSON:                          false,
    skipMarkup:                        false
}
```

## TODO

* Create additional templates and stylesheets (ex: one page per module, client side search, sphinx output, ...)



### Log

**July the 30th 2013 (v0.0.3)**:

* global executable (inkdoc)
* support for .inkdocrc


**July the 30th 2013 (v0.0.2)**:

* ditched old comment extraction code in favor of esprima
* completely rewritten tag parsing strategy (from top-down to bottom-up)
* friendly warnings and errors
* added several tags
* slightly improved template


**July the 26th 2013 (v0.0.1)**:

* added aliases for tags
* added tags attribute/variable/property
* functions/methods can be assigned to modules directly
* attributes are now supported
* fixed double attribution of property tags
* error messages are now more verbose (featuring the source file and line)
