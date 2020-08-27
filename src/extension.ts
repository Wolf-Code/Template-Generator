import { commands, ExtensionContext } from 'vscode'
import { executeGenerateTemplateCommand } from './templates/template-generation'

export function activate (context: ExtensionContext) {
	const disposable = commands.registerCommand('componentgenerator.generateComponent', async e => {
		await executeGenerateTemplateCommand(e && e.fsPath)
	})

	context.subscriptions.push(disposable)
}