import { NextResponse } from 'next/server'
import { sendNotification } from '@/app/action'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message : ''
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }
    const result = await sendNotification(message)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Send push API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    )
  }
}
