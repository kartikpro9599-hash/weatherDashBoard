import { z } from "zod";

export const locationValidateSchema = z.object({
  lat: z.coerce
    .number()
    .min(-90, { message: "invalid location" })
    .max(90, { message: "invalid location" }),
  lon: z.coerce
    .number()
    .min(-180, { message: "invalid location" })
    .max(180, { message: "invalid location" }),
});

export const cityValidationSchema = z
  .string()
  .trim()
  .min(1, { message: "City name cannot be empty" })
  .max(100, { message: "City name is too long" })
  .regex(/^[a-zA-Z\u00C0-\u017F\s'.()-]+$/, {
    message: "invalid ciyf name",
  });
