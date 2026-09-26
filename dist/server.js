
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
  tester_doctor_password: process.env.tester_doctor_password,
  redis_user: process.env.REDIS_USER,
  redis_password: process.env.REDIS_PASSWORD,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  email_user: process.env.EMAIL_USER,
  email_sender: process.env.EMAIL_SENDER,
  email_password: process.env.EMAIL_PASS
};

// src/routes/index.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  status;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import ejs from "ejs";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// prisma/generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model MechanicProfile {\n  id            String         @id @default(uuid())\n  userId        String         @unique\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  // serviceTypes  String[]\n  licenseDoc    String\n  nidDoc        String\n  status        MechanicStatus @default(PENDING)\n  isAvailable   Boolean        @default(false)\n  currentLat    Float?\n  currentLng    Float?\n  serviceRadius Float          @default(10)\n  rating        Float          @default(0)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n\n  requests ServiceRequest[]\n\n  @@index([isAvailable, status])\n  @@map("mechanic_profiles")\n}\n\nmodel Payment {\n  id            String         @id @default(uuid())\n  requestId     String         @unique\n  request       ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n  amount        Float\n  status        PaymentStatus  @default(UNPAID)\n  method        PaymentMethod\n  transactionId String?        @unique\n  paidAt        DateTime?\n  createdAt     DateTime       @default(now())\n\n  @@map("payments")\n}\n\nmodel Review {\n  id        String         @id @default(uuid())\n  requestId String         @unique\n  request   ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n  userId    String\n  user      User           @relation(fields: [userId], references: [id])\n  rating    Int\n  comment   String?\n  createdAt DateTime       @default(now())\n\n  @@map("reviews")\n}\n\nmodel ServiceRequest {\n  id          String           @id @default(uuid())\n  customerId  String\n  customer    User             @relation(fields: [customerId], references: [id])\n  mechanicId  String?\n  mechanic    MechanicProfile? @relation(fields: [mechanicId], references: [id])\n  serviceType String\n  description String?\n  pickupLat   Float\n  pickupLng   Float\n  status      RequestStatus    @default(PENDING)\n  price       Float?\n  payment     Payment?\n  review      Review?\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n\n  @@index([customerId])\n  @@index([mechanicId])\n  @@index([status])\n  @@map("service_requests")\n}\n\nenum Role {\n  CUSTOMER\n  MECHANIC\n  ADMIN\n}\n\nenum MechanicStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  SUSPENDED\n}\n\nenum RequestStatus {\n  PENDING\n  ACCEPTED\n  EN_ROUTE\n  IN_PROGRESS\n  COMPLETED\n  CANCELLED\n}\n\nenum PaymentStatus {\n  UNPAID\n  PAID\n  REFUNDED\n}\n\nenum PaymentMethod {\n  SSLCOMMERZ\n  STRIPE\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id        String   @id @default(uuid())\n  name      String\n  email     String   @unique\n  password  String?\n  googleId  String?  @unique\n  role      Role     @default(CUSTOMER)\n  phone     String?\n  isBlocked Boolean  @default(false)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  mechanicProfile MechanicProfile?\n  requests        ServiceRequest[]\n  reviews         Review[]\n\n  @@map("users")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"MechanicProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"MechanicProfileToUser"},{"name":"licenseDoc","kind":"scalar","type":"String"},{"name":"nidDoc","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"MechanicStatus"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"currentLat","kind":"scalar","type":"Float"},{"name":"currentLng","kind":"scalar","type":"Float"},{"name":"serviceRadius","kind":"scalar","type":"Float"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"requests","kind":"object","type":"ServiceRequest","relationName":"MechanicProfileToServiceRequest"}],"dbName":"mechanic_profiles","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"request","kind":"object","type":"ServiceRequest","relationName":"PaymentToServiceRequest"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"method","kind":"enum","type":"PaymentMethod"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"payments","schema":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"request","kind":"object","type":"ServiceRequest","relationName":"ReviewToServiceRequest"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews","schema":null},"ServiceRequest":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"ServiceRequestToUser"},{"name":"mechanicId","kind":"scalar","type":"String"},{"name":"mechanic","kind":"object","type":"MechanicProfile","relationName":"MechanicProfileToServiceRequest"},{"name":"serviceType","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"pickupLat","kind":"scalar","type":"Float"},{"name":"pickupLng","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"RequestStatus"},{"name":"price","kind":"scalar","type":"Float"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToServiceRequest"},{"name":"review","kind":"object","type":"Review","relationName":"ReviewToServiceRequest"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"service_requests","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"phone","kind":"scalar","type":"String"},{"name":"isBlocked","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"mechanicProfile","kind":"object","type":"MechanicProfile","relationName":"MechanicProfileToUser"},{"name":"requests","kind":"object","type":"ServiceRequest","relationName":"ServiceRequestToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","mechanicProfile","orderBy","cursor","customer","mechanic","request","payment","user","review","requests","reviews","_count","MechanicProfile.findUnique","MechanicProfile.findUniqueOrThrow","MechanicProfile.findFirst","MechanicProfile.findFirstOrThrow","MechanicProfile.findMany","data","MechanicProfile.createOne","MechanicProfile.createMany","MechanicProfile.createManyAndReturn","MechanicProfile.updateOne","MechanicProfile.updateMany","MechanicProfile.updateManyAndReturn","create","update","MechanicProfile.upsertOne","MechanicProfile.deleteOne","MechanicProfile.deleteMany","having","_avg","_sum","_min","_max","MechanicProfile.groupBy","MechanicProfile.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","ServiceRequest.findUnique","ServiceRequest.findUniqueOrThrow","ServiceRequest.findFirst","ServiceRequest.findFirstOrThrow","ServiceRequest.findMany","ServiceRequest.createOne","ServiceRequest.createMany","ServiceRequest.createManyAndReturn","ServiceRequest.updateOne","ServiceRequest.updateMany","ServiceRequest.updateManyAndReturn","ServiceRequest.upsertOne","ServiceRequest.deleteOne","ServiceRequest.deleteMany","ServiceRequest.groupBy","ServiceRequest.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","name","email","password","googleId","Role","role","phone","isBlocked","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","customerId","mechanicId","serviceType","description","pickupLat","pickupLng","RequestStatus","status","price","requestId","userId","rating","comment","amount","PaymentStatus","PaymentMethod","method","transactionId","paidAt","licenseDoc","nidDoc","MechanicStatus","isAvailable","currentLat","currentLng","serviceRadius","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "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_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-AAAFACB_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_wEAIJ0BAAD9AQAgngEAAP4BACChAQAADAAgogEAAAwAIKMBAAAPACAGCAAAggIAIGgBAAAAAXFAAAAAAYsBAQAAAAGMAQIAAAABjQEBAAAAAQIAAAAPACAZAAD8AQAgAwAAAAwAIBkAAPwBACAaAACAAgAgCAAAAAwAIAgAAIECACASAACAAgAgaAEA1AEAIXFAANgBACGLAQEA1AEAIYwBAgDmAQAhjQEBANUBACEGCAAAgQIAIGgBANQBACFxQADYAQAhiwEBANQBACGMAQIA5gEAIY0BAQDVAQAhBRkAANYCACAaAADZAgAgnQEAANcCACCeAQAA2AIAIKMBAABxACADGQAA1gIAIJ0BAADXAgAgowEAAHEAIAdoAQAAAAFxQAAAAAGIAQAAAJABAo4BCAAAAAGRAQAAAJEBApIBAQAAAAGTAUAAAAABAgAAACsAIBkAAIMCACADAAAACgAgGQAAgwIAIBoAAIcCACAJAAAACgAgEgAAhwIAIGgBANQBACFxQADYAQAhiAEAAIgCkAEijgEIAPUBACGRAQAAiQKRASKSAQEA1QEAIZMBQACKAgAhB2gBANQBACFxQADYAQAhiAEAAIgCkAEijgEIAPUBACGRAQAAiQKRASKSAQEA1QEAIZMBQACKAgAhAaABAAAAkAECAaABAAAAkQECAaABQAAAAAENBQAAjAIAIAcAAI0CACAJAACOAgAgaAEAAAABcUAAAAABckAAAAABggEBAAAAAYMBAQAAAAGEAQEAAAABhQEIAAAAAYYBCAAAAAGIAQAAAIgBAokBCAAAAAEDGQAA1AIAIJ0BAADVAgAgowEAAAEAIAMZAACDAgAgnQEAAIQCACCjAQAAKwAgAxkAAPwBACCdAQAA_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-UAg_URxAUgVBUwVCVAhDVx1EWCNFWQNGWgNHWwNIXANJXQNKXwNLYQhMYiRNZQNOZwhPaCVQagNRawNSbAhTbyZUcCxVcgJWcwJXdgJYdwJZeAJaegJbfAhcfS1dfwJegQEIX4IBLmCDAQJhhAECYoUBCGOIAS9kiQEz"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  MechanicProfileScalarFieldEnum: () => MechanicProfileScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  ServiceRequestScalarFieldEnum: () => ServiceRequestScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.10.0",
  engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  MechanicProfile: "MechanicProfile",
  Payment: "Payment",
  Review: "Review",
  ServiceRequest: "ServiceRequest",
  User: "User"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var MechanicProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  licenseDoc: "licenseDoc",
  nidDoc: "nidDoc",
  status: "status",
  isAvailable: "isAvailable",
  currentLat: "currentLat",
  currentLng: "currentLng",
  serviceRadius: "serviceRadius",
  rating: "rating",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  requestId: "requestId",
  amount: "amount",
  status: "status",
  method: "method",
  transactionId: "transactionId",
  paidAt: "paidAt",
  createdAt: "createdAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  requestId: "requestId",
  userId: "userId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt"
};
var ServiceRequestScalarFieldEnum = {
  id: "id",
  customerId: "customerId",
  mechanicId: "mechanicId",
  serviceType: "serviceType",
  description: "description",
  pickupLat: "pickupLat",
  pickupLng: "pickupLng",
  status: "status",
  price: "price",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  password: "password",
  googleId: "googleId",
  role: "role",
  phone: "phone",
  isBlocked: "isBlocked",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/utils/redis.ts
import { createClient } from "redis";
var redisClient = createClient({
  username: config_default.redis_user,
  password: config_default.redis_password,
  socket: {
    host: config_default.redis_host,
    port: Number(config_default.redis_port)
  }
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis connected successfully"));

// src/modules/auth/auth.service.ts
import path3 from "path";

// src/lib/nodemailer.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config_default.email_user,
    pass: config_default.email_password
  }
});

