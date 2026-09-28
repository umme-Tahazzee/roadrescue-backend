import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { MechanicRoutes } from "../modules/mechanic/mechanic.router";

const router = Router();


const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
    { path: "/mechanics", route: MechanicRoutes },
  
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;