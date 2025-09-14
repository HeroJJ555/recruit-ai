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
  console.log(`\n=== EXTRACTING TEXT FROM ${ext.toUpperCase()} FILE ===`)
  console.log(`File: ${fileName}`)
  console.log(`Size: ${bytes.byteLength} bytes`)
  console.log(`Extension: ${ext}`)
  
  // Log binary preview
  const buffer = Buffer.from(bytes)
  const preview = buffer.slice(0, 100).toString('hex')
  console.log(`Binary preview (first 100 bytes): ${preview}`)
  
  // Check file signature
  const signature = buffer.slice(0, 10).toString('hex')
  console.log(`File signature: ${signature}`)
  
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
  console.log(`\n=== PDF EXTRACTION DEBUG ===`)
  console.log(`PDF File: ${fileName}`)
  console.log(`PDF Size: ${bytes.byteLength} bytes`)
  
  const buffer = Buffer.from(bytes)
  
  // Check if it's actually a PDF
  const pdfHeader = buffer.slice(0, 4).toString()
  console.log(`PDF Header: "${pdfHeader}"`)
  if (!pdfHeader.startsWith('%PDF')) {
    console.log('❌ NOT A VALID PDF! Missing %PDF header')
    throw new Error('File is not a valid PDF - missing %PDF header')
  }
  
  // Get PDF version
  const versionMatch = buffer.slice(0, 20).toString().match(/%PDF-(\d\.\d)/)
  if (versionMatch) {
    console.log(`✅ PDF Version: ${versionMatch[1]}`)
  }
  
  const methods = [
    { name: 'pdf2json', fn: () => extractWithPdf2Json(bytes, fileName) },
    { name: 'pdfreader', fn: () => extractWithPdfReader(bytes, fileName) },
    { name: 'pdf-parse-fixed', fn: () => extractWithPdfParseFixed(bytes) },
    { name: 'raw-text-search', fn: () => extractRawTextFromPDF(bytes) },
    { name: 'encoding-fallback', fn: () => extractWithEncodingFallback(bytes) }
  ]
  
  let allResults: Array<{method: string, success: boolean, textLength: number, preview: string, error?: string}> = []
  
  for (const method of methods) {
    try {
      console.log(`\n--- Trying method: ${method.name} ---`)
      const startTime = Date.now()
      const text = await method.fn()
      const endTime = Date.now()
      
      if (text && text.trim().length > 0) {
        const textLength = text.length
        const preview = text.trim().substring(0, 200)
        const wordCount = text.split(/\s+/).length
        const alphabeticRatio = (text.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length / text.length
        
        console.log(`✅ ${method.name} SUCCESS!`)
        console.log(`   Time: ${endTime - startTime}ms`)
        console.log(`   Length: ${textLength} characters`)
        console.log(`   Words: ${wordCount}`)
        console.log(`   Alphabetic ratio: ${alphabeticRatio.toFixed(3)}`)
        console.log(`   Preview: "${preview}..."`)
        
        allResults.push({
          method: method.name,
          success: true,
          textLength,
          preview: preview.substring(0, 100)
        })
        
        // Return first successful result
        return text.trim()
      } else {
        console.log(`❌ ${method.name} returned empty text`)
        allResults.push({
          method: method.name,
          success: false,
          textLength: 0,
          preview: '',
          error: 'Empty result'
        })
      }
    } catch (error: any) {
      console.log(`❌ ${method.name} failed: ${error.message}`)
      allResults.push({
        method: method.name,
        success: false,
        textLength: 0,
        preview: '',
        error: error.message
      })
      continue
    }
  }
  
  // Log summary of all attempts
  console.log(`\n=== PDF EXTRACTION SUMMARY ===`)
  console.log('All extraction attempts:')
  allResults.forEach(result => {
    console.log(`  ${result.method}: ${result.success ? '✅' : '❌'} ${result.success ? `${result.textLength} chars` : result.error}`)
  })
  
  // If all methods fail, return a descriptive analysis
  console.log('❌ All PDF extraction methods failed, returning minimal info')
  return `PDF file received: ${fileName}. File size: ${bytes.byteLength} bytes. Manual review required - automatic text extraction failed.`
}

