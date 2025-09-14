import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { chatJSON, heuristicAnalysis } from "@/lib/ai"

export const maxDuration = 60

function extOf(name?: string | null) {
  if (!name) return ""
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ""
}

async function getLatestCvKey(appId: string, bucket: string) {
  const prefix = `applications/${appId}`
  const { data: files, error } = await supabaseAdmin.storage.from(bucket).list(prefix, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'updated_at', order: 'desc' },
  })
  if (error) throw new Error(error.message)
  
  // Filter out analysis.json files - we only want CV files
  const cvFiles = files?.filter(file => 
    file.name && !file.name.includes('analysis.json')
  ) || []
  
  console.log('All files found:', files?.map(f => f.name))
  console.log('CV files filtered:', cvFiles.map(f => f.name))
  
  if (cvFiles.length > 0) return `${prefix}/${cvFiles[0].name}`
  return null
}

async function downloadAsArrayBuffer(bucket: string, key: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).download(key)
  if (error || !data) throw new Error(error?.message || "Download failed")
  // supabase-js returns a Blob in node env too; convert to ArrayBuffer
  const buf = await data.arrayBuffer()
  return buf
}

async function extractText(fileName: string, bytes: ArrayBuffer): Promise<string> {
  const ext = extOf(fileName)
  console.log(`Extracting text from ${ext} file: ${fileName}`)
  
  if (ext === 'pdf') {
    return await extractFromPDF(bytes, fileName)
  }
  if (ext === 'docx') {
    return await extractFromDOCX(bytes)
  }
  if (ext === 'txt') {
    console.log('Processing as plain text file')
    return Buffer.from(bytes).toString('utf-8')
  }
  
  // Fallback: try utf-8 decode for unknown formats
  console.log('Using fallback UTF-8 decoding')
  const text = Buffer.from(bytes).toString('utf-8')
  if (text.trim().length === 0) {
    throw new Error('No readable text found in file')
  }
  return text
}

async function extractFromPDF(bytes: ArrayBuffer, fileName: string): Promise<string> {
  const methods = [
    { name: 'pdf-parse', fn: () => extractWithPdfParse(bytes) },
    { name: 'pdfjs-dist', fn: () => extractWithPdfJs(bytes) },
    { name: 'fallback-text', fn: () => extractFallbackText(bytes) },
    { name: 'encoding-fallback', fn: () => extractWithEncodingFallback(bytes) }
  ]
  
  for (const method of methods) {
    try {
      console.log(`Trying PDF extraction method: ${method.name}`)
      const text = await method.fn()
      if (text && text.trim().length > 0) {
        console.log(`Success with ${method.name}, extracted ${text.length} characters`)
        return text.trim()
      }
      console.log(`${method.name} returned empty text, trying next method`)
    } catch (error: any) {
      console.warn(`${method.name} failed:`, error.message)
      continue
    }
  }
  
  // If all methods fail, return a basic analysis indicating the issue
  console.log('All PDF extraction methods failed, returning minimal info')
  return `PDF file received: ${fileName}. File size: ${bytes.byteLength} bytes. Manual review required - automatic text extraction failed.`
}

async function extractWithPdfParse(bytes: ArrayBuffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default as any
  const res = await pdfParse(Buffer.from(bytes))
  return String(res.text || '').trim()
}

async function extractWithPdfJs(bytes: ArrayBuffer): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }
    
    return fullText.trim()
  } catch (error: any) {
    throw new Error(`PDF.js extraction failed: ${error.message}`)
  }
}

async function extractWithEncodingFallback(bytes: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(bytes)
  
  // Try different encodings
  const encodings = ['utf8', 'latin1', 'ascii', 'utf16le', 'base64']
  
  for (const encoding of encodings) {
    try {
      let text = buffer.toString(encoding as BufferEncoding)
      
      // Clean up and look for readable content
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      
      // Extract words (sequences of letters and basic punctuation)
      const words = text.match(/[a-zA-Z][a-zA-Z\s\d.,!?-]{2,}/g) || []
      const readable = words
        .filter(word => word.trim().length > 2)
        .filter(word => /[a-zA-Z]/.test(word))
        .join(' ')
      
      if (readable.length > 50) {
        console.log(`Encoding ${encoding} yielded ${readable.length} readable characters`)
        return readable
      }
    } catch (e) {
      continue
    }
  }
  
  throw new Error('No readable text found with any encoding')
}

