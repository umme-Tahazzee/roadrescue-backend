
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  io: () => io
});
module.exports = __toCommonJS(server_exports);
var import_http = require("http");
var import_socket = require("socket.io");
var import_dotenv2 = __toESM(require("dotenv"), 1);

// src/app.ts
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express = __toESM(require("express"), 1);

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({ path: import_path.default.join(process.cwd(), ".env") });
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
var app = (0, import_express.default)();
app.use(
  (0, import_cors.default)({
    origin: config_default.frontend_url,
    credentials: true
  })
);
app.use(import_express.default.urlencoded({ extended: true }));
app.use(import_express.default.json());
app.use((0, import_cookie_parser.default)());
var app_default = app;

// src/server.ts
import_dotenv2.default.config();
var PORT = process.env.PORT || 5e3;
var httpServer = (0, import_http.createServer)(app_default);
var io = new import_socket.Server(httpServer, {
  cors: { origin: "*" }
});
io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
});
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  io
});
//# sourceMappingURL=server.cjs.map