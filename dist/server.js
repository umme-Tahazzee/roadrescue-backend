
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv2 from "dotenv";

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bak_url: process.env.APP_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  super_admin_name: process.env.SUPER_ADMIN_NAME,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPPER_ADMIN_PASSWORD,
  tester_admin_name: process.env.TESTER_ADMIN_NAME,
  tester_admin_email: process.env.TESTER_ADMIN_EMAIL,
  tester_admin_password: process.env.TESTER_ADMIN_PASSWORD,
  tester_doctor_name: process.env.TESTER_DOCTOR_NAME,
  tester_doctor_email: process.env.TESTER_DOCTOR_EMAIL,
  tester_doctor_password: process.env.tester_doctor_password
};

// src/app.ts
var app = express();
app.use(
  cors({
    origin: config_default.frontend_url,
    credentials: true
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
var app_default = app;

// src/server.ts
dotenv2.config();
var PORT = process.env.PORT || 5e3;
var httpServer = createServer(app_default);
var io = new Server(httpServer, {
  cors: { origin: "*" }
});
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
});
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export {
  io
};
//# sourceMappingURL=server.js.map