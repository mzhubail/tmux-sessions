import { readFileSync } from "fs";
import { parse } from "yaml";

function main() {
  const filename = process.argv[2];
  if (!filename) {
    console.error("No filename was provided");
    process.exit(-1);
  }

  const fileContent = readFileSync(filename);
  const config = parse(fileContent.toString()) as unknown;
}

main();
