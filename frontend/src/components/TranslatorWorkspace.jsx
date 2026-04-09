import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRightLeft, WifiOff } from "lucide-react";
import Shell from "./Shell";
import TranslationInputPanel from "./TranslationInputPanel";
import TranslationOutputPanel from "./TranslationOutputPanel";
import LearningModePanel from "./LearningModePanel";
import HistoryPanel from "./HistoryPanel";
import LiveCallPreview from "./LiveCallPreview";
import ToneEnhancementControls from "./ToneEnhancementControls";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { api } from "../services/api";
import { fallbackLanguages } from "../utils/fallbackLanguages";
import { downloadTextFile } from "../utils/download";

const buildCacheKey = (text, sourceLanguage, targetLanguage) =>
  `${sourceLanguage}::${targetLanguage}::${text.trim().toLowerCase()}`;

const formatTimestamp = (value) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

const TranslatorWorkspace = () => {
  const [languages, setLanguages] = useState(fallbackLanguages);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("ta");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("auto");
  const [detectedLanguageLabel, setDetectedLanguageLabel] = useState("Auto Detect");
  const [providerLabel, setProviderLabel] = useState("Awaiting translation");
  const [learning, setLearning] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, setHistory] = useLocalStorage("lingua-flow-history", []);
  const [translationCache, setTranslationCache] = useLocalStorage("lingua-flow-cache", []);
  const [toneEnhancementEnabled, setToneEnhancementEnabled] = useLocalStorage(
    "lingua-flow-tone-enhancement-enabled",
    false
  );
  const [selectedTone, setSelectedTone] = useLocalStorage(
    "lingua-flow-tone-enhancement-tone",
    "Professional"
  );
  const [isToneTranslating, setIsToneTranslating] = useState(false);
  const lastRequestKeyRef = useRef("");
  const skipDebounceRef = useRef("");

  const debouncedInput = useDebouncedValue(inputText, 650);

  const getLanguage = (code) =>
    languages.find((language) => language.code === code) ??
    fallbackLanguages.find((language) => language.code === code) ??
    fallbackLanguages[1];

  const targetLanguageDetails = getLanguage(targetLanguage);
  const sourceLanguageDetails = getLanguage(sourceLanguage);

  const upsertLocalCache = (entry, extra = {}) => {
    const cacheKey = buildCacheKey(
      entry.sourceText || inputText,
      entry.sourceLanguage || sourceLanguage,
      entry.targetLanguage || targetLanguage
    );

    setTranslationCache((currentCache) => {
      const nextEntry = {
        cacheKey,
        sourceText: entry.sourceText ?? inputText,
        translatedText: entry.translatedText ?? translatedText,
        sourceLanguage: entry.sourceLanguage ?? sourceLanguage,
        targetLanguage: entry.targetLanguage ?? targetLanguage,
        detectedLanguage: entry.detectedLanguage ?? detectedLanguage,
        detectedLanguageLabel: entry.detectedLanguageLabel ?? detectedLanguageLabel,
        targetLanguageLabel: entry.targetLanguageLabel ?? targetLanguageDetails.name,
        learning: entry.learning ?? learning,
        createdAt: entry.createdAt ?? new Date().toISOString(),
        ...extra
      };

      return [nextEntry, ...currentCache.filter((item) => item.cacheKey !== cacheKey)].slice(0, 25);
    });
  };

  const syncHistoryEntry = (entry) => {
    setHistory((currentHistory) => {
      const nextEntry = { ...entry };
      return [nextEntry, ...currentHistory.filter((item) => item.id !== entry.id)].slice(0, 20);
    });
  };

  const resolveCachedTranslation = (text, source, target) =>
    translationCache.find((entry) => entry.cacheKey === buildCacheKey(text, source, target));

  const applyTranslationPayload = (payload, options = {}) => {
    setTranslatedText(payload.translatedText || "");
    setDetectedLanguage(payload.detectedLanguage || "auto");
    setDetectedLanguageLabel(payload.detectedLanguageLabel || "Auto Detect");
    setProviderLabel(payload.provider || "Unknown provider");
    setLearning(payload.learning || null);
    setIsOfflineResult(Boolean(payload.cached) || Boolean(options.fromLocalCache));
    setLastUpdated(formatTimestamp(new Date()));
    setError(options.notice || "");

    if (payload.historyEntry) {
      syncHistoryEntry(payload.historyEntry);
    }

    upsertLocalCache(payload.historyEntry || payload, {
      cached: Boolean(payload.cached) || Boolean(options.fromLocalCache)
    });
  };

  const performTranslation = async (text, options = {}) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setTranslatedText("");
      setLearning(null);
      setError("");
      setIsOfflineResult(false);
      lastRequestKeyRef.current = "";
      return;
    }

    const requestKey = buildCacheKey(trimmedText, sourceLanguage, targetLanguage);
    if (!options.force && requestKey === lastRequestKeyRef.current) {
      return;
    }

    lastRequestKeyRef.current = requestKey;
    setIsTranslating(true);
    setError("");

    try {
      const payload = await api.translate({
        text: trimmedText,
        sourceLanguage,
        targetLanguage,
        includeLearning: true
      });

      applyTranslationPayload(payload);
    } catch (requestError) {
      const cachedEntry = resolveCachedTranslation(trimmedText, sourceLanguage, targetLanguage);

      if (cachedEntry) {
        applyTranslationPayload(cachedEntry, {
          fromLocalCache: true,
          notice: "Live provider unavailable. Showing your latest cached translation."
        });
      } else {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Translation failed. Check your API provider configuration."
        );
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const {
    isSupported: speechSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening
  } = useSpeechRecognition({
    continuous: true,
    onResult: ({ transcript, isFinal }) => {
      if (!transcript) {
        return;
      }

      setInputText(transcript);
      if (isFinal) {
        skipDebounceRef.current = transcript.trim();
        performTranslation(transcript, { force: true });
      }
    },
    onError: (speechError, meta = {}) => {
      if (meta.recoverable && meta.retrying) {
        setError(
          `Speech recognition error: ${speechError}. Retrying automatically${
            meta.attempt ? ` (attempt ${meta.attempt})` : ""
          }.`
        );
        return;
      }

      setError(`Speech recognition error: ${speechError}`);
    }
  });

  const {
    isSupported: speechSynthesisSupported,
    isSpeaking,
    speak,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  useEffect(() => {
    const loadBootData = async () => {
      try {
        const [languageResponse, historyResponse] = await Promise.all([
          api.getLanguages(),
          api.getHistory()
        ]);
        setLanguages(languageResponse);
        setHistory(historyResponse);
      } catch {
        setLanguages(fallbackLanguages);
      }
    };

    loadBootData();
  }, [setHistory]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(
    () => () => {
      stopListening();
    },
    [stopListening]
  );

  useEffect(() => {
    const trimmedDebouncedInput = debouncedInput.trim();
    if (!trimmedDebouncedInput) {
      return;
    }

    if (skipDebounceRef.current && skipDebounceRef.current === trimmedDebouncedInput) {
      skipDebounceRef.current = "";
      return;
    }

    performTranslation(trimmedDebouncedInput);
  }, [debouncedInput, sourceLanguage, targetLanguage]);

  const handleCopy = async () => {
    if (!translatedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedText);
      setError("Copied translated text to the clipboard.");
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };

  const handleDownload = () => {
    if (!translatedText) {
      return;
    }

    downloadTextFile(translatedText, targetLanguage);
  };

  const handleSpeak = () => {
    speak(translatedText, targetLanguageDetails.speechLocale, targetLanguage);
  };

  const handleSwapLanguages = () => {
    const nextSource = targetLanguage;
    const nextTarget =
      sourceLanguage === "auto" ? detectedLanguage || "en" : sourceLanguage;

    setSourceLanguage(nextSource);
    setTargetLanguage(nextTarget === "auto" ? "en" : nextTarget);
    setInputText(translatedText || inputText);
    setTranslatedText(inputText);
    lastRequestKeyRef.current = "";
  };

  const handleClear = () => {
    setInputText("");
    setTranslatedText("");
    setLearning(null);
    setError("");
    setIsOfflineResult(false);
    setLastUpdated("");
    lastRequestKeyRef.current = "";
  };

  const handleSelectHistory = (entry) => {
    setInputText(entry.sourceText);
    setSourceLanguage(entry.sourceLanguage);
    setTargetLanguage(entry.targetLanguage);
    setTranslatedText(entry.translatedText);
    setDetectedLanguage(entry.detectedLanguage);
    setDetectedLanguageLabel(entry.detectedLanguageLabel);
    setProviderLabel(entry.favorite ? "favorite-history" : "history");
    setLearning(entry.learning || null);
    setLastUpdated(formatTimestamp(new Date(entry.createdAt)));
    setError("");
  };

  const handleToggleFavorite = async (id) => {
    try {
      const updatedEntry = await api.toggleFavorite(id);
      setHistory((currentHistory) =>
        currentHistory.map((entry) => (entry.id === id ? updatedEntry : entry))
      );
    } catch {
      setHistory((currentHistory) =>
        currentHistory.map((entry) =>
          entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
        )
      );
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearHistory();
    } catch {
      return;
    }

    setHistory([]);
  };

  const handleStartVoiceInput = async () => {
    if (!speechSupported) {
      setError("This browser does not support microphone access.");
      return;
    }

    setError("");
    startListening(sourceLanguageDetails.speechLocale);
  };

  const handleStopVoiceInput = () => {
    stopListening();
  };

  const handleToneAwareTranslate = async () => {
    const trimmedInput = inputText.trim();

    if (!trimmedInput) {
      setError("Enter some text before translating.");
      return;
    }

    skipDebounceRef.current = trimmedInput;

    if (!toneEnhancementEnabled) {
      await performTranslation(trimmedInput, { force: true });
      return;
    }

    setIsToneTranslating(true);
    setError("");

    try {
      const payload = await api.llmTranslate({
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
        selected_tone: selectedTone,
        user_message: trimmedInput
      });

      const nextTranslatedText = payload.translated_text?.trim() ?? "";
      const nextDetectedLanguage = sourceLanguage === "auto" ? "auto" : sourceLanguage;
      const nextDetectedLabel = sourceLanguageDetails.name;

      if (!nextTranslatedText) {
        throw new Error("Tone-enhanced translation returned an empty response.");
      }

      setTranslatedText(nextTranslatedText);
      setDetectedLanguage(nextDetectedLanguage);
      setDetectedLanguageLabel(nextDetectedLabel);
      setProviderLabel(`OpenAI tone - ${selectedTone.toLowerCase()}`);
      setLearning(null);
      setIsOfflineResult(false);
      setLastUpdated(formatTimestamp(new Date()));

      upsertLocalCache({
        sourceText: trimmedInput,
        translatedText: nextTranslatedText,
        sourceLanguage,
        targetLanguage,
        detectedLanguage: nextDetectedLanguage,
        detectedLanguageLabel: nextDetectedLabel,
        targetLanguageLabel: targetLanguageDetails.name,
        learning: null,
        createdAt: new Date().toISOString()
      });

      try {
        const updatedHistory = await api.getHistory();
        setHistory(updatedHistory);
      } catch {
        // Keep the current local history if the refresh call is unavailable.
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Tone-enhanced translation failed."
      );
    } finally {
      setIsToneTranslating(false);
    }
  };

  return (
    <Shell
      themeToggle={null}
      online={online}
      cachedMode={isOfflineResult}
      lastUpdated={lastUpdated}
    >
      {!online ? (
        <div className="glass-panel flex items-center gap-3 p-4 text-sm text-amber-100 dark:text-amber-100">
          <WifiOff size={16} />
          You are offline. Cached translations will be used when possible.
        </div>
      ) : null}

      {error ? (
        <div className="glass-panel flex items-center gap-3 p-4 text-sm text-slate-700 dark:text-slate-200">
          <AlertCircle size={16} className="text-amber-500" />
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <TranslationInputPanel
          languages={languages}
          sourceLanguage={sourceLanguage}
          onSourceLanguageChange={setSourceLanguage}
          inputText={inputText}
          onInputTextChange={setInputText}
          onClear={handleClear}
          onStartListening={handleStartVoiceInput}
          onStopListening={handleStopVoiceInput}
          isListening={isListening}
          speechSupported={speechSupported}
          interimTranscript={interimTranscript}
          voiceLanguageHint={sourceLanguage === "auto" ? navigator.language : sourceLanguageDetails.name}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwapLanguages}
            className="icon-button h-14 w-14 shadow-glow"
            aria-label="Swap source and target languages"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        <TranslationOutputPanel
          languages={languages}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          translatedText={translatedText}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onSpeak={handleSpeak}
          onStopSpeaking={stopSpeaking}
          isSpeaking={isSpeaking}
          speechSupported={speechSynthesisSupported}
          isTranslating={isTranslating || isToneTranslating}
          detectedLanguageLabel={detectedLanguageLabel}
          providerLabel={providerLabel}
          rtl={targetLanguageDetails.rtl}
        />
      </section>

      <ToneEnhancementControls
        enabled={toneEnhancementEnabled}
        selectedTone={selectedTone}
        onEnabledChange={setToneEnhancementEnabled}
        onToneChange={setSelectedTone}
        onSubmit={handleToneAwareTranslate}
        isSubmitting={isToneTranslating}
        disabled={!inputText.trim()}
      />

      <LearningModePanel learning={learning} />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
        />
        <LiveCallPreview />
      </section>
    </Shell>
  );
};

export default TranslatorWorkspace;
