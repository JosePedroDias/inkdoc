# inkdoc - a KISS JavaScript documentation engine


[![NPM](https://nodei.co/npm/inkdoc.png?downloads=true&compact=true)](https://nodei.co/npm/inkdoc/)

[![NPM](https://nodei.co/npm-dl/inkdoc.png?months=2)](https://nodei.co/npm/inkdoc/)


## motivation

It shouldn't be THAT difficult to tame a documentation generation engine.

The rationale here is to have a generic-enough solution.

One can edit and extend its logic (kinda hard) and templates (easy as pie - it uses Handlebars!).



## install

`npm install -g inkdoc`

(sudo may be required depending on your system configuration)



## how to

* [configure your project](/JosePedroDias/inkdoc/blob/master/HOW_TO.md#configure_your_project)
* [document your source code](/JosePedroDias/inkdoc/blob/master/HOW_TO.md#document_your_source_code)
* [create / customize a template](/JosePedroDias/inkdoc/blob/master/HOW_TO.md#create_/_customize_a_template)



## sample results

* [inkdoc API (generated from the files in lib folder)](/JosePedroDias/inkdoc/blob/master/API.md)
* your page can be here!



## internals

The engine is split into the following parts:

* comments parsing into JSON metadata `parseComments`
* additional massaging of the extracted data is done in `prepareStructure`
* markup generation from JSON metadata `generateMarkup`

It uses **esprima** to extract block comments from JavaScript source files.

It uses **handlebars** templates for generating the final markup.

It uses **marked** to convert markdown syntax to HTML.

It groups information in a hierarchy of modules, classes and functions/attributes.



## log

You can find a human-readable log of inkdoc versions and their changes [here](/JosePedroDias/inkdoc/blob/master/LOG.md)
