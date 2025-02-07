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

const baseWindowDefinition = z.object({
  cmd: z.string(),
  working_directory: z.string().optional(),
  norun: z.boolean().optional(),
});

export type WindowDefinition =
  // TODO: Base case should also allow an optional title for the window
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
  z.object({
    leftside: z.lazy(() => windowSchema),
    rightside: z.lazy(() => windowSchema),
  }),
  z.object({
    upperside: z.lazy(() => windowSchema),
    lowerside: z.lazy(() => windowSchema),
  }),
]);

export const configSechma = z.strictObject({
  env: envSchema.array(),
  windows: windowSchema.and(z.object({ title: z.string().optional() })).array(),
});

export type configDefinition = z.infer<typeof configSechma>;
