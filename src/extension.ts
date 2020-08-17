import { commands, ExtensionContext, window } from 'vscode'
import { ComponentGenerator } from './generator'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const generator = new ComponentGenerator(window);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand('componentgenerator.generateComponent', e => {
	// The code you place here will be executed every time your command is executed
	generator.execute(e && e.fsPath);
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(generator);
}

// this method is called when your extension is deactivated
export function deactivate() { }