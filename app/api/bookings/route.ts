import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { Booking } from '@/lib/types'
import { sendBookingConfirmationEmail } from '@/lib/email'

// GET - Lấy tất cả bookings
export async function GET() {
  try {
    const db = await getDb()
    const bookings = await db.collection<Booking>('bookings').find({}).toArray()
    
    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Tạo booking mới
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/bookings - Starting ===')
    
    const booking: Booking = await request.json()
    console.log('Received booking data:', JSON.stringify(booking, null, 2))
    
    // Validate required fields
    if (!booking.id || !booking.customerName || !booking.customerPhone || !booking.customerEmail) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'Booking must have id, customerName, customerPhone, and customerEmail'
        },
        { status: 400 }
      )
    }
    
    console.log('Attempting to connect to database...')
    const db = await getDb()
    console.log('Database connected successfully')

    // Kiểm tra xem ngày có bị khóa không
    const lockedDate = await db.collection('locked_dates').findOne({
      date: booking.date
    })

    if (lockedDate) {
      return NextResponse.json(
        { 
          error: 'Date is locked',
          message: 'Booking is not available for this date'
        },
        { status: 403 }
      )
    }

    // Kiểm tra xem khung giờ cụ thể có bị khóa không
    if (booking.date && booking.time) {
      const lockedTimeSlot = await db.collection('locked_time_slots').findOne({
        date: booking.date,
        time: booking.time
      })

      if (lockedTimeSlot) {
        return NextResponse.json(
          { 
            error: 'Time slot is locked',
            message: 'This time slot is currently locked and not available for booking'
          },
          { status: 403 }
        )
      }
    }
    const result = await db.collection<Booking>('bookings').insertOne(booking)
    console.log('Insert result:', result)
    
    if (result.insertedId) {
      console.log('Booking inserted successfully with ID:', result.insertedId)
      
      // Send confirmation email (non-blocking - don't fail booking if email fails)
      try {
        console.log('=== ATTEMPTING TO SEND EMAIL ===')
        console.log('Customer email:', booking.customerEmail)
        console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY)
        console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Not set (using default)')
        
        const emailResult = await sendBookingConfirmationEmail(booking)
        
        if (emailResult.success) {
          console.log('✅ Confirmation email sent successfully!')
          console.log('Message ID:', emailResult.messageId)
        } else {
          console.error('❌ Failed to send confirmation email')
          console.error('Error:', emailResult.error)
          
          // Special handling for domain verification requirement
          if (emailResult.requiresDomainVerification) {
            console.error('')
            console.error('📧 EMAIL NOT SENT - Domain verification required')
            console.error('   The booking was saved, but email confirmation was not sent.')
            console.error('   This is expected in test mode. Verify domain in Resend to enable email sending.')
            console.error('')
          } else {
            console.error('Details:', emailResult.details)
          }
        }
      } catch (emailError: any) {
        // Log error but don't fail the booking
        console.error('❌ Exception while sending confirmation email:')
        console.error('Error type:', emailError?.constructor?.name)
        console.error('Error message:', emailError?.message)
        console.error('Error stack:', emailError?.stack)
      }
      
      return NextResponse.json(
        { ...booking, _id: result.insertedId },
        { status: 201 }
      )
    }
    
    console.error('Insert failed - no inserted ID returned')
    return NextResponse.json(
      { error: 'Failed to create booking', details: 'No inserted ID returned' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('=== ERROR in POST /api/bookings ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    const errorMessage = error?.message || 'Unknown error'
    const errorDetails = error?.toString() || 'No details available'
    const errorName = error?.name || 'Error'
    
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        message: errorMessage,
        name: errorName,
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}



