import * as fs from 'fs'
import * as path from 'path'
import { window, Uri, workspace, ViewColumn } from "vscode"
import { Template, TemplateFile, TemplateParameter } from "./template-type"

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

export const getTemplateParameters = async (template: Template): Promise<boolean> => {
	let parameters = template.configuration.parameters

	for (const parameter of parameters) {
		await getParameterValue(parameter)
		if (parameter.value === undefined) {
			return false
		}
	}

	return true
}

export const generateTemplate = async (template: Template, generatePath: string) => {
	try {
		for (const file of template.files) {
			const filename = replaceParametersWithValues(template.configuration.parameters, `${file.path}`)
			const fullPath = path.join(generatePath, filename)

			const directoryPath = path.dirname(fullPath)

			const fileExists = await checkFileExistence(fullPath)

			if (fileExists) {
				window.showInformationMessage(`Skipped generation of ${file.name} as it already exists.`)
			}
			else {
				await fs.promises.mkdir(directoryPath, { recursive: true })

				const contents = replaceParametersWithValues(template.configuration.parameters, file.contents)
				await fs.promises.writeFile(fullPath, contents)
			}

			if (!file.openAfterGeneration) {
				continue
			}

			const openPath = Uri.file(fullPath)
			const textDocument = await workspace.openTextDocument(openPath)
			await window.showTextDocument(textDocument, {
				viewColumn: ViewColumn.Active,
				preview: false
			})
		}
	} catch (err) {
		if (err instanceof Error) {
			console.error('Error while generating template', err.message)
		}

		throw err
	}
}

const checkFileExistence = async (path: string) => {
	try {
		return !!(await fs.promises.stat(path))
	}
	catch (e) {
		return false;
	}
}

