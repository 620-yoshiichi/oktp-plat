import {fetchAlt} from '@cm/lib/http/fetch-client'
import OpenAI from 'openai'
import {ChatCompletionCreateParamsBase} from 'openai/resources/chat/completions'
export const getGpt = async () => {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })
}

export const gpt_chat_getGptReply = async (props: ChatCompletionCreateParamsBase) => {
  const {model, messages, max_tokens, response_format} = props
  const result = await fetchAlt(`/api/openAi/getGptReply`, {
    model,
    messages,
    max_tokens,
    response_format,
  })
  return result
}
