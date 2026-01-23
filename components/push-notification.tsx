import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/action"
import { useEffect, useState, useRef } from "react"
import urlBase64ToUint8Array from "@/utils/web-push-utils"

const SUBSCRIPTION_STORAGE_KEY = 'push_subscription_endpoint'

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [message, setMessage] = useState('')
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Save subscription to localStorage when it changes
  useEffect(() => {
    if (subscription) {
      try {
        const endpoint = subscription.endpoint
        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, endpoint)
      } catch (error) {
        console.error('Failed to save subscription to localStorage:', error)
      }
    } else {
      try {
        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
      } catch (error) {
        console.error('Failed to remove subscription from localStorage:', error)
      }
    }
  }, [subscription])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()

      // Set up periodic subscription check (every 5 minutes)
      checkIntervalRef.current = setInterval(() => {
        checkSubscriptionStatus()
      }, 5 * 60 * 1000) // 5 minutes
    }

    // Cleanup interval on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [])

  async function checkSubscriptionStatus() {
    try {
      const registration = await navigator.serviceWorker.ready
      const currentSub = await registration.pushManager.getSubscription()

      if (currentSub) {
        // Subscription exists in service worker
        const storedEndpoint = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)

        if (!storedEndpoint || storedEndpoint !== currentSub.endpoint) {
          // Subscription changed or was lost from storage, update it
          setSubscription(currentSub)
          // Re-sync with server
          const serializedSub = JSON.parse(JSON.stringify(currentSub))
          await subscribeUser(serializedSub).catch(err => {
            console.error('Failed to re-sync subscription with server:', err)
          })
        }
      } else {
        // No subscription in service worker
        const storedEndpoint = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
        if (storedEndpoint) {
          // We had a subscription but it's gone, clear it
          localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
          setSubscription(null)
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Check for existing subscription
      const sub = await registration.pushManager.getSubscription()

      if (sub) {
        setSubscription(sub)
        // Re-sync with server to ensure it's stored
        const serializedSub = JSON.parse(JSON.stringify(sub))
        await subscribeUser(serializedSub).catch(err => {
          console.error('Failed to sync existing subscription with server:', err)
        })
      } else {
        // Check if we have a stored endpoint but no active subscription
        const storedEndpoint = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
        if (storedEndpoint) {
          // Subscription was lost, clear storage
          localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
        }
        setSubscription(null)
      }

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // Service worker updated, re-check subscription
              checkSubscriptionStatus()
            }
          })
        }
      })
    } catch (error) {
      console.error('Error registering service worker:', error)
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      const existingSub = await registration.pushManager.getSubscription()
      if (existingSub) {
        setSubscription(existingSub)
        const serializedSub = JSON.parse(JSON.stringify(existingSub))
        await subscribeUser(serializedSub)
        return
      }

      // Create new subscription
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      // If subscription fails, clear any stale state
      setSubscription(null)
      try {
        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  async function unsubscribeFromPush() {
    try {
      const endpoint = subscription?.endpoint

      if (subscription) {
        await subscription.unsubscribe()
      } else {
        // Try to get subscription from service worker
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
        }
      }
      setSubscription(null)
      try {
        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
      } catch (e) {
        // Ignore localStorage errors
      }
      // Pass endpoint to server for proper cleanup
      await unsubscribeUser(endpoint || undefined)
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      // Clear state even if unsubscribe fails
      setSubscription(null)
      try {
        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button>
        </>
      )}
    </div>
  )
}