async function extractWithOCR(bytes: ArrayBuffer): Promise<string> {
  try {
    console.log('Attempting OCR extraction (this may take a while)...')
    
    // Convert PDF first page to image, then OCR
    const pdfjsLib = await import('pdfjs-dist')
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise
    
    if (pdf.numPages === 0) {
      throw new Error('PDF has no pages')
    }
    
    // Get first page for OCR
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2.0 })
    
    // Create canvas (this is a simplified approach - in production you'd need proper canvas setup)
    const canvas = { 
      width: viewport.width, 
      height: viewport.height,
      getContext: () => null 
    }
    
    // For now, return a message indicating OCR would be attempted
    throw new Error('OCR extraction requires additional setup - skipping for now')
    
  } catch (error: any) {
    throw new Error(`OCR extraction failed: ${error.message}`)
  }
}

async function extractFallbackText(bytes: ArrayBuffer): Promise<string> {
  try {
    // Try to extract any readable text from PDF binary data
    const buffer = Buffer.from(bytes)
    const text = buffer.toString('latin1')
    
    // Look for text patterns in PDF streams - multiple methods
    const methods = [
      // Method 1: Extract text from parentheses (PDF text objects)
      () => {
        const textMatches = text.match(/\(([^)]*)\)/g) || []
        return textMatches
          .map(match => match.slice(1, -1))
          .filter(t => t.trim().length > 2)
          .join(' ')
      },
      
      // Method 2: Extract text from hex strings
      () => {
        const hexMatches = text.match(/<([0-9A-Fa-f\s]+)>/g) || []
        let result = ''
        for (const match of hexMatches) {
          try {
            const hex = match.slice(1, -1).replace(/\s/g, '')
            if (hex.length % 2 === 0) {
              const decoded = Buffer.from(hex, 'hex').toString('utf8')
              if (decoded.match(/[a-zA-Z]/)) {
                result += decoded + ' '
              }
            }
          } catch (e) {
            continue
          }
        }
        return result
      },
      
      // Method 3: Look for readable ASCII text in streams
      () => {
        const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g
        const streamMatches = text.match(streamRegex) || []
        let result = ''
        for (const stream of streamMatches) {
          const streamContent = stream.replace(/^stream\s*/, '').replace(/\s*endstream$/, '')
          const readable = streamContent.match(/[a-zA-Z][a-zA-Z0-9\s.,!?]+/g) || []
          result += readable.join(' ') + ' '
        }
        return result
      },
      
      // Method 4: Extract from BT/ET blocks (text blocks)
      () => {
        const btRegex = /BT\s*([\s\S]*?)\s*ET/g
        const btMatches = text.match(btRegex) || []
        let result = ''
        for (const block of btMatches) {
          const blockContent = block.replace(/^BT\s*/, '').replace(/\s*ET$/, '')
          const textParts = blockContent.match(/\([^)]*\)/g) || []
          result += textParts.map(p => p.slice(1, -1)).join(' ') + ' '
        }
        return result
      }
    ]
    
    // Try each method and return the one with most text
    let bestText = ''
    for (const method of methods) {
      try {
        const extracted = method()
        if (extracted && extracted.trim().length > bestText.length) {
          bestText = extracted.trim()
        }
      } catch (e) {
        continue
      }
    }
    
    if (bestText.length > 10) {
      console.log(`Fallback extraction successful: ${bestText.length} characters`)
      return bestText
    }
    
    throw new Error('No readable text found in PDF binary data')
  } catch (error: any) {
    throw new Error(`Fallback text extraction failed: ${error.message}`)
  }
}

async function extractFromDOCX(bytes: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import('mammoth') as any
    console.log('Using mammoth for DOCX extraction')
    const res = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
    const text = String(res.value || '').trim()
    
    if (text.length === 0) {
      throw new Error('DOCX file appears to be empty')
    }
    
    return text
  } catch (error: any) {
    console.error(`DOCX extraction error:`, error.message)
    throw new Error(`Failed to extract text from DOCX: ${error.message}`)
  }
}

function buildPrompt(text: string) {
  const clipped = text.length > 16000 ? text.slice(0, 16000) : text
  return `You are a recruiting assistant. Analyze the CV text below and return a concise JSON with keys: summary, key_skills (array), total_experience_years (number), seniority (one of: junior, mid, senior, lead), top_roles (array of strings), education (array of strings), languages (array of strings), notable_projects (array of strings), risks (array of strings). Only JSON, no extra text.\n\nCV_TEXT:\n${clipped}`
}

// Removed direct OpenAI call; we use lib/ai provider abstraction.

async function readCached(bucket: string, appId: string) {
  const key = `applications/${appId}/analysis.json`
  const { data } = await supabaseAdmin.storage.from(bucket).download(key)
  if (!data) return null
  try {
    const txt = await data.text()
    return JSON.parse(txt)
  } catch {
    return null
  }
}

