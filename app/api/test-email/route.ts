import { NextResponse } from 'next/server'
import { sendBookingConfirmationEmail } from '@/lib/email'
import type { Booking } from '@/lib/types'

export async function GET() {
  try {
    // Check environment variables
    const hasApiKey = !!process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'AMICI NAILS SALON <noreply@yourdomain.com>'
    
    const envCheck = {
      hasResendApiKey: hasApiKey,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A',
      fromEmail,
      nodeEnv: process.env.NODE_ENV,
    }

    // Create a test booking
    const testBooking: Booking = {
      id: 'test-booking-' + Date.now(),
      customerName: 'Test Customer',
      customerPhone: '+49123456789',
      customerEmail: 'cclemonchanh04@gmail.com', // Using registered email for testing (Resend test mode restriction)
      services: [
        {
          id: 'test-service',
          name: 'Test Service',
          nameVi: 'Dịch vụ test',
          nameDe: 'Test Leistung',
          price: 25,
          duration: 45,
          category: 'TEST',
          categoryVi: 'TEST',
          categoryDe: 'TEST',
        },
      ],
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      notes: 'This is a test booking',
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalPrice: 25,
      totalDuration: 45,
    }

    // Try to send email
    const emailResult = await sendBookingConfirmationEmail(testBooking)

    return NextResponse.json(
      {
        success: true,
        envCheck,
        emailResult,
        message: hasApiKey
          ? 'Email test completed. Check the emailResult for details.'
          : 'RESEND_API_KEY is not configured. Please add it to .env.local',
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

