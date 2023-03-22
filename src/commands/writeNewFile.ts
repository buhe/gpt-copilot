import { IEditor } from '../Editor'
import { IOpenAIWrapper } from '../OpenAIWrapper'

export const writeNewFileCommand = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
  const prompt = await editor.getUserTwoInput(["outline", "ext"], ["outline", "ext"])
  if (prompt !== undefined) {
    const response = await openAiApi.makeRequestWithLoadingIndicator(`Generate ${prompt[1]} code according to the following ${prompt[0]}`, editor)
    if (response !== undefined) {
      await editor.writeNewFile(response, prompt[1])
    }
  } else {
    void editor.showErrorMessage('No prompt entered')
  }
}
