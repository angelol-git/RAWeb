import { useEffect, useRef } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

/**
 * Persists form values to sessionStorage so drafts survive back-button
 * navigation and accidental page leaves/refreshes. Writes are debounced
 * to avoid blocking the main thread on every keystroke in large text fields.
 * Pass null as a key to disable persistence (eg: when editing, not creating).
 * Optionally flushes a pending draft immediately on unmount.
 */
export function useFormDraft<T extends FieldValues>(
  key: string | null,
  form: UseFormReturn<T>,
  options?: { flushOnUnmount?: boolean },
) {
  const values = useWatch({ control: form.control });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValuesRef = useRef(values);
  const { flushOnUnmount = false } = options ?? {};

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  useEffect(() => {
    if (key) {
      timerRef.current = setTimeout(() => {
        sessionStorage.setItem(key, JSON.stringify(values));
      }, 500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, values]);

  useEffect(() => {
    if (!key || !flushOnUnmount) return;

    return () => {
      sessionStorage.setItem(key, JSON.stringify(latestValuesRef.current));
    };
  }, [key, flushOnUnmount]);

  const clearDraft = () => {
    if (key) {
      sessionStorage.removeItem(key);
    }
  };

  return { clearDraft };
}
