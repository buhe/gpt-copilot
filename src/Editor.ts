import * as vscode from 'vscode'

export interface IEditor {
  writeToConsole: (text: string) => void
  getUserInput: (prompt: string, placeHolder: string, errorText: string, password?: boolean) => Promise<string | undefined>
  showErrorMessage: (message: string) => void
  getCurrentFileContents: () => string
  getCurrentFileExtension: () => string
  getHighlightedText: () => string
  getSecret: (key: string) => Promise<string | undefined>
  setSecret: (key: string, value: string) => void
  getConfigValue: (key: string) => any
}

export class Editor implements IEditor {
  private readonly outputChannel: vscode.OutputChannel
  private readonly context: vscode.ExtensionContext

  constructor (context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel('GPT Copilot')
    this.context = context
  }

  writeToConsole (text: string): void {
    this.outputChannel.appendLine(text)
    this.outputChannel.show()
  }

  async getUserInput (prompt: string, placeHolder: string, errorText: string, password: boolean = false): Promise<string | undefined> {
    return await vscode.window.showInputBox({
      prompt,
      placeHolder,
      password,
      ignoreFocusOut: true,
      validateInput: (value: string) => {
        if (value.length === 0) {
          return errorText
        }
        return null
      }
    })
  }

  showErrorMessage (message: string): void {
    void vscode.window.showErrorMessage(message)
  }

  getCurrentFileContents (): string {
    const editor = vscode.window.activeTextEditor
    if (editor != null) {
      const document = editor.document
      return document.getText()
    }
    return ''
  }

  getCurrentFileExtension (): string {
    const editor = vscode.window.activeTextEditor
    if (editor != null) {
      const fileName = editor.document.fileName
      const extension = fileName.split('.').pop()
      if (extension != null) {
        return extension
      }
    }
    return ''
  }

  getHighlightedText (): string {
    const editor = vscode.window.activeTextEditor
    if (editor != null) {
      const selection = editor.selection
      if (!selection.isEmpty) {
        const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character)
        return editor.document.getText(selectionRange)
      }
    }
    return ''
  }

  async getSecret (key: string): Promise<string | undefined> {
    return await this.context.secrets.get(key)
  }

  setSecret (key: string, value: string): void {
    void this.context.secrets.store(key, value)
    void vscode.window.showInformationMessage('API Key saved')
  }

  getConfigValue (key: string): any {
    return vscode.workspace.getConfiguration('gpt-copilot').get(key)
  }
}
