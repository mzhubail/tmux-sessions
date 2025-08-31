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
      working_directory?: string;
    }
  | {
      upperside: WindowDefinition;
      lowerside: WindowDefinition;
      working_directory?: string;
    };

const windowSchema: z.ZodType<WindowDefinition> = z.union([
  baseWindowDefinition,
  z.strictObject({
    leftside: z.lazy(() => windowSchema),
    rightside: z.lazy(() => windowSchema),
    working_directory: z.string().optional(),
  }),
  z.strictObject({
    upperside: z.lazy(() => windowSchema),
    lowerside: z.lazy(() => windowSchema),
    working_directory: z.string().optional(),
  }),
]);

// Top-level windows should allow an optional title
const windowSchemaWithTitle = z.union([
  baseWindowDefinition.extend({ title: z.string().optional() }),
  z.strictObject({
    title: z.string().optional(),
    leftside: windowSchema,
    rightside: windowSchema,
    working_directory: z.string().optional(),
  }),
  z.strictObject({
    title: z.string().optional(),
    upperside: windowSchema,
    lowerside: windowSchema,
    working_directory: z.string().optional(),
  }),
]);

export const configSechma = z.strictObject({
  env: envSchema.array(),
  windows: windowSchemaWithTitle.array(),
});

export type configDefinition = z.infer<typeof configSechma>;