async function extractWithPdfParse(bytes: ArrayBuffer): Promise<string> {
  console.log('   🔍 pdf-parse: Loading library...')
  const pdfParse = (await import('pdf-parse')).default as any
  console.log('   🔍 pdf-parse: Parsing PDF...')
  const res = await pdfParse(Buffer.from(bytes))
  console.log(`   🔍 pdf-parse: Got ${res.numpages} pages, ${res.numrender} rendered`)
  console.log(`   🔍 pdf-parse: Raw text length: ${res.text?.length || 0}`)
  const text = String(res.text || '').trim()
  
  // Show detailed text analysis
  if (text.length > 0) {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    console.log(`   🔍 pdf-parse: Non-empty lines: ${lines.length}`)
    console.log(`   🔍 pdf-parse: First 3 lines:`)
    lines.slice(0, 3).forEach((line, i) => {
      console.log(`     ${i+1}: "${line.substring(0, 100)}"`)
    })
  }
  
  return text
}

async function extractWithPdfParseFixed(bytes: ArrayBuffer): Promise<string> {
  try {
    console.log('   🔍 pdf-parse-fixed: Loading library...')
    const pdfParse = (await import('pdf-parse')).default as any
    console.log('   🔍 pdf-parse-fixed: Parsing PDF buffer directly...')
    
    // Parse without any options to avoid test file dependencies
    const buffer = Buffer.from(bytes)
    const res = await pdfParse(buffer)
    
    console.log(`   🔍 pdf-parse-fixed: Success - ${res.numpages} pages`)
    console.log(`   🔍 pdf-parse-fixed: Extracted text length: ${res.text?.length || 0}`)
    
    const text = String(res.text || '').trim()
    if (text.length > 0) {
      console.log(`   🔍 pdf-parse-fixed: Preview: "${text.substring(0, 200)}"`)
      // Show some lines for debugging
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      console.log(`   🔍 pdf-parse-fixed: Found ${lines.length} non-empty lines`)
      if (lines.length > 0) {
        console.log(`   🔍 pdf-parse-fixed: First line: "${lines[0].substring(0, 100)}"`)
      }
    }
    
    return text
  } catch (error: any) {
    console.log(`   ❌ pdf-parse-fixed: ${error.message}`)
    // If it's the test file error, try a workaround
    if (error.message.includes('test/data')) {
      console.log('   � pdf-parse-fixed: Test file error detected, trying workaround...')
      try {
        // Try importing pdf-parse differently
        const pdfParse = require('pdf-parse')
        const buffer = Buffer.from(bytes)
        const res = await pdfParse(buffer, { max: 0 }) // max: 0 means parse all pages
        const text = String(res.text || '').trim()
        console.log(`   ✅ pdf-parse-fixed: Workaround success - ${text.length} chars`)
        return text
      } catch (workaroundError: any) {
        console.log(`   ❌ pdf-parse-fixed: Workaround failed - ${workaroundError.message}`)
      }
    }
    throw error
  }
}

