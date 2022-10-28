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
	const files = await getTemplateFiles(fullDir, '/', config.openAfterGeneration ?? [])

	return {
		name: dir.name,
		configuration: config,
		files
	} as Template
}

const getTemplateFiles = async (fullDir: string, subDirectory: string, openAfterGeneration: string[]): Promise<TemplateFile[]> => {
	const currentDirectory = join(fullDir, subDirectory)
	const entries = await fs.promises.readdir(currentDirectory, {
		withFileTypes: true
	})

	const directories = entries.filter(x => x.isDirectory())
	const directoriesMapped = directories.map(async directory => {
		return await getTemplateFiles(fullDir, `${subDirectory}/${directory.name}`, openAfterGeneration)
	})
	const directoryFiles = flatten(await Promise.all(directoriesMapped))

	const files = entries.filter(x => x.isFile() && x.name !== configFileName)
	const filesMapped = files.map(async file => await getTemplateFile(file.name, join(currentDirectory, file.name), join(subDirectory, file.name), openAfterGeneration))
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

const getTemplateFile = async (name: string, path: string, relativePath: string, openAfterGeneration: string[]): Promise<TemplateFile> => {
	const contents = (await fs.promises.readFile(path)).toString('utf8')

	const comparePath = relativePath.replace(/^\\+|\\+$/g, '')
	
	return {
		name,
		path: relativePath,
		contents,
		openAfterGeneration: openAfterGeneration.find(x => x.replace('/', '\\') === comparePath) !== undefined
	}
}

export const getTemplates = async (): Promise<Template[]> => {
	const paths = getTemplatesPaths()
	if (paths.length <= 0) {
		return []
	}

	let templates: Template[] = []

	for (var p of paths) {
		const directories = (await fs.promises.readdir(p, { withFileTypes: true }))
			.filter(x => x.isDirectory())

		const pathTemplates = await Promise.all(directories.map(async dir => await getTemplate(p, dir)))
		templates = [...templates, ...pathTemplates]
	}

	return templates
}

export const getTemplatesPaths = (): string[] => {
	let path = workspace.getConfiguration('templates').get<string>('path')
	const additionalPaths = workspace.getConfiguration('templates').get<string[]>('additionalPaths') ?? []
	const paths = [path, ...additionalPaths].filter(x => x !== undefined).map(x => resolvePath(x!))

	return paths
}

const resolvePath = (path: string): string => {
	if (!path?.startsWith('.')) {
		return path
	}

	const workspaces = workspace.workspaceFolders?.map(folder => folder.uri.fsPath)
	if (workspaces && workspaces.length > 0) {
		path = resolve(workspaces[0], path)
	}

	return path
}