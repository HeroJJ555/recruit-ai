import { perplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function safeJSONParse<T = any>(s: string): T | null {
  try { return JSON.parse(s) } catch { return null }
}

async function puterClaudeChat(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.puter.com/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-3-haiku-20240307',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.message?.content || ''
    
    if (!text) {
      throw new Error('Empty response from Puter API')
    }
    
    return text

async function perplexityChat(prompt: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''
  
  return text
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
  console.log(`🤖 OpenAI Request: model=${model}, json=${opts?.json || false}`)
  
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        response_format: opts?.json ? { type: 'json_object' } : undefined,
      })
    })

    // Extract debugging headers for troubleshooting
    const requestId = res.headers.get('x-request-id')
    const organization = res.headers.get('openai-organization')
    const processingMs = res.headers.get('openai-processing-ms')
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining-requests')
    
    console.log('🤖 OpenAI Response Headers:', {
      requestId,
      organization,
      processingMs: processingMs ? `${processingMs}ms` : undefined,
      rateLimitRemaining
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = `OpenAI API error ${res.status}: ${errorData.error?.message || res.statusText}`
      console.error('❌ OpenAI Error Details:', { requestId, status: res.status, error: errorData })
      throw new Error(errorMessage)
    }

    const data = await res.json()
    const content: string = data?.choices?.[0]?.message?.content || ''
    
    console.log('✅ OpenAI Success:', {
      requestId,
      contentLength: content.length,
      tokensUsed: data?.usage?.total_tokens,
      model: data?.model
    })
    
    return content
  } catch (error) {
    console.error('❌ OpenAI Request Failed:', error)
    throw error
  }
}

export const chatJSON = async (prompt: string, provider: 'openai' | 'puter' | 'perplexity' = 'openai', opts?: { json?: boolean }) => {
  const cleanedPrompt = prompt.replace(/\s+/g, ' ').trim()
  
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful assistant that analyzes CVs and resumes. Always reply with strict JSON only.' },
    { role: 'user', content: prompt }
  ]
  
  let content = ''
  
  // Try providers in order: OpenAI (primary) -> Puter (free Claude) -> Perplexity (free) -> Ollama (free local) -> Heuristic (fallback)
  if (provider === 'openai' || !provider) {
    try {
      console.log('🤖 Attempting OpenAI connection...')
      content = await callOpenAI(messages, { json: true })
      console.log('✅ OpenAI response length:', content.length)
    } catch (error) {
      console.error('❌ OpenAI failed, trying Puter:', error)
      try {
        console.log('🎯 Attempting Puter (Claude) fallback...')
        content = await callPuter(messages, { json: true })
        console.log('✅ Puter response length:', content.length)
      } catch (puterError) {
        console.error('❌ Puter also failed, trying Perplexity:', puterError)
        try {
          console.log('🔮 Attempting Perplexity fallback...')
          content = await callPerplexity(messages, { json: true })
          console.log('✅ Perplexity response length:', content.length)
        } catch (perplexityError) {
          console.error('❌ All AI providers failed:', perplexityError)
          throw error // Use original OpenAI error
        }
      }
    }
  } else if (provider === 'puter') {
    try {
      console.log('🎯 Using Puter (Claude) provider...')
      content = await callPuter(messages, { json: true })
      console.log('✅ Puter response length:', content.length)
    } catch (error) {
      console.error('❌ Puter failed, trying OpenAI:', error)
      try {
        content = await callOpenAI(messages, { json: true })
        console.log('✅ OpenAI fallback response length:', content.length)
      } catch (openaiError) {
        console.error('❌ OpenAI fallback also failed:', openaiError)
        throw error // Use original Puter error
      }
    }
  } else if (provider === 'perplexity') {
    try {
      console.log('🔮 Using Perplexity provider...')
      content = await callPerplexity(messages, { json: true })
      console.log('✅ Perplexity response length:', content.length)
    } catch (error) {
      console.error('❌ Perplexity failed, trying OpenAI:', error)
      try {
        content = await callOpenAI(messages, { json: true })
        console.log('✅ OpenAI fallback response length:', content.length)
      } catch (openaiError) {
        console.error('❌ OpenAI fallback also failed:', openaiError)
        throw error // Use original Perplexity error
      }
    }
  } else if (provider === 'ollama' && process.env.OLLAMA_HOST) {
    console.log('� Using Ollama provider...')
    content = await callOllama(messages, { json: true })
    console.log('✅ Ollama response length:', content.length)
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