async function extractWithPoppler(bytes: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log('   🔍 poppler: Attempting text extraction...')
    
    // Save buffer to temp file for poppler
    const fs = await import('fs')
    const path = await import('path')
    const os = await import('os')
    
    const tempDir = os.tmpdir()
    const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`)
    const tempTxtPath = path.join(tempDir, `temp_${Date.now()}.txt`)
    
    console.log(`   🔍 poppler: Writing to temp file: ${tempPdfPath}`)
    fs.writeFileSync(tempPdfPath, Buffer.from(bytes))
    
    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      console.log(`   🔍 poppler: Running pdftotext command...`)
      const command = `pdftotext "${tempPdfPath}" "${tempTxtPath}"`
      await execAsync(command)
      
      if (fs.existsSync(tempTxtPath)) {
        const text = fs.readFileSync(tempTxtPath, 'utf-8').trim()
        console.log(`   🔍 poppler: Extracted ${text.length} characters`)
        console.log(`   🔍 poppler: Preview: "${text.substring(0, 100)}"`)
        
        // Cleanup
        fs.unlinkSync(tempPdfPath)
        fs.unlinkSync(tempTxtPath)
        
        return text
      } else {
        throw new Error('pdftotext did not create output file')
      }
    } catch (cmdError: any) {
      // Cleanup on error
      if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
      if (fs.existsSync(tempTxtPath)) fs.unlinkSync(tempTxtPath)
      throw new Error(`pdftotext command failed: ${cmdError.message}`)
    }
  } catch (error: any) {
    console.log(`   ❌ poppler: ${error.message}`)
    throw error
  }
}

async function extractRawTextFromPDF(bytes: ArrayBuffer): Promise<string> {
  try {
    console.log('   🔍 raw-text-search: Searching for readable text in PDF binary...')
    const buffer = Buffer.from(bytes)
    const content = buffer.toString('latin1')
    
    // Look for common PDF text patterns - IMPROVED VERSION
    const patterns = [
      // Pattern 1: Clean text in parentheses - filter out metadata
      {
        name: 'clean-parentheses-text',
        regex: /\(([^)]{3,})\)/g,
        extract: (matches: RegExpMatchArray[]) => {
          return matches
            .map(match => match[1])
            .filter(text => {
              // Filter out metadata and junk
              const lower = text.toLowerCase()
              if (lower.includes('anonymous') || lower.includes('unspecified')) return false
              if (lower.includes('reportlab') || lower.includes('www.')) return false
              if (lower.includes('d:') && lower.includes("'00'")) return false // timestamps
              if (/^[^a-zA-Z]*$/.test(text)) return false // no letters
              if (text.length < 3) return false
              if (/[\\]{2,}/.test(text)) return false // escaped characters
              
              // Keep text that looks like real content
              return /[a-zA-Z]/.test(text) && text.length > 2
            })
            .map(text => {
              // Clean up escaped characters
              return text
                .replace(/\\[\\()]/g, '') // remove escaped chars
                .replace(/\s+/g, ' ') // normalize spaces
                .trim()
            })
            .filter(text => text.length > 2)
            .join(' ')
        }
      },
      
      // Pattern 2: Look for stream content with decompression
      {
        name: 'stream-content',
        regex: /stream\s*([\s\S]*?)\s*endstream/g,
        extract: (matches: RegExpMatchArray[]) => {
          let result = ''
          for (const match of matches) {
            const streamContent = match[1]
            // Look for readable text in stream
            const textMatches = streamContent.match(/[A-Za-z][A-Za-z\s]{5,}/g) || []
            result += textMatches.filter(t => t.trim().length > 5).join(' ') + ' '
          }
          return result.trim()
        }
      },
      
      // Pattern 3: Text objects with better filtering
      {
        name: 'text-objects',
        regex: /BT\s*([\s\S]*?)\s*ET/g,
        extract: (matches: RegExpMatchArray[]) => {
          let result = ''
          for (const match of matches) {
            const btContent = match[1]
            // Extract text from BT/ET blocks
            const textParts = btContent.match(/\(([^)]+)\)/g) || []
            const cleanTexts = textParts
              .map(p => p.slice(1, -1))
              .filter(text => {
                const lower = text.toLowerCase()
                return !lower.includes('anonymous') && 
                       !lower.includes('unspecified') &&
                       !lower.includes('reportlab') &&
                       /[a-zA-Z]/.test(text) && 
                       text.length > 2
              })
            result += cleanTexts.join(' ') + ' '
          }
          return result.trim()
        }
      },
      
      // Pattern 4: Direct readable ASCII text search
      {
        name: 'ascii-text',
        regex: /[A-Za-z][A-Za-z\s\.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}/g,
        extract: (matches: RegExpMatchArray[]) => {
          return matches
            .map(match => match[0]) // Get the full match string
            .filter(text => {
              const lower = text.toLowerCase()
              // Filter out common PDF junk
              if (lower.includes('reportlab') || lower.includes('anonymous')) return false
              if (lower.includes('www.') || lower.includes('http')) return false
              
              // Keep text that looks like real content
              const alphaRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length
              return alphaRatio > 0.6 && text.length > 10
            })
            .join(' ')
        }
      }
    ]
    
    let bestText = ''
    let bestMethod = ''
    
    for (const pattern of patterns) {
      console.log(`   🔍 raw-text-search: Trying ${pattern.name} pattern...`)
      const matches = Array.from(content.matchAll(pattern.regex))
      console.log(`   🔍 raw-text-search: Found ${matches.length} matches for ${pattern.name}`)
      
      if (matches.length > 0) {
        const extracted = pattern.extract(matches)
        console.log(`   🔍 raw-text-search: ${pattern.name} extracted ${extracted.length} chars`)
        
        if (extracted && extracted.trim().length > 0) {
          console.log(`   🔍 raw-text-search: ${pattern.name} preview: "${extracted.substring(0, 100)}"`)
          
          if (extracted.length > bestText.length) {
            bestText = extracted
            bestMethod = pattern.name
            console.log(`   ✅ raw-text-search: New best result from ${pattern.name}: ${extracted.length} chars`)
          }
        }
      }
    }
    
    if (bestText.length > 10) {
      console.log(`   🔍 raw-text-search: Final result from ${bestMethod}: ${bestText.length} characters`)
      console.log(`   🔍 raw-text-search: Final preview: "${bestText.substring(0, 200)}"`)
      return bestText.trim()
    }
    
    throw new Error('No readable text patterns found')
  } catch (error: any) {
    console.log(`   ❌ raw-text-search: ${error.message}`)
    throw error
  }
}

async function extractWithPdfJs(bytes: ArrayBuffer): Promise<string> {
  try {
    console.log('   🔍 pdfjs-dist: Loading library...')
    const pdfjsLib = await import('pdfjs-dist')
    console.log('   🔍 pdfjs-dist: Creating document...')
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise
    console.log(`   🔍 pdfjs-dist: Document loaded, ${pdf.numPages} pages`)
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`   🔍 pdfjs-dist: Processing page ${i}/${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      console.log(`   🔍 pdfjs-dist: Page ${i} has ${textContent.items.length} text items`)
      
      const pageText = textContent.items
        .map((item: any) => {
          const text = item.str || ''
          // Log first few items for debugging
          if (i === 1 && fullText.length < 200) {
            console.log(`     Item: "${text}" (${text.length} chars)`)
          }
          return text
        })
        .join(' ')
      
      console.log(`   🔍 pdfjs-dist: Page ${i} text length: ${pageText.length}`)
      fullText += pageText + '\n'
    }
    
    console.log(`   🔍 pdfjs-dist: Total extracted text length: ${fullText.length}`)
    return fullText.trim()
  } catch (error: any) {
    console.log(`   ❌ pdfjs-dist error: ${error.message}`)
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
    console.log('   🔍 fallback: Starting binary text extraction...')
    // Try to extract any readable text from PDF binary data
    const buffer = Buffer.from(bytes)
    const text = buffer.toString('latin1')
    console.log(`   🔍 fallback: Binary data as latin1 - ${text.length} chars`)
    
    // Look for text patterns in PDF streams - multiple methods
    const methods = [
      // Method 1: Extract text from parentheses (PDF text objects)
      {
        name: 'parentheses',
        fn: () => {
          const textMatches = text.match(/\(([^)]*)\)/g) || []
          console.log(`     Method 1: Found ${textMatches.length} parentheses matches`)
          const result = textMatches
            .map(match => match.slice(1, -1))
            .filter(t => t.trim().length > 2)
            .join(' ')
          console.log(`     Method 1: Extracted ${result.length} chars`)
          return result
        }
      },
      
      // Method 2: Extract text from hex strings
      {
        name: 'hex',
        fn: () => {
          const hexMatches = text.match(/<([0-9A-Fa-f\s]+)>/g) || []
          console.log(`     Method 2: Found ${hexMatches.length} hex matches`)
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
          console.log(`     Method 2: Extracted ${result.length} chars`)
          return result
        }
      },
      
      // Method 3: Look for readable ASCII text in streams
      {
        name: 'streams',
        fn: () => {
          const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g
          const streamMatches = text.match(streamRegex) || []
          console.log(`     Method 3: Found ${streamMatches.length} stream matches`)
          let result = ''
          for (const stream of streamMatches) {
            const streamContent = stream.replace(/^stream\s*/, '').replace(/\s*endstream$/, '')
            const readable = streamContent.match(/[a-zA-Z][a-zA-Z0-9\s.,!?]+/g) || []
            result += readable.join(' ') + ' '
          }
          console.log(`     Method 3: Extracted ${result.length} chars`)
          return result
        }
      },
      
      // Method 4: Extract from BT/ET blocks (text blocks)
      {
        name: 'text-blocks',
        fn: () => {
          const btRegex = /BT\s*([\s\S]*?)\s*ET/g
          const btMatches = text.match(btRegex) || []
          console.log(`     Method 4: Found ${btMatches.length} BT/ET matches`)
          let result = ''
          for (const block of btMatches) {
            const blockContent = block.replace(/^BT\s*/, '').replace(/\s*ET$/, '')
            const textParts = blockContent.match(/\([^)]*\)/g) || []
            result += textParts.map(p => p.slice(1, -1)).join(' ') + ' '
          }
          console.log(`     Method 4: Extracted ${result.length} chars`)
          return result
        }
      }
    ]
    
    // Try each method and return the one with most text
    let bestText = ''
    let bestMethod = ''
    for (const method of methods) {
      try {
        console.log(`   🔍 fallback: Trying ${method.name} method...`)
        const extracted = method.fn()
        if (extracted && extracted.trim().length > bestText.length) {
          bestText = extracted.trim()
          bestMethod = method.name
          console.log(`   ✅ fallback: New best result from ${method.name}: ${bestText.length} chars`)
        }
      } catch (e) {
        console.log(`   ❌ fallback: ${method.name} method failed`)
        continue
      }
    }
    
    if (bestText.length > 10) {
      console.log(`   ✅ fallback: SUCCESS with ${bestMethod} method - ${bestText.length} characters`)
      console.log(`   📄 fallback: Preview: "${bestText.substring(0, 200)}"`)
      return bestText
    }
    
    console.log(`   ❌ fallback: All methods failed, no readable text found`)
    throw new Error('No readable text found in PDF binary data')
  } catch (error: any) {
    console.log(`   ❌ fallback: Exception - ${error.message}`)
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
      console.log(`\n=== STARTING TEXT EXTRACTION ===`)
      text = await extractText(fileName, bytes)
      console.log(`\n=== TEXT EXTRACTION COMPLETED ===`)
      console.log(`✅ Text extraction successful, length: ${text.length} characters`)
      
      // Detailed text analysis
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      const words = text.split(/\s+/).filter(word => word.length > 0)
      const alphabeticChars = (text.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length
      const alphabeticRatio = alphabeticChars / text.length
      
      console.log(`📊 TEXT QUALITY ANALYSIS:`)
      console.log(`   Total characters: ${text.length}`)
      console.log(`   Non-empty lines: ${lines.length}`)
      console.log(`   Words: ${words.length}`)
      console.log(`   Alphabetic characters: ${alphabeticChars}`)
      console.log(`   Alphabetic ratio: ${alphabeticRatio.toFixed(3)}`)
      console.log(`   Quality: ${alphabeticRatio >= 0.3 ? '✅ GOOD' : '⚠️ POOR (may need OCR)'}`)
      
      console.log(`\n📄 TEXT PREVIEW (first 500 characters):`)
      console.log(`"${text.substring(0, 500)}"`)
      
      if (lines.length > 0) {
        console.log(`\n📝 FIRST 5 LINES:`)
        lines.slice(0, 5).forEach((line, i) => {
          console.log(`   ${i+1}: "${line.substring(0, 100)}"`)
        })
      }
      
      // Check if extracted text looks like garbage (too many non-alphabetic characters)
      console.log(`\n🔍 QUALITY CHECK - alphabetic ratio: ${alphabeticRatio}`)
      
      if (alphabeticRatio < 0.3) {
        console.log('⚠️ Extracted text appears to be garbage, trying OCR...')
        try {
          text = await extractWithOCR(bytes)
          console.log(`✅ OCR extraction successful, length: ${text.length} characters`)
          console.log(`📄 OCR TEXT PREVIEW: "${text.substring(0, 200)}"`)
        } catch (ocrError) {
          console.log('❌ OCR failed, using original text:', ocrError)
        }
      } else {
        console.log('✅ Text quality acceptable, proceeding with extracted text')
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
    console.log('EXTRACTED TEXT (first 200 chars):', text.substring(0, 200))
    
    let result: any
    
    // INSTANT ANALYSIS - try AI but fallback immediately to heuristic for speed
    console.log('Attempting fast AI analysis with timeout...')
    try {
      // Set a 5-second timeout for AI response
      const aiPromise = chatJSON(prompt)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI timeout')), 5000)
      )
      
      result = await Promise.race([aiPromise, timeoutPromise])
      console.log('AI analysis successful:', result ? 'Got result' : 'Empty result')
    } catch (e: any) {
      console.log('AI analysis failed or timed out, using instant heuristic:', e.message)
      // Immediate fallback to heuristic analysis for instant results
      result = heuristicAnalysis(text)
      console.log('Heuristic analysis completed instantly:', result ? 'Got result' : 'Empty result')
    }
    
    console.log('Caching result and returning response...')
    await writeCached(bucket, app.id, result)
    return NextResponse.json({ cached: false, result })
  } catch (e: any) {
    console.error('Analysis error:', e)
    return NextResponse.json({ error: e?.message || 'Analysis failed' }, { status: 500 })
  }
}

