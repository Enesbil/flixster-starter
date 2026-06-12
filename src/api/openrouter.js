const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openrouter/free'

export const AI_FALLBACK_MESSAGE =
  "Could not generate a take this time. Try opening the movie again in a moment."

const SYSTEM_PROMPT = `You are a film critic writing 2 to 3 sentence watch recommendations.
Tell the reader who this movie is for and what kind of evening it fits.
Use second person ("you"). Never use first person ("I").
No spoilers past the overview. No markdown, no bullet points, no headings.
Avoid filler like "must-see", "instant classic", or "you won't want to miss it".
Write plain prose. Be specific.`

const buildUserPrompt = ({ title, genres, overview }) => {
  const safeGenres = genres && genres.length > 0 ? genres : 'Unspecified'
  const safeOverview = overview || 'No overview available.'
  return `Movie: ${title}
Genres: ${safeGenres}
Overview: ${safeOverview}

Write the recommendation now.`
}

export const getMovieInsight = async ({ title, genres, overview }) => {
  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!API_KEY) {
    console.error('Missing VITE_OPENROUTER_API_KEY')
    return AI_FALLBACK_MESSAGE
  }
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildUserPrompt({ title, genres, overview }),
          },
        ],
      }),
    })
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`)
    }
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content || typeof content !== 'string') {
      throw new Error('OpenRouter returned no content')
    }
    return content.trim()
  } catch (error) {
    console.error('AI insight failed:', error)
    return AI_FALLBACK_MESSAGE
  }
}
