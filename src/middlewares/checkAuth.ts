import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";

import { Role } from "../../prisma/generated/prisma/enums";
import { catchAsync } from "../utils/catchAsyn";
import { AppError } from "../utils/AppError";
import config from "../config";

export interface RequestUser {
	email: string;
	name: string;
	userId: string;
	role: Role;
}

declare global {
	namespace Express {
		interface Request {
			user?: RequestUser;
		}
	}
}

export const auth = (...requiredRoles: Role[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies?.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization.split(" ")[1]
				: req.headers.authorization;
				console.log("Extracted token:", token);

		if (!token) {
			throw new AppError("You are not authorized", httpStatus.UNAUTHORIZED); // 401
		}

		let decoded: JwtPayload;
		try {
			decoded = jwt.verify(token, config.jwt_access_secret) as JwtPayload;
		} catch (err) {
			throw new AppError("Invalid or expired token", httpStatus.UNAUTHORIZED); // 401
		}

		req.user = {
			userId: decoded.userId,
			name: decoded.name,
			email: decoded.email,
			role: decoded.role,
		};

		if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
			throw new AppError(
				"You do not have permission to access this resource",
				httpStatus.FORBIDDEN, // 403
			);
		}

		next(); 
	});
};