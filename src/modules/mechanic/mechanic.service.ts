// mechanic-profile/mechanic.service.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { AppError } from "../../utils/AppError";
import  httpStatus  from "http-status";
import { ICreateMechanicProfile } from "./mechanic.interface";
import { prisma } from "../../lib/prisma";
import { MechanicStatus, Role } from "../../../prisma/generated/prisma/enums";


const createProfile = async (userId: string, payload: ICreateMechanicProfile) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	
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

const getMyProfile = async (userId: string) => {
	const profile = await prisma.mechanicProfile.findUnique({
		where: { userId },
	});

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	return profile;
};


const toggleAvailability = async (userId: string, isAvailable: boolean) => {
	const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	// শুধু APPROVED mechanic online হতে পারবে
	if (profile.status !== "APPROVED" && isAvailable) {
		throw new AppError(
			"Your account is not yet approved. You cannot go online.",
			httpStatus.FORBIDDEN,
		);
	}

	return prisma.mechanicProfile.update({
		where: { userId },
		data: { isAvailable },
	});
};

const updateLocation = async (userId: string, lat: number, lng: number) => {
	if (
		typeof lat !== "number" ||
		typeof lng !== "number" ||
		lat < -90 ||
		lat > 90 ||
		lng < -180 ||
		lng > 180
	) {
		throw new AppError(
			"Invalid coordinates. lat must be -90 to 90, lng must be -180 to 180",
			httpStatus.BAD_REQUEST,
		);
	}

	const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	return prisma.mechanicProfile.update({
		where: { userId },
		data: { currentLat: lat, currentLng: lng },
		select: { id: true, currentLat: true, currentLng: true, updatedAt: true },
	});
};


const getAllProfiles = async (status?: string) => {
	if (status && !Object.values(MechanicStatus).includes(status as MechanicStatus)) {
		throw new AppError("Invalid status filter", httpStatus.BAD_REQUEST);
	}

	return prisma.mechanicProfile.findMany({
		where: status ? { status: status as MechanicStatus } : {},
		include: {
			user: { select: { id: true, name: true, email: true, phone: true } },
		},
		orderBy: { createdAt: "desc" },
	});
};

const approveProfile = async (mechanicProfileId: string, adminId: string) => {
	const profile = await prisma.mechanicProfile.findUnique({
		where: { id: mechanicProfileId },
	});

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	if (profile.status !== "PENDING") {
		throw new AppError(
			"Only pending profiles can be approved",
			httpStatus.BAD_REQUEST,
		);
	}

	return prisma.mechanicProfile.update({
		where: { id: mechanicProfileId },
		data: { status: "APPROVED" },
	});
};

const rejectProfile = async (mechanicProfileId: string) => {
	const profile = await prisma.mechanicProfile.findUnique({
		where: { id: mechanicProfileId },
	});

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	if (profile.status !== MechanicStatus.PENDING) {
		throw new AppError(
			"Only pending profiles can be rejected",
			httpStatus.BAD_REQUEST,
		);
	}

	return prisma.mechanicProfile.update({
		where: { id: mechanicProfileId },
		data: { status: MechanicStatus.REJECTED },
	});
};

export const MechanicService = {
	createProfile,
	getMyProfile,
	toggleAvailability,
	updateLocation,
	getAllProfiles,
	approveProfile,
	rejectProfile
};