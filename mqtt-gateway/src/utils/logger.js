export function logInfo(...msg) {
  console.log("\x1b[36m%s\x1b[0m", "[INFO]", ...msg);
}

export function logWarn(...msg) {
  console.log("\x1b[33m%s\x1b[0m", "[WARN]", ...msg);
}

export function logError(...msg) {
  console.log("\x1b[31m%s\x1b[0m", "[ERROR]", ...msg);
}
