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

export type WindowDefinition =
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

// Top-level windows should allow an optional title
const windowSchemaWithTitle = z.union([
  baseWindowDefinition.extend({ title: z.string().optional() }),
  z.strictObject({
    title: z.string().optional(),
    leftside: windowSchema,
    rightside: windowSchema,
  }),
  z.strictObject({
    title: z.string().optional(),
    upperside: windowSchema,
    lowerside: windowSchema,
  }),
]);

export const configSechma = z.strictObject({
  env: envSchema.array(),
  windows: windowSchemaWithTitle.array(),
});

export type configDefinition = z.infer<typeof configSechma>;
