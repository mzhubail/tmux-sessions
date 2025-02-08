import { tokenizeArgs } from "args-tokenizer";
import { x, type Output } from "tinyexec";

export async function runTmux(args: (string | undefined)[] | string) {
  const castedArgs = (
    typeof args === "string" ? tokenizeArgs(args) : args
  ).filter((v): v is string => !!v);

  await exec("echo", ["tmux", ...castedArgs]);
  if (!process.env.TEST) {
    await exec("tmux", castedArgs);
  }
}

async function exec(...args: Parameters<typeof x>): Promise<Output> {
  const out = await x(...args);
  if (out.stdout) process.stdout.write(out.stdout);
  if (out.stderr) process.stderr.write(out.stderr);

  return out;
}