// src/modules/auth/auth.service.ts
var register = async (payload) => {
  const { name, email, password } = payload;
  const isExistUser = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (isExistUser) {
    throw new AppError("A user with this email  already exists.", 409);
  }
  const hashedPassword = await bcrypt.hash(password, 8);
  const OTP_EXPIRY_MINUTES = 5 * 60;
  const otpKey = `customer-registration-otp${email}`;
  const otpValue = crypto.randomInt(1e5, 1e6).toString();
  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRY_MINUTES
    }
  });
  const userRegistrationKey = `customer-registration-data${email}`;
  const redisUserPayload = {
    name,
    email,
    password: hashedPassword
  };
  await redisClient.set(
    userRegistrationKey,
    JSON.stringify(redisUserPayload),
    {
      expiration: {
        type: "EX",
        value: OTP_EXPIRY_MINUTES
      }
    }
  );
  const templatePath = path3.join(
    process.cwd(),
    "src/templates/registration-user-otp.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name,
    email,
    otp: otpValue,
    expirationMinutes: OTP_EXPIRY_MINUTES / 60
  });
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "UNDEFINED");
  await transporter.sendMail({
    from: config_default.email_sender,
    to: email,
    subject: "Email verfication",
    html
  });
};
var AuthService = {
  register
};

