import { configSechma } from "config-schema";
import { writeFileSync } from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";

const jsonSchema = zodToJsonSchema(configSechma);
writeFileSync("schema.json", JSON.stringify(jsonSchema, null, 2));
