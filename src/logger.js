// Minimal structured logger. One JSON object per line: info to stdout,
// warn and error to stderr. No dependencies, by design (see AGENTS.md rule 5).

function write(stream, level, event, context) {
  const entry = { time: new Date().toISOString(), level, event, ...context };
  stream.write(JSON.stringify(entry) + "\n");
}

export const logger = {
  info(event, context = {}) {
    write(process.stdout, "info", event, context);
  },
  warn(event, context = {}) {
    write(process.stderr, "warn", event, context);
  },
  error(event, context = {}) {
    write(process.stderr, "error", event, context);
  },
};
