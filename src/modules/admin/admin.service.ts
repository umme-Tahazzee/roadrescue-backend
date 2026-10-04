// admin/admin.service.ts

// biome-ignore assist/source/organizeImports: <explanation>
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { Role, RequestStatus, MechanicStatus } from "../../../prisma/generated/prisma/enums";

const getProfile = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		omit: { password: true },
	});

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	if (user.role !== Role.ADMIN) {
		throw new AppError("This account is not an admin account", httpStatus.FORBIDDEN);
	}

	return user;
};

const getAllUsers = async (role?: string) => {
	if (role && !Object.values(Role).includes(role as Role)) {
		throw new AppError("Invalid role filter", httpStatus.BAD_REQUEST);
	}

	return prisma.user.findMany({
		where: role ? { role: role as Role } : {},
		omit: { password: true },
		orderBy: { createdAt: "desc" },
	});
};

const getUserById = async (targetUserId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: targetUserId },
		omit: { password: true },
		include: {
			mechanicProfile: true,
			requests: true,
			reviews: true,
		},
	});

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	return user;
};

const toggleBlockUser = async (targetUserId: string, isBlocked: boolean, adminId: string) => {
	if (targetUserId === adminId) {
		// নিজেকেই নিজে block করে নিজের access হারিয়ে ফেলা আটকানো
		throw new AppError("You cannot block your own account", httpStatus.BAD_REQUEST);
	}

	const user = await prisma.user.findUnique({ where: { id: targetUserId } });

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	if (user.role === Role.ADMIN) {
		// এক admin আরেক admin-কে block করতে পারবে না — abuse of power প্রতিরোধ
		throw new AppError("Admin accounts cannot be blocked", httpStatus.FORBIDDEN);
	}

	return prisma.user.update({
		where: { id: targetUserId },
		data: { isBlocked },
		omit: { password: true },
	});
};

const getDashboardStats = async () => {
	// একসাথে সব count query চালানো, sequential না করে
	const [
		totalCustomers,
		totalMechanics,
		pendingMechanics,
		approvedMechanics,
		totalRequests,
		pendingRequests,
		completedRequests,
		cancelledRequests,
	] = await Promise.all([
		prisma.user.count({ where: { role: Role.CUSTOMER, isDeleted: false } }),
		prisma.user.count({ where: { role: Role.MECHANIC, isDeleted: false } }),
		prisma.mechanicProfile.count({ where: { status: MechanicStatus.PENDING } }),
		prisma.mechanicProfile.count({ where: { status: MechanicStatus.APPROVED } }),
		prisma.serviceRequest.count(),
		prisma.serviceRequest.count({ where: { status: RequestStatus.PENDING } }),
		prisma.serviceRequest.count({ where: { status: RequestStatus.COMPLETED } }),
		prisma.serviceRequest.count({ where: { status: RequestStatus.CANCELLED } }),
	]);

	return {
		users: {
			totalCustomers,
			totalMechanics,
		},
		mechanics: {
			pendingApproval: pendingMechanics,
			approved: approvedMechanics,
		},
		requests: {
			total: totalRequests,
			pending: pendingRequests,
			completed: completedRequests,
			cancelled: cancelledRequests,
		},
	};
};

const getAllRequests = async (status?: string) => {
	if (status && !Object.values(RequestStatus).includes(status as RequestStatus)) {
		throw new AppError("Invalid status filter", httpStatus.BAD_REQUEST);
	}

	return prisma.serviceRequest.findMany({
		where: status ? { status: status as RequestStatus } : {},
		include: {
			customer: { select: { id: true, name: true, phone: true } },
			mechanic: {
				select: {
					id: true,
					user: { select: { name: true, phone: true } },
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

export const AdminService = {
	getProfile,
	getAllUsers,
	getUserById,
	toggleBlockUser,
	getDashboardStats,
	getAllRequests,
};