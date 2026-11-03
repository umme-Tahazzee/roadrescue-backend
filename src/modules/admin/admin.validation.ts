import { z } from "zod";
import { RequestStatus, Role } from "../../../prisma/generated/prisma/enums";
import { idParams } from "../../utils/commonValidation";

const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(Role, { error: "Invalid role filter" }).optional(),
  }),
});

const userIdSchema = z.object({
  params: idParams,
});

const toggleBlockSchema = z.object({
  params: idParams,
  body: z.object({
    isBlocked: z.boolean({ error: "isBlocked must be a boolean (true or false)" }),
  }),
});

const listRequestsSchema = z.object({
  query: z.object({
    status: z.enum(RequestStatus, { error: "Invalid status filter" }).optional(),
  }),
});

export const AdminValidation = {
  listUsersSchema,
  userIdSchema,
  toggleBlockSchema,
  listRequestsSchema,
};
