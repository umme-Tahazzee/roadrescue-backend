/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { auth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validationRequest";
import { MechanicController } from "./mechanic.controller";
import { MechanicValidation } from "./mechanic.validation";
import { Role } from "../../../prisma/generated/prisma/enums";
import { Router } from "express";
import { mechanicDocs } from "../../middlewares/upload";


const router = Router();

router.post(
	"/profile",
	auth(Role.MECHANIC),
	mechanicDocs,
	MechanicController.createProfile,
);
router.get("/profile/me", auth(Role.MECHANIC), MechanicController.getMyProfile);
router.patch("/availability", auth(Role.MECHANIC), validateRequest(MechanicValidation.toggleAvailabilitySchema), MechanicController.toggleAvailability);
router.patch("/location", auth(Role.MECHANIC), validateRequest(MechanicValidation.updateLocationSchema), MechanicController.updateLocation);
router.get("/jobs", auth(Role.MECHANIC), validateRequest(MechanicValidation.listJobsSchema), MechanicController.getMyJobs);
router.get("/nearby", auth(Role.CUSTOMER), validateRequest(MechanicValidation.nearbySearchSchema), MechanicController.searchNearby);
router.get("/stats", auth(Role.MECHANIC), MechanicController.getMyStats);
router.get("/", auth(Role.ADMIN), validateRequest(MechanicValidation.listProfilesSchema), MechanicController.getAllProfiles);
router.patch("/:id/approve", auth(Role.ADMIN), validateRequest(MechanicValidation.profileIdSchema), MechanicController.approveProfile);
router.patch("/:id/reject", auth(Role.ADMIN), validateRequest(MechanicValidation.profileIdSchema), MechanicController.rejectProfile);


export const MechanicRoutes = router;
