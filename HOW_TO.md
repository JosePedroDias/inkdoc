# HOW TO


## how to configure your project

Inkdoc looks for a configuration JSON file named `.inkdocrc` from the current directory up to /.


### step 1 (setup)

Create a file named `.inkdocrc` on the topmost directory of your project.

Edit the configuration options which need overriding, such as:

```
{
    "outputDir":  "docs",
    "sourceDir":  "lib",
    "files": [
        "moduleX.js",
        "moduleY.js"
    ],
    "template": "markdown"
}
```

This file needs editing only when your configuration needs updating, such as in the case of addition of new source files.

**Advanced tip**:
if you have several projects sharing some options, inkdoc reads all .inkdocrc files along the way, overriding iteratively.
This can be used to your advantage.


### step 2 (parse and generate)

just run

    inkdoc

inkdoc exits if having trouble parsing a comment block.
It gives a reason for the failure and lists the source file and start line of the docblock.
Inkdoc parses identifiers with a regular expression not much different from the allowed JavaScript spec.
This enforces you to comply to the names you've given on your code. Well, it doesn't per se but catches many commenting typos.


### default configuration options

    sourceFiles                       (String[]) files to process. you can prefix all these using the sourceDir option
    sourceDir                         (String)   path to use to prefix all files
    templatesDir                      (String)   path to the directory where templates reside. Defaults to the <module>/templates dir
    outputDir                         (String)   path to the directory where generated content will be written. Defaults to '.'
    jsonFile                          (String)   file name to use to write the extracted metadata in the JSON format. Defaults to 'docs.json'
    markupFile                        (String)   file name to use to write the generated markup. Defaults to 'docs.html'
    identifierFile                    (String)   file name to use to write the extracted identifiers. Defaults to 'identifiers.json'
    template                          (String)   name of template to use. Default is 'single-page'
    title                             (String)   project title. Default is 'Documentation'
    debug                             (Boolean)  if true, additional info appears on the console
    sortChildren                      (Boolean)  if true, modules, classes/namespaces, functions and attributes are sorted alphabetically. If not, they appear in the order they're processed. Default is true
    ommitPrivates                     (Boolean)  if true, functions and attributes tagged @private will not appear on the generated markup. Default is true
    treatUnderscorePrefixesAsPrivates (Boolean)  if true, functions and attributes prefixed with _ will be treated as privates too. Default is true
    skipJSON                          (Boolean)  if true, the extracted metadata won't be persisted to file. Default is false
    skipMarkup                        (Boolean)  if true, no markup will be generated. Default is false
    skipIdentifiers                   (Boolean)  if true, no identifiers will be extracted. Default is false
    skipInkdocPromotion               (Boolean)  if true, no footer will be featured lightly promoting inkdoc


----



## how to document your source code

Inkdoc extracts information exclusively from block comments in the source file such as `/** blah */`


### supported tags

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


### tag syntax

TODO: add syntax of each tag here



## how to create / customize a template

1.
Start by copying the most satisfying template as a starting point.
The name of the template is the containing folder. Ex: 'MyTemplate'

    mkdir ~/InkdocTemplates
    mkdir ~/InkdocTemplates/AShinyTemplate
    cp -R <template_x>/* ~/InkdocTemplates/AShinyTemplate


2.
Change the `templatesDir` of your .inkdocrc configuration so it points to the folder containing the template your creating.
Change the `template` to match the template too.

    ...
    "templatesDir": "~/InkdocTemplates/",
    "template":     "AShinyTemplate",
    ....


3.
Most templates generate HTML.
There's a template which generates Markdown so you can easily document your modules straight to GitHub.
The `markupFile` config parameter defines the starting recipient for the generated markup. Something such as `index.html`.


4.
If you're not familiar with Handlebars this is a good time to browse their site.
Learning to output data and use the main helpers is straightforward.


5.
Handlebars is used here to generate the documentation from the extracted JSON structure which gets persisted
to `docs.json` if you set the config parameter `skipJSON` to false (default).
Analysing this file can help you better grasp what you can pass on to Handlebars in each context.


6.
The starting Handlebars template is `index.hbs`.
Partials were used to segment the output into logic units such as module and class.
You're free to add or replace such naming scheme. inkdoc loads all .hbs files in the folder,
assuming index as the main template and the remaining ones partials.


7.
With the custom `file` helper we've put to use, one can save to additional files.
The `multi-page` template uses this feature to create one file per module.
Bear in mind file is not recursive - group everything you want to store in file x and surround
the content with `{{#file x}}` ... `{{/file}}` tags.


8.
Any files with extensions other than .hbs are assumed to be static resources and are copied
straight to the output folder. This allows for custom js, css, images and the like to be part of the template.


9.
Along with the `docs.json` file, inkdoc can also generate `identifiers.json` if you set the
`skipIdentifiers` parameters false (default).
This format is optimized support an autocomplete or indexing feature.
It generates an array of items, each one:

  0: text to compare (in lower case), 1: m/c/f, 2: real name, 3: file, 4: hash, 5: ancestors
  1: m/c/f (for either module, class/namespace or function/method/attribute)
  2: real name (same as 0, but without lower case)
  3: source file
  4: hash version (the name with spaces replaced with underscores. used to name anchors).
  5: ancestors, reparated by spaces


10.
Fire inkdoc
