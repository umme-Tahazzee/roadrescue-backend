import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
// import { UserRoutes } from "../modules/user/user.route";
// import { MechanicRoutes } from "../modules/mechanic/mechanic.route";
// import { RequestRoutes } from "../modules/request/request.route";
// import { PaymentRoutes } from "../modules/payment/payment.route";
// import { ReviewRoutes } from "../modules/review/review.route";
// import { AdminRoutes } from "../modules/admin/admin.route";

const router = Router();


const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
//   { path: "/users", route: UserRoutes },
//   { path: "/mechanics", route: MechanicRoutes },
//   { path: "/requests", route: RequestRoutes },
//   { path: "/payments", route: PaymentRoutes },
//   { path: "/reviews", route: ReviewRoutes },
//   { path: "/admin", route: AdminRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;