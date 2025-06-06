import { resolve } from "path";
import type { WindowDefinition, configDefinition } from "~/config-schema";
import { runTmux } from "~/run-tmux";

type EngineContext = {
  baseWorkingDirectory: string;
};

export async function handleConfig(
  config: configDefinition,
  ctx: EngineContext,
) {
  // TODO: hande env (don't need to for now :|)

  for (const w of config.windows) {
    if (w.title) {
      await runTmux(["new-window", "-n", w.title]);
    } else {
      await runTmux("new-window");
    }

    await handleConfigWindow(w, ctx);
  }
}

async function handleConfigWindow(
  w: WindowDefinition,

  ctx: EngineContext,
) {
  if ("cmd" in w) {
    const { cmd, working_directory, norun } = w;
    if (working_directory) {
      // TODO: handle working directories using '-c'
      // TODO: add a map for working directories
      // TODO: top level working directories for splits with inheritance
      await runTmux([
        "send-keys",
        "  cd ",
        resolve(ctx.baseWorkingDirectory, working_directory),
        "C-m",
      ]);
    }

    // prettier-ignore
    await runTmux([
      "send-keys",
      cmd,
      norun ? undefined : "C-m"
    ]);
  } else if ("leftside" in w) {
    const { leftside, rightside } = w;

    await handleConfigWindow(leftside, ctx);

    await runTmux(["split-window", "-h"]);

    await handleConfigWindow(rightside, ctx);
  } else if ("upperside" in w) {
    const { upperside, lowerside } = w;

    await handleConfigWindow(upperside, ctx);

    await runTmux(["split-window", "-v"]);

    await handleConfigWindow(lowerside, ctx);
  }
}
