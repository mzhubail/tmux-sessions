import type { WindowDefinition, configDefinition } from "~/config-schema";
import { runTmux } from "~/run-tmux";

export async function handleConfig(config: configDefinition) {
  // TODO: hande env (don't need to for now :|)

  for (const w of config.windows) {
    if (w.title) {
      await runTmux(["new-window", "-n", w.title]);
    } else {
      await runTmux("new-window");
    }

    await handleConfigWindow(w);
  }
}

async function handleConfigWindow(w: WindowDefinition) {
  if ("cmd" in w) {
    const { cmd, working_directory, norun } = w;
    if (working_directory) {
      // TODO: handle working directories using '-c'
      await runTmux(["send-keys", "  cd", working_directory, "C-m"]);
    }

    // prettier-ignore
    await runTmux([
      "send-keys",
      cmd,
      norun ? undefined : "C-m"
    ]);
  } else if ("leftside" in w) {
    const { leftside, rightside } = w;

    await handleConfigWindow(leftside);

    await runTmux(["split-window", "-h"]);

    await handleConfigWindow(rightside);
  } else if ("upperside" in w) {
    const { upperside, lowerside } = w;

    await handleConfigWindow(upperside);

    await runTmux(["split-window", "-v"]);

    await handleConfigWindow(lowerside);
  }
}
