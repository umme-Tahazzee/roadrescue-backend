import { z } from "zod";
import { AdminAction, RequestStatus, Role } from "../../../prisma/generated/prisma/enums";
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

// query values arrive as strings, so coerce turns "2" into 2 (defaults: page 1, 20 per page)
const listActivitiesQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: z.enum(AdminAction, { error: "Invalid action filter" }).optional(),
});

const listActivitiesSchema = z.object({
  query: listActivitiesQuery,
});

export const AdminValidation = {
  listActivitiesQuery,
  listActivitiesSchema,
  listUsersSchema,
  userIdSchema,
  toggleBlockSchema,
  listRequestsSchema,
};
