# LOG

## TODO

* Optionally apply tidy to markup (attempted, not working well in OSX)
* Add a syntax highlighter to sample tags, fallback to GFM code blocks
* Add file include helper to handlebars (so source code can be output)
* Check/fix paths in Windows


----


## ONGOING

* Create additional templates and stylesheets (ex: one page per module, client side search)


----

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