async function extractWithPdf2Json(bytes: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log('   🔍 pdf2json: Starting PDF parsing...')
    
    // Save buffer to temp file for pdf2json
    const fs = await import('fs')
    const path = await import('path')
    const os = await import('os')
    
    const tempDir = os.tmpdir()
    const tempPdfPath = path.join(tempDir, `pdf2json_${Date.now()}.pdf`)
    
    console.log(`   🔍 pdf2json: Writing to temp file: ${tempPdfPath}`)
    fs.writeFileSync(tempPdfPath, Buffer.from(bytes))
    
    try {
      const PDFParser = (await import('pdf2json')).default
      
      return new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser()
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.log(`   ❌ pdf2json: Parse error - ${errData}`)
          reject(new Error(`PDF2JSON parse error: ${errData}`))
        })
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            console.log(`   🔍 pdf2json: Data ready, processing...`)
            let text = ''
            
            // Extract text from all pages
            if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
              console.log(`   🔍 pdf2json: Processing ${pdfData.Pages.length} pages`)
              
              for (let i = 0; i < pdfData.Pages.length; i++) {
                const page = pdfData.Pages[i]
                if (page.Texts && Array.isArray(page.Texts)) {
                  console.log(`   🔍 pdf2json: Page ${i+1} has ${page.Texts.length} text elements`)
                  
                  for (const textElement of page.Texts) {
                    if (textElement.R && Array.isArray(textElement.R)) {
                      for (const run of textElement.R) {
                        if (run.T) {
                          // Decode URI encoded text
                          const decodedText = decodeURIComponent(run.T)
                          text += decodedText + ' '
                        }
                      }
                    }
                  }
                  text += '\n'
                }
              }
            }
            
            console.log(`   🔍 pdf2json: Extracted ${text.length} characters`)
            console.log(`   🔍 pdf2json: Preview: "${text.substring(0, 200)}"`)
            
            // Cleanup
            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
            
            if (text.trim().length > 0) {
              resolve(text.trim())
            } else {
              reject(new Error('No text found in PDF'))
            }
          } catch (processError: any) {
            console.log(`   ❌ pdf2json: Processing error - ${processError.message}`)
            reject(processError)
          }
        })
        
        console.log(`   🔍 pdf2json: Loading PDF file...`)
        pdfParser.loadPDF(tempPdfPath)
      })
    } catch (parseError: any) {
      // Cleanup on error
      if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
      throw new Error(`PDF2JSON error: ${parseError.message}`)
    }
  } catch (error: any) {
    console.log(`   ❌ pdf2json: ${error.message}`)
    throw error
  }
}

