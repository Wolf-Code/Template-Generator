import { commands, ExtensionContext } from 'vscode'
import { executeGenerateTemplateCommand } from './templates/template-generator'

export function activate (context: ExtensionContext) {
	const disposable = commands.registerCommand('templateGenerator.generateTemplate', async e => {
		await executeGenerateTemplateCommand(e && e.fsPath)
	})

	context.subscriptions.push(disposable)
}