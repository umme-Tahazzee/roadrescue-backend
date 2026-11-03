import { z } from "zod";
import { idParams, latitude, longitude } from "../../utils/commonValidation";

const createRequestSchema = z.object({
  body: z.object({
    serviceType: z
      .string({ error: "serviceType is required" })
      .trim()
      .min(1, "serviceType is required")
      .max(50, "serviceType must not exceed 50 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    pickupLat: latitude,
    pickupLng: longitude,
  }),
});

// only :id in the url, no body
const requestIdSchema = z.object({
  params: idParams,
});

// COMPLETED is not allowed here, use the complete endpoint so a payment is created
const updateStatusSchema = z.object({
  params: idParams,
  body: z.object({
    status: z.literal("IN_PROGRESS", {
      error: "status must be IN_PROGRESS (use the complete endpoint to finish a job)",
    }),
  }),
});

const completeServiceSchema = z.object({
  params: idParams,
  body: z.object({
    finalPrice: z
      .number({ error: "finalPrice must be a number" })
      .positive("finalPrice must be a positive number")
      .max(1_000_000, "finalPrice is too large"),
    method: z.enum(["CASH", "BKASH"], { error: "method must be CASH or BKASH" }),
  }),
});

export const RequestValidation = {
  createRequestSchema,
  requestIdSchema,
  updateStatusSchema,
  completeServiceSchema,
};
