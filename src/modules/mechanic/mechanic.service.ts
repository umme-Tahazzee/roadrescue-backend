// mechanic-profile/mechanic.service.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { AppError } from "../../utils/AppError";
import  httpStatus  from "http-status";
import { ICreateMechanicProfile } from "./mechanic.interface";
import { getDistanceInKm } from "../../utils/geo";
import { prisma } from "../../lib/prisma";
import { logAdminActivity } from "../../utils/logAdminActivity";
import { AdminAction, MechanicStatus, RequestStatus, Role } from "../../../prisma/generated/prisma/enums";


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


const getMyJobs = async (userId: string, status?: string) => {
	if (status && !Object.values(RequestStatus).includes(status as RequestStatus)) {
		throw new AppError("Invalid status filter", httpStatus.BAD_REQUEST);
	}

	const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	return prisma.serviceRequest.findMany({
		where: {
			mechanicId: profile.id,
			...(status && { status: status as RequestStatus }),
		},
		include: {
			customer: { select: { id: true, name: true, phone: true } },
			payment: true,
		},
		orderBy: { updatedAt: "desc" },
	});
};

const getMyStats = async (userId: string) => {
	const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });

	if (!profile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	const [byStatus, paid, unpaid] = await Promise.all([
		prisma.serviceRequest.groupBy({
			by: ["status"],
			where: { mechanicId: profile.id },
			_count: { _all: true },
		}),
		prisma.payment.aggregate({
			where: { status: "PAID", request: { mechanicId: profile.id } },
			_sum: { amount: true },
		}),
		prisma.payment.aggregate({
			where: {
				status: { in: ["UNPAID", "PENDING"] },
				request: { mechanicId: profile.id },
			},
			_sum: { amount: true },
		}),
	]);

	const count = (s: string) =>
		byStatus.find((row) => row.status === s)?._count._all ?? 0;

	return {
		jobs: {
			active: count("ACCEPTED") + count("EN_ROUTE") + count("IN_PROGRESS"),
			completed: count("COMPLETED"),
			cancelled: count("CANCELLED"),
		},
		earnings: {
			paid: paid._sum.amount ?? 0,
			unpaid: unpaid._sum.amount ?? 0,
		},
		rating: profile.rating,
	};
};

// customer-facing search: who can reach this spot right now?
// Only safe fields are returned (no documents, no phone) and positions are rounded to ~100 m.
const searchNearby = async (query: {
	lat: number;
	lng: number;
	serviceType?: string;
	radiusKm: number;
}) => {
	const candidates = await prisma.mechanicProfile.findMany({
		where: {
			status: MechanicStatus.APPROVED,
			isAvailable: true,
			currentLat: { not: null },
			currentLng: { not: null },
			...(query.serviceType && { serviceTypes: { has: query.serviceType } }),
		},
		select: {
			id: true,
			rating: true,
			serviceTypes: true,
			serviceRadius: true,
			currentLat: true,
			currentLng: true,
			user: { select: { name: true } },
			_count: { select: { requests: { where: { status: "COMPLETED" } } } },
		},
	});

	const round = (n: number) => Math.round(n * 1000) / 1000;

	return candidates
		.map((m) => ({
			id: m.id,
			name: m.user.name,
			rating: m.rating,
			serviceTypes: m.serviceTypes,
			serviceRadius: m.serviceRadius,
			completedJobs: m._count.requests,
			lat: round(m.currentLat as number),
			lng: round(m.currentLng as number),
			distanceKm: getDistanceInKm(
				query.lat,
				query.lng,
				m.currentLat as number,
				m.currentLng as number,
			),
		}))
		// must be inside the search radius AND the mechanic must cover this spot
		.filter((m) => m.distanceKm <= query.radiusKm && m.distanceKm <= m.serviceRadius)
		.sort((a, b) => a.distanceKm - b.distanceKm || b.rating - a.rating);
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

	const updated = await prisma.mechanicProfile.update({
		where: { id: mechanicProfileId },
		data: { status: "APPROVED" },
		include: { user: { select: { email: true } } },
	});

	await logAdminActivity({
		adminId,
		action: AdminAction.MECHANIC_APPROVED,
		targetType: "MECHANIC_PROFILE",
		targetId: mechanicProfileId,
		description: `Approved mechanic ${updated.user.email}`,
	});

	return updated;
};

const rejectProfile = async (mechanicProfileId: string, adminId: string) => {
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

	const updated = await prisma.mechanicProfile.update({
		where: { id: mechanicProfileId },
		data: { status: MechanicStatus.REJECTED },
		include: { user: { select: { email: true } } },
	});

	await logAdminActivity({
		adminId,
		action: AdminAction.MECHANIC_REJECTED,
		targetType: "MECHANIC_PROFILE",
		targetId: mechanicProfileId,
		description: `Rejected mechanic ${updated.user.email}`,
	});

	return updated;
};

export const MechanicService = {
	createProfile,
	getMyProfile,
	toggleAvailability,
	updateLocation,
	getMyJobs,
	getMyStats,
	searchNearby,
	getAllProfiles,
	approveProfile,
	rejectProfile
};