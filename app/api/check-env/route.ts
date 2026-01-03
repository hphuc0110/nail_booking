import { NextResponse } from 'next/server'

export async function GET() {
  // This route helps debug environment variables
  const envCheck = {
    nodeEnv: process.env.NODE_ENV,
    resendApiKey: {
      exists: !!process.env.RESEND_API_KEY,
      length: process.env.RESEND_API_KEY?.length || 0,
      prefix: process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A',
      // Don't expose the full key for security
      firstChars: process.env.RESEND_API_KEY?.substring(0, 10) + '...' || 'N/A',
    },
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
    mongodbUri: {
      exists: !!process.env.MONGODB_URI,
      // Don't expose full URI for security
    },
    allEnvKeys: Object.keys(process.env)
      .filter(key => key.includes('RESEND') || key.includes('MONGO'))
      .sort(),
  }

  return NextResponse.json(
    {
      message: 'Environment variables check',
      envCheck,
      instructions: !envCheck.resendApiKey.exists
        ? [
            'RESEND_API_KEY is not loaded!',
            '1. Make sure .env.local exists in the root directory',
            '2. Make sure .env.local contains: RESEND_API_KEY=re_...',
            '3. RESTART your development server (stop with Ctrl+C, then run npm run dev again)',
            '4. Next.js only loads .env.local on server start',
          ]
        : ['✅ RESEND_API_KEY is configured correctly!'],
    },
    { status: 200 }
  )
}

