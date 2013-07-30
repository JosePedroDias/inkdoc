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
* function or method or constructor (in modules and classes, constructor only in classes)
* param and return (in function-like tags above)


### boolean tags

* async
* deprecated
* private


### property tags

* author
* example
* since
* uses
* version



## usage

See tests directory.

Workflow number one:

    node run_full.js    # generates docs.html


Workflow number two:

    node run_1_parse.js > docs.json
    cat docs.json | node run_2_gen.js > docs.html



## TODO

* Create a different markup which uses the JSON file client-side, expands the templates client-side and allows for autcomplete search of symbols
* A decent CSS stylesheet?



### Log

July the ? 2013 (v0.0.2):

* ditched old comment extraction code in favor of esprima
* completely rewritten tag parsing strategy (from top-down to bottom-up)
* added several tags
* slightly improved template


July the 26th 2013 (v0.0.1):

* added aliases for tags
* added tags attribute/variable/property
* functions/methods can be assigned to modules directly
* attributes are now supported
* fixed double attribution of property tags
* error messages are now more verbose (featuring the source file and line)
