import { configSechma } from "~/config-schema";
import { readFileSync } from "fs";
import { parse } from "yaml";
import { handleConfig } from "~/engine";
import { dirname } from "path";

export function main() {
  const filename = process.argv[2];
  if (!filename) {
    console.error("No filename was provided");
    process.exit(-1);
  }

  const fileContent = readFileSync(filename);
  const config__ = parse(fileContent.toString()) as unknown;
  const config = configSechma.parse(config__);

  handleConfig(config, {
    baseWorkingDirectory: dirname(filename),
  });
}
