import { perplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function safeJSONParse<T = any>(s: string): T | null {
  try { return JSON.parse(s) } catch { return null }
}

async function callPuter(messages: ChatMessage[], opts?: { model?: string; json?: boolean }) {
  try {
    console.log('🎯 Using Puter.js for free Claude AI access...')
    
    // Combine system and user messages
    const systemMessage = messages.find(m => m.role === 'system')?.content || "You are a helpful assistant."
    const userMessage = messages.find(m => m.role === 'user')?.content || ""
    
    const prompt = opts?.json 
      ? `${systemMessage}\n\nUser: ${userMessage}\n\nPlease respond with valid JSON only, no markdown or additional text.`
      : `${systemMessage}\n\nUser: ${userMessage}`

    console.log('📤 Sending request to Puter with prompt length:', prompt.length)
    
    // Use fetch to call Puter API directly since we can't use their browser SDK in Node.js
    const response = await fetch('https://api.puter.com/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_TOKEN || ''}`
      },
      body: JSON.stringify({
        message: prompt,
        model: opts?.model || 'claude-sonnet-4',
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Puter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.response || data.content || data.message || ''

    console.log('✅ Puter response received, length:', text.length)
    return text
  } catch (error) {
    console.error('❌ Puter error details:', error)
    throw new Error(`Puter error: ${error}`)
  }
}

async function callPerplexity(messages: ChatMessage[], opts?: { model?: string; json?: boolean }) {
  try {
    // Check if API key is available
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY === 'your-perplexity-api-key-here') {
      throw new Error('PERPLEXITY_API_KEY not configured')
    }

    console.log('🔮 Connecting to Perplexity AI...')
    
    // Combine system and user messages
    const systemMessage = messages.find(m => m.role === 'system')?.content || "You are a helpful assistant."
    const userMessage = messages.find(m => m.role === 'user')?.content || ""
    
    const prompt = opts?.json 
      ? `${systemMessage}\n\nUser: ${userMessage}\n\nPlease respond with valid JSON only, no markdown or additional text.`
      : `${systemMessage}\n\nUser: ${userMessage}`

    console.log('📤 Sending request to Perplexity with prompt length:', prompt.length)
    
    const { text } = await generateText({
      model: perplexity(opts?.model || 'sonar'),
      prompt: prompt,
      maxRetries: 2,
    })

    console.log('✅ Perplexity response received, length:', text.length)
    return text
  } catch (error) {
    console.error('❌ Perplexity error details:', error)
    throw new Error(`Perplexity error: ${error}`)
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
  const provider = (process.env.AI_PROVIDER || '').toLowerCase() || 'puter' // Default to Puter (free Claude)
  console.log('AI Provider:', provider)
  
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful assistant that analyzes CVs and resumes. Always reply with strict JSON only.' },
    { role: 'user', content: prompt }
  ]
  
  let content = ''
  
  // Try providers in order: Puter (free Claude) -> Perplexity (free) -> Ollama (free local) -> OpenAI (paid) -> Heuristic (fallback)
  if (provider === 'puter' || !provider) {
    try {
      console.log('🎯 Attempting Puter (Claude) connection...')
      content = await callPuter(messages, { json: true })
      console.log('✅ Puter response length:', content.length)
    } catch (error) {
      console.error('❌ Puter failed, trying Perplexity:', error)
      try {
        console.log('🔮 Attempting Perplexity fallback...')
        content = await callPerplexity(messages, { json: true })
        console.log('✅ Perplexity response length:', content.length)
      } catch (perplexityError) {
        console.error('❌ Perplexity also failed:', perplexityError)
        throw error // Use original Puter error
      }
    }
  } else if (provider === 'perplexity') {
    try {
      console.log('🔮 Using Perplexity provider...')
      content = await callPerplexity(messages, { json: true })
      console.log('✅ Perplexity response length:', content.length)
    } catch (error) {
      console.error('❌ Perplexity failed, trying Puter:', error)
      content = await callPuter(messages, { json: true })
      console.log('✅ Puter fallback response length:', content.length)
    }
  } else if (provider === 'ollama' && process.env.OLLAMA_HOST) {
    console.log('🦙 Using Ollama provider...')
    content = await callOllama(messages, { json: true })
    console.log('✅ Ollama response length:', content.length)
  } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    console.log('🤖 Using OpenAI provider...')
    content = await callOpenAI(messages, { json: true })
    console.log('✅ OpenAI response length:', content.length)
  } else {
    console.log('❌ No AI provider available, falling back to heuristic analysis')
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
  console.log('Running enhanced heuristic analysis...')
  const lower = text.toLowerCase()
  
  // Enhanced skills detection
  const skillPatterns = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'express', 
    'python', 'django', 'flask', 'java', 'spring', 'c#', 'c++', 'c', 'go', 'rust',
    'php', 'laravel', 'ruby', 'rails', 'swift', 'kotlin', 'dart', 'flutter',
    'html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'heroku', 'vercel',
    'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'terraform',
    'graphql', 'rest', 'api', 'microservices', 'websockets',
    'next.js', 'nextjs', 'nest.js', 'nestjs', 'nuxt', 'gatsby',
    'webpack', 'vite', 'babel', 'eslint', 'prettier',
    'figma', 'sketch', 'photoshop', 'illustrator'
  ]
  
  const maybeSkills = Array.from(new Set(
    skillPatterns.filter(skill => 
      lower.includes(skill) || lower.includes(skill.replace(/[.\-]/g, ''))
    )
  ))
  
  // Experience years detection
  const yearMatches = text.match(/(\d+)\s*(?:years?|lat|roku|lata)/gi) || []
  const experienceYears = yearMatches
    .map(match => parseInt(match.match(/\d+/)?.[0] || '0'))
    .filter(num => num > 0 && num <= 30)
    .reduce((max, current) => Math.max(max, current), 0)
  
  // Seniority detection (enhanced)
  const seniority = ((): string => {
    if (/(\bsenior\b|\bsr\.?\b|\bstarszy\b)/.test(lower)) return 'senior'
    if (/(\bmid\b|\bmiddle\b|\bregular\b|\bspecjalista\b)/.test(lower)) return 'mid'
    if (/(\bjunior\b|\bjr\.?\b|\bmłodszy\b|\bstażysta\b)/.test(lower)) return 'junior'
    if (/(\blead\b|\bprincipal\b|\bstaff\b|\barchitect\b|\bkierownik\b|\bteam lead\b)/.test(lower)) return 'lead'
    
    // Infer from experience
    if (experienceYears >= 7) return 'senior'
    if (experienceYears >= 3) return 'mid'
    if (experienceYears >= 1) return 'junior'
    return 'junior'
  })()
  
  // Role detection (enhanced)
  const rolePatterns = [
    { pattern: /frontend|front-end|ui|user interface/i, role: 'Frontend Developer' },
    { pattern: /backend|back-end|server|api/i, role: 'Backend Developer' },
    { pattern: /full[- ]?stack|fullstack/i, role: 'Fullstack Developer' },
    { pattern: /mobile|android|ios|react native|flutter/i, role: 'Mobile Developer' },
    { pattern: /devops|sre|infrastructure|deployment/i, role: 'DevOps Engineer' },
    { pattern: /data engineer|big data|etl/i, role: 'Data Engineer' },
    { pattern: /data scientist|machine learning|ml|ai/i, role: 'Data Scientist' },
    { pattern: /qa|quality assurance|tester|testing/i, role: 'QA Engineer' },
    { pattern: /ux|user experience|ui\/ux|product design/i, role: 'UX/UI Designer' },
    { pattern: /project manager|pm|scrum master/i, role: 'Project Manager' }
  ]
  
  const roles = rolePatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ role }) => role)
  
  // Education detection
  const educationPatterns = [
    /(?:university|uniwersytet|uczelnia|college)\s+(?:of\s+)?([^,.\n]+)/gi,
    /(?:bachelor|master|phd|mgr|inż|dr)\s+(?:of\s+|in\s+)?([^,.\n]+)/gi,
    /(?:computer science|informatyka|engineering|inżynieria)/gi
  ]
  
  const education = []
  for (const pattern of educationPatterns) {
    const matches = text.match(pattern) || []
    education.push(...matches.map(match => match.trim()))
  }
  
  // Languages detection
  const languagePatterns = [
    /(?:english|angielski|język angielski)[:\s]*([^\n,]*)/gi,
    /(?:polish|polski|język polski)[:\s]*([^\n,]*)/gi,
    /(?:german|niemiecki|język niemiecki)[:\s]*([^\n,]*)/gi,
    /(?:french|francuski|język francuski)[:\s]*([^\n,]*)/gi,
    /(?:spanish|hiszpański|język hiszpański)[:\s]*([^\n,]*)/gi
  ]
  
  const languages = []
  for (const pattern of languagePatterns) {
    const matches = text.match(pattern) || []
    languages.push(...matches.map(match => match.trim()))
  }
  
  // Projects detection
  const projectLines = text.split('\n')
    .filter(line => 
      /project|projekt|application|app|system|platforma|portal/i.test(line) &&
      line.length > 20 && line.length < 200
    )
    .slice(0, 3)
  
  // Summary generation
  const name = text.match(/(?:^|\n)\s*([A-ZŚĆŻŹŁĄĘŃ][a-zśćżźłąęń]+\s+[A-ZŚĆŻŹŁĄĘŃ][a-zśćżźłąęń]+)/)?.[1] || 'Kandydat'
  const primaryRole = roles[0] || 'Developer'
  const topSkills = maybeSkills.slice(0, 3).join(', ')
  
  const summary = `${name} - ${seniority} ${primaryRole}${experienceYears ? ` z ${experienceYears} latami doświadczenia` : ''}${topSkills ? `. Główne umiejętności: ${topSkills}` : ''}.`
  
  console.log('Heuristic analysis completed with:', {
    skills: maybeSkills.length,
    roles: roles.length,
    experienceYears,
    seniority
  })
  
  return {
    summary,
    key_skills: maybeSkills,
    total_experience_years: experienceYears || 0,
    seniority,
    top_roles: roles.length > 0 ? roles : [primaryRole],
    education: Array.from(new Set(education)).slice(0, 3),
    languages: Array.from(new Set(languages)).slice(0, 5),
    notable_projects: projectLines,
    risks: maybeSkills.length < 3 ? ['Ograniczona liczba zidentyfikowanych umiejętności technicznych'] : [],
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
