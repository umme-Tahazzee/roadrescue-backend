import { prisma } from "../lib/prisma";
import { AdminAction } from "../../prisma/generated/prisma/enums";

interface ILogAdminActivity {
	adminId: string;
	action: AdminAction;
	targetType: "USER" | "MECHANIC_PROFILE" | "REFUND";
	targetId: string;
	description: string;
}

// saves one row in admin_activities.
// if saving the log fails we only print the error, the admin's real action already succeeded
export const logAdminActivity = async (payload: ILogAdminActivity) => {
	try {
		await prisma.adminActivity.create({ data: payload });
	} catch (error) {
		console.error("Failed to save admin activity:", error);
	}
};
