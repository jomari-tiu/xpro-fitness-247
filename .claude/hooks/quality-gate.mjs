// TaskCompleted hook: a task can only be marked complete when lint, typecheck and unit tests pass.
// Exit code 2 blocks completion and sends stderr back to the agent as feedback.
import { spawnSync } from "node:child_process"

let task = ""
try {
  const input = JSON.parse(await new Promise((resolve) => {
    let data = ""
    process.stdin.on("data", (c) => (data += c))
    process.stdin.on("end", () => resolve(data || "{}"))
  }))
  task = input.task_subject ?? input.task?.subject ?? ""
} catch {
  // input is optional for this gate
}

const checks = [
  ["lint", "pnpm lint"],
  ["typecheck", "pnpm typecheck"],
  ["unit tests", "pnpm test"],
]

for (const [label, command] of checks) {
  const result = spawnSync(command, { shell: true, encoding: "utf8", cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd() })
  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim().split("\n").slice(-40).join("\n")
    process.stderr.write(
      `Quality gate failed${task ? ` for "${task}"` : ""}: ${label} (\`${command}\`) did not pass.\n` +
        `Fix it before completing the task. Last output:\n${output}\n`
    )
    process.exit(2)
  }
}
process.exit(0)
