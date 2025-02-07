import type { WindowDefinition, configDefinition } from "~/config-schema";
import { runTmux } from "~/run-tmux";

export async function handleConfig(config: configDefinition) {
  for (const w of config.windows) {
    if (w.title) {
      await runTmux(`new window with title "${w.title}"`);
    } else {
      await runTmux("new window");
    }

    await handleConfigWindow(w);
  }
}

async function handleConfigWindow(w: WindowDefinition) {
  if ("cmd" in w) {
    // TODO: use actual tmux commands

    if (w.working_directory) {
      await runTmux(["cd", w.working_directory]);
    }

    if (!!w.norun) {
      await runTmux(w.cmd + " <C-m>");
    } else {
      await runTmux(w.cmd);
    }
  } else if ("leftside" in w) {
    const { leftside, rightside } = w;

    await handleConfigWindow(leftside);

    await runTmux("create split and switch to rightside");

    await handleConfigWindow(rightside);
  } else if ("upperside" in w) {
    const { upperside, lowerside } = w;

    await handleConfigWindow(upperside);

    await runTmux("create split and switch to loweside");

    await handleConfigWindow(lowerside);
  }
}
