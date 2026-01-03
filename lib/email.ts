import { Resend } from 'resend'
import type { Booking } from './types'

export async function sendBookingConfirmationEmail(booking: Booking) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    const errorMsg = 'Resend API key not configured. Email will not be sent.'
    console.warn('=== EMAIL ERROR ===')
    console.warn(errorMsg)
    console.warn('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.warn('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0)
    console.warn('All env keys with RESEND:', Object.keys(process.env).filter(k => k.includes('RESEND')))
    return { success: false, error: errorMsg }
  }

  // Initialize Resend client each time (to ensure it picks up env vars after server restart)
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    console.log('=== SENDING EMAIL ===')
    console.log('To:', booking.customerEmail)
    console.log('From:', process.env.RESEND_FROM_EMAIL || 'AMICI NAILS SALON <noreply@yourdomain.com>')
    console.log('Subject: Terminbestätigung -', booking.id)
    // Format date and time in German
    const bookingDate = new Date(booking.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Format services list
    const servicesList = booking.services.map(service => {
      return `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>${service.nameDe || service.name}</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
            €${service.price}
          </td>
        </tr>
      `
    }).join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Terminbestätigung</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AMICI NAILS SALON</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Terminbestätigung Erfolgreich</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hallo <strong>${booking.customerName}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Vielen Dank für Ihre Terminbuchung bei AMICI NAILS SALON! Wir haben Ihre Buchungsanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden, um Ihren Termin zu bestätigen.
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #f43f5e; margin-top: 0; font-size: 20px; margin-bottom: 15px;">Buchungsinformationen</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 120px;">Buchungsnummer:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${booking.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Datum & Uhrzeit:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${bookingDate} - ${booking.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Telefonnummer:</td>
                  <td style="padding: 8px 0;">${booking.customerPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">E-Mail:</td>
                  <td style="padding: 8px 0;">${booking.customerEmail}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #f43f5e; font-size: 18px; margin-bottom: 15px;">Ausgewählte Leistungen</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${servicesList}
                <tr>
                  <td style="padding: 12px 0; border-top: 2px solid #f43f5e; font-weight: bold; font-size: 18px;">
                    Gesamtpreis
                  </td>
                  <td style="padding: 12px 0; border-top: 2px solid #f43f5e; text-align: right; font-weight: bold; font-size: 18px; color: #f43f5e;">
                    €${booking.totalPrice}
                  </td>
                </tr>
              </table>
            </div>
            
            ${booking.notes ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <strong style="color: #92400e;">Notizen:</strong>
                <p style="margin: 5px 0 0 0; color: #78350f;">${booking.notes}</p>
              </div>
            ` : ''}
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af;">
                <strong>Hinweis:</strong> Dies ist eine automatische Bestätigungs-E-Mail. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden, um Ihren Termin zu bestätigen.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Mit freundlichen Grüßen,<br>
              <strong>Das Team von AMICI NAILS SALON</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} AMICI NAILS SALON. Alle Rechte vorbehalten.</p>
          </div>
        </body>
      </html>
    `

    const emailText = `
AMICI NAILS SALON - Terminbestätigung Erfolgreich

Hallo ${booking.customerName},

Vielen Dank für Ihre Terminbuchung bei AMICI NAILS SALON! Wir haben Ihre Buchungsanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden, um Ihren Termin zu bestätigen.

BUCHUNGSINFORMATIONEN:
- Buchungsnummer: ${booking.id}
- Datum & Uhrzeit: ${bookingDate} - ${booking.time}
- Telefonnummer: ${booking.customerPhone}
- E-Mail: ${booking.customerEmail}

AUSGEWÄHLTE LEISTUNGEN:
${booking.services.map(s => `- ${s.nameDe || s.name}: €${s.price}`).join('\n')}

Gesamtpreis: €${booking.totalPrice}

${booking.notes ? `Notizen: ${booking.notes}\n` : ''}

Hinweis: Dies ist eine automatische Bestätigungs-E-Mail. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden, um Ihren Termin zu bestätigen.

Mit freundlichen Grüßen,
Das Team von AMICI NAILS SALON
    `.trim()

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'AMICI NAILS SALON <onboarding@resend.dev>'
    
    console.log('Attempting to send email via Resend...')
    const result = await resend.emails.send({
      from: fromEmail,
      to: booking.customerEmail,
      subject: `AMICI NAILS SALON - Terminbestätigung - ${booking.id}`,
      html: emailHtml,
      text: emailText,
    })

    // Check if email was actually sent
    if (result.error) {
      console.error('=== EMAIL SEND ERROR FROM RESEND ===')
      console.error('Error:', result.error)
      
      // Check if it's a test mode limitation
      if (result.error.message?.includes('only send testing emails to your own email') || 
          result.error.message?.includes('verify a domain')) {
        console.error('⚠️ ==========================================')
        console.error('⚠️ RESEND DOMAIN NOT VERIFIED')
        console.error('⚠️ ==========================================')
        console.error('⚠️ Current mode: TEST MODE (limited)')
        console.error('⚠️ Can only send to: cclemonchanh04@gmail.com')
        console.error('⚠️')
        console.error('⚠️ SOLUTION: Verify domain in Resend Dashboard')
        console.error('⚠️ 1. Go to: https://resend.com/domains')
        console.error('⚠️ 2. Add your domain')
        console.error('⚠️ 3. Add DNS records (SPF, DKIM)')
        console.error('⚠️ 4. Wait for verification (5-30 min)')
        console.error('⚠️ 5. Update RESEND_FROM_EMAIL to use verified domain')
        console.error('⚠️ 6. Redeploy application')
        console.error('⚠️ ==========================================')
        console.error('⚠️ Booking was saved successfully, but email was not sent')
        console.error('⚠️ Customer email:', booking.customerEmail)
        console.error('⚠️ ==========================================')
        return { 
          success: false, 
          error: 'Domain not verified. Please verify domain in Resend Dashboard to send emails to any recipient.',
          details: result.error,
          isTestModeLimit: true,
          requiresDomainVerification: true
        }
      }
      
      return { success: false, error: result.error.message || 'Unknown error', details: result.error }
    }

    console.log('=== EMAIL SENT SUCCESSFULLY ===')
    console.log('Message ID:', result.data?.id)
    console.log('Response:', JSON.stringify(result, null, 2))
    return { success: true, messageId: result.data?.id, result }
  } catch (error: any) {
    console.error('=== EMAIL SEND ERROR ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Error details:', error)
    if (error.response) {
      console.error('Resend API response:', error.response)
    }
    // Don't throw error - we don't want email failure to break booking
    return { success: false, error: error.message, details: error }
  }
}

