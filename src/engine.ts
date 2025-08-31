import { resolve } from "path";
import type { WindowDefinition, configDefinition } from "~/config-schema";
import { runTmux } from "~/run-tmux";
import { validatePaths } from "./validate-paths";

export type EngineContext = {
  baseWorkingDirectory: string;
};

export async function handleConfig(
  config: configDefinition,
  ctx: EngineContext,
) {
  // TODO: hande env (don't need to for now :|)

  if (await validatePaths(config, ctx)) {
    return;
  }

  for (const w of config.windows) {
    if (w.title) {
      await runTmux(["new-window", "-n", w.title]);
    } else {
      await runTmux("new-window");
    }

    await handleConfigWindow(w, ctx, w.working_directory);
  }
}

async function handleConfigWindow(
  w: WindowDefinition,
  ctx: EngineContext,
  working_directory?: string,
) {
  const wd = w.working_directory || working_directory;
  console.log(`  >>  ${wd}`);

  if ("cmd" in w) {
    const { cmd, norun } = w;
    if (wd) {
      // TODO: handle working directories using '-c'
      // TODO: add a map for working directories
      await runTmux([
        "send-keys",
        "  cd ",
        resolve(ctx.baseWorkingDirectory, wd ?? ""),
        "C-m",
      ]);
    }

    // prettier-ignore
    await runTmux([
      "send-keys",
      `  ${cmd.trimEnd()}`,
      norun ? undefined : "C-m"
    ]);
  } else if ("leftside" in w) {
    const { leftside, rightside } = w;

    await runTmux(["split-window", "-bh"]);

    await handleConfigWindow(leftside, ctx, wd);

    // advance to next pane
    await runTmux(["select-pane", "-t+"]);

    await handleConfigWindow(rightside, ctx, wd);
  } else if ("upperside" in w) {
    const { upperside, lowerside } = w;

    await runTmux(["split-window", "-bv"]);

    await handleConfigWindow(upperside, ctx, wd);

    // advance to next pane
    await runTmux(["select-pane", "-t+"]);

    await handleConfigWindow(lowerside, ctx, wd);
  }
}
