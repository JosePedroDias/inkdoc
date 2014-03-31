# LOG

## TODO

* Optionally apply tidy to markup (attempted, not working well in OSX)
* Add a syntax highlighter to sample tags, fallback to GFM code blocks
* Check/fix paths in Windows


----


## ONGOING

* the html templates are not that appealing... does anyone wanna help?
* single-page template need full rewrite OR migrating most logic from multi-page which has since improved!
* handlebars whitespace handling, which is very ineffective (logic tags generating \ns and stuff, particularly painful when generating markdown!)


----

## January the 30th 2014 (v0.3.0)

* added support for glob syntax (like `.gitignore` or grunt) to the sourceFiles option. Thanks mariomc and the guy who made simple-glob module.


## November the 8th 2013 (v0.2.5)

* improved `multi-page` template to match most of `markdown`'s functionality (function signatures and order of type, parameters, description)


## November the 8th 2013 (v0.2.4)

* improved `markdown` templates for functions A LOT (hard to do with all the whitespace constraints!)
* added a small inkdoc promoting message in the generated doc footer's main page, can be opted out via configuration (`skipInkdocPromotion`)


## November the 4th 2013 (v0.2.3)

* fixed bug in multi-page template's feature


## November the 1st 2013 (v0.2.2)

* now the module tag can be invoked several times (there was a bug which was losing info and generating duplicates)
* generated files use the extension of the `markupFile` option
* created `markdown-multi-page` template
* fixed some bugs on `markdown-multi-page` and `multi-page` templates (should apply them to other ones too)


## October the 14th 2013 (v0.2.1)

* first round at the `multi-page` template. it's mostly a hack for now.


## October the 13th 2013 (v0.2.0)

* refactored generateMarkup into generateMarkup and prepareStructure
* changed the signatures of all methods, therefore 0.2.0...
* support for multi-file output via custom file handlebars helper
* files in a template directory which have an extension other than .hbs get copied to the output dir
* added debug option


## September the 24th 2013 (v0.1.0)

* now using semver versioning


## September the 11th 2013 (v0.0.8)

* added markdown template, more suited for github repos and stuff


## July the 31st 2013 (v0.0.7)

* extracts identifiers optionally
* exposing new options identifiersFile, skipIdentifiers


## July the 31st 2013 (v0.0.6)

* metadata format now uses arrays as bags instead of objects (simplifies template scripting without any drawbacks)
* added tag `namespace` (similar to a class, but a bag of stuff without need to call new Ctor())
* added option `sortChildren`, true by default


## July the 30th 2013 (v0.0.5)

* now the type is unwrapped from {}
* added CSS class for boolean tags (named tag)


## July the 30th 2013 (v0.0.4)

* major rewrite of README.md
* changed the option files to sourceFiles (to avoid confusion)
* passed options to generateMarkup
* `module` tags become optional


## July the 30th 2013 (v0.0.3)

* global executable (inkdoc)
* support for .inkdocrc


## July the 30th 2013 (v0.0.2)

* ditched old comment extraction code in favor of esprima
* completely rewritten tag parsing strategy (from top-down to bottom-up)
* friendly warnings and errors
* added several tags
* slightly improved template


## July the 26th 2013 (v0.0.1)

* added aliases for tags
* added tags attribute/variable/property
* functions/methods can be assigned to modules directly
* attributes are now supported
* fixed double attribution of property tags
* error messages are now more verbose (featuring the source file and line)

