import type { WindowDefinition, configDefinition } from "~/config-schema";
import { runTmux } from "~/run-tmux";

export async function handleConfig(config: configDefinition) {
  // TODO: hande env

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
    if (w.working_directory) {
      await runTmux(["send-keys", "  cd", w.working_directory, "<C-m>"]);
    }

    // prettier-ignore
    await runTmux([
      "send-keys",
      `  ${w.cmd}`,
      w.norun ? undefined : "<C-m>"
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
