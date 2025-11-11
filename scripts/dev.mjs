import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadConfig() {
  const p = resolve(process.cwd(), "dev.config.json");
  const raw = readFileSync(p, "utf8");
  const j = JSON.parse(raw);
  if (!Array.isArray(j.services)) throw new Error("Invalid dev.config.json: services[] missing");
  return j.services.filter(s => s && (s.enabled ?? true));
}

function resolveVenvBin(venvPath) {
  const root = resolve(process.cwd(), venvPath);
  const isWin = process.platform === "win32";
  const binDir = isWin ? resolve(root, "Scripts") : resolve(root, "bin");
  return { root, binDir, isWin };
}

function toWslPath(winPath) {
  // Convert C:\Users\User\myapp -> /mnt/c/Users/User/myapp
  const driveMatch = winPath.match(/^[A-Za-z]:/);
  let p = winPath.replaceAll('\\', '/');
  if (driveMatch) {
    const drive = driveMatch[0][0].toLowerCase();
    p = `/mnt/${drive}${p.slice(2)}`;
  }
  return p;
}

function prefix(name, colorCode) {
  return (line) => {
    const txt = line.toString();
    process.stdout.write(`\x1b[${colorCode}m[${name}]\x1b[0m ${txt}`);
  };
}

function runService(svc, color) {
  const useWsl = !!svc.runInWsl;
  let child;
  if (useWsl) {
    const distro = svc.wslDistro || "Ubuntu";
    const hostCwd = svc.cwd ? resolve(process.cwd(), svc.cwd) : process.cwd();
    const wslCwd = toWslPath(hostCwd);
    const exports = Object.entries(svc.env || {})
      .map(([k, v]) => `export ${k}='${String(v).replaceAll("'", "'\\''")}'`)
      .join(" && ");
    const activate = svc.venvLinuxPath ? `source '${svc.venvLinuxPath}/bin/activate' && ` : "";
    const prologue = [exports, `cd '${wslCwd}'`, `${activate}`].filter(Boolean).join(" && ");
    const bashCmd = prologue ? `${prologue} ${svc.command}` : svc.command;
    const full = ["-d", distro, "--", "bash", "-lc", bashCmd];
    child = spawn("wsl", full, { stdio: ["inherit", "pipe", "pipe"] });
  } else {
    let env = { ...process.env, ...(svc.env || {}) };
    if (svc.useVenv && svc.venvPath) {
      const { root, binDir, isWin } = resolveVenvBin(svc.venvPath);
      const sep = isWin ? ";" : ":";
      env = {
        ...env,
        VIRTUAL_ENV: root,
        PATH: `${binDir}${sep}${process.env.PATH || ""}`,
      };
    }
    child = spawn(svc.command, {
      cwd: svc.cwd ? resolve(process.cwd(), svc.cwd) : process.cwd(),
      shell: true,
      env,
      stdio: ["inherit", "pipe", "pipe"],
    });
  }
  child.stdout.on("data", prefix(svc.name, color));
  child.stderr.on("data", prefix(svc.name, color));
  child.on("exit", (code) => {
    console.log(`[orchestrator] ${svc.name} exited with code ${code}`);
  });
  return child;
}

const colors = [31, 32, 33, 34, 35, 36];
const procs = [];

try {
  const services = loadConfig();
  console.log(`[orchestrator] launching ${services.length} service(s)`);
  services.forEach((svc, i) => {
    procs.push(runService(svc, colors[i % colors.length]));
  });
} catch (e) {
  console.error(`[orchestrator] config error: ${e?.message || e}`);
  process.exit(1);
}

function shutdown() {
  console.log("[orchestrator] shutting down...");
  procs.forEach((p) => {
    try { p.kill(); } catch {}
  });
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
