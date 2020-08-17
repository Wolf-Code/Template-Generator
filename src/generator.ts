import * as fs from 'fs'
import * as path from 'path'
import { InputBoxOptions } from 'vscode'
import { IComponentFile } from './component-file.interface'
import { IDisposable } from './disposable.interface'
import { ComponentExistsError } from './errors/component-exists.error'
import files from './files'
import { VSCodeWindow } from './vscode.interfaces'

export class ComponentGenerator implements IDisposable {
	constructor(
		private window: VSCodeWindow
	) { }

	async execute (selectedPath?: string): Promise<void> {
		if (!selectedPath) {
			const openFilePath = this.window.activeTextEditor?.document?.fileName
			if (!openFilePath) {
				this.window.showErrorMessage('No folder was selected in the explorer and there is no open file. Unable to create component.')
				return
			}

			selectedPath = path.dirname(openFilePath)
		}

		const componentName: string | undefined = await this.prompt(selectedPath)

		if (!componentName) {
			return
		}
		const absolutePath: string = path.resolve(selectedPath as string, componentName)

		try {
			this.create(componentName, absolutePath)

			this.window.showInformationMessage(`Component '${componentName}' successfully created`)
		} catch (err) {
			if (err instanceof ComponentExistsError) {
				this.window.showErrorMessage(`Component '${componentName}' already exists`)
			} else {
				this.window.showErrorMessage(`Error: ${err.message}`)
			}
		}
	}

	async prompt (componentPath: string): Promise<string | undefined> {
		const options: InputBoxOptions = {
			ignoreFocusOut: true,
			prompt: `Component name (will be created in ${componentPath})`,
			placeHolder: 'SomeComponent',
			validateInput: this.validate
		}

		return await this.window.showInputBox(options)
	}

	create (componentName: string, componentPath: string) {
		if (fs.existsSync(componentPath)) {
			throw new ComponentExistsError(`'${componentName}' already exists`)
		}

		try {
			fs.mkdirSync(componentPath)

			files.forEach((file: IComponentFile) => {
				const filename = this.fillVariables(`${file.name}`, componentName)
				const fullpath = path.join(componentPath, filename)

				fs.writeFileSync(fullpath, this.fillVariables(file.content, componentName))
			})
		} catch (err) {
			console.log('Error', err.message)

			throw err
		}
	}

	fillVariables (text: string, componentName: string): string {
		return text.replace(/{name}/g, componentName)
	}

	validate (name: string): string | null {
		if (!name) {
			return 'Name is required'
		}

		if (name.includes(' ')) {
			return 'Spaces are not allowed'
		}

		if (name.includes('-')) {
			return 'Component names should be PascalCase and therefore cannot include -'
		}

		return null
	}

	dispose (): void {
		
	}
}