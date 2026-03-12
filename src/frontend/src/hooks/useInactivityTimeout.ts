import { useCallback, useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_KEY = "mantralayam_last_timeout_prompt";
const RATE_LIMIT_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useInactivityTimeout(onTimeout: () => void, enabled = true) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        // Check rate limiting
        const lastPrompt = localStorage.getItem(RATE_LIMIT_KEY);
        if (lastPrompt) {
          const timeSinceLastPrompt = Date.now() - Number.parseInt(lastPrompt);
          if (timeSinceLastPrompt < RATE_LIMIT_DURATION) {
            return; // Skip prompt if shown recently
          }
        }

        onTimeout();
        localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      }, INACTIVITY_TIMEOUT);
    }
  }, [onTimeout, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    for (const event of events) {
      document.addEventListener(event, handleActivity);
    }

    resetTimer();

    return () => {
      for (const event of events) {
        document.removeEventListener(event, handleActivity);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, enabled]);

  return { resetTimer };
}
