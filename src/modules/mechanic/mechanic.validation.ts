import { z } from "zod";
import { MechanicStatus, RequestStatus } from "../../../prisma/generated/prisma/enums";
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

const listJobsSchema = z.object({
  query: z.object({
    status: z.enum(RequestStatus, { error: "Invalid status filter" }).optional(),
  }),
});

// query values arrive as strings, so they are converted to numbers first
const nearbySearchSchema = z.object({
  query: z.object({
    lat: z.coerce.number({ error: "lat must be a number" }).min(-90).max(90),
    lng: z.coerce.number({ error: "lng must be a number" }).min(-180).max(180),
    serviceType: z
      .string()
      .trim()
      .toLowerCase()
      .max(50)
      .optional(),
    radiusKm: z.coerce
      .number({ error: "radiusKm must be a number" })
      .positive("radiusKm must be greater than zero")
      .max(50, "radiusKm must not exceed 50")
      .default(15),
  }),
});

const profileIdSchema = z.object({
  params: idParams,
});

export const MechanicValidation = {
  toggleAvailabilitySchema,
  updateLocationSchema,
  listProfilesSchema,
  listJobsSchema,
  nearbySearchSchema,
  profileIdSchema,
};
