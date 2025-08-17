import { stat } from "fs/promises";
import { configDefinition, WindowDefinition } from "./config-schema";
import { EngineContext } from "./engine";
import { resolve } from "path";

export async function validatePaths(
  config: configDefinition,
  ctx: EngineContext,
) {
  const validate = async (w: WindowDefinition): Promise<string[]> => {
    if ("cmd" in w) {
      const { working_directory } = w;

      const foundDir =
        working_directory &&
        !(await checkExistence(
          resolve(ctx.baseWorkingDirectory, working_directory),
        ));

      return foundDir ? [`Couldn't find path "${working_directory}"`] : [];
    } else if ("leftside" in w) {
      return [
        ...(await validate(w.leftside)),
        ...(await validate(w.rightside)),
      ];
    } else {
      return [
        ...(await validate(w.upperside)),
        ...(await validate(w.lowerside)),
      ];
    }
  };

  const output = (await Promise.all(config.windows.map(validate))).flat();

  output.forEach((m) => console.error(`ERR: ${m}`));

  return !!output.length;
}

async function checkExistence(path: string) {
  try {
    return await stat(path);
  } catch {
    return false;
  }
}
