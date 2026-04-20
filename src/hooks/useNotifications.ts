/// <reference types="vite/client" />
import { useEffect, useState, useCallback } from 'react';
import { messaging } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { toast } from 'sonner';
import firebaseConfig from '../../firebase-applet-config.json';

export const useNotifications = (activeChildId?: string) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!activeChildId) return;

    const setupNotifications = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          
          // Send config to service worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'INIT_FIREBASE',
              config: firebaseConfig
            });
          } else {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: 'INIT_FIREBASE',
                  config: firebaseConfig
                });
              }
            });
          }
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const msg = await messaging();
          if (msg) {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (vapidKey) {
              const token = await getToken(msg, { vapidKey });
              setFcmToken(token);
              // In a real app, you would save this token to the user's Firestore document
              // to send them push notifications from a backend.
            } else {
              console.warn('VITE_FIREBASE_VAPID_KEY is not set in environment variables.');
            }

            onMessage(msg, (payload) => {
              // Handle foreground messages
              if (payload.notification) {
                toast(payload.notification.title, {
                  description: payload.notification.body,
                  icon: '🔔',
                });
                
                // Play a sound for foreground notification
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.error('Audio play failed:', e));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, [activeChildId]);

  const playMessageSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.play().catch(e => console.error('Audio play failed:', e));
  }, []);

  const playCallSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
    audio.play().catch(e => console.error('Audio play failed:', e));
    return audio;
  }, []);

  return { fcmToken, playMessageSound, playCallSound };
};
