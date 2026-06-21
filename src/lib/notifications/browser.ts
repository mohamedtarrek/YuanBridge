export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Browser] Notifications not supported in this browser')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.warn('[Browser] Notification permission denied')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function showBrowserNotification(
  title: string,
  options: NotificationOptions = {}
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  try {
    const notification = new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options,
    })

    notification.onclick = () => {
      if (options.data?.url) {
        window.open(options.data.url, '_blank')
      }
      notification.close()
    }
  } catch (error) {
    console.error('[Browser] Failed to show notification:', error)
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Browser] Service workers not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    console.log('[Browser] Service worker registered:', registration.scope)
  } catch (error) {
    console.error('[Browser] Service worker registration failed:', error)
  }
}