async function extractWithPdfReader(bytes: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log('   🔍 pdfreader: Starting PDF reading...')
    
    // Save buffer to temp file for pdfreader
    const fs = await import('fs')
    const path = await import('path')
    const os = await import('os')
    
    const tempDir = os.tmpdir()
    const tempPdfPath = path.join(tempDir, `pdfreader_${Date.now()}.pdf`)
    
    console.log(`   🔍 pdfreader: Writing to temp file: ${tempPdfPath}`)
    fs.writeFileSync(tempPdfPath, Buffer.from(bytes))
    
    try {
      const { PdfReader } = await import('pdfreader')
      
      return new Promise<string>((resolve, reject) => {
        let text = ''
        let itemCount = 0
        
        new PdfReader().parseFileItems(tempPdfPath, (err: any, item: any) => {
          if (err) {
            console.log(`   ❌ pdfreader: Parse error - ${err}`)
            // Cleanup
            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
            reject(new Error(`PDFReader error: ${err}`))
            return
          }
          
          if (!item) {
            // End of file
            console.log(`   🔍 pdfreader: Finished processing ${itemCount} items`)
            console.log(`   🔍 pdfreader: Extracted ${text.length} characters`)
            console.log(`   🔍 pdfreader: Preview: "${text.substring(0, 200)}"`)
            
            // Cleanup
            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
            
            if (text.trim().length > 0) {
              resolve(text.trim())
            } else {
              reject(new Error('No text found in PDF'))
            }
            return
          }
          
          if (item.text) {
            text += item.text + ' '
            itemCount++
            
            // Log progress every 100 items
            if (itemCount % 100 === 0) {
              console.log(`   🔍 pdfreader: Processed ${itemCount} text items...`)
            }
          }
        })
      })
    } catch (parseError: any) {
      // Cleanup on error
      if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
      throw new Error(`PDFReader setup error: ${parseError.message}`)
    }
  } catch (error: any) {
    console.log(`   ❌ pdfreader: ${error.message}`)
    throw error
  }
}

