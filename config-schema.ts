import { z } from "zod";

const envSchema = z.union([
  z.strictObject({
    name: z.string(),
    default: z.string().optional(),
  }),
  z.strictObject({
    name: z.string(),
    value: z.string().optional(),
  }),
]);

const baseWindowDefinition = z.strictObject({
  cmd: z.string(),
  working_directory: z.string().optional(),
  norun: z.boolean().optional(),
});

type WindowDefinition =
  | z.infer<typeof baseWindowDefinition>
  | {
      leftside: WindowDefinition;
      rightside: WindowDefinition;
    }
  | {
      upperside: WindowDefinition;
      lowerside: WindowDefinition;
    };

const windowSchema: z.ZodType<WindowDefinition> = z.union([
  baseWindowDefinition,
  z.strictObject({
    leftside: z.lazy(() => windowSchema),
    rightside: z.lazy(() => windowSchema),
  }),
  z.strictObject({
    upperside: z.lazy(() => windowSchema),
    lowerside: z.lazy(() => windowSchema),
  }),
]);

export const configSechma = z.strictObject({
  env: envSchema.array(),
  windows: windowSchema.array(),
});
