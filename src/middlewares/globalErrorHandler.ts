import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";

import config from "../config";
import { Prisma } from "../../prisma/generated/prisma/client";
import { AppError } from "../utils/AppError";

interface IErrorDetail {
	path: string;
	message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (config.node_env === "development") {
		console.log("Error from Global Error Handler", err);
	}

	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let errorMessage: string = err.message || "Internal Server Error";
	const errorName: string = err.name || "Internal Server Error";
	let errorDetails: IErrorDetail[] | undefined = undefined;

	if (err instanceof AppError) {
		// নিজেদের throw করা operational error — customer already exists, OTP expired, ইত্যাদি
		statusCode = err.statusCode;
		errorMessage = err.message;
	} else if (err instanceof ZodError) {
		statusCode = httpStatus.BAD_REQUEST;
		errorMessage = "Validation Error";
		errorDetails = err.issues.map((issue) => ({
			path: String(issue.path[issue.path.length - 1]), // ✅
			message: issue.message,
		}));
	} else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;
		errorMessage = "You have provided incorrect field type or missing fields";
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Duplicate Key Error";
		} else if (err.code === "P2003") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Foreign key constraint failed";
		} else if (err.code === "P2025") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage =
				"An operation failed because it depends on one or more records that were required but not found.";
		} else {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Database request error";
		}
	} else if (err instanceof Prisma.PrismaClientInitializationError) {
		if (err.errorCode === "P1000") {
			statusCode = httpStatus.UNAUTHORIZED;
			errorMessage =
				"Authentication failed against database server. Please check your credentials";
		} else if (err.errorCode === "P1001") {
			statusCode = httpStatus.BAD_REQUEST;
			errorMessage = "Can't reach database server";
		}
	} else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		errorMessage = "Error occurred during query execution";
	} else if (err instanceof Error) {
		errorMessage = err.message;
	}

	const isServerError = statusCode >= 500;
	const shouldMaskMessage = isServerError && config.node_env !== "development";

	res.status(statusCode).json({
		success: false,
		statusCode,
		name:
			config.node_env === "development"
				? errorName
				: shouldMaskMessage
					? "Error"
					: errorName,
		message: shouldMaskMessage
			? "Something went wrong, please try again later"
			: errorMessage,
		errorDetails,
		stack: config.node_env === "development" ? err.stack : undefined,
	});
};