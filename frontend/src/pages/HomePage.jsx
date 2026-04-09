import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import Navbar from "../components/Navbar";
import RoomJoinCard from "../components/RoomJoinCard";
import RoomHeader from "../components/RoomHeader";
import TranscriptColumn from "../components/TranscriptColumn";
import CallControls from "../components/CallControls";
import TranslatorWorkspace from "../components/TranslatorWorkspace";
import HistoryWorkspace from "../components/HistoryWorkspace";
import { useTheme } from "../hooks/useTheme";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { api } from "../services/api";
import { getSocket } from "../services/socket";
import { fallbackLanguages } from "../utils/fallbackLanguages";

const createEntry = (text, helperText, timestamp = new Date().toISOString()) => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  text,
  helperText,
  timestamp
});

const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useLocalStorage(
    "lingua-flow-active-view",
    "translator"
  );
  const [languages, setLanguages] = useState(fallbackLanguages);
  const [roomIdInput, setRoomIdInput] = useLocalStorage("lingua-flow-room-id", "");
  const [targetLanguage, setTargetLanguage] = useLocalStorage(
    "lingua-flow-live-target-language",
    "es"
  );
  const [activeRoomId, setActiveRoomId] = useState("");
  const [localEntries, setLocalEntries] = useState([]);
  const [remoteEntries, setRemoteEntries] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [online, setOnline] = useState(navigator.onLine);
  const [isJoining, setIsJoining] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const activeRoomRef = useRef("");
  const languagesRef = useRef(languages);
  const targetLanguageRef = useRef(targetLanguage);
  const speakRef = useRef(() => {});
  const speechSynthesisSupportedRef = useRef(false);
  const stopListeningRef = useRef(() => {});
  const stopSpeakingRef = useRef(() => {});
  const lastRelayedTranscriptRef = useRef({
    text: "",
    timestamp: 0
  });

  const getLanguageDetails = (code) =>
    languagesRef.current.find((language) => language.code === code) ??
    fallbackLanguages.find((language) => language.code === code) ??
    fallbackLanguages[1];

  const {
    isSupported: speechSynthesisSupported,
    speak,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  const relaySpeechChunk = async (transcript) => {
    const trimmedTranscript = transcript.trim();
    const roomId = activeRoomRef.current;

    if (!trimmedTranscript || !roomId) {
      return;
    }

    const now = Date.now();
    if (
      lastRelayedTranscriptRef.current.text === trimmedTranscript &&
      now - lastRelayedTranscriptRef.current.timestamp < 2000
    ) {
      return;
    }

    lastRelayedTranscriptRef.current = {
      text: trimmedTranscript,
      timestamp: now
    };

    const selectedLanguage = getLanguageDetails(targetLanguageRef.current);
    setLocalEntries((currentEntries) => [
      ...currentEntries,
      createEntry(trimmedTranscript, `Relayed to ${selectedLanguage.name}`)
    ]);
    setIsSending(true);
    setError("");

    try {
      const translation = await api.translate({
        text: trimmedTranscript,
        sourceLanguage: "auto",
        targetLanguage: targetLanguageRef.current,
        includeLearning: false
      });

      const acknowledgement = await new Promise((resolve) => {
        socketRef.current?.emit(
          "translatedSpeech",
          {
            roomId,
            originalText: trimmedTranscript,
            translatedText: translation.translatedText,
            sourceLanguage: translation.detectedLanguage ?? "auto",
            targetLanguage: targetLanguageRef.current
          },
          resolve
        );
      });

      if (!acknowledgement?.ok) {
        throw new Error(acknowledgement?.message ?? "Unable to send translated speech.");
      }

      setStatusNotice(
        `Sent ${selectedLanguage.name} audio-ready translation to room ${roomId}.`
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to translate and relay the current speech segment."
      );
    } finally {
      setIsSending(false);
    }
  };

  const {
    isSupported: speechRecognitionSupported,
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

      if (isFinal) {
        relaySpeechChunk(transcript);
      }
    },
    onError: (speechError, meta = {}) => {
      if (meta.recoverable && meta.retrying) {
        setError(
          `Speech recognition error: ${speechError}. Retrying automatically${
            meta.attempt ? ` (attempt ${meta.attempt})` : ""
          }.`
        );
        setStatusNotice("Speech service dropped briefly. Reconnecting microphone recognition.");
        return;
      }

      setError(`Speech recognition error: ${speechError}`);
      setStatusNotice("Speech recognition stopped. Try Start Speaking again.");
    }
  });

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    speechSynthesisSupportedRef.current = speechSynthesisSupported;
  }, [speechSynthesisSupported]);

  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  useEffect(() => {
    stopSpeakingRef.current = stopSpeaking;
  }, [stopSpeaking]);

  useEffect(() => {
    languagesRef.current = languages;
  }, [languages]);

  useEffect(() => {
    targetLanguageRef.current = targetLanguage;
  }, [targetLanguage]);

  useEffect(() => {
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const loadedLanguages = await api.getLanguages();
        setLanguages(loadedLanguages);
      } catch {
        setLanguages(fallbackLanguages);
      }
    };

    loadLanguages();
  }, []);

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

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setConnectionStatus("connected");
      setError("");
    };

    const handleDisconnect = () => {
      setConnectionStatus("disconnected");
      stopListeningRef.current();
    };

    const handleConnectError = () => {
      setIsJoining(false);
      setConnectionStatus("disconnected");
      setError("Unable to connect to the room server.");
    };

    const handleRoomJoined = ({ roomId }) => {
      setActiveRoomId(roomId);
      setConnectionStatus("connected");
      setIsJoining(false);
      setError("");
      setStatusNotice(`Joined room ${roomId}. Your speech will now relay only to this room.`);
      setLocalEntries([]);
      setRemoteEntries([]);
    };

    const handleParticipantJoined = ({ participantId }) => {
      setStatusNotice(`Participant ${participantId.slice(0, 6)} joined the room.`);
    };

    const handleParticipantLeft = ({ participantId }) => {
      setStatusNotice(`Participant ${participantId.slice(0, 6)} left the room.`);
    };

    const handleRoomMessage = (message) => {
      const language = getLanguageDetails(message.targetLanguage);
      setRemoteEntries((currentEntries) => [
        ...currentEntries,
        createEntry(
          message.translatedText,
          message.originalText
            ? `Heard: ${message.originalText} · ${language.name}`
            : `Incoming translation · ${language.name}`,
          message.timestamp
        )
      ]);

      if (speechSynthesisSupportedRef.current) {
        speakRef.current(message.translatedText, language.speechLocale, message.targetLanguage);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("roomJoined", handleRoomJoined);
    socket.on("participantJoined", handleParticipantJoined);
    socket.on("participantLeft", handleParticipantLeft);
    socket.on("roomMessage", handleRoomMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("roomJoined", handleRoomJoined);
      socket.off("participantJoined", handleParticipantJoined);
      socket.off("participantLeft", handleParticipantLeft);
      socket.off("roomMessage", handleRoomMessage);
      socket.disconnect();
      stopListeningRef.current();
      stopSpeakingRef.current();
    };
  }, []);

  const handleJoinRoom = () => {
    const normalizedRoomId = roomIdInput.trim();

    if (!normalizedRoomId) {
      setError("Enter a room ID before joining.");
      return;
    }

    const socket = socketRef.current ?? getSocket();
    socketRef.current = socket;

    setIsJoining(true);
    setConnectionStatus("connecting");
    setError("");
    setStatusNotice("");

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinRoom", normalizedRoomId, (response) => {
      if (!response?.ok) {
        setIsJoining(false);
        setConnectionStatus("disconnected");
        setError(response?.message ?? "Unable to join the requested room.");
      }
    });
  };

  const handleStartSpeaking = async () => {
    if (!activeRoomRef.current) {
      setError("Join a room before starting the microphone.");
      return;
    }

    if (!speechRecognitionSupported) {
      setError("This browser does not support microphone access.");
      return;
    }

    setError("");
    setStatusNotice("Listening continuously. Final speech chunks will translate and relay to the room.");
    startListening();
  };

  const handleStopSpeaking = () => {
    stopListening();
    setStatusNotice("Microphone stopped. Room session remains active.");
  };

  const handleEndCall = () => {
    stopListening();
    stopSpeaking();

    if (socketRef.current?.connected) {
      socketRef.current.emit("endCall", { roomId: activeRoomRef.current });
      socketRef.current.disconnect();
    }

    setActiveRoomId("");
    activeRoomRef.current = "";
    setConnectionStatus("disconnected");
    setLocalEntries([]);
    setRemoteEntries([]);
    setError("");
    setStatusNotice("Call ended. Join a room again to start a new session.");
  };

  const renderVoiceRoom = () => {
    if (!activeRoomId) {
      return (
        <RoomJoinCard
          roomId={roomIdInput}
          onRoomIdChange={setRoomIdInput}
          onJoinRoom={handleJoinRoom}
          isJoining={isJoining}
          error={error}
        />
      );
    }

    return (
      <>
        <RoomHeader
          roomId={activeRoomId}
          connectionStatus={connectionStatus}
          online={online}
          themeToggle={null}
        />

        {error ? (
          <div className="glass-panel flex items-center gap-3 p-4 text-sm text-rose-700 dark:text-rose-200">
            <AlertCircle size={18} />
            {error}
          </div>
        ) : null}

        {statusNotice ? (
          <div className="glass-panel flex items-center gap-3 p-4 text-sm text-emerald-700 dark:text-emerald-200">
            <CheckCircle2 size={18} />
            {statusNotice}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-2">
          <TranscriptColumn
            title="You"
            description="Your original speech appears here as room history. Finalized chunks are translated and relayed to everyone else in the room."
            entries={localEntries}
            liveText={interimTranscript}
            emptyState="Start speaking to build your transcript history."
          />
          <TranscriptColumn
            title="Translated"
            description="Incoming translated speech from other room participants is displayed here and spoken aloud automatically."
            entries={remoteEntries}
            emptyState="Incoming room translations will appear here."
            tone="indigo"
          />
        </section>

        <CallControls
          languages={languages}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          isListening={isListening}
          onStartSpeaking={handleStartSpeaking}
          onStopSpeaking={handleStopSpeaking}
          onEndCall={handleEndCall}
          speechSupported={speechRecognitionSupported}
          canTalk={connectionStatus === "connected"}
          isSending={isSending}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-32">
      <Navbar
        activeView={activeView}
        onChange={setActiveView}
        themeToggle={<ThemeToggle theme={theme} onToggle={toggleTheme} />}
      />

      {activeView === "translator" ? <TranslatorWorkspace /> : null}

      {activeView === "history" ? <HistoryWorkspace /> : null}

      {activeView === "room" ? (
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">{renderVoiceRoom()}</div>
        </div>
      ) : null}
    </div>
  );
};

export default HomePage;
