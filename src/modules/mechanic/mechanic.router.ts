/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { auth } from "../../middlewares/checkAuth";
import { MechanicController } from "./mechanic.controller";
import { Role } from "../../../prisma/generated/prisma/enums";
import { Router } from "express";
import { mechanicDocs } from "../../middlewares/upload";


const router = Router();

router.post(
	"/profile",
	auth(Role.MECHANIC),
	mechanicDocs, // multer auth-er pore, controller-er age
	MechanicController.createProfile,
);
router.get("/profile/me", auth(Role.MECHANIC), MechanicController.getMyProfile);
router.patch("/availability", auth(Role.MECHANIC), MechanicController.toggleAvailability);
router.patch("/location", auth(Role.MECHANIC), MechanicController.updateLocation);
router.get("/", auth(Role.ADMIN), MechanicController.getAllProfiles);



export const MechanicRoutes = router;