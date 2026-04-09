import { useEffect, useRef, useState } from "react";

const recoverableErrors = new Set(["network", "no-speech"]);

export const useSpeechRecognition = ({
  onResult,
  onError,
  continuous = false
}) => {
  const recognitionRef = useRef(null);
  const callbacksRef = useRef({ onResult, onError });
  const shouldContinueRef = useRef(false);
  const manualStopRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const restartAttemptRef = useRef(0);
  const lastErrorRef = useRef("");
  const lastLanguageHintRef = useRef("");
  const recognitionActiveRef = useRef(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  callbacksRef.current = { onResult, onError };

  const clearRestartTimeout = () => {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  const scheduleRestart = (reason = "network") => {
    if (
      !continuous ||
      !shouldContinueRef.current ||
      manualStopRef.current ||
      !recognitionRef.current
    ) {
      setIsListening(false);
      setInterimTranscript("");
      return;
    }

    if (restartTimeoutRef.current) {
      return;
    }

    restartAttemptRef.current += 1;
    const attempt = restartAttemptRef.current;
    const delay = Math.min(600 * attempt, 2500);

    callbacksRef.current.onError?.(reason, {
      recoverable: true,
      retrying: true,
      attempt,
      delay
    });

    restartTimeoutRef.current = window.setTimeout(() => {
      restartTimeoutRef.current = null;

      if (!recognitionRef.current || manualStopRef.current || !shouldContinueRef.current) {
        setIsListening(false);
        return;
      }

      try {
        recognitionActiveRef.current = true;
        recognitionRef.current.lang =
          lastLanguageHintRef.current || navigator.language || "en-US";
        recognitionRef.current.start();
      } catch {
        recognitionActiveRef.current = false;
        scheduleRestart(reason);
      }
    }, delay);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      clearRestartTimeout();
      restartAttemptRef.current = 0;
      lastErrorRef.current = "";
      recognitionActiveRef.current = true;
      setIsListening(true);
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;

      if (continuous && shouldContinueRef.current && !manualStopRef.current) {
        scheduleRestart(lastErrorRef.current || "network");
        return;
      }

      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onerror = (event) => {
      lastErrorRef.current = event.error;
      recognitionActiveRef.current = false;

      if (manualStopRef.current && event.error === "aborted") {
        setIsListening(false);
        setInterimTranscript("");
        return;
      }

      const recoverable = recoverableErrors.has(event.error);

      if (!recoverable) {
        shouldContinueRef.current = false;
        manualStopRef.current = true;
      }

      setIsListening(false);
      setInterimTranscript("");
      callbacksRef.current.onError?.(event.error, {
        recoverable,
        retrying: recoverable && continuous && shouldContinueRef.current && !manualStopRef.current
      });

      if (recoverable && continuous && shouldContinueRef.current && !manualStopRef.current) {
        scheduleRestart(event.error);
      }
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript ?? "")
        .join("")
        .trim();
      const isFinal =
        Array.from(event.results)
          .slice(event.resultIndex)
          .every((result) => result.isFinal) ?? false;

      setInterimTranscript(isFinal ? "" : transcript);
      callbacksRef.current.onResult?.({ transcript, isFinal });
    };

    recognitionRef.current = recognition;

    return () => {
      clearRestartTimeout();
      shouldContinueRef.current = false;
      manualStopRef.current = true;
      recognitionActiveRef.current = false;

      if (typeof recognition.abort === "function") {
        recognition.abort();
      } else {
        recognition.stop();
      }

      recognitionRef.current = null;
    };
  }, [continuous]);

  const startListening = (languageHint) => {
    if (!recognitionRef.current || recognitionActiveRef.current) {
      return;
    }

    clearRestartTimeout();
    shouldContinueRef.current = continuous;
    manualStopRef.current = false;
    restartAttemptRef.current = 0;
    lastErrorRef.current = "";
    setInterimTranscript("");
    setIsListening(true);
    recognitionRef.current.continuous = false;
    lastLanguageHintRef.current =
      languageHint || lastLanguageHintRef.current || navigator.language || "en-US";
    recognitionRef.current.lang = lastLanguageHintRef.current;

    try {
      recognitionActiveRef.current = true;
      recognitionRef.current.start();
    } catch {
      recognitionActiveRef.current = false;
      shouldContinueRef.current = false;
      manualStopRef.current = true;
      setIsListening(false);
      callbacksRef.current.onError?.("start-failed", {
        recoverable: false,
        retrying: false
      });
    }
  };

  const stopListening = () => {
    clearRestartTimeout();
    shouldContinueRef.current = false;
    manualStopRef.current = true;
    restartAttemptRef.current = 0;
    lastErrorRef.current = "";
    setIsListening(false);
    setInterimTranscript("");

    if (!recognitionRef.current) {
      recognitionActiveRef.current = false;
      return;
    }

    recognitionActiveRef.current = false;

    if (typeof recognitionRef.current.abort === "function") {
      recognitionRef.current.abort();
      return;
    }

    recognitionRef.current.stop();
  };

  return {
    isSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening
  };
};
