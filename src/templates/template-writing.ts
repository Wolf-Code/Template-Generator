import * as fs from 'fs'
import * as path from 'path'
import { window } from "vscode"
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

