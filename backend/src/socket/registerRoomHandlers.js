const normalizeRoomId = (roomId) => roomId?.toString().trim();

export const registerRoomHandlers = (io, socket) => {
  let activeRoomId = null;

  socket.on("joinRoom", (roomId, callback) => {
    const normalizedRoomId = normalizeRoomId(roomId);

    if (!normalizedRoomId) {
      callback?.({
        ok: false,
        message: "A room ID is required."
      });
      return;
    }

    if (activeRoomId && activeRoomId !== normalizedRoomId) {
      socket.leave(activeRoomId);
      socket.to(activeRoomId).emit("participantLeft", {
        roomId: activeRoomId,
        participantId: socket.id,
        timestamp: new Date().toISOString()
      });
    }

    activeRoomId = normalizedRoomId;
    socket.join(normalizedRoomId);

    callback?.({
      ok: true,
      roomId: normalizedRoomId,
      participantId: socket.id
    });

    socket.emit("roomJoined", {
      roomId: normalizedRoomId,
      participantId: socket.id,
      timestamp: new Date().toISOString()
    });

    socket.to(normalizedRoomId).emit("participantJoined", {
      roomId: normalizedRoomId,
      participantId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("translatedSpeech", (payload = {}, callback) => {
    const normalizedRoomId = normalizeRoomId(payload.roomId);

    if (!normalizedRoomId || normalizedRoomId !== activeRoomId) {
      callback?.({
        ok: false,
        message: "Join a room before sending translated speech."
      });
      return;
    }

    const message = {
      id: `${socket.id}-${Date.now()}`,
      roomId: normalizedRoomId,
      participantId: socket.id,
      originalText: payload.originalText?.toString().trim() ?? "",
      translatedText: payload.translatedText?.toString().trim() ?? "",
      sourceLanguage: payload.sourceLanguage ?? "auto",
      targetLanguage: payload.targetLanguage ?? "en",
      timestamp: new Date().toISOString()
    };

    if (!message.translatedText) {
      callback?.({
        ok: false,
        message: "Translated text is required."
      });
      return;
    }

    socket.to(normalizedRoomId).emit("roomMessage", message);
    callback?.({
      ok: true,
      messageId: message.id
    });
  });

  socket.on("endCall", ({ roomId } = {}, callback) => {
    const normalizedRoomId = normalizeRoomId(roomId ?? activeRoomId);

    if (normalizedRoomId) {
      socket.leave(normalizedRoomId);
      socket.to(normalizedRoomId).emit("participantLeft", {
        roomId: normalizedRoomId,
        participantId: socket.id,
        timestamp: new Date().toISOString()
      });
    }

    activeRoomId = null;
    callback?.({ ok: true });
  });

  socket.on("disconnect", () => {
    if (!activeRoomId) {
      return;
    }

    socket.to(activeRoomId).emit("participantLeft", {
      roomId: activeRoomId,
      participantId: socket.id,
      timestamp: new Date().toISOString()
    });
  });
};
