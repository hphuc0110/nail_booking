// Quick script to check if environment variables are loaded
// Run with: node check-env.js

require('dotenv').config({ path: '.env.local' })

console.log('=== Environment Variables Check ===')
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0)
console.log('RESEND_API_KEY prefix:', process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A')
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Not set')
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)

if (process.env.RESEND_API_KEY) {
  console.log('\n✅ RESEND_API_KEY is configured!')
} else {
  console.log('\n❌ RESEND_API_KEY is NOT configured!')
  console.log('Please check your .env.local file')
}

