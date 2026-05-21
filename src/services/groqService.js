import Groq from 'groq-sdk'

const MODEL = 'llama-3.3-70b-versatile'

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY
  })
}

function cleanJSON(text) {
  return text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
}

export async function callGroq(systemPrompt, userPrompt) {
  const groq = getGroqClient()

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2048
  })

  return cleanJSON(completion.choices[0].message.content)
}

export async function callGroqLarge(systemPrompt, userPrompt) {
  const groq = getGroqClient()

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 4096
  })

  return cleanJSON(completion.choices[0].message.content)
}