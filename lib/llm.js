import OpenAI from 'openai';

export const llmClient = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: process.env.EMERGENT_LLM_BASE_URL || 'https://integrations.emergentagent.com/llm/v1',
});

export const LLM_MODEL = process.env.EMERGENT_LLM_MODEL || 'gpt-4o';

export async function chat(messages, { temperature = 0.8, max_tokens = 2400 } = {}) {
  const res = await llmClient.chat.completions.create({
    model: LLM_MODEL,
    messages,
    temperature,
    max_tokens,
  });
  return res.choices?.[0]?.message?.content || '';
}
