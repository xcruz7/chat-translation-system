import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

const remotePreferredLanguages = new Set(["ta", "kn", "te", "ml"]);

const normalizeLanguageBase = (value) => value?.toLowerCase().split("-")[0] ?? "";

const findBestVoice = (voices, locale, languageCode) => {
  if (!locale && !languageCode) {
    return null;
  }

  const lowerLocale = locale?.toLowerCase() ?? "";
  const baseLanguage = normalizeLanguageBase(languageCode || locale);

  return (
    voices.find((voice) => voice.lang.toLowerCase() === lowerLocale) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(baseLanguage)) ??
    null
  );
};

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const remoteAudioRef = useRef(null);
  const remoteAudioUrlRef = useRef("");

  const stopRemoteAudio = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.currentTime = 0;
      remoteAudioRef.current = null;
    }

    if (remoteAudioUrlRef.current) {
      URL.revokeObjectURL(remoteAudioUrlRef.current);
      remoteAudioUrlRef.current = "";
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
    const loadVoices = () => setVoices(synth.getVoices());

    if (synth) {
      loadVoices();
      synth.addEventListener("voiceschanged", loadVoices);
    }

    return () => {
      stopRemoteAudio();

      if (synth) {
        synth.removeEventListener("voiceschanged", loadVoices);
      }
    };
  }, []);

  const playRemoteAudio = async (text, languageCode) => {
    try {
      stopRemoteAudio();

      const audioBlob = await api.synthesizeSpeech({
        text,
        languageCode
      });

      const objectUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(objectUrl);

      remoteAudioRef.current = audio;
      remoteAudioUrlRef.current = objectUrl;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        stopRemoteAudio();
        setIsSpeaking(false);
      };
      audio.onerror = () => {
        stopRemoteAudio();
        setIsSpeaking(false);
      };

      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  };

  const speak = (text, locale, languageCode = "en") => {
    if (!text.trim()) {
      return;
    }

    const bestVoice = findBestVoice(voices, locale, languageCode);
    const shouldUseRemoteAudio =
      remotePreferredLanguages.has(languageCode) || !bestVoice;

    if (shouldUseRemoteAudio) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      void playRemoteAudio(text, languageCode);
      return;
    }

    const synth = window.speechSynthesis;
    stopRemoteAudio();
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale || `${languageCode}`;
    utterance.voice = bestVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const stop = () => {
    stopRemoteAudio();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  return {
    isSupported,
    isSpeaking,
    speak,
    stop
  };
};
