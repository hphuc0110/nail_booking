import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const rootDir = process.cwd()
    const envLocalPath = join(rootDir, '.env.local')
    
    let fileExists = false
    let fileContent = ''
    let parsedVars: Record<string, string> = {}
    
    try {
      // Try reading with UTF-8 first, then try UTF-16 if that fails
      try {
        fileContent = readFileSync(envLocalPath, 'utf-8')
      } catch {
        // If UTF-8 fails, try reading as buffer and converting
        const buffer = readFileSync(envLocalPath)
        // Check for UTF-16 BOM
        if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
          // UTF-16 LE
          fileContent = buffer.toString('utf16le').substring(1) // Remove BOM
        } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
          // UTF-16 BE (unlikely but handle it)
          throw new Error('UTF-16 BE encoding detected. Please convert file to UTF-8.')
        } else {
          fileContent = buffer.toString('utf-8')
        }
      }
      fileExists = true
      
      // Parse .env.local file manually
      fileContent.split('\n').forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          if (key && valueParts.length > 0) {
            parsedVars[key.trim()] = valueParts.join('=').trim()
          }
        }
      })
    } catch (error: any) {
      fileExists = false
    }

    const runtimeEnv = {
      RESEND_API_KEY: process.env.RESEND_API_KEY || 'NOT SET',
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'NOT SET',
    }

    return NextResponse.json({
      fileCheck: {
        exists: fileExists,
        path: envLocalPath,
        contentPreview: fileExists ? fileContent.substring(0, 200) : 'File not found',
      },
      parsedFromFile: {
        RESEND_API_KEY: parsedVars.RESEND_API_KEY || 'NOT FOUND IN FILE',
        RESEND_FROM_EMAIL: parsedVars.RESEND_FROM_EMAIL || 'NOT FOUND IN FILE',
      },
      runtimeEnvironment: runtimeEnv,
      match: {
        apiKeyMatches: parsedVars.RESEND_API_KEY === process.env.RESEND_API_KEY,
        fromEmailMatches: parsedVars.RESEND_FROM_EMAIL === process.env.RESEND_FROM_EMAIL,
      },
      instructions: !process.env.RESEND_API_KEY
        ? [
            '❌ RESEND_API_KEY is NOT loaded in runtime!',
            '',
            'SOLUTION:',
            '1. Make sure you RESTARTED the development server after creating/editing .env.local',
            '2. Stop the server (Ctrl+C)',
            '3. Start again: npm run dev',
            '4. Next.js only loads .env.local when the server starts',
            '',
            'If still not working:',
            '- Check that .env.local is in the ROOT directory (same level as package.json)',
            '- Make sure there are no spaces around the = sign',
            '- Make sure there are no quotes around the values',
          ]
        : ['✅ RESEND_API_KEY is loaded correctly!'],
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

