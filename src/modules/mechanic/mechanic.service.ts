// mechanic-profile/mechanic.service.ts

import { AppError } from "../../utils/AppError";
import  httpStatus  from "http-status";
import { ICreateMechanicProfile } from "./mechanic.interface";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../prisma/generated/prisma/enums";


const createProfile = async (userId: string, payload: ICreateMechanicProfile) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	// FIX: শুধু MECHANIC role-এর user profile তৈরি করতে পারবে
	if (user.role !== Role.MECHANIC) {
		throw new AppError(
			"Only mechanic accounts can create a mechanic profile",
			httpStatus.FORBIDDEN,
		);
	}

	const existingProfile = await prisma.mechanicProfile.findUnique({
		where: { userId },
	});

	if (existingProfile) {
		throw new AppError(
			"Mechanic profile already exists for this user",
			httpStatus.CONFLICT,
		);
	}

	const profile = await prisma.mechanicProfile.create({
		data: {
			userId,
			serviceTypes: payload.serviceTypes,
			licenseDoc: payload.licenseDoc,
			nidDoc: payload.nidDoc,
			vehiclePhoto: payload.vehiclePhoto,
			serviceRadius: payload.serviceRadius ?? 10,
			
		},
	});

	return profile;
};

export const MechanicService = {
	createProfile,
};