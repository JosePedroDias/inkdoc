# inkdoc module API













**generateMarkup**(
`Object` root,
`Object` options,
`Boolean` options.ommitPrivates,
`Boolean` options.treatUnderscorePrefixesAsPrivates,
`String` options.title,
`Function(err, markup)` cb
) *function*

<p>Visits data and prepares it for templating
Extracts additional info</p>


**async**





---


**generateMarkup**(
`Object` root,
`Object` options,
`String` options.templatesDir,
`String` options.template,
`String` options.markupFile,
`Function(err)` cb
) *function*

<p>Expands handlebars templates in templatesDir/template usin root as context.
Starts at index.hbs, loading remaining .hbs files as partials</p>








---


**parseComments**(
`Object` cfg,
`Boolean` cfg.debug,
`String[]` cfg.sourceFiles,
`Function(err, root)` cb
) *function*

<p>Reads source files and populated a shared object with the extracted metadata, which is sent to the callback</p>


**async**





---






