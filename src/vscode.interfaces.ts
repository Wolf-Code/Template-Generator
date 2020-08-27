// creating an interface for the VS Code Extension window namespace so that 
// intellisense can be used when the namespace is passed in as an argument
// in the contructor of the duck-generator. this makes it easier to mock 
// the window in the duck-generator test

import { CancellationToken, InputBoxOptions, QuickPickOptions, TextEditor } from "vscode"

export interface VSCodeWindow extends Window {
	showErrorMessage (message: string): Thenable<string>
	showInformationMessage (message: string): Thenable<string>
	showInputBox (options?: InputBoxOptions): Thenable<string | undefined>
	showQuickPick(items: string[] | Thenable<string[]>, options: QuickPickOptions, token?: CancellationToken): Thenable<string[] | undefined>
	activeTextEditor: TextEditor | undefined
}