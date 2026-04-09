import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

class StorageService {
  constructor() {
    this.filePath = env.storagePath;
    this.writeQueue = Promise.resolve();
  }

  async ensureStore() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(
        this.filePath,
        JSON.stringify({ history: [], updatedAt: null }, null, 2),
        "utf-8"
      );
    }
  }

  async readStore() {
    await this.ensureStore();
    const raw = await fs.readFile(this.filePath, "utf-8");

    try {
      const parsed = JSON.parse(raw);
      return {
        history: Array.isArray(parsed.history) ? parsed.history : [],
        updatedAt: parsed.updatedAt ?? null
      };
    } catch {
      return { history: [], updatedAt: null };
    }
  }

  async writeStore(nextStore) {
    this.writeQueue = this.writeQueue.then(async () => {
      await this.ensureStore();
      await fs.writeFile(this.filePath, JSON.stringify(nextStore, null, 2), "utf-8");
    });

    return this.writeQueue;
  }

  async getHistory() {
    const store = await this.readStore();
    return store.history;
  }

  async saveTranslation(entry) {
    const store = await this.readStore();
    const duplicateEntry = store.history.find(
      (currentEntry) =>
        currentEntry.sourceText.trim().toLowerCase() === entry.sourceText.trim().toLowerCase() &&
        currentEntry.translatedText.trim().toLowerCase() ===
          entry.translatedText.trim().toLowerCase() &&
        currentEntry.targetLanguage === entry.targetLanguage
    );

    const normalizedEntry = duplicateEntry
      ? { ...entry, favorite: duplicateEntry.favorite }
      : entry;

    const history = [
      normalizedEntry,
      ...store.history.filter(
        (currentEntry) =>
          !(
            currentEntry.sourceText.trim().toLowerCase() ===
              normalizedEntry.sourceText.trim().toLowerCase() &&
            currentEntry.translatedText.trim().toLowerCase() ===
              normalizedEntry.translatedText.trim().toLowerCase() &&
            currentEntry.targetLanguage === normalizedEntry.targetLanguage
          )
      )
    ].slice(0, env.historyLimit);
    const nextStore = {
      history,
      updatedAt: new Date().toISOString()
    };

    await this.writeStore(nextStore);
    return entry;
  }

  async toggleFavorite(id) {
    const store = await this.readStore();
    let updatedEntry = null;
    const history = store.history.map((entry) => {
      if (entry.id !== id) {
        return entry;
      }

      updatedEntry = { ...entry, favorite: !entry.favorite };
      return updatedEntry;
    });

    await this.writeStore({
      history,
      updatedAt: new Date().toISOString()
    });

    return updatedEntry;
  }

  async clearHistory() {
    await this.writeStore({
      history: [],
      updatedAt: new Date().toISOString()
    });
  }

  async findMatchingTranslation({ sourceText, sourceLanguage, targetLanguage }) {
    const history = await this.getHistory();

    return (
      history.find(
        (entry) =>
          entry.sourceText.trim().toLowerCase() === sourceText.trim().toLowerCase() &&
          entry.targetLanguage === targetLanguage &&
          (sourceLanguage === "auto" ||
            entry.sourceLanguage === sourceLanguage ||
            entry.detectedLanguage === sourceLanguage)
      ) ?? null
    );
  }
}

export const storageService = new StorageService();
