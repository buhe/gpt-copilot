import * as vscode from 'vscode'
import { MultiStepInput } from './multiStepInput';

export interface IEditor {
  writeToConsole: (text: string) => void
  writeNewFile: (text: string, ext: string) => Promise<void> 
  getUserInput: (prompt: string, placeHolder: string, errorText: string, password?: boolean) => Promise<string | undefined>
  getUserTwoInput: (prompt: string[], title: string[]) => Promise<string[] | undefined>
  showErrorMessage: (message: string) => void
  getCurrentFileContents: () => string
  getCurrentFileExtension: () => string
  getHighlightedText: () => string
  getSecret: (key: string) => Promise<string | undefined>
  setSecret: (key: string, value: string) => void
  getConfigValue: (key: string) => any
  enterText: (text: string) => void
  getCurrentLanguage: () => string
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

  extractCode(text: string): string {
    const regex = /```([\s\S]*?)```/g;
    const matches = regex.exec(text);
    if (matches && matches.length > 1) {
      return matches[1];
    }
    return '';
  }

  async writeNewFile(text: string, ext: string): Promise<void> {
    let document = await vscode.workspace.openTextDocument({ language: ext, content: this.extractCode(text) });
    await vscode.window.showTextDocument(document)
  }

  enterText(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, text);
      });
    }
  }

  getCurrentLanguage(): string {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const languageId = document.languageId;
      return languageId;
    }
    return "";
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
  async getUserTwoInput(prompt: string[], title: string[]): Promise<string[] | undefined> {
    let data: string[] = ['', '']
    await MultiStepInput.run(async (input) => {
      data[0] = await input.showInputBox({
        title: title[0],
        step: 1,
        totalSteps: 2,
        value: data[0],
        prompt: prompt[0],
      });

      data[1] = await input.showInputBox({
        title: title[1],
        step: 2,
        totalSteps: 2,
        value: data[1],
        prompt: prompt[1],
      });
    });
    return data
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
