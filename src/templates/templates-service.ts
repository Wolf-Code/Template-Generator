import * as fs from 'fs'
import { join } from 'path'
import { workspace } from "vscode"
import { Template, TemplateConfiguration } from './template-type'

const configFileName = 'template.config.json'

const getTemplate = (templatesPath: string, dir: fs.Dirent): Template => {
	const fullDir = join(templatesPath, dir.name)
	const configFilePath = join(fullDir, configFileName)
	const config = getTemplateConfig(configFilePath)
	const files =

	return {
		name: dir.name,
		configuration: config
	} as Template
}

const getTemplateConfig = (configPath: string): TemplateConfiguration => {
	if (!fs.existsSync(configPath)) {
		return {
			parameters: []
		}
	}

	const content = fs.readFileSync(configPath).toString('utf8')
	const json = JSON.parse(content)

	return json as TemplateConfiguration
}

export const getTemplates = (): Template[] => {
	const path = getTemplatesPath()
	if (!path) {
		return []
	}

	const directories = fs.readdirSync(path, {
		withFileTypes: true
	})
		.filter(x => x.isDirectory())

	return directories.map(dir => getTemplate(path, dir))
}

export const getTemplatesPath = (): string | undefined => {
	return workspace.getConfiguration('templates').get<string>('path')
}