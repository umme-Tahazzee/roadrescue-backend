import { NextFunction, Request, Response } from "express";
import { Role } from "../../prisma/generated/prisma/enums";
import { catchAsync } from "../utils/catchAsyn";


export interface RequestUser {
				email: string;
				name: string;
				userId: string;
				role: Role;
			};

declare global {
	namespace Express {
		interface Request {
			user?: RequestUser
		}
	}
}
export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;
    })
}