async function extractWithTesseractOCR(bytes: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log('   🔍 tesseract-ocr: Starting OCR extraction...')
    
    // Convert PDF first page to image using pdf2pic
    const pdf2pic = await import('pdf2pic')
    const fs = await import('fs')
    const path = await import('path')
    const os = await import('os')
    
    const tempDir = os.tmpdir()
    const tempPdfPath = path.join(tempDir, `ocr_${Date.now()}.pdf`)
    
    console.log(`   🔍 tesseract-ocr: Writing PDF to temp file: ${tempPdfPath}`)
    fs.writeFileSync(tempPdfPath, Buffer.from(bytes))
    
    try {
      console.log('   🔍 tesseract-ocr: Converting PDF to image...')
      const convert = pdf2pic.fromPath(tempPdfPath, {
        density: 300,           // DPI
        saveFilename: "page",
        savePath: tempDir,
        format: "png",
        width: 2000,
        height: 2000
      })
      
      const result = await convert(1) // First page only
      const imagePath = result.path
      
      console.log(`   🔍 tesseract-ocr: Image created: ${imagePath}`)
      
      // Now use Tesseract to extract text
      const Tesseract = await import('tesseract.js')
      console.log('   🔍 tesseract-ocr: Running Tesseract OCR...')
      
      const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`   🔍 tesseract-ocr: Progress ${Math.round(m.progress * 100)}%`)
          }
        }
      })
      
      console.log(`   🔍 tesseract-ocr: OCR completed, extracted ${text.length} characters`)
      console.log(`   🔍 tesseract-ocr: Preview: "${text.substring(0, 200)}"`)
      
      // Cleanup
      fs.unlinkSync(tempPdfPath)
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
      
      return text.trim()
    } catch (conversionError: any) {
      // Cleanup on error
      if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath)
      throw new Error(`PDF to image conversion failed: ${conversionError.message}`)
    }
  } catch (error: any) {
    console.log(`   ❌ tesseract-ocr: ${error.message}`)
    throw error
  }
}
