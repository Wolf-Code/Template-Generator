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

	async execute (selectedPath: string): Promise<void> {
		// prompt for the name of the duck, or the path to create the duck in
		const componentName: string | undefined = await this.prompt()

		if (!componentName) {
			return
		}

		const absolutePath: string = path.resolve(selectedPath, componentName)

		try {
			this.create(componentName, absolutePath)

			this.window.showInformationMessage(`Component '${componentName}' successfully created`)
		} catch (err) {
			// log?
			if (err instanceof ComponentExistsError) {
				this.window.showErrorMessage(`Component '${componentName}' already exists`)
			} else {
				this.window.showErrorMessage(`Error: ${err.message}`)
			}
		}
	}

	async prompt (): Promise<string | undefined> {
		// this can be abstracted out as an argument for prompt
		const options: InputBoxOptions = {
			ignoreFocusOut: true,
			prompt: `Component name`,
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
			// create the directory
			fs.mkdirSync(componentPath)

			files.forEach((file: IComponentFile) => {
				const filename = this.fillVariables(`${file.name}`, componentName)
				const fullpath = path.join(componentPath, filename)

				fs.writeFileSync(fullpath, this.fillVariables(file.content, componentName))
			})
		} catch (err) {
			// log other than console?
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

		// no errors
		return null
	}
	
	dispose (): void {
		console.log('disposing...')
	}
}