import { z } from "zod";

// small reusable pieces so every module validates ids and coordinates the same way

// all ids in the database are uuids
export const idParams = z.object({
  id: z.uuid("Invalid id"),
});

export const latitude = z
  .number({ error: "Latitude must be a number" })
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90");

export const longitude = z
  .number({ error: "Longitude must be a number" })
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180");

// e.g. 01712345678 or +8801712345678
export const phone = z
  .string({ error: "Phone must be a string" })
  .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number");
