import fs from "fs";
import path from "path";

type DevService = { name: string; env?: Record<string, string> };
type DevConfig = { services?: DevService[] };

function readDevCeleryEnv(): Record<string, string> {
  try {
    const p = path.join(process.cwd(), "dev.config.json");
    if (!fs.existsSync(p)) return {};
    const raw = fs.readFileSync(p, "utf-8");
    const cfg = JSON.parse(raw) as DevConfig;
    const svc = (cfg.services || []).find((s) => s.name === "celery");
    return (svc?.env && typeof svc.env === "object") ? svc.env : {};
  } catch {
    return {};
  }
}

const devEnv = readDevCeleryEnv();

export function getProvider(): string {
  const v = (process.env.LLM_PROVIDER || devEnv["LLM_PROVIDER"] || "openai").toLowerCase();
  return v;
}

export function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL || devEnv["OLLAMA_BASE_URL"] || "http://localhost:11434";
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL || devEnv["OLLAMA_MODEL"] || "llama3.2:3b";
}

