import { z } from "zod";
import { RequestStatus } from "../../../prisma/generated/prisma/enums";
import { phone } from "../../utils/commonValidation";

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must not exceed 50 characters")
        .optional(),
      phone: phone.optional(),
    })
    .refine((data) => data.name !== undefined || data.phone !== undefined, {
      message: "Send at least one field to update (name or phone)",
    }),
});

const listMyRequestsSchema = z.object({
  query: z.object({
    status: z.enum(RequestStatus, { error: "Invalid status filter" }).optional(),
  }),
});

export const CustomerValidation = {
  updateProfileSchema,
  listMyRequestsSchema,
};
