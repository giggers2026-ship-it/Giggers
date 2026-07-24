const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function subscribeToWebPush(token: string): Promise<{ success: boolean; message?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Push notifications are not supported in this browser.' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, message: 'VAPID public key is not configured.' };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission was denied.' };
    }

    // 2. Ensure service worker is ready
    const registration = await navigator.serviceWorker.ready;

    // 3. Subscribe via PushManager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 4. Send subscription to backend
    const res = await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to register subscription with server');
    }

    return { success: true };
  } catch (err: any) {
    console.error('Web Push Subscription Error:', err);
    return { success: false, message: err.message || 'Push subscription failed' };
  }
}

export async function sendTestPush(token: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/notifications/test-push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
