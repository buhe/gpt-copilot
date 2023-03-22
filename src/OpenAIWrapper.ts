import { Configuration, OpenAIApi } from 'openai'
import * as vscode from 'vscode'
import { IEditor } from './Editor'

export interface IOpenAIWrapper {
  makeRequestWithLoadingIndicator: (text: string, editor: IEditor) => Promise<string | undefined>
  makeRequest: (text: string, editor: IEditor) => Promise<string | undefined>
}

export class OpenAIWrapper implements IOpenAIWrapper {
  async makeRequestWithLoadingIndicator (text: string, editor: IEditor): Promise<string | undefined> {
    let response: string | undefined
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      cancellable: false,
      title: 'Loading response...'
    }, async (progress) => {
      progress.report({ increment: 0 })
      response = await this.makeRequest(text, editor)
      progress.report({ increment: 100 })
    })
    return response
  }

  async makeRequest (text: string, editor: IEditor): Promise<string | undefined> {
    const config = new Configuration({
      apiKey: await editor.getSecret('openai-api-key'),
      basePath: "https://closeai.deno.dev/v1"
    })
    const openai = new OpenAIApi(config)
    const response = await openai.createChatCompletion({
      messages: [
        {
          role: 'user',
          content: text,
        }
      ],
      max_tokens: editor.getConfigValue('maxTokens'),
      temperature: editor.getConfigValue('temperature'),
      model: editor.getConfigValue('model')
    })
    return response.data.choices[0].message?.content
  }
}
