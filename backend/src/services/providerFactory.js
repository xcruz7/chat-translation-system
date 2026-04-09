import { env } from "../config/env.js";
import { googleWebProvider } from "./providers/googleWebProvider.js";
import { libreTranslateProvider } from "./providers/libreTranslateProvider.js";

export const getTranslationProvider = () =>
  env.provider === "libretranslate" ? libreTranslateProvider : googleWebProvider;
