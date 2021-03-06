import * as fs from 'fs'
import { resolve } from 'path'
import { flatten } from 'lodash'
import { join } from 'path'
import { workspace } from 'vscode'
import { Template, TemplateConfiguration, TemplateFile } from './template-type'

const configFileName = 'template.config.json'

const getTemplate = async (templatesPath: string, dir: fs.Dirent): Promise<Template> => {
	const fullDir = join(templatesPath, dir.name)
	const configFilePath = join(fullDir, configFileName)
	const config = getTemplateConfig(configFilePath)
	const files = await getTemplateFiles(fullDir, '/')

	return {
		name: dir.name,
		configuration: config,
		files
	} as Template
}

const getTemplateFiles = async (fullDir: string, subDirectory: string): Promise<TemplateFile[]> => {
	const currentDirectory = join(fullDir, subDirectory)
	const entries = await fs.promises.readdir(currentDirectory, {
		withFileTypes: true
	})

	const directories = entries.filter(x => x.isDirectory())
	const directoriesMapped = directories.map(async directory => {
		return await getTemplateFiles(fullDir, `${subDirectory}/${directory.name}`)
	})
	const directoryFiles = flatten(await Promise.all(directoriesMapped))

	const files = entries.filter(x => x.isFile() && x.name !== configFileName)
	const filesMapped = files.map(async file => await getTemplateFile(file.name, join(currentDirectory, file.name), join(subDirectory, file.name)))
	const templateFiles = await Promise.all(filesMapped)

	return [...templateFiles, ...directoryFiles]
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

const getTemplateFile = async (name: string, path: string, relativePath: string): Promise<TemplateFile> => {
	const contents = (await fs.promises.readFile(path)).toString('utf8')

	return {
		name,
		path: relativePath,
		contents
	}
}

export const getTemplates = async (): Promise<Template[]> => {
	const path = getTemplatesPath()
	if (!path) {
		return []
	}

	const directories = (await fs.promises.readdir(path, { withFileTypes: true }))
		.filter(x => x.isDirectory())

	return Promise.all(directories.map(async dir => await getTemplate(path, dir)))
}

export const getTemplatesPath = (): string | undefined => {
	let path = workspace.getConfiguration('templates').get<string>('path')

	if (path?.startsWith('.')) {
		const workspaces = workspace.workspaceFolders?.map(folder => folder.uri.fsPath)
		if (workspaces && workspaces.length > 0) {
			path = resolve(workspaces[0], path)
		}
	}

	return path
}