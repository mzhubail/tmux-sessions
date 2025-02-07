import {
  type WindowDefinition,
  type configDefinition,
  configSechma,
} from "config-schema";
import { readFileSync } from "fs";
import { runTmux } from "run-tmux";
import { parse } from "yaml";

// TODO: move to main.ts
function main() {
  const filename = process.argv[2];
  if (!filename) {
    console.error("No filename was provided");
    process.exit(-1);
  }

  const fileContent = readFileSync(filename);
  const config__ = parse(fileContent.toString()) as unknown;
  const config = configSechma.parse(config__);

  handleConfig(config);
}

async function handleConfig(config: configDefinition) {
  for (const w of config.windows) {
    await handleConfigWindow(w);
  }
}

async function handleConfigWindow(w: WindowDefinition) {
  if ("cmd" in w) {
    // TODO: Don't always create a new window
    // TODO: use actual tmux commands
    await runTmux("new window");

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

main();
