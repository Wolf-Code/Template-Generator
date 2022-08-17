## Features

Automatic template generation in Visual Studio Code based on a pre-defined templates folder, using an extra context menu entry on directories in the Explorer.
![](demo.gif)

### Configuration

In your preferences, set the `templates.path` variable as the path to a directory which will contain all templates.  
As of 0.1.6 it is also possible to use a relative path (using ./path-to-folder or ../path-to-folder) and this will resolve based on the first open workspace.  
This is especially useful for per-project templates, as you can use the .vscode directory with a settings.json file to set this path differently in different projects.

### Creating a template

Inside the template folder, create a new folder with a recognizable name. This will be the name of this specific template.  
This template folder can contain an optional `template.config.json` file if you intend to make use of parameters.  
You can add all your own files and (sub-)directories to the template folder and they will all be created when the template is generated in Visual Studio Code.  

#### template.config.json

The contents of this config file are as follows:
```
{
	"parameters": [
		{
			"name": "Name of the parameter",
			"variable": "name_of_the_variable",
			"description": "Description of this variable",
			"pattern": "[a-zA-Z]+"
		},
		...
	],
	"openAfterGeneration": [
		"{name}/{name}.js",
		"{name}/{name}.module.scss",
		...
	]
}
```

### Parameters
* `name`: This is the name of the parameter as it is presented during generation inside Visual Studio Code
* `variable`: This is the name of the variable as it's used in the template.
* `description`: This is the description of the parameter as it is presented during generation inside Visual Studio Code
* `pattern` (optional): An optional RegEx pattern to ensure the user inputs a correct value.

### Opening files after generating them
`openAfterGeneration`: This optional array of paths to files inside the template indicate which files should be opened immediately after generating them.

#### Usage of parameters
When adding files or contents of files to the template, parameter placeholders can be used.  
These placeholders look like `{variablename}` and will be replaced with the value entered in Visual Studio Code when running the template generation.

### Examples

An example of a template (an overly templified React component) can be found in the `example` folder of this repository.