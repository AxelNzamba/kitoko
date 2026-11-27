/**
 * Logger structuré pour INDUS-ERP.
 *
 * Niveaux : debug, info, warn, error, fatal
 * Format : [TIMESTAMP] LEVEL [context] message { ...metadata }
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *
 *   logger.info("Démarrage du POS", { userId, saleNumber });
 *   logger.error("Échec de la création de vente", { error, cartSize });
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

function getMinLevel(): LogLevel {
  return (
    (typeof process !== "undefined" &&
      (process.env.LOG_LEVEL as LogLevel)) ||
    "info"
  );
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLog(entry: LogEntry): string {
  const parts: string[] = [
    `[${entry.timestamp}]`,
    entry.level.toUpperCase().padEnd(5),
  ];

  if (entry.context) {
    parts.push(`[${entry.context}]`);
  }

  parts.push(entry.message);

  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    try {
      parts.push(JSON.stringify(entry.metadata, null, 0));
    } catch {
      parts.push("[unserializable metadata]");
    }
  }

  return parts.join(" ");
}

function log(
  level: LogLevel,
  message: string,
  context?: string,
  metadata?: Record<string, unknown>,
) {
  if (LOG_LEVELS[level] < LOG_LEVELS[getMinLevel()]) return;

  const entry: LogEntry = {
    timestamp: formatTimestamp(),
    level,
    context,
    message,
    metadata,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "debug":
    case "info":
      console.log(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
    case "fatal":
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    log("debug", message, undefined, metadata),
  info: (message: string, metadata?: Record<string, unknown>) =>
    log("info", message, undefined, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) =>
    log("warn", message, undefined, metadata),
  error: (message: string, metadata?: Record<string, unknown>) =>
    log("error", message, undefined, metadata),
  fatal: (message: string, metadata?: Record<string, unknown>) =>
    log("fatal", message, undefined, metadata),

  /**
   * Logger avec contexte.
   * Exemple: logger.withContext("stock-movement").info("Entrée enregistrée", { productId, quantity });
   */
  withContext: (context: string) => ({
    debug: (message: string, metadata?: Record<string, unknown>) =>
      log("debug", message, context, metadata),
    info: (message: string, metadata?: Record<string, unknown>) =>
      log("info", message, context, metadata),
    warn: (message: string, metadata?: Record<string, unknown>) =>
      log("warn", message, context, metadata),
    error: (message: string, metadata?: Record<string, unknown>) =>
      log("error", message, context, metadata),
    fatal: (message: string, metadata?: Record<string, unknown>) =>
      log("fatal", message, context, metadata),
  }),
};
