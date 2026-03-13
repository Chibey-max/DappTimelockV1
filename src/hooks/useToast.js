'use client';
import { useState, useCallback } from 'react';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, title, message, duration = 5000) => {
    const id = ++_id;
    setToasts(t => [...t, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return {
    toasts, remove,
    success: (title, msg, dur)  => add('success', title, msg, dur),
    error:   (title, msg, dur)  => add('error',   title, msg, dur),
    info:    (title, msg, dur)  => add('info',     title, msg, dur),
    warning: (title, msg, dur)  => add('warning',  title, msg, dur),
  };
}
