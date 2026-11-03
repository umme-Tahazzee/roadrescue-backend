import { z } from "zod";
import { MechanicStatus } from "../../../prisma/generated/prisma/enums";
import { idParams, latitude, longitude } from "../../utils/commonValidation";

// createProfile is multipart (files + text), so it is checked inside the controller

const toggleAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean({ error: "isAvailable must be a boolean (true or false)" }),
  }),
});

const updateLocationSchema = z.object({
  body: z.object({
    lat: latitude,
    lng: longitude,
  }),
});

const listProfilesSchema = z.object({
  query: z.object({
    status: z.enum(MechanicStatus, { error: "Invalid status filter" }).optional(),
  }),
});

const profileIdSchema = z.object({
  params: idParams,
});

export const MechanicValidation = {
  toggleAvailabilitySchema,
  updateLocationSchema,
  listProfilesSchema,
  profileIdSchema,
};
