import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable' | 'error';

/**
 * Check push permission status.
 * Does NOT request — just returns current state.
 */
export async function checkPushPermission(): Promise<{ state: PermissionState; raw?: any }> {
  const platform = Capacitor.getPlatform();
  if (platform === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { state: 'unavailable' };
    }
    const p = Notification.permission; // 'granted' | 'denied' | 'default'
    return {
      state: p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'prompt',
      raw: p,
    };
  }

  try {
    const res = await PushNotifications.checkPermissions();
    // Capacitor PushNotifications uses `receive` or similar field for permission
    const status = (res as any).receive ?? (res as any).value ?? null;
    if (status === 'granted') return { state: 'granted', raw: res };
    if (status === 'denied') return { state: 'denied', raw: res };
    return { state: 'prompt', raw: res };
  } catch (e) {
    return { state: 'error', raw: e };
  }
}

/**
 * Request push permission explicitly. Call only after user interaction.
 * On native, will also attempt to register if granted.
 */
export async function requestPushPermission(): Promise<{ state: PermissionState; raw?: any }> {
  const platform = Capacitor.getPlatform();
  if (platform === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { state: 'unavailable' };
    }
    try {
      const p = await Notification.requestPermission();
      return { state: p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'prompt', raw: p };
    } catch (e) {
      return { state: 'error', raw: e };
    }
  }

  try {
    const res = await PushNotifications.requestPermissions();
    const status = (res as any).receive ?? (res as any).value ?? null;
    const state = status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'prompt';
    if (state === 'granted') {
      try {
        await PushNotifications.register();
      } catch (_) {
        // ignore register errors here — caller can handle push setup separately
      }
    }
    return { state, raw: res };
  } catch (e) {
    return { state: 'error', raw: e };
  }
}

/**
 * Check geolocation permission status. Does not request.
 */
export async function checkGeolocationPermission(): Promise<{ state: PermissionState; raw?: any }> {
  const platform = Capacitor.getPlatform();
  if (platform === 'web') {
    if (typeof navigator === 'undefined' || !(navigator as any).permissions) {
      // no permissions API available — treat as prompt
      return { state: 'prompt' };
    }
    try {
      // navigator.permissions.query may throw on some browsers; wrap defensively
      const status = await (navigator as any).permissions.query({ name: 'geolocation' });
      return { state: status.state === 'granted' ? 'granted' : status.state === 'denied' ? 'denied' : 'prompt', raw: status };
    } catch (e) {
      return { state: 'error', raw: e };
    }
  }

  try {
    const res = await Geolocation.checkPermissions();
    // Capacitor returns { location: 'granted' | 'denied' | 'prompt' }
    const loc = (res as any).location ?? (res as any).coarse ?? null;
    if (loc === 'granted') return { state: 'granted', raw: res };
    if (loc === 'denied') return { state: 'denied', raw: res };
    return { state: 'prompt', raw: res };
  } catch (e) {
    return { state: 'error', raw: e };
  }
}

/**
 * Request geolocation permission explicitly. Call only after user interaction.
 * On web this will attempt to getCurrentPosition to trigger browser prompt.
 */
export async function requestGeolocationPermission(): Promise<{ state: PermissionState; raw?: any }> {
  const platform = Capacitor.getPlatform();
  if (platform === 'web') {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return { state: 'unavailable' };
    }
    try {
      // Trigger prompt by requesting current position
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          (err) => reject(err),
          { maximumAge: 0, timeout: 10000 }
        );
      });
      // If successful, permission granted
      return { state: 'granted' };
    } catch (e: any) {
      if (e && e.code === 1) return { state: 'denied', raw: e };
      return { state: 'error', raw: e };
    }
  }

  try {
    const res = await Geolocation.requestPermissions();
    const loc = (res as any).location ?? null;
    if (loc === 'granted') return { state: 'granted', raw: res };
    if (loc === 'denied') return { state: 'denied', raw: res };
    return { state: 'prompt', raw: res };
  } catch (e) {
    return { state: 'error', raw: e };
  }
}

/**
 * Attempt to open the app settings page so the user can manually enable permissions.
 * Behavior varies by platform; this function tries a best-effort approach.
 */
export async function openAppSettings(): Promise<boolean> {
  try {
    // Capacitor App plugin doesn't have openUrl method
    // Instead, use browser or platform-specific APIs
    if (typeof window !== 'undefined') {
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        // iOS
        window.location.href = 'app-settings:';
      } else if (navigator.userAgent.includes('Android')) {
        // Android - try to open app settings via intent
        window.location.href = 'intent://settings/#Intent;action=android.app.action.MANAGE_APP_PERMISSIONS;end';
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  checkPushPermission,
  requestPushPermission,
  checkGeolocationPermission,
  requestGeolocationPermission,
  openAppSettings,
};