// src/utils/catchAsyn.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/auth/auth.controller.ts
import httpStatus from "http-status";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};

// src/modules/auth/auth.controller.ts
var register2 = catchAsync(async (req, res, Next) => {
  const payload = req.body;
  const result = await AuthService.register(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "OTP send successfully",
    data: result
  });
});
var login = catchAsync(async (req, res, Next) => {
});
var googleAuth = catchAsync(async (req, res, Next) => {
});
var logut = catchAsync(async (req, res, Next) => {
});
var AuthControllers = {
  register: register2
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/register", AuthControllers.register);
var AuthRoutes = router;

// src/routes/index.ts
var router2 = Router2();
var moduleRoutes = [
  { path: "/auth", route: AuthRoutes }
  //   { path: "/users", route: UserRoutes },
  //   { path: "/mechanics", route: MechanicRoutes },
  //   { path: "/requests", route: RequestRoutes },
  //   { path: "/payments", route: PaymentRoutes },
  //   { path: "/reviews", route: ReviewRoutes },
  //   { path: "/admin", route: AdminRoutes },
];
moduleRoutes.forEach(({ path: path4, route }) => router2.use(path4, route));
var routes_default = router2;

// src/middlewares/globalErrorHandler.ts
import httpStatus2 from "http-status";
var globalErrorHandler = async (err, _req, res, _next) => {
  if (config_default.node_env === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let statusCode = httpStatus2.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  const errorName = err.name || "Internal Server Error";
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = httpStatus2.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus2.BAD_REQUEST, errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus2.BAD_REQUEST, errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus2.BAD_REQUEST, errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus2.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus2.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = httpStatus2.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }
  res.status(statusCode).json({
    success: false,
    statusCode: statusCode || httpStatus2.INTERNAL_SERVER_ERROR,
    name: config_default.node_env === "development" ? errorName : "Internal Server Error",
    message: config_default.node_env === "development" ? errorMessage : "Internal Server Error",
    error: config_default.node_env === "development" ? err : void 0,
    stack: config_default.node_env === "development" ? err.stack : void 0
  });
};

// src/middlewares/not-found.ts
import httpStatus3 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus3.NOT_FOUND).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
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
app.use("/api/v1", routes_default);
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var PORT = config_default.port;
try {
  await prisma.$connect();
  console.log("Connected to the database successfully.");
  await redisClient.connect();
  console.log("Redis to the database successfully.");
  await transporter.verify();
  console.log("nodemailer connected successfully");
  app_default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
  await prisma.$disconnect();
  process.exit(1);
}
//# sourceMappingURL=server.js.map