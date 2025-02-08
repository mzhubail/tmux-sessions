import { tokenizeArgs } from "args-tokenizer";
import { x, type Output } from "tinyexec";

export async function runTmux(args: (string | undefined)[] | string) {
  const castedArgs = (
    typeof args === "string" ? tokenizeArgs(args) : args
  ).filter((v): v is string => !!v);

  const output = process.env.TEST
    ? await x("echo", ["tmux", ...castedArgs])
    : await x("tmux", castedArgs);

  handleOutput(output);
}

function handleOutput({ stdout, stderr }: Output) {
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}
