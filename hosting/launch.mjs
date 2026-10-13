import { mkdir, access, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
process.umask(0o077);
if (Number(process.versions.node.split(".")[0]) < 22)
  throw new Error("Нужен Node.js 22 или новее.");
const directory =
  process.env.NUMEROLOGIC_DATA_DIR ||
  resolve(
    homedir(),
    process.platform === "darwin"
      ? "Library/Application Support/Numerologic"
      : ".local/share/Numerologic",
  );
await mkdir(directory, { recursive: true, mode: 0o700 });
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
for (const subdir of [".", "frontend"]) {
  try {
    await access(resolve(root, subdir, "node_modules"));
  } catch {
    execFileSync(npm, ["ci", "--prefix", subdir], { stdio: "inherit" });
  }
}
try {
  await access("dist/server/index.js");
} catch {
  execFileSync(npm, ["run", "build"], { stdio: "inherit" });
}
process.env.LOCAL_DB = resolve(directory, "workspace.sqlite3");
process.env.PORT = process.env.NUMEROLOGIC_PORT || "8080";
process.env.PREVIEW_MODE = "false";
console.log(
  "Numerologic · данные сохраняются между запусками. Оплата отключена. Закрыть: Ctrl+C.",
);
await import("./dev.mjs");
await chmod(process.env.LOCAL_DB, 0o600);
if (process.env.NUMEROLOGIC_NO_BROWSER !== "1") {
  const url = "http://127.0.0.1:" + process.env.PORT;
  const command =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  const browser = spawn(command[0], command[1], { stdio: "ignore" });
  browser.on("error", () => console.log("Откройте " + url));
  browser.unref();
}
