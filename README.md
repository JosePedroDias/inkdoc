# inkdoc - a KISS JavaScript documentation engine



## summary

The engine is split into the following parts:

* a stream reader that publishes block comment events `CommentStream`
* comments parsing into JSON metadata `parseComments`
* HTML markup generation from JSON metadata `generateMarkup`

We make use of handlebars templates for generating the expanded markup.
We make use of marked markdown library to parse markdown syntax.


## motivation

It shouldn't be THAT difficult to tame a documentation generation engine.
The rationale here is to have a generic-enough solution.



## supported tags

### special tags

* module (top level at file)
* class (in modules)
* method (in classes)
* param (in methods)
* return (in methods)
* example (in modules, classes and methods)


### boolean tags

* async


### property tags

* author
* since
* version



## usage

See tests directory.

Workflow number one:

    node run_full.js    # generates docs.html


Workflow number two:

    node run_1_parse.js > docs.json
    cat docs.json | node run_2_gen.js > docs.html



## TODO

* Improve the stategy for fetching text nodes (some tags are sharing text nodes because property tags aren't grabbing their text nodes)
* Fix bug in cursor on CommentStream (relevant for generic use cases, not prement to this use case)
* Add additional relevant tags/tag contexts - methods out of classes, per instance
* Create a different markup which uses the JSON file client-side, expands the templates client-side and allows for autcomplete search of symbols
* A decent CSS stylesheet?
