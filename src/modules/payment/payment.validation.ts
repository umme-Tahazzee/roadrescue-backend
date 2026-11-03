import { z } from "zod";
import { PaymentStatus, RefundStatus } from "../../../prisma/generated/prisma/enums";
import { idParams } from "../../utils/commonValidation";

const paymentIdSchema = z.object({
  params: idParams,
});

const listPaymentsSchema = z.object({
  query: z.object({
    status: z.enum(PaymentStatus, { error: "Invalid status filter" }).optional(),
  }),
});

const listRefundsSchema = z.object({
  query: z.object({
    status: z.enum(RefundStatus, { error: "Invalid status filter" }).optional(),
  }),
});

const requestRefundSchema = z.object({
  params: idParams,
  body: z.object({
    amount: z
      .number({ error: "amount must be a number" })
      .positive("amount must be greater than zero"),
    reason: z
      .string({ error: "reason is required" })
      .trim()
      .min(3, "Reason must be at least 3 characters")
      .max(500, "Reason must not exceed 500 characters"),
  }),
});

// bKash sends extra fields too, so unknown keys are kept (looseObject)
const bkashCallbackSchema = z.object({
  body: z.looseObject({
    paymentID: z
      .string({ error: "paymentID is required" })
      .min(1, "paymentID is required"),
    status: z.enum(["success", "failure", "cancel"], {
      error: "status must be success, failure or cancel",
    }),
    trxID: z.string().optional(),
    amount: z.string().optional(),
  }),
});

export const PaymentValidation = {
  paymentIdSchema,
  listPaymentsSchema,
  listRefundsSchema,
  requestRefundSchema,
  bkashCallbackSchema,
};
