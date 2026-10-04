// service-request/request.service.ts

// biome-ignore assist/source/organizeImports: <explanation>
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";


import { RequestStatus } from "../../../prisma/generated/prisma/enums";
import { ICreateServiceRequest } from "../customer/customer.interface";
import { getDistanceInKm } from "../../utils/geo";


const createRequest = async (
	customerId: string,
	payload: ICreateServiceRequest,
) => {
	const { serviceType, description, pickupLat, pickupLng } = payload;

	if (
		typeof pickupLat !== "number" ||
		typeof pickupLng !== "number" ||
		pickupLat < -90 ||
		pickupLat > 90 ||
		pickupLng < -180 ||
		pickupLng > 180
	) {
		throw new AppError("Invalid pickup coordinates", httpStatus.BAD_REQUEST);
	}

	// customer-এর কোনো already-active request থাকলে নতুন request নিতে দেওয়া হবে না
	const activeRequest = await prisma.serviceRequest.findFirst({
		where: {
			customerId,
			status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS] },
		},
	});

	if (activeRequest) {
		throw new AppError(
			"You already have an active service request",
			httpStatus.CONFLICT,
		);
	}

	const request = await prisma.serviceRequest.create({
		data: {
			customerId,
			serviceType,
			description,
			pickupLat,
			pickupLng,
			status: RequestStatus.PENDING,
		},
	});

	
	const nearbyMechanics = await findNearbyMechanics(
		pickupLat,
		pickupLng,
		serviceType,
	);

	return { request, nearbyMechanicsCount: nearbyMechanics.length };
};

// internal helper — request-এর location আর serviceType অনুযায়ী nearby available mechanic খোঁজে
const findNearbyMechanics = async (
	pickupLat: number,
	pickupLng: number,
	serviceType: string,
) => {
	const candidates = await prisma.mechanicProfile.findMany({
		where: {
			status: "APPROVED",
			isAvailable: true,
			serviceTypes: { has: serviceType },
			currentLat: { not: null },
			currentLng: { not: null },
		},
		include: {
			user: { select: { id: true, name: true, phone: true } },
		},
	});

	// prisma dont support geospatial query native support ,that's why do js distance filter
	return candidates
		.map((m) => ({
			...m,
			distanceKm: getDistanceInKm(
				pickupLat,
				pickupLng,
				m.currentLat as number,
				m.currentLng as number,
			),
		}))
		.filter((m) => m.distanceKm <= m.serviceRadius)
		.sort((a, b) => a.distanceKm - b.distanceKm);
};

const getNearbyMechanicsForRequest = async (
	requestId: string,
	customerId: string,
) => {
	const request = await prisma.serviceRequest.findUnique({
		where: { id: requestId },
	});

	if (!request) {
		throw new AppError("Service request not found", httpStatus.NOT_FOUND);
	}

	if (request.customerId !== customerId) {
		throw new AppError(
			"You can only view mechanics for your own request",
			httpStatus.FORBIDDEN,
		);
	}

	return findNearbyMechanics(
		request.pickupLat,
		request.pickupLng,
		request.serviceType,
	);
};

