const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openrouter/free'

export const AI_FALLBACK_MESSAGE =
  "We couldn't generate a recommendation for this one — check out the overview above!"

const SYSTEM_PROMPT = `You are an enthusiastic but honest film critic giving brief watch recommendations.
Write 2 to 3 sentences telling the reader who this movie is for and what kind of mood or evening it suits.
Use second person ("you"), never first person ("I").
No spoilers beyond what is given in the overview.
No bullet points, no markdown, no headings — plain prose only.
Avoid generic phrases like "must-see", "instant classic", or "you won't want to miss it".`

const buildUserPrompt = ({ title, genres, overview }) => {
  const safeGenres = genres && genres.length > 0 ? genres : 'Unspecified'
  const safeOverview = overview || 'No overview available.'
  return `Movie: ${title}
Genres: ${safeGenres}
Overview: ${safeOverview}

Write the watch recommendation now.`
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
