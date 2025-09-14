import { Client } from "@gradio/client"

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function safeJSONParse<T = any>(s: string): T | null {
  try { return JSON.parse(s) } catch { return null }
}

async function callGradio(messages: ChatMessage[], opts?: { model?: string; json?: boolean }) {
  try {
    console.log('Connecting to Gradio client: NotASI/Llama-3.1-Storm-8B')
    const client = await Client.connect("NotASI/Llama-3.1-Storm-8B")
    console.log('Gradio client connected successfully')
    
    // Combine system and user messages for Gradio format
    const systemMessage = messages.find(m => m.role === 'system')?.content || "You are a helpful assistant."
    const userMessage = messages.find(m => m.role === 'user')?.content || ""
    
    const prompt = opts?.json 
      ? `${userMessage}\n\nPlease respond with valid JSON only.`
      : userMessage

    console.log('Sending request to Gradio with prompt length:', prompt.length)
    const result = await client.predict("/chat", {
      message: prompt,
      system_prompt: systemMessage,
      temperature: 0.2,
      max_new_tokens: 2048,
      top_p: 0.9,
      top_k: 40,
      penalty: 1.1,
    })

    console.log('Gradio prediction completed, result type:', typeof result, 'data type:', typeof result.data)
    const content = Array.isArray(result.data) ? (result.data[0] || '') : String(result.data || '')
    console.log('Extracted content length:', content.length)
    return content
  } catch (error) {
    console.error('Gradio error details:', error)
    throw new Error(`Gradio error: ${error}`)
  }
}

async function callOllama(messages: ChatMessage[], opts?: { model?: string; json?: boolean }) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434'
  const model = opts?.model || process.env.OLLAMA_MODEL || 'llama3.1'
  const res = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature: 0.2 },
    })
  })
  if (!res.ok) throw new Error(`Ollama error ${res.status}`)
  const json = await res.json()
  const content: string = json?.message?.content || ''
  return content
}

async function callOpenAI(messages: ChatMessage[], opts?: { model?: string; json?: boolean }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')
  const model = opts?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: opts?.json ? { type: 'json_object' } : undefined,
    })
  })
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`)
  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content || ''
  return content
}

export async function chatJSON(prompt: string) {
  console.log('=== chatJSON called ===')
  const provider = (process.env.AI_PROVIDER || '').toLowerCase() || 'gradio' // Default to Gradio (free)
  console.log('AI Provider:', provider)
  
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful assistant. Always reply with strict JSON only.' },
    { role: 'user', content: prompt }
  ]
  
  let content = ''
  
  // Try providers in order: Gradio (free) -> Ollama (free local) -> OpenAI (paid) -> Heuristic (fallback)
  if (provider === 'gradio') {
    try {
      console.log('Attempting Gradio connection...')
      content = await callGradio(messages, { json: true })
      console.log('Gradio response length:', content.length)
    } catch (error) {
      console.error('Gradio failed, trying Ollama:', error)
      if (process.env.OLLAMA_HOST) {
        console.log('Attempting Ollama fallback...')
        content = await callOllama(messages, { json: true })
        console.log('Ollama response length:', content.length)
      } else {
        console.log('No Ollama host configured, throwing error')
        throw error
      }
    }
  } else if (provider === 'ollama' && process.env.OLLAMA_HOST) {
    console.log('Using Ollama provider...')
    content = await callOllama(messages, { json: true })
    console.log('Ollama response length:', content.length)
  } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    console.log('Using OpenAI provider...')
    content = await callOpenAI(messages, { json: true })
    console.log('OpenAI response length:', content.length)
  } else {
    console.log('No AI provider available, falling back to heuristic analysis')
    // Fallback to heuristic analysis
    throw new Error('No AI provider available, falling back to heuristic analysis')
  }
  
  console.log('Raw AI response first 200 chars:', content.substring(0, 200))
  const json = safeJSONParse(content)
  if (!json) {
    console.error('AI did not return valid JSON, content:', content)
    throw new Error('AI did not return JSON')
  }
  console.log('JSON parsing successful, keys:', Object.keys(json))
  return json
}

export function heuristicAnalysis(text: string) {
  const lower = text.toLowerCase()
  const maybeSkills = Array.from(new Set(
    lower
      .split(/[^a-zA-Z0-9+#.\-]/)
      .filter(Boolean)
      .filter(w => ['javascript','typescript','react','node','python','java','c#','c++','docker','kubernetes','aws','gcp','azure','sql','nosql','graphql','next','nestjs','django','spring','go','rust','redis','rabbitmq','kafka'].includes(w))
  ))
  const seniority = ((): string | undefined => {
    if (/(\bsenior\b|\bsr\b)/.test(lower)) return 'senior'
    if (/(\bmid\b|\bregular\b)/.test(lower)) return 'mid'
    if (/(\bjunior\b|\bjr\b)/.test(lower)) return 'junior'
    if (/lead|principal|staff/.test(lower)) return 'lead'
    return undefined
  })()
  const roles = Array.from(new Set([
    /frontend/.test(lower) ? 'frontend developer' : undefined,
    /backend/.test(lower) ? 'backend developer' : undefined,
    /full[- ]?stack/.test(lower) ? 'fullstack developer' : undefined,
    /data (engineer|scientist)/.test(lower) ? 'data' : undefined,
    /devops|sre/.test(lower) ? 'devops' : undefined,
  ].filter(Boolean) as string[]))
  return {
    summary: undefined,
    key_skills: maybeSkills,
    total_experience_years: undefined,
    seniority,
    top_roles: roles,
    education: [],
    languages: [],
    notable_projects: [],
    risks: [],
  }
}

export function heuristicCompatibility(golden: { level?: string; role?: string; skills?: string }, analysis: any) {
  const parseSkills = (s?: string) => (s||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)
  let score = 0
  const gSkills = new Set(parseSkills(golden.skills))
  const aSkills = new Set((analysis?.key_skills||[]).map((x:string)=>x.toLowerCase()))
  const inter = [...gSkills].filter(s => aSkills.has(s)).length
  const skillsWeight = 60
  const skillsScore = gSkills.size ? Math.round(inter / gSkills.size * skillsWeight) : 0
  score += skillsScore
  const levelWeight = 20
  const gLevel = (golden.level||'').toLowerCase()
  const aLevel = (analysis?.seniority||'').toLowerCase()
  if (gLevel && aLevel && gLevel === aLevel) score += levelWeight
  const rolesWeight = 20
  const gRole = (golden.role||'').toLowerCase()
  const roles = (analysis?.top_roles||[]).map((r:string)=>r.toLowerCase())
  if (gRole && roles.includes(gRole)) score += rolesWeight
  if (score < 0) score = 0
  if (score > 100) score = 100
  return { score, breakdown: { skillsScore, skillsWeight, levelWeight, rolesWeight, inter, gSkills: [...gSkills] } }
}
