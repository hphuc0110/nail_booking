'use server'

import webpush from 'web-push'
import { getDb } from '@/lib/mongodb'

// Validate VAPID keys are set
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys are not set! Push notifications will not work.')
  console.error('Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.')
} else {
  webpush.setVapidDetails(
    'mailto:hieuls369@gmail.com',
    vapidPublicKey,
    vapidPrivateKey
  )
  console.log('VAPID keys configured successfully')
}

const SUBSCRIPTIONS_COLLECTION = 'push_subscriptions'

export async function subscribeUser(sub: PushSubscription) {
  try {
    const db = await getDb()
    const collection = db.collection(SUBSCRIPTIONS_COLLECTION)

    // Use endpoint as unique identifier
    // Serialize the subscription to ensure all properties are captured
    const subscriptionData = {
      endpoint: sub.endpoint,
      keys: (sub as any).keys || null,
      subscription: JSON.parse(JSON.stringify(sub)), // Full serialized subscription
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Upsert: update if exists, insert if not
    await collection.updateOne(
      { endpoint: sub.endpoint },
      { $set: subscriptionData },
      { upsert: true }
    )

    return { success: true }
  } catch (error) {
    console.error('Error storing subscription:', error)
    // Don't throw - allow subscription to continue even if storage fails
    return { success: false, error: 'Failed to store subscription' }
  }
}

export async function unsubscribeUser(endpoint?: string) {
  try {
    const db = await getDb()
    const collection = db.collection(SUBSCRIPTIONS_COLLECTION)

    if (endpoint) {
      // Remove specific subscription by endpoint
      const result = await collection.deleteOne({ endpoint })
      console.log(`Removed subscription: ${endpoint}`, result.deletedCount > 0 ? 'success' : 'not found')
    } else {
      // Remove all subscriptions (fallback)
      const result = await collection.deleteMany({})
      console.log(`Removed all subscriptions: ${result.deletedCount} deleted`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing subscription:', error)
    return { success: false, error: 'Failed to remove subscription' }
  }
}

/**
 * Clean up subscriptions with VAPID key mismatches
 * This can be called manually or scheduled to run periodically
 */
export async function cleanupInvalidSubscriptions() {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('Cannot cleanup subscriptions: VAPID keys not configured')
      return { cleaned: 0, error: 'VAPID keys not configured' }
    }

    const subscriptions = await getSubscriptions()
    if (subscriptions.length === 0) {
      return { cleaned: 0, message: 'No subscriptions to check' }
    }

    // Test each subscription by attempting to send a test notification
    // This will identify subscriptions with VAPID mismatches
    const testPayload = JSON.stringify({ title: 'Test', body: 'Validation check' })
    let cleanedCount = 0

    for (const sub of subscriptions) {
      try {
        // Try to send a test notification (we'll catch the error)
        await webpush.sendNotification(sub as any, testPayload)
      } catch (error: any) {
        // If we get a 403, 404, or 410, the subscription is invalid
        if (error?.statusCode === 403 || error?.statusCode === 404 || error?.statusCode === 410) {
          console.log(`Cleaning up invalid subscription (${error?.statusCode}):`, sub.endpoint)
          await unsubscribeUser(sub.endpoint)
          cleanedCount++
        } else {
          // Other errors might be temporary, don't remove
          console.warn('Unexpected error testing subscription:', error)
        }
      }
    }

    return { cleaned: cleanedCount, total: subscriptions.length }
  } catch (error) {
    console.error('Error cleaning up subscriptions:', error)
    return { cleaned: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function getSubscriptions(): Promise<PushSubscription[]> {
  try {
    const db = await getDb()
    const collection = db.collection(SUBSCRIPTIONS_COLLECTION)
    const docs = await collection.find({}).toArray()

    return docs.map(doc => doc.subscription as PushSubscription)
  } catch (error) {
    console.error('Error retrieving subscriptions:', error)
    return []
  }
}

export async function sendNotification(message: string, endpoint?: string) {
  try {
    // Validate VAPID keys before sending
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys are not configured. Cannot send notifications.')
    }

    const subscriptions = await getSubscriptions()

    if (subscriptions.length === 0) {
      throw new Error('No subscriptions available')
    }

    // If endpoint is provided, send to that specific subscription
    // Otherwise, send to all subscriptions
    const targets = endpoint
      ? subscriptions.filter(sub => sub.endpoint === endpoint)
      : subscriptions

    if (targets.length === 0) {
      throw new Error('No matching subscription found')
    }

    const notificationPayload = JSON.stringify({
      title: 'Test Notification',
      body: message,
      icon: '/icon.png',
    })

    // Send to all target subscriptions
    const results = await Promise.allSettled(
      targets.map(sub =>
        webpush.sendNotification(sub as any, notificationPayload)
      )
    )

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      console.error('Some notifications failed:', failures)

      // Remove invalid subscriptions
      for (const failure of failures) {
        if (failure.status === 'rejected') {
          const error = failure.reason as any
          const statusCode = error?.statusCode

          // 410 Gone - subscription expired
          // 404 Not Found - subscription doesn't exist
          // 403 Forbidden - VAPID key mismatch (subscription created with different keys)
          if (statusCode === 410 || statusCode === 404 || statusCode === 403) {
            const failedIndex = results.indexOf(failure)
            const failedSub = targets[failedIndex]

            if (failedSub) {
              console.log(`Removing invalid subscription (${statusCode}):`, failedSub.endpoint)
              await unsubscribeUser(failedSub.endpoint)

              if (statusCode === 403) {
                console.warn('VAPID key mismatch detected. This subscription was created with different VAPID keys.')
                console.warn('The user needs to resubscribe with the current VAPID keys.')
              }
            }
          }
        }
      }
    }

    const successCount = results.filter(r => r.status === 'fulfilled').length
    return {
      success: successCount > 0,
      sent: successCount,
      total: targets.length
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification'
    }
  }
}