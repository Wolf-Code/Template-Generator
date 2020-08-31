import * as path from 'path'
import { window } from "vscode"
import { TemplateExistsError } from '../errors/template-exists.error'
import { Template } from "./template-type"
import { generateTemplate, getTemplateParameters } from './template-writing'
import { getTemplates } from './templates-reading'

export const executeGenerateTemplateCommand = async (selectedPath?: string) => {
	if (!selectedPath) {
		const openFilePath = window.activeTextEditor?.document?.fileName
		if (!openFilePath) {
			window.showErrorMessage('No folder was selected in the explorer and there is no open file. Unable to generate template.')
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
		const parametersResult = await getTemplateParameters(template)
		const wasCanceled = !(parametersResult)
		if(wasCanceled) {
			return
		}
		
		await generateTemplate(template, absolutePath)

		window.showInformationMessage(`Template '${template.name}' successfully created`)
	} catch (err) {
		if (err instanceof TemplateExistsError) {
			window.showErrorMessage(`Template '${template.name}' already exists`)
		} else {
			window.showErrorMessage(`Error: ${err.message}`)
		}
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