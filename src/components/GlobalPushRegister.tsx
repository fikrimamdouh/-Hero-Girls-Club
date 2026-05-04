import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

export default function GlobalPushRegister() {
  const location = useLocation();
  const [activeChildId, setActiveChildId] = useState<string | undefined>();

  useEffect(() => {
    const isPublic = ['/', '/parent', '/admin', '/terms', '/contact'].includes(location.pathname);
    if (isPublic) { setActiveChildId(undefined); return; }
    try {
      const raw = localStorage.getItem('active_child');
      if (!raw) { setActiveChildId(undefined); return; }
      const parsed = JSON.parse(raw);
      setActiveChildId(parsed?.uid);
    } catch {
      setActiveChildId(undefined);
    }
  }, [location.pathname]);

  useNotifications(activeChildId);
  return null;
}