async function writeCached(bucket: string, appId: string, value: any) {
  const key = `applications/${appId}/analysis.json`
  const content = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  await supabaseAdmin.storage.from(bucket).upload(key, content, { upsert: true, contentType: 'application/json' })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('=== CV ANALYZE API CALLED ===', params.id)
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const search = new URL(req.url).searchParams
  const refresh = search.get('refresh') === '1'
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'cvs'
  console.log('Request params - refresh:', refresh, 'bucket:', bucket)

  const app = await prisma.candidateApplication.findUnique({
    where: { id: params.id },
    select: { id: true, cvFileName: true }
  })
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!refresh) {
    console.log('Checking cache for app:', app.id)
    const cached = await readCached(bucket, app.id)
    console.log('Cache result:', cached ? 'Found cached data' : 'No cache found')
    if (cached) {
      console.log('Returning cached data:', JSON.stringify(cached, null, 2))
      return NextResponse.json({ cached: true, result: cached })
    }
  }

  const key = await getLatestCvKey(app.id, bucket)
  console.log('Found CV key:', key)
  if (!key) return NextResponse.json({ error: 'CV not found in storage' }, { status: 404 })

  try {
    const bytes = await downloadAsArrayBuffer(bucket, key)
    console.log(`Downloaded CV file, size: ${bytes.byteLength} bytes`)
    console.log('File path:', key)
    
    const fileName = app.cvFileName || key.split('/').pop() || 'file'
    console.log(`Attempting to extract text from file: ${fileName}`)
    console.log('Is this an analysis.json file?', key.includes('analysis.json'))
    
    let text = ''
    try {
      text = await extractText(fileName, bytes)
      console.log(`Text extraction successful, length: ${text.length} characters`)
      
      // Check if extracted text looks like garbage (too many non-alphabetic characters)
      const alphabeticRatio = (text.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length / text.length
      console.log(`Text quality check - alphabetic ratio: ${alphabeticRatio}`)
      
      if (alphabeticRatio < 0.3) {
        console.log('Extracted text appears to be garbage, trying OCR...')
        try {
          text = await extractWithOCR(bytes)
          console.log(`OCR extraction successful, length: ${text.length} characters`)
        } catch (ocrError) {
          console.log('OCR failed, using original text:', ocrError)
        }
      }
    } catch (extractError: any) {
      console.error('Text extraction failed:', extractError.message)
      console.error('File extension:', extOf(fileName))
      console.error('File size:', bytes.byteLength)
      
      // Try OCR as fallback
      try {
        console.log('Trying OCR as fallback...')
        text = await extractWithOCR(bytes)
        console.log(`OCR fallback successful, length: ${text.length} characters`)
      } catch (ocrError) {
        console.log('OCR fallback failed, providing descriptive text')
        // Always provide some text for analysis, even if extraction failed
        text = `Plik CV: ${fileName} (${bytes.byteLength} bajtów). Automatyczna ekstrakcja tekstu nie powiodła się. Plik może zawierać tylko obrazy lub być w niestandardowym formacie. Wymagana ręczna weryfikacja.`
      }
    }
    
    // Ensure we always have some text to analyze
    if (!text || text.trim().length === 0) {
      console.error('Extracted text is empty, providing fallback')
      text = `CV file uploaded: ${fileName}. File size: ${bytes.byteLength} bytes. Text extraction returned empty result. Manual review required.`
    }

    console.log(`Building prompt with ${text.length} characters of text`)
    const prompt = buildPrompt(text)
    console.log('Prompt created, calling AI analysis...')
    console.log('EXTRACTED TEXT:', JSON.stringify(text))
    console.log('FULL PROMPT:', JSON.stringify(prompt))
    
    let result: any
    try {
      console.log('Attempting chatJSON analysis...')
      result = await chatJSON(prompt)
      console.log('chatJSON success:', result ? 'Got result' : 'Empty result')
    } catch (e: any) {
      console.log('chatJSON failed, falling back to heuristic:', e.message)
      // No provider configured: fallback to heuristic extraction (free)
      result = heuristicAnalysis(text)
      console.log('Heuristic analysis completed:', result ? 'Got result' : 'Empty result')
    }
    
    console.log('Caching result and returning response...')
    await writeCached(bucket, app.id, result)
    return NextResponse.json({ cached: false, result })
  } catch (e: any) {
    console.error('Analysis error:', e)
    return NextResponse.json({ error: e?.message || 'Analysis failed' }, { status: 500 })
  }
}
