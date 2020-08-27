import * as fs from 'fs'
import * as path from 'path'
import { window } from "vscode"
import { TemplateExistsError } from '../errors/template-exists.error'
import { Template, TemplateFile, TemplateParameter } from "./template-type"
import { getTemplates } from './templates-service'

export const executeGenerateTemplateCommand = async (selectedPath?: string) => {
	if (!selectedPath) {
		const openFilePath = window.activeTextEditor?.document?.fileName
		if (!openFilePath) {
			window.showErrorMessage('No folder was selected in the explorer and there is no open file. Unable to create component.')
			return
		}

		selectedPath = path.dirname(openFilePath)
	}

	const templates = await getTemplates()
	const template = await selectTemplate(templates)

	if (!template) {
		return
	}
	const absolutePath: string = path.resolve(selectedPath as string)

	try {
		await getTemplateParameters(template)
		generateTemplate(template, absolutePath)

		window.showInformationMessage(`Template '${template.name}' successfully created`)
	} catch (err) {
		if (err instanceof TemplateExistsError) {
			window.showErrorMessage(`Template '${template.name}' already exists`)
		} else {
			window.showErrorMessage(`Error: ${err.message}`)
		}
	}
}

const validateParameterInput = (parameter: TemplateParameter) => {
	return (value: string): string | undefined => {
		if (!parameter.pattern) {
			return undefined
		}

		const regexPattern = `^${parameter.pattern}$`
		const matched = new RegExp(regexPattern).test(value)
		if (!matched) {
			return `Provided value does not match the required RegEx pattern '${parameter.pattern}'`
		}

		return undefined
	}
}

const getParameterValue = async (parameter: TemplateParameter) => {
	const value = await window.showInputBox({
		placeHolder: parameter.name,
		ignoreFocusOut: true,
		prompt: parameter.description,
		validateInput: validateParameterInput(parameter)
	})

	parameter.value = value
}

const replaceParametersWithValues = (parameters: TemplateParameter[], value: string) => {
	let finalValue = value
	parameters.forEach(parameter => {
		finalValue = finalValue.replace(new RegExp('{' + parameter.variable + '}', 'g'), parameter.value as string)
	})

	return finalValue
}

export const getTemplateParameters = async (template: Template): Promise<TemplateParameter[]> => {
	let parameters = template.configuration.parameters

	for (const parameter of parameters) {
		await getParameterValue(parameter)
	}

	return parameters
}

export const generateTemplate = async (template: Template, generatePath: string) => {
	try {
		template.files.forEach((file: TemplateFile) => {
			const filename = replaceParametersWithValues(template.configuration.parameters, `${file.path}`)
			const fullPath = path.join(generatePath, filename)

			const directoryPath = path.dirname(fullPath)

			fs.exists(fullPath, async exists => {
				if (!exists) {
					await fs.promises.mkdir(directoryPath, { recursive: true })

					const contents = replaceParametersWithValues(template.configuration.parameters, file.contents)
					await fs.promises.writeFile(fullPath, contents)
				}
				else {
					window.showInformationMessage(`Skipped generation of ${file.name} as it already exists.`)
				}
			})
		})
	} catch (err) {
		console.error('Error while generating template', err.message)

		throw err
	}
}

const selectTemplate = async (templates: Template[]): Promise<Template | undefined> => {
	const result = await window.showQuickPick(templates.map(x => x.name), {
		canPickMany: false,
		placeHolder: 'Select a template'
	})

	if (result) {
		return templates.find(x => x.name === result)
	}

	return undefined
}