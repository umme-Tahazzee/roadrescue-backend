// biome-ignore assist/source/organizeImports: <explanation>
import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { MechanicRoutes } from "../modules/mechanic/mechanic.router";
import { CustomerRoutes } from "../modules/customer/customer.route";
import { RequestRoutes } from "../modules/service-request/service.route";

const router = Router();


const moduleRoutes = [
    { path: "/auth", route: AuthRoutes },
    { path: "/mechanics", route: MechanicRoutes },
    { path: "/customers", route: CustomerRoutes },
    {path : "/requests", route: RequestRoutes}

  
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;