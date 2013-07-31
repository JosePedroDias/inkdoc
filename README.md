# inkdoc - a KISS JavaScript documentation engine


## motivation

It shouldn't be THAT difficult to tame a documentation generation engine.

The rationale here is to have a generic-enough solution.

One can edit and extend its logic and templates too.



## how to comment for inkdoc

Inkdoc extracts information exclusively from block comments in the source file such as `/** blah */`

These are the currently supported tags:

* special tags

    * module (optional grouping structure, root module assumed otherwise)
    * class/namespace (in modules)
    * function/method, constructor (in modules and classes/namespaces, only in classes/namespaces)
    * param, return (in function-like tags above)

* function-related tags

    * param
    * return

* attribute-related tags

    * type
    * default

* boolean tags

    * async
    * deprecated
    * private
    * static

* property tags

    * author
    * example
    * since
    * uses
    * version

Take a look at the syntax in the tests/test1.js file.



## install

`npm install -g inkdoc`

(sudo may be required depending on your system configuration)



## inkdoc usage

Inkdoc looks for a configuration JSON file named `.inkdocrc` from the current directory up to /.


### step 1 (setup)

Create a file named `.inkdocrc` on the topmost directory of your project.

Edit the configuration options which need overriding, such as:

```
{
    "outputDir":  "sample",
    "sourceDir":  "lib",
    "files": [
        "parseComments.js",
        "generateMarkup.js"
    ]
}
```

This file needs editing only when your configuration needs update, such as in the case of addition of new source files.

**Advanced tip**: if you have several projects sharing some options, inkdoc reads all .inkdocrc files along the way, overriding iteratively. This can be used to your advantage.


### step 2 (parse and generate)

just run

    inkdoc



### default configuration options

* **sourceFiles**                       (String[]) - files to process. you can prefix all these using the sourceDir option
* **sourceDir**                         (String)   - path to use to prefix all files
* **templatesDir**                      (String)   - path to the directory where templates reside. Defaults to the `<module>/templates` dir
* **outputDir**                         (String)   - path to the directory where generated content will be written. Defaults to `.`
* **jsonFile**                          (String)   - file name to use to write the extracted metadata in the JSON format. Defaults to `docs.json`
* **markupFile**                        (String)   - file name to use to write the generated markup. Defaults to `docs.html`
* **template**                          (String)   - name of template to use. Default is `single-page`
* **title**                             (String)   - project title. Default is `Documentation`
* **sortChildren**                      (Boolean)  - if true, modules, classes/namespaces, functions and attributes are sorted alphabetically. If not, they appear in the order they're processed. Default is `true`
* **ommitPrivates**                     (Boolean)  - if true, functions and attributes tagged @private will not appear on the generated markup. Default is `true`
* **treatUnderscorePrefixesAsPrivates** (Boolean)  - if true, functions and attributes prefixed with _ will be treated as privates too. Default is `true`
* **skipJSON**                          (Boolean)  - if true, the extracted metadata won't be persisted to file. Default is `false`
* **skipMarkup**                        (Boolean)  - if true, no markup will be generated. Default is `false`



## internals

The engine is split into the following parts:

* comments parsing into JSON metadata `parseComments`
* HTML markup generation from JSON metadata `generateMarkup`

It uses **esprima** to extract block comments from JavaScript source files.

It uses **handlebars** templates for generating the final markup.

It uses **marked** to convert markdown syntax to HTML.

It groups information in a hierarchy of modules, classes and functions/attributes.



## TODO

* Create additional templates and stylesheets (ex: one page per module, client side search, sphinx output, ...)



### Log

**July the 31st 2013 (v0.0.6)**:

* metadata format now uses arrays as bags instead of objects (simplifies template scripting without any drawbacks)
* added tag `namespace` (similar to a class, but a bag of stuff without need to call new Ctor())
* added option `sortChildren`, true by default


**July the 30th 2013 (v0.0.5)**:

* now the type is unwrapped from {}
* added CSS class for boolean tags (named tag)


**July the 30th 2013 (v0.0.4)**:

* major rewrite of README.md
* changed the option files to sourceFiles (to avoid confusion)
* passed options to generateMarkup
* `module` tags become optional


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