const getPendingRequestsForMechanic = async (mechanicUserId: string) => {
	const mechanicProfile = await prisma.mechanicProfile.findUnique({
		where: { userId: mechanicUserId },
	});
   
    
	if (!mechanicProfile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	if (mechanicProfile.status !== "APPROVED" || !mechanicProfile.isAvailable) {
		throw new AppError(
			"You must be approved and online to view requests",
			httpStatus.FORBIDDEN,
		);
	}

	if (mechanicProfile.currentLat === null || mechanicProfile.currentLng === null) {
		throw new AppError(
			"Update your location before viewing nearby requests",
			httpStatus.BAD_REQUEST,
		);
	}

	const pendingRequests = await prisma.serviceRequest.findMany({
		where: {
			status: RequestStatus.PENDING,
			serviceType: { in: mechanicProfile.serviceTypes },
		},
		include: {
			customer: { select: { id: true, name: true, phone: true } },
		},
	});

	return pendingRequests
		.map((r) => ({
			...r,
			distanceKm: getDistanceInKm(
				mechanicProfile.currentLat as number,
				mechanicProfile.currentLng as number,
				r.pickupLat,
				r.pickupLng,
			),
		}))
		.filter((r) => r.distanceKm <= mechanicProfile.serviceRadius)
		.sort((a, b) => a.distanceKm - b.distanceKm);
};

const acceptRequest = async (requestId: string, mechanicUserId: string) => {
	const mechanicProfile = await prisma.mechanicProfile.findUnique({
		where: { userId: mechanicUserId },
	});
    
    

	if (!mechanicProfile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	if (mechanicProfile.status !== "APPROVED" || !mechanicProfile.isAvailable) {
		throw new AppError(
			"You must be approved and online to accept a request",
			httpStatus.FORBIDDEN,
		);
	}

	
	const result = await prisma.serviceRequest.updateMany({
		where: { id: requestId, status: RequestStatus.PENDING },
		data: {
			mechanicId: mechanicProfile.id,
			status: RequestStatus.ACCEPTED,
		},
	});

    // console.log(result);
    

	if (result.count === 0) {
		throw new AppError(
			"This request is no longer available (already accepted or cancelled)",
			httpStatus.CONFLICT,
		);
	}

	return prisma.serviceRequest.findUnique({
		where: { id: requestId },
		include: { customer: { select: { name: true, phone: true } } },
	});
};

const updateRequestStatus = async (
	requestId: string,
	mechanicUserId: string,
	newStatus: "IN_PROGRESS" | "COMPLETED",
) => {
	const mechanicProfile = await prisma.mechanicProfile.findUnique({
		where: { userId: mechanicUserId },
	});
	

	if (!mechanicProfile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	const request = await prisma.serviceRequest.findUnique({
		where: { id: requestId },
	});

	console.log(mechanicProfile.id, 'machine-profileID');


	if (!request) {
		throw new AppError("Service request not found", httpStatus.NOT_FOUND);
	}

	

	if (request.mechanicId !== mechanicProfile.id) {
		throw new AppError(
			"You are not assigned to this request",
			httpStatus.FORBIDDEN,
		);
	}


	

	// valid transition path enforce করা — ACCEPTED -> IN_PROGRESS -> COMPLETED
	const validTransitions: Record<string, string[]> = {
		ACCEPTED: ["IN_PROGRESS"],
		IN_PROGRESS: ["COMPLETED"],
	};

	if (!validTransitions[request.status]?.includes(newStatus)) {
		throw new AppError(
			`Cannot move from ${request.status} to ${newStatus}`,
			httpStatus.BAD_REQUEST,
		);
	}

	return prisma.serviceRequest.update({
		where: { id: requestId },
		data: { status: newStatus as RequestStatus },
	});
};

const completeService = async (
	requestId: string,
	mechanicUserId: string,
	payload: { finalPrice: number; method: "CASH" | "BKASH" },
) => {
	const mechanicProfile = await prisma.mechanicProfile.findUnique({
		where: { userId: mechanicUserId },
	});

	if (!mechanicProfile) {
		throw new AppError("Mechanic profile not found", httpStatus.NOT_FOUND);
	}

	const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });

	if (!request) {
		throw new AppError("Service request not found", httpStatus.NOT_FOUND);
	}

	// if (request.mechanicId !== mechanicProfile.id) {
	// 	throw new AppError("You are not assigned to this request", httpStatus.FORBIDDEN);
	// }

	// if (request.status !== "IN_PROGRESS") {
	// 	throw new AppError(
	// 		`Cannot complete a request that is ${request.status}`,
	// 		httpStatus.BAD_REQUEST,
	// 	);
	// }

	if (payload.finalPrice <= 0) {
		throw new AppError("Final price must be greater than zero", httpStatus.BAD_REQUEST);
	}

	const invoiceNumber = `RR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

	// transaction দিয়ে — একসাথে দুটো টেবিল আপডেট হবে, একটা fail করলে অন্যটাও rollback হবে
	const [updatedRequest, payment] = await prisma.$transaction([
		prisma.serviceRequest.update({
			where: { id: requestId },
			data: { status: "COMPLETED", price: payload.finalPrice },
		}),
		prisma.payment.create({
			data: {
				requestId,
				amount: payload.finalPrice,
				merchantInvoiceNumber: invoiceNumber,
				method: payload.method,
				status: payload.method === "CASH" ? "UNPAID" : "PENDING",
				
			},
		}),
	]);

	return { request: updatedRequest, payment };
};

// Cash confirm — mechanic call করবে
const confirmCashPayment = async (paymentId: string, mechanicUserId: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: { request: true },
	});

	if (!payment) {
		throw new AppError("Payment not found", httpStatus.NOT_FOUND);
	}

	if (payment.method !== "CASH") {
		throw new AppError("This payment is not a cash payment", httpStatus.BAD_REQUEST);
	}

	if (payment.status === "PAID") {
		throw new AppError("Payment already confirmed", httpStatus.CONFLICT);
	}

	const mechanicProfile = await prisma.mechanicProfile.findUnique({
		where: { userId: mechanicUserId },
	});

	if (payment.request.mechanicId !== mechanicProfile?.id) {
		throw new AppError("You are not authorized to confirm this payment", httpStatus.FORBIDDEN);
	}

	return prisma.payment.update({
		where: { id: paymentId },
		data: {
			status: "PAID",
			paidAt: new Date(),
			confirmedBy: mechanicUserId,
		},
	});
};

const cancelRequest = async (requestId: string, customerId: string) => {
	const request = await prisma.serviceRequest.findUnique({
		where: { id: requestId },
	});

	if (!request) {
		throw new AppError("Service request not found", httpStatus.NOT_FOUND);
	}

	if (request.customerId !== customerId) {
		throw new AppError(
			"You can only cancel your own request",
			httpStatus.FORBIDDEN,
		);
	}

	// IN_PROGRESS হয়ে গেলে আর cancel করা যাবে না — mechanic ইতিমধ্যে কাজ শুরু করেছে
	if (request.status === RequestStatus.IN_PROGRESS || request.status === RequestStatus.COMPLETED) {
		throw new AppError(
			`Cannot cancel a request that is already ${request.status}`,
			httpStatus.BAD_REQUEST,
		);
	}

	return prisma.serviceRequest.update({
		where: { id: requestId },
		data: { status: RequestStatus.CANCELLED },
	});
};

export const RequestService = {
	createRequest,
	getNearbyMechanicsForRequest,
	getPendingRequestsForMechanic,
	acceptRequest,
	updateRequestStatus,
	completeService,
	confirmCashPayment,
	cancelRequest,
};