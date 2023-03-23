import { IEditor } from '../Editor'
import { IOpenAIWrapper } from '../OpenAIWrapper'

export const insertFunctionCommand = async (editor: IEditor, openAiApi: IOpenAIWrapper): Promise<void> => {
    const comment = await editor.getUserInput('Enter your comment', 'What is polymorphism?', 'Invalid question')
    const lang = editor.getCurrentLanguage()
    if (comment !== undefined) {
        const response = await openAiApi.makeRequestWithLoadingIndicator(`Follow ${comment} to generate ${lang} functions`, editor)
        if (response !== undefined) {
            editor.enterText(extractCode(response))
        }
    } else {
        void editor.showErrorMessage('No prompt entered')
    }
}

function extractCode(text: string): string {
    const regex = /```([\s\S]*?)```/g;
    // const regex = new RegExp(`\`\`\`${lang}([\s\S]*?)\`\`\``, 'i');
    const matches = regex.exec(text);
    if (matches && matches.length > 1) {
        return matches[1];
    }
    return '';
}