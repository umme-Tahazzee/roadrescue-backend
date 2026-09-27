
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
  google_client_secrect: process.env.GOOGLE_CLIENT_SECRET,
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

// src/modules/auth/auth.validation.ts
import { z } from "zod";
var registerCustomerValidationSchema = z.object({
  body: z.object({
    name: z.string({ error: "Name is required" }).min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    password: z.string({ error: "Password is required" }).min(6, "Password must be at least 6 characters").max(30, "Password must not exceed 30 characters")
  })
});
var verifyEmailValidationSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    otp: z.string({ error: "OTP is required" }).length(2, "OTP must be exactly 6 digits")
  })
});
var loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    password: z.string({ error: "Password is required" }).min(6, "Password must be at least 6 characters")
  })
});
var AuthValidation = {
  registerCustomerValidationSchema,
  verifyEmailValidationSchema,
  loginValidationSchema
};

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
  "inlineSchema": 'model MechanicProfile {\n  id            String         @id @default(uuid())\n  userId        String         @unique\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  serviceTypes  String[]\n  vehiclePhoto  String?\n  licenseDoc    String\n  nidDoc        String\n  status        MechanicStatus @default(PENDING)\n  isAvailable   Boolean        @default(false)\n  currentLat    Float?\n  currentLng    Float?\n  serviceRadius Float          @default(10)\n  rating        Float          @default(0)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n\n  requests ServiceRequest[]\n\n  @@index([isAvailable, status])\n  @@map("mechanic_profiles")\n}\n\nmodel Payment {\n  id            String         @id @default(uuid())\n  requestId     String         @unique\n  request       ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n  amount        Float\n  status        PaymentStatus  @default(UNPAID)\n  method        PaymentMethod\n  transactionId String?        @unique\n  paidAt        DateTime?\n  createdAt     DateTime       @default(now())\n\n  @@map("payments")\n}\n\nmodel Review {\n  id        String         @id @default(uuid())\n  requestId String         @unique\n  request   ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n  userId    String\n  user      User           @relation(fields: [userId], references: [id])\n  rating    Int\n  comment   String?\n  createdAt DateTime       @default(now())\n\n  @@map("reviews")\n}\n\nmodel ServiceRequest {\n  id          String           @id @default(uuid())\n  customerId  String\n  customer    User             @relation(fields: [customerId], references: [id])\n  mechanicId  String?\n  mechanic    MechanicProfile? @relation(fields: [mechanicId], references: [id])\n  serviceType String\n  description String?\n  pickupLat   Float\n  pickupLng   Float\n  status      RequestStatus    @default(PENDING)\n  price       Float?\n  payment     Payment?\n  review      Review?\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n\n  @@index([customerId])\n  @@index([mechanicId])\n  @@index([status])\n  @@map("service_requests")\n}\n\nenum Role {\n  CUSTOMER\n  MECHANIC\n  ADMIN\n}\n\nenum MechanicStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  SUSPENDED\n}\n\nenum RequestStatus {\n  PENDING\n  ACCEPTED\n  EN_ROUTE\n  IN_PROGRESS\n  COMPLETED\n  CANCELLED\n}\n\nenum PaymentStatus {\n  UNPAID\n  PAID\n  REFUNDED\n}\n\nenum PaymentMethod {\n  SSLCOMMERZ\n  STRIPE\n}\n\nenum AuthProvider {\n  GOOGLE\n  CREDENTIAL\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id           String       @id @default(uuid())\n  name         String\n  email        String       @unique\n  password     String?\n  googleId     String?      @unique\n  authProvider AuthProvider @default(CREDENTIAL)\n  role         Role         @default(CUSTOMER)\n  phone        String?\n\n  needPasswordChange Boolean  @default(false)\n  isBlocked          Boolean  @default(false)\n  isDeleted          Boolean  @default(false)\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n\n  mechanicProfile MechanicProfile?\n  requests        ServiceRequest[]\n  reviews         Review[]\n\n  @@map("users")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"MechanicProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"MechanicProfileToUser"},{"name":"serviceTypes","kind":"scalar","type":"String"},{"name":"vehiclePhoto","kind":"scalar","type":"String"},{"name":"licenseDoc","kind":"scalar","type":"String"},{"name":"nidDoc","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"MechanicStatus"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"currentLat","kind":"scalar","type":"Float"},{"name":"currentLng","kind":"scalar","type":"Float"},{"name":"serviceRadius","kind":"scalar","type":"Float"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"requests","kind":"object","type":"ServiceRequest","relationName":"MechanicProfileToServiceRequest"}],"dbName":"mechanic_profiles","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"request","kind":"object","type":"ServiceRequest","relationName":"PaymentToServiceRequest"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"method","kind":"enum","type":"PaymentMethod"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"payments","schema":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"request","kind":"object","type":"ServiceRequest","relationName":"ReviewToServiceRequest"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews","schema":null},"ServiceRequest":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"ServiceRequestToUser"},{"name":"mechanicId","kind":"scalar","type":"String"},{"name":"mechanic","kind":"object","type":"MechanicProfile","relationName":"MechanicProfileToServiceRequest"},{"name":"serviceType","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"pickupLat","kind":"scalar","type":"Float"},{"name":"pickupLng","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"RequestStatus"},{"name":"price","kind":"scalar","type":"Float"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToServiceRequest"},{"name":"review","kind":"object","type":"Review","relationName":"ReviewToServiceRequest"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"service_requests","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"authProvider","kind":"enum","type":"AuthProvider"},{"name":"role","kind":"enum","type":"Role"},{"name":"phone","kind":"scalar","type":"String"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isBlocked","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"mechanicProfile","kind":"object","type":"MechanicProfile","relationName":"MechanicProfileToUser"},{"name":"requests","kind":"object","type":"ServiceRequest","relationName":"ServiceRequestToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","mechanicProfile","orderBy","cursor","customer","mechanic","request","payment","user","review","requests","reviews","_count","MechanicProfile.findUnique","MechanicProfile.findUniqueOrThrow","MechanicProfile.findFirst","MechanicProfile.findFirstOrThrow","MechanicProfile.findMany","data","MechanicProfile.createOne","MechanicProfile.createMany","MechanicProfile.createManyAndReturn","MechanicProfile.updateOne","MechanicProfile.updateMany","MechanicProfile.updateManyAndReturn","create","update","MechanicProfile.upsertOne","MechanicProfile.deleteOne","MechanicProfile.deleteMany","having","_avg","_sum","_min","_max","MechanicProfile.groupBy","MechanicProfile.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","ServiceRequest.findUnique","ServiceRequest.findUniqueOrThrow","ServiceRequest.findFirst","ServiceRequest.findFirstOrThrow","ServiceRequest.findMany","ServiceRequest.createOne","ServiceRequest.createMany","ServiceRequest.createManyAndReturn","ServiceRequest.updateOne","ServiceRequest.updateMany","ServiceRequest.updateManyAndReturn","ServiceRequest.upsertOne","ServiceRequest.deleteOne","ServiceRequest.deleteMany","ServiceRequest.groupBy","ServiceRequest.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","name","email","password","googleId","AuthProvider","authProvider","Role","role","phone","needPasswordChange","isBlocked","isDeleted","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","customerId","mechanicId","serviceType","description","pickupLat","pickupLng","RequestStatus","status","price","requestId","userId","rating","comment","amount","PaymentStatus","PaymentMethod","method","transactionId","paidAt","serviceTypes","vehiclePhoto","licenseDoc","nidDoc","MechanicStatus","isAvailable","currentLat","currentLng","serviceRadius","has","hasEvery","hasSome","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "7AIzUBMIAADNAQAgCgAApwEAIGUAANMBADBmAAADABBnAADTAQAwaAEAAAABdUAApQEAIXZAAKUBACGMAQAA1AGdASKPAQEAAAABkAEIAMEBACGYAQAAxwEAIJkBAQChAQAhmgEBAKABACGbAQEAoAEAIZ0BIACkAQAhngEIANABACGfAQgA0AEAIaABCADBAQAhAQAAAAEAIBMIAADNAQAgCgAApwEAIGUAANMBADBmAAADABBnAADTAQAwaAEAoAEAIXVAAKUBACF2QAClAQAhjAEAANQBnQEijwEBAKABACGQAQgAwQEAIZgBAADHAQAgmQEBAKEBACGaAQEAoAEAIZsBAQCgAQAhnQEgAKQBACGeAQgA0AEAIZ8BCADQAQAhoAEIAMEBACEBAAAAAwAgEgQAAM0BACAFAACmAQAgBwAA0QEAIAkAANIBACBlAADOAQAwZgAABQAQZwAAzgEAMGgBAKABACF1QAClAQAhdkAApQEAIYUBAQCgAQAhhgEBAKEBACGHAQEAoAEAIYgBAQChAQAhiQEIAMEBACGKAQgAwQEAIYwBAADPAYwBIo0BCADQAQAhBwQAAMkCACAFAACtAgAgBwAAygIAIAkAAMsCACCGAQAA1QEAIIgBAADVAQAgjQEAANUBACASBAAAzQEAIAUAAKYBACAHAADRAQAgCQAA0gEAIGUAAM4BADBmAAAFABBnAADOAQAwaAEAAAABdUAApQEAIXZAAKUBACGFAQEAoAEAIYYBAQChAQAhhwEBAKABACGIAQEAoQEAIYkBCADBAQAhigEIAMEBACGMAQAAzwGMASKNAQgA0AEAIQMAAAAFACACAAAGADADAAAHACABAAAAAwAgDAYAAMUBACBlAADAAQAwZgAACgAQZwAAwAEAMGgBAKABACF1QAClAQAhjAEAAMIBlAEijgEBAKABACGSAQgAwQEAIZUBAADDAZUBIpYBAQChAQAhlwFAAMQBACEBAAAACgAgCwYAAMUBACAIAADNAQAgZQAAywEAMGYAAAwAEGcAAMsBADBoAQCgAQAhdUAApQEAIY4BAQCgAQAhjwEBAKABACGQAQIAzAEAIZEBAQChAQAhAQAAAAwAIAMGAADBAgAgCAAAyQIAIJEBAADVAQAgCwYAAMUBACAIAADNAQAgZQAAywEAMGYAAAwAEGcAAMsBADBoAQAAAAF1QAClAQAhjgEBAAAAAY8BAQCgAQAhkAECAMwBACGRAQEAoQEAIQMAAAAMACACAAAOADADAAAPACABAAAABQAgAQAAAAwAIAMAAAAFACACAAAGADADAAAHACABAAAABQAgAQAAAAEAIAUIAADJAgAgCgAArgIAIJkBAADVAQAgngEAANUBACCfAQAA1QEAIAMAAAADACACAAAWADADAAABACADAAAAAwAgAgAAFgAwAwAAAQAgAwAAAAMAIAIAABYAMAMAAAEAIBAIAADIAgAgCgAAqQIAIGgBAAAAAXVAAAAAAXZAAAAAAYwBAAAAnQECjwEBAAAAAZABCAAAAAGYAQAAqAIAIJkBAQAAAAGaAQEAAAABmwEBAAAAAZ0BIAAAAAGeAQgAAAABnwEIAAAAAaABCAAAAAEBEgAAGgAgDmgBAAAAAXVAAAAAAXZAAAAAAYwBAAAAnQECjwEBAAAAAZABCAAAAAGYAQAAqAIAIJkBAQAAAAGaAQEAAAABmwEBAAAAAZ0BIAAAAAGeAQgAAAABnwEIAAAAAaABCAAAAAEBEgAAHAAwARIAABwAMBAIAADHAgAgCgAAnAIAIGgBANkBACF1QADeAQAhdkAA3gEAIYwBAACbAp0BIo8BAQDZAQAhkAEIAPsBACGYAQAAmgIAIJkBAQDaAQAhmgEBANkBACGbAQEA2QEAIZ0BIADdAQAhngEIAP0BACGfAQgA_QEAIaABCAD7AQAhAgAAAAEAIBIAAB8AIA5oAQDZAQAhdUAA3gEAIXZAAN4BACGMAQAAmwKdASKPAQEA2QEAIZABCAD7AQAhmAEAAJoCACCZAQEA2gEAIZoBAQDZAQAhmwEBANkBACGdASAA3QEAIZ4BCAD9AQAhnwEIAP0BACGgAQgA-wEAIQIAAAADACASAAAhACACAAAAAwAgEgAAIQAgAwAAAAEAIBkAABoAIBoAAB8AIAEAAAABACABAAAAAwAgCAwAAMICACAfAADDAgAgIAAAxgIAICEAAMUCACAiAADEAgAgmQEAANUBACCeAQAA1QEAIJ8BAADVAQAgEWUAAMYBADBmAAAoABBnAADGAQAwaAEAiwEAIXVAAJABACF2QACQAQAhjAEAAMgBnQEijwEBAIsBACGQAQgAqgEAIZgBAADHAQAgmQEBAIwBACGaAQEAiwEAIZsBAQCLAQAhnQEgAI8BACGeAQgArAEAIZ8BCACsAQAhoAEIAKoBACEDAAAAAwAgAgAAJwAwHgAAKAAgAwAAAAMAIAIAABYAMAMAAAEAIAwGAADFAQAgZQAAwAEAMGYAAAoAEGcAAMABADBoAQAAAAF1QAClAQAhjAEAAMIBlAEijgEBAAAAAZIBCADBAQAhlQEAAMMBlQEilgEBAAAAAZcBQADEAQAhAQAAACsAIAEAAAArACADBgAAwQIAIJYBAADVAQAglwEAANUBACADAAAACgAgAgAALgAwAwAAKwAgAwAAAAoAIAIAAC4AMAMAACsAIAMAAAAKACACAAAuADADAAArACAJBgAAwAIAIGgBAAAAAXVAAAAAAYwBAAAAlAECjgEBAAAAAZIBCAAAAAGVAQAAAJUBApYBAQAAAAGXAUAAAAABARIAADIAIAhoAQAAAAF1QAAAAAGMAQAAAJQBAo4BAQAAAAGSAQgAAAABlQEAAACVAQKWAQEAAAABlwFAAAAAAQESAAA0ADABEgAANAAwCQYAAL8CACBoAQDZAQAhdUAA3gEAIYwBAACOApQBIo4BAQDZAQAhkgEIAPsBACGVAQAAjwKVASKWAQEA2gEAIZcBQACQAgAhAgAAACsAIBIAADcAIAhoAQDZAQAhdUAA3gEAIYwBAACOApQBIo4BAQDZAQAhkgEIAPsBACGVAQAAjwKVASKWAQEA2gEAIZcBQACQAgAhAgAAAAoAIBIAADkAIAIAAAAKACASAAA5ACADAAAAKwAgGQAAMgAgGgAANwAgAQAAACsAIAEAAAAKACAHDAAAugIAIB8AALsCACAgAAC-AgAgIQAAvQIAICIAALwCACCWAQAA1QEAIJcBAADVAQAgC2UAALYBADBmAABAABBnAAC2AQAwaAEAiwEAIXVAAJABACGMAQAAtwGUASKOAQEAiwEAIZIBCACqAQAhlQEAALgBlQEilgEBAIwBACGXAUAAuQEAIQMAAAAKACACAAA_ADAeAABAACADAAAACgAgAgAALgAwAwAAKwAgAQAAAA8AIAEAAAAPACADAAAADAAgAgAADgAwAwAADwAgAwAAAAwAIAIAAA4AMAMAAA8AIAMAAAAMACACAAAOADADAAAPACAIBgAA8AEAIAgAAIgCACBoAQAAAAF1QAAAAAGOAQEAAAABjwEBAAAAAZABAgAAAAGRAQEAAAABARIAAEgAIAZoAQAAAAF1QAAAAAGOAQEAAAABjwEBAAAAAZABAgAAAAGRAQEAAAABARIAAEoAMAESAABKADAIBgAA7gEAIAgAAIcCACBoAQDZAQAhdUAA3gEAIY4BAQDZAQAhjwEBANkBACGQAQIA7AEAIZEBAQDaAQAhAgAAAA8AIBIAAE0AIAZoAQDZAQAhdUAA3gEAIY4BAQDZAQAhjwEBANkBACGQAQIA7AEAIZEBAQDaAQAhAgAAAAwAIBIAAE8AIAIAAAAMACASAABPACADAAAADwAgGQAASAAgGgAATQAgAQAAAA8AIAEAAAAMACAGDAAAtQIAIB8AALYCACAgAAC5AgAgIQAAuAIAICIAALcCACCRAQAA1QEAIAllAACzAQAwZgAAVgAQZwAAswEAMGgBAIsBACF1QACQAQAhjgEBAIsBACGPAQEAiwEAIZABAgC0AQAhkQEBAIwBACEDAAAADAAgAgAAVQAwHgAAVgAgAwAAAAwAIAIAAA4AMAMAAA8AIAEAAAAHACABAAAABwAgAwAAAAUAIAIAAAYAMAMAAAcAIAMAAAAFACACAAAGADADAAAHACADAAAABQAgAgAABgAwAwAABwAgDwQAAKcCACAFAACSAgAgBwAAkwIAIAkAAJQCACBoAQAAAAF1QAAAAAF2QAAAAAGFAQEAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEIAAAAAYoBCAAAAAGMAQAAAIwBAo0BCAAAAAEBEgAAXgAgC2gBAAAAAXVAAAAAAXZAAAAAAYUBAQAAAAGGAQEAAAABhwEBAAAAAYgBAQAAAAGJAQgAAAABigEIAAAAAYwBAAAAjAECjQEIAAAAAQESAABgADABEgAAYAAwAQAAAAMAIA8EAAClAgAgBQAA_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_AQAAAAGAAQEAAAABgQEBAAAAAQcMAACSAQAgIQAAmQEAICIAAJkBACB3AAAAbgJ4AAAAbgh5AAAAbgh-AACYAW4iBwwAAJIBACAhAACXAQAgIgAAlwEAIHcAAABwAngAAABwCHkAAABwCH4AAJYBcCIFDAAAkgEAICEAAJUBACAiAACVAQAgdyAAAAABfiAAlAEAIQsMAACSAQAgIQAAkwEAICIAAJMBACB3QAAAAAF4QAAAAAR5QAAAAAR6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QACRAQAhCwwAAJIBACAhAACTAQAgIgAAkwEAIHdAAAAAAXhAAAAABHlAAAAABHpAAAAAAXtAAAAAAXxAAAAAAX1AAAAAAX5AAJEBACEIdwIAAAABeAIAAAAEeQIAAAAEegIAAAABewIAAAABfAIAAAABfQIAAAABfgIAkgEAIQh3QAAAAAF4QAAAAAR5QAAAAAR6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QACTAQAhBQwAAJIBACAhAACVAQAgIgAAlQEAIHcgAAAAAX4gAJQBACECdyAAAAABfiAAlQEAIQcMAACSAQAgIQAAlwEAICIAAJcBACB3AAAAcAJ4AAAAcAh5AAAAcAh-AACWAXAiBHcAAABwAngAAABwCHkAAABwCH4AAJcBcCIHDAAAkgEAICEAAJkBACAiAACZAQAgdwAAAG4CeAAAAG4IeQAAAG4IfgAAmAFuIgR3AAAAbgJ4AAAAbgh5AAAAbgh-AACZAW4iDgwAAJsBACAhAACcAQAgIgAAnAEAIHcBAAAAAXgBAAAABXkBAAAABXoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAJoBACF_AQAAAAGAAQEAAAABgQEBAAAAAQh3AgAAAAF4AgAAAAV5AgAAAAV6AgAAAAF7AgAAAAF8AgAAAAF9AgAAAAF-AgCbAQAhC3cBAAAAAXgBAAAABXkBAAAABXoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAJwBACF_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_AQAgIgAAvwEAIHcAAACUAQJ4AAAAlAEIeQAAAJQBCH4AAL4BlAEiBwwAAJIBACAhAAC9AQAgIgAAvQEAIHcAAACVAQJ4AAAAlQEIeQAAAJUBCH4AALwBlQEiCwwAAJsBACAhAAC7AQAgIgAAuwEAIHdAAAAAAXhAAAAABXlAAAAABXpAAAAAAXtAAAAAAXxAAAAAAX1AAAAAAX5AALoBACELDAAAmwEAICEAALsBACAiAAC7AQAgd0AAAAABeEAAAAAFeUAAAAAFekAAAAABe0AAAAABfEAAAAABfUAAAAABfkAAugEAIQh3QAAAAAF4QAAAAAV5QAAAAAV6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QAC7AQAhBwwAAJIBACAhAAC9AQAgIgAAvQEAIHcAAACVAQJ4AAAAlQEIeQAAAJUBCH4AALwBlQEiBHcAAACVAQJ4AAAAlQEIeQAAAJUBCH4AAL0BlQEiBwwAAJIBACAhAAC_AQAgIgAAvwEAIHcAAACUAQJ4AAAAlAEIeQAAAJQBCH4AAL4BlAEiBHcAAACUAQJ4AAAAlAEIeQAAAJQBCH4AAL8BlAEiDAYAAMUBACBlAADAAQAwZgAACgAQZwAAwAEAMGgBAKABACF1QAClAQAhjAEAAMIBlAEijgEBAKABACGSAQgAwQEAIZUBAADDAZUBIpYBAQChAQAhlwFAAMQBACEIdwgAAAABeAgAAAAEeQgAAAAEeggAAAABewgAAAABfAgAAAABfQgAAAABfggAsgEAIQR3AAAAlAECeAAAAJQBCHkAAACUAQh-AAC_AZQBIgR3AAAAlQECeAAAAJUBCHkAAACVAQh-AAC9AZUBIgh3QAAAAAF4QAAAAAV5QAAAAAV6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QAC7AQAhFAQAAM0BACAFAACmAQAgBwAA0QEAIAkAANIBACBlAADOAQAwZgAABQAQZwAAzgEAMGgBAKABACF1QAClAQAhdkAApQEAIYUBAQCgAQAhhgEBAKEBACGHAQEAoAEAIYgBAQChAQAhiQEIAMEBACGKAQgAwQEAIYwBAADPAYwBIo0BCADQAQAhpAEAAAUAIKUBAAAFACARZQAAxgEAMGYAACgAEGcAAMYBADBoAQCLAQAhdUAAkAEAIXZAAJABACGMAQAAyAGdASKPAQEAiwEAIZABCACqAQAhmAEAAMcBACCZAQEAjAEAIZoBAQCLAQAhmwEBAIsBACGdASAAjwEAIZ4BCACsAQAhnwEIAKwBACGgAQgAqgEAIQR3AQAAAAWhAQEAAAABogEBAAAABKMBAQAAAAQHDAAAkgEAICEAAMoBACAiAADKAQAgdwAAAJ0BAngAAACdAQh5AAAAnQEIfgAAyQGdASIHDAAAkgEAICEAAMoBACAiAADKAQAgdwAAAJ0BAngAAACdAQh5AAAAnQEIfgAAyQGdASIEdwAAAJ0BAngAAACdAQh5AAAAnQEIfgAAygGdASILBgAAxQEAIAgAAM0BACBlAADLAQAwZgAADAAQZwAAywEAMGgBAKABACF1QAClAQAhjgEBAKABACGPAQEAoAEAIZABAgDMAQAhkQEBAKEBACEIdwIAAAABeAIAAAAEeQIAAAAEegIAAAABewIAAAABfAIAAAABfQIAAAABfgIAkgEAIRUBAACmAQAgCgAApwEAIAsAAKgBACBlAACfAQAwZgAAdAAQZwAAnwEAMGgBAKABACFpAQCgAQAhagEAoAEAIWsBAKEBACFsAQChAQAhbgAAogFuInAAAKMBcCJxAQChAQAhciAApAEAIXMgAKQBACF0IACkAQAhdUAApQEAIXZAAKUBACGkAQAAdAAgpQEAAHQAIBIEAADNAQAgBQAApgEAIAcAANEBACAJAADSAQAgZQAAzgEAMGYAAAUAEGcAAM4BADBoAQCgAQAhdUAApQEAIXZAAKUBACGFAQEAoAEAIYYBAQChAQAhhwEBAKABACGIAQEAoQEAIYkBCADBAQAhigEIAMEBACGMAQAAzwGMASKNAQgA0AEAIQR3AAAAjAECeAAAAIwBCHkAAACMAQh-AACwAYwBIgh3CAAAAAF4CAAAAAV5CAAAAAV6CAAAAAF7CAAAAAF8CAAAAAF9CAAAAAF-CACuAQAhDgYAAMUBACBlAADAAQAwZgAACgAQZwAAwAEAMGgBAKABACF1QAClAQAhjAEAAMIBlAEijgEBAKABACGSAQgAwQEAIZUBAADDAZUBIpYBAQChAQAhlwFAAMQBACGkAQAACgAgpQEAAAoAIA0GAADFAQAgCAAAzQEAIGUAAMsBADBmAAAMABBnAADLAQAwaAEAoAEAIXVAAKUBACGOAQEAoAEAIY8BAQCgAQAhkAECAMwBACGRAQEAoQEAIaQBAAAMACClAQAADAAgEwgAAM0BACAKAACnAQAgZQAA0wEAMGYAAAMAEGcAANMBADBoAQCgAQAhdUAApQEAIXZAAKUBACGMAQAA1AGdASKPAQEAoAEAIZABCADBAQAhmAEAAMcBACCZAQEAoQEAIZoBAQCgAQAhmwEBAKABACGdASAApAEAIZ4BCADQAQAhnwEIANABACGgAQgAwQEAIQR3AAAAnQECeAAAAJ0BCHkAAACdAQh-AADKAZ0BIgAAAAABqQEBAAAAAQGpAQEAAAABAakBAAAAbgIBqQEAAABwAgGpASAAAAABAakBQAAAAAEHGQAAlQIAIBoAAJgCACCmAQAAlgIAIKcBAACXAgAgqgEAAAMAIKsBAAADACCsAQAAAQAgCxkAAPEBADAaAAD2AQAwpgEAAPIBADCnAQAA8wEAMKgBAAD0AQAgqQEAAPUBADCqAQAA9QEAMKsBAAD1AQAwrAEAAPUBADCtAQAA9wEAMK4BAAD4AQAwCxkAAOIBADAaAADnAQAwpgEAAOMBADCnAQAA5AEAMKgBAADlAQAgqQEAAOYBADCqAQAA5gEAMKsBAADmAQAwrAEAAOYBADCtAQAA6AEAMK4BAADpAQAwBgYAAPABACBoAQAAAAF1QAAAAAGOAQEAAAABkAECAAAAAZEBAQAAAAECAAAADwAgGQAA7wEAIAMAAAAPACAZAADvAQAgGgAA7QEAIAESAADsAgAwCwYAAMUBACAIAADNAQAgZQAAywEAMGYAAAwAEGcAAMsBADBoAQAAAAF1QAClAQAhjgEBAAAAAY8BAQCgAQAhkAECAMwBACGRAQEAoQEAIQIAAAAPACASAADtAQAgAgAAAOoBACASAADrAQAgCWUAAOkBADBmAADqAQAQZwAA6QEAMGgBAKABACF1QAClAQAhjgEBAKABACGPAQEAoAEAIZABAgDMAQAhkQEBAKEBACEJZQAA6QEAMGYAAOoBABBnAADpAQAwaAEAoAEAIXVAAKUBACGOAQEAoAEAIY8BAQCgAQAhkAECAMwBACGRAQEAoQEAIQVoAQDZAQAhdUAA3gEAIY4BAQDZAQAhkAECAOwBACGRAQEA2gEAIQWpAQIAAAABsAECAAAAAbEBAgAAAAGyAQIAAAABswECAAAAAQYGAADuAQAgaAEA2QEAIXVAAN4BACGOAQEA2QEAIZABAgDsAQAhkQEBANoBACEFGQAA5wIAIBoAAOoCACCmAQAA6AIAIKcBAADpAgAgrAEAAAcAIAYGAADwAQAgaAEAAAABdUAAAAABjgEBAAAAAZABAgAAAAGRAQEAAAABAxkAAOcCACCmAQAA6AIAIKwBAAAHACANBQAAkgIAIAcAAJMCACAJAACUAgAgaAEAAAABdUAAAAABdkAAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEIAAAAAYoBCAAAAAGMAQAAAIwBAo0BCAAAAAECAAAABwAgGQAAkQIAIAMAAAAHACAZAACRAgAgGgAA_gEAIAESAADmAgAwEgQAAM0BACAFAACmAQAgBwAA0QEAIAkAANIBACBlAADOAQAwZgAABQAQZwAAzgEAMGgBAAAAAXVAAKUBACF2QAClAQAhhQEBAKABACGGAQEAoQEAIYcBAQCgAQAhiAEBAKEBACGJAQgAwQEAIYoBCADBAQAhjAEAAM8BjAEijQEIANABACECAAAABwAgEgAA_gEAIAIAAAD5AQAgEgAA-gEAIA5lAAD4AQAwZgAA-QEAEGcAAPgBADBoAQCgAQAhdUAApQEAIXZAAKUBACGFAQEAoAEAIYYBAQChAQAhhwEBAKABACGIAQEAoQEAIYkBCADBAQAhigEIAMEBACGMAQAAzwGMASKNAQgA0AEAIQ5lAAD4AQAwZgAA-QEAEGcAAPgBADBoAQCgAQAhdUAApQEAIXZAAKUBACGFAQEAoAEAIYYBAQChAQAhhwEBAKABACGIAQEAoQEAIYkBCADBAQAhigEIAMEBACGMAQAAzwGMASKNAQgA0AEAIQpoAQDZAQAhdUAA3gEAIXZAAN4BACGGAQEA2gEAIYcBAQDZAQAhiAEBANoBACGJAQgA-wEAIYoBCAD7AQAhjAEAAPwBjAEijQEIAP0BACEFqQEIAAAAAbABCAAAAAGxAQgAAAABsgEIAAAAAbMBCAAAAAEBqQEAAACMAQIFqQEIAAAAAbABCAAAAAGxAQgAAAABsgEIAAAAAbMBCAAAAAENBQAA_wEAIAcAAIACACAJAACBAgAgaAEA2QEAIXVAAN4BACF2QADeAQAhhgEBANoBACGHAQEA2QEAIYgBAQDaAQAhiQEIAPsBACGKAQgA-wEAIYwBAAD8AYwBIo0BCAD9AQAhBxkAANwCACAaAADkAgAgpgEAAN0CACCnAQAA4wIAIKoBAAADACCrAQAAAwAgrAEAAAEAIAcZAACJAgAgGgAAjAIAIKYBAACKAgAgpwEAAIsCACCqAQAACgAgqwEAAAoAIKwBAAArACAHGQAAggIAIBoAAIUCACCmAQAAgwIAIKcBAACEAgAgqgEAAAwAIKsBAAAMACCsAQAADwAgBggAAIgCACBoAQAAAAF1QAAAAAGPAQEAAAABkAECAAAAAZEBAQAAAAECAAAADwAgGQAAggIAIAMAAAAMACAZAACCAgAgGgAAhgIAIAgAAAAMACAIAACHAgAgEgAAhgIAIGgBANkBACF1QADeAQAhjwEBANkBACGQAQIA7AEAIZEBAQDaAQAhBggAAIcCACBoAQDZAQAhdUAA3gEAIY8BAQDZAQAhkAECAOwBACGRAQEA2gEAIQUZAADeAgAgGgAA4QIAIKYBAADfAgAgpwEAAOACACCsAQAAcQAgAxkAAN4CACCmAQAA3wIAIKwBAABxACAHaAEAAAABdUAAAAABjAEAAACUAQKSAQgAAAABlQEAAACVAQKWAQEAAAABlwFAAAAAAQIAAAArACAZAACJAgAgAwAAAAoAIBkAAIkCACAaAACNAgAgCQAAAAoAIBIAAI0CACBoAQDZAQAhdUAA3gEAIYwBAACOApQBIpIBCAD7AQAhlQEAAI8ClQEilgEBANoBACGXAUAAkAIAIQdoAQDZAQAhdUAA3gEAIYwBAACOApQBIpIBCAD7AQAhlQEAAI8ClQEilgEBANoBACGXAUAAkAIAIQGpAQAAAJQBAgGpAQAAAJUBAgGpAUAAAAABDQUAAJICACAHAACTAgAgCQAAlAIAIGgBAAAAAXVAAAAAAXZAAAAAAYYBAQAAAAGHAQEAAAABiAEBAAAAAYkBCAAAAAGKAQgAAAABjAEAAACMAQKNAQgAAAABAxkAANwCACCmAQAA3QIAIKwBAAABACADGQAAiQIAIKYBAACKAgAgrAEAACsAIAMZAACCAgAgpgEAAIMCACCsAQAADwAgDgoAAKkCACBoAQAAAAF1QAAAAAF2QAAAAAGMAQAAAJ0BApABCAAAAAGYAQAAqAIAIJkBAQAAAAGaAQEAAAABmwEBAAAAAZ0BIAAAAAGeAQgAAAABnwEIAAAAAaABCAAAAAECAAAAAQAgGQAAlQIAIAMAAAADACAZAACVAgAgGgAAmQIAIBAAAAADACAKAACcAgAgEgAAmQIAIGgBANkBACF1QADeAQAhdkAA3gEAIYwBAACbAp0BIpABCAD7AQAhmAEAAJoCACCZAQEA2gEAIZoBAQDZAQAhmwEBANkBACGdASAA3QEAIZ4BCAD9AQAhnwEIAP0BACGgAQgA-wEAIQ4KAACcAgAgaAEA2QEAIXVAAN4BACF2QADeAQAhjAEAAJsCnQEikAEIAPsBACGYAQAAmgIAIJkBAQDaAQAhmgEBANkBACGbAQEA2QEAIZ0BIADdAQAhngEIAP0BACGfAQgA_QEAIaABCAD7AQAhAqkBAQAAAASvAQEAAAAFAakBAAAAnQECCxkAAJ0CADAaAAChAgAwpgEAAJ4CADCnAQAAnwIAMKgBAACgAgAgqQEAAPUBADCqAQAA9QEAMKsBAAD1AQAwrAEAAPUBADCtAQAAogIAMK4BAAD4AQAwDQQAAKcCACAHAACTAgAgCQAAlAIAIGgBAAAAAXVAAAAAAXZAAAAAAYUBAQAAAAGHAQEAAAABiAEBAAAAAYkBCAAAAAGKAQgAAAABjAEAAACMAQKNAQgAAAABAgAAAAcAIBkAAKYCACADAAAABwAgGQAApgIAIBoAAKQCACABEgAA2wIAMAIAAAAHACASAACkAgAgAgAAAPkBACASAACjAgAgCmgBANkBACF1QADeAQAhdkAA3gEAIYUBAQDZAQAhhwEBANkBACGIAQEA2gEAIYkBCAD7AQAhigEIAPsBACGMAQAA_AGMASKNAQgA_QEAIQ0EAAClAgAgBwAAgAIAIAkAAIECACBoAQDZAQAhdUAA3gEAIXZAAN4BACGFAQEA2QEAIYcBAQDZAQAhiAEBANoBACGJAQgA-wEAIYoBCAD7AQAhjAEAAPwBjAEijQEIAP0BACEFGQAA1gIAIBoAANkCACCmAQAA1wIAIKcBAADYAgAgrAEAAHEAIA0EAACnAgAgBwAAkwIAIAkAAJQCACBoAQAAAAF1QAAAAAF2QAAAAAGFAQEAAAABhwEBAAAAAYgBAQAAAAGJAQgAAAABigEIAAAAAYwBAAAAjAECjQEIAAAAAQMZAADWAgAgpgEAANcCACCsAQAAcQAgAakBAQAAAAQEGQAAnQIAMKYBAACeAgAwqAEAAKACACCsAQAA9QEAMAMZAACVAgAgpgEAAJYCACCsAQAAAQAgBBkAAPEBADCmAQAA8gEAMKgBAAD0AQAgrAEAAPUBADAEGQAA4gEAMKYBAADjAQAwqAEAAOUBACCsAQAA5gEAMAUIAADJAgAgCgAArgIAIJkBAADVAQAgngEAANUBACCfAQAA1QEAIAAAAAAAAAAAAAAAAAAAAAAABRkAANECACAaAADUAgAgpgEAANICACCnAQAA0wIAIKwBAAAHACADGQAA0QIAIKYBAADSAgAgrAEAAAcAIAcEAADJAgAgBQAArQIAIAcAAMoCACAJAADLAgAghgEAANUBACCIAQAA1QEAII0BAADVAQAgAAAAAAAFGQAAzAIAIBoAAM8CACCmAQAAzQIAIKcBAADOAgAgrAEAAHEAIAMZAADMAgAgpgEAAM0CACCsAQAAcQAgBgEAAK0CACAKAACuAgAgCwAArwIAIGsAANUBACBsAADVAQAgcQAA1QEAIAMGAADBAgAglgEAANUBACCXAQAA1QEAIAMGAADBAgAgCAAAyQIAIJEBAADVAQAgDwoAAKsCACALAACsAgAgaAEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbgAAAG4CcAAAAHACcQEAAAABciAAAAABcyAAAAABdCAAAAABdUAAAAABdkAAAAABAgAAAHEAIBkAAMwCACADAAAAdAAgGQAAzAIAIBoAANACACARAAAAdAAgCgAA4AEAIAsAAOEBACASAADQAgAgaAEA2QEAIWkBANkBACFqAQDZAQAhawEA2gEAIWwBANoBACFuAADbAW4icAAA3AFwInEBANoBACFyIADdAQAhcyAA3QEAIXQgAN0BACF1QADeAQAhdkAA3gEAIQ8KAADgAQAgCwAA4QEAIGgBANkBACFpAQDZAQAhagEA2QEAIWsBANoBACFsAQDaAQAhbgAA2wFuInAAANwBcCJxAQDaAQAhciAA3QEAIXMgAN0BACF0IADdAQAhdUAA3gEAIXZAAN4BACEOBAAApwIAIAUAAJICACAJAACUAgAgaAEAAAABdUAAAAABdkAAAAABhQEBAAAAAYYBAQAAAAGHAQEAAAABiAEBAAAAAYkBCAAAAAGKAQgAAAABjAEAAACMAQKNAQgAAAABAgAAAAcAIBkAANECACADAAAABQAgGQAA0QIAIBoAANUCACAQAAAABQAgBAAApQIAIAUAAP8BACAJAACBAgAgEgAA1QIAIGgBANkBACF1QADeAQAhdkAA3gEAIYUBAQDZAQAhhgEBANoBACGHAQEA2QEAIYgBAQDaAQAhiQEIAPsBACGKAQgA-wEAIYwBAAD8AYwBIo0BCAD9AQAhDgQAAKUCACAFAAD_AQAgCQAAgQIAIGgBANkBACF1QADeAQAhdkAA3gEAIYUBAQDZAQAhhgEBANoBACGHAQEA2QEAIYgBAQDaAQAhiQEIAPsBACGKAQgA-wEAIYwBAAD8AYwBIo0BCAD9AQAhDwEAAKoCACALAACsAgAgaAEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbgAAAG4CcAAAAHACcQEAAAABciAAAAABcyAAAAABdCAAAAABdUAAAAABdkAAAAABAgAAAHEAIBkAANYCACADAAAAdAAgGQAA1gIAIBoAANoCACARAAAAdAAgAQAA3wEAIAsAAOEBACASAADaAgAgaAEA2QEAIWkBANkBACFqAQDZAQAhawEA2gEAIWwBANoBACFuAADbAW4icAAA3AFwInEBANoBACFyIADdAQAhcyAA3QEAIXQgAN0BACF1QADeAQAhdkAA3gEAIQ8BAADfAQAgCwAA4QEAIGgBANkBACFpAQDZAQAhagEA2QEAIWsBANoBACFsAQDaAQAhbgAA2wFuInAAANwBcCJxAQDaAQAhciAA3QEAIXMgAN0BACF0IADdAQAhdUAA3gEAIXZAAN4BACEKaAEAAAABdUAAAAABdkAAAAABhQEBAAAAAYcBAQAAAAGIAQEAAAABiQEIAAAAAYoBCAAAAAGMAQAAAIwBAo0BCAAAAAEPCAAAyAIAIGgBAAAAAXVAAAAAAXZAAAAAAYwBAAAAnQECjwEBAAAAAZABCAAAAAGYAQAAqAIAIJkBAQAAAAGaAQEAAAABmwEBAAAAAZ0BIAAAAAGeAQgAAAABnwEIAAAAAaABCAAAAAECAAAAAQAgGQAA3AIAIA8BAACqAgAgCgAAqwIAIGgBAAAAAWkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW4AAABuAnAAAABwAnEBAAAAAXIgAAAAAXMgAAAAAXQgAAAAAXVAAAAAAXZAAAAAAQIAAABxACAZAADeAgAgAwAAAHQAIBkAAN4CACAaAADiAgAgEQAAAHQAIAEAAN8BACAKAADgAQAgEgAA4gIAIGgBANkBACFpAQDZAQAhagEA2QEAIWsBANoBACFsAQDaAQAhbgAA2wFuInAAANwBcCJxAQDaAQAhciAA3QEAIXMgAN0BACF0IADdAQAhdUAA3gEAIXZAAN4BACEPAQAA3wEAIAoAAOABACBoAQDZAQAhaQEA2QEAIWoBANkBACFrAQDaAQAhbAEA2gEAIW4AANsBbiJwAADcAXAicQEA2gEAIXIgAN0BACFzIADdAQAhdCAA3QEAIXVAAN4BACF2QADeAQAhAwAAAAMAIBkAANwCACAaAADlAgAgEQAAAAMAIAgAAMcCACASAADlAgAgaAEA2QEAIXVAAN4BACF2QADeAQAhjAEAAJsCnQEijwEBANkBACGQAQgA-wEAIZgBAACaAgAgmQEBANoBACGaAQEA2QEAIZsBAQDZAQAhnQEgAN0BACGeAQgA_QEAIZ8BCAD9AQAhoAEIAPsBACEPCAAAxwIAIGgBANkBACF1QADeAQAhdkAA3gEAIYwBAACbAp0BIo8BAQDZAQAhkAEIAPsBACGYAQAAmgIAIJkBAQDaAQAhmgEBANkBACGbAQEA2QEAIZ0BIADdAQAhngEIAP0BACGfAQgA_QEAIaABCAD7AQAhCmgBAAAAAXVAAAAAAXZAAAAAAYYBAQAAAAGHAQEAAAABiAEBAAAAAYkBCAAAAAGKAQgAAAABjAEAAACMAQKNAQgAAAABDgQAAKcCACAFAACSAgAgBwAAkwIAIGgBAAAAAXVAAAAAAXZAAAAAAYUBAQAAAAGGAQEAAAABhwEBAAAAAYgBAQAAAAGJAQgAAAABigEIAAAAAYwBAAAAjAECjQEIAAAAAQIAAAAHACAZAADnAgAgAwAAAAUAIBkAAOcCACAaAADrAgAgEAAAAAUAIAQAAKUCACAFAAD_AQAgBwAAgAIAIBIAAOsCACBoAQDZAQAhdUAA3gEAIXZAAN4BACGFAQEA2QEAIYYBAQDaAQAhhwEBANkBACGIAQEA2gEAIYkBCAD7AQAhigEIAPsBACGMAQAA_AGMASKNAQgA_QEAIQ4EAAClAgAgBQAA_wEAIAcAAIACACBoAQDZAQAhdUAA3gEAIXZAAN4BACGFAQEA2QEAIYYBAQDaAQAhhwEBANkBACGIAQEA2gEAIYkBCAD7AQAhigEIAPsBACGMAQAA_AGMASKNAQgA_QEAIQVoAQAAAAF1QAAAAAGOAQEAAAABkAECAAAAAZEBAQAAAAEDCAACChMDDAAHBAEEAQoIAwsQBQwABgQEAAIFCQEHCwQJDQUBBgADAgYAAwgAAgIKEQALEgABChQAAAEIAAIBCAACBQwADB8ADSAADiEADyIAEAAAAAAABQwADB8ADSAADiEADyIAEAEGAAMBBgADBQwAFR8AFiAAFyEAGCIAGQAAAAAABQwAFR8AFiAAFyEAGCIAGQIGAAMIAAICBgADCAACBQwAHh8AHyAAICEAISIAIgAAAAAABQwAHh8AHyAAICEAISIAIgIEAAIFYwECBAACBWkBBQwAJx8AKCAAKSEAKiIAKwAAAAAABQwAJx8AKCAAKSEAKiIAKwAAAwwAMCEAMSIAMgAAAAMMADAhADEiADINAgEOFQEPFwEQGAERGQETGwEUHQgVHgkWIAEXIggYIwobJAEcJQEdJggjKQskKhElLAQmLQQnLwQoMAQpMQQqMwQrNQgsNhItOAQuOggvOxMwPAQxPQQyPggzQRQ0Qho1QwU2RAU3RQU4RgU5RwU6SQU7Swg8TBs9TgU-UAg_URxAUgVBUwVCVAhDVx1EWCNFWQNGWgNHWwNIXANJXQNKXwNLYQhMYiRNZQNOZwhPaCVQagNRawNSbAhTbyZUcCxVcgJWcwJXdgJYdwJZeAJaegJbfAhcfS1dfwJegQEIX4IBLmCDAQJhhAECYoUBCGOIAS9kiQEz"
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
  serviceTypes: "serviceTypes",
  vehiclePhoto: "vehiclePhoto",
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
  authProvider: "authProvider",
  role: "role",
  phone: "phone",
  needPasswordChange: "needPasswordChange",
  isBlocked: "isBlocked",
  isDeleted: "isDeleted",
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

// prisma/generated/prisma/enums.ts
var Role = {
  CUSTOMER: "CUSTOMER",
  MECHANIC: "MECHANIC",
  ADMIN: "ADMIN"
};
var AuthProvider = {
  GOOGLE: "GOOGLE",
  CREDENTIAL: "CREDENTIAL"
};

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

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken
    };
  } catch (error) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
var jwtUtils = {
  createToken,
  verifyToken
};

// src/modules/auth/auth.service.ts
import httpStatus from "http-status";

// src/lib/googleAuth.ts
import { OAuth2Client } from "google-auth-library";
var googleClient = new OAuth2Client(config_default.google_client_id);
var verficationGoogleToken = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config_default.google_client_id
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError("Invalid Google Token", 404);
  }
  return {
    email: payload.email,
    name: payload.name || "Google User",
    googleId: payload.sub
  };
};

// src/modules/auth/auth.service.ts
import ejs, { renderFile } from "ejs";
var register = async (payload) => {
  const { name, email, password } = payload;
  const isExistUser = await prisma.user.findUnique({
    where: { email }
  });
  if (isExistUser) {
    throw new AppError("A user with this email already exists.", 409);
  }
  const hashedPassword = await bcrypt.hash(password, 8);
  const OTP_EXPIRY_MINUTES = 5 * 60;
  const otpKey = `customer-registration-otp:${email}`;
  const otpValue = crypto.randomInt(1e5, 1e6).toString();
  console.log(otpValue, "refister");
  await redisClient.set(otpKey, otpValue, {
    expiration: { type: "EX", value: OTP_EXPIRY_MINUTES }
  });
  const userRegistrationKey = `customer-registration-data:${email}`;
  const redisUserPayload = { name, email, password: hashedPassword };
  await redisClient.set(userRegistrationKey, JSON.stringify(redisUserPayload), {
    expiration: { type: "EX", value: OTP_EXPIRY_MINUTES }
  });
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
  await transporter.sendMail({
    from: config_default.email_sender,
    to: email,
    subject: "Email verfication",
    html
  });
};
var verifycustomerEmail = async (payload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (isUserExists?.isDeleted || isUserExists?.isBlocked) {
    throw new AppError("This account is not accessible", httpStatus.FORBIDDEN);
  }
  const otpKey = `customer-registration-otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) {
    throw new AppError("OTP expired or invalid", httpStatus.GONE);
  }
  if (storedOtp !== otp) {
    throw new AppError("OTP does not match", httpStatus.BAD_REQUEST);
  }
  await redisClient.del(otpKey);
  const customerRegistrationKey = `customer-registration-data:${email}`;
  const redisCustomerData = await redisClient.get(customerRegistrationKey);
  if (!redisCustomerData) {
    throw new AppError(
      "Registration data not found or expired",
      httpStatus.NOT_FOUND
    );
  }
  const customerPayload = JSON.parse(redisCustomerData);
  const user = await prisma.user.create({
    data: {
      name: customerPayload.name,
      email: customerPayload.email,
      password: customerPayload.password,
      authProvider: AuthProvider.CREDENTIAL
    },
    omit: { password: true }
  });
  await redisClient.del(customerRegistrationKey);
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return { user, accessToken, refreshToken: refreshToken3 };
};
var login = async (payload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }
  if (user.isBlocked) {
    throw new AppError("User is blocked", httpStatus.FORBIDDEN);
  }
  if (user.isDeleted) {
    throw new AppError("User is deleted", httpStatus.GONE);
  }
  if (!user.password) {
    throw new AppError(
      "This account uses Google sign-in. Please log in with Google.",
      httpStatus.BAD_REQUEST
    );
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError("Invalid credentials", httpStatus.BAD_REQUEST);
  }
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return { accessToken, refreshToken: refreshToken3 };
};
var getMe = async (user) => {
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus.UNAUTHORIZED
    );
  }
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { requests: true, reviews: true },
    omit: { password: true }
  });
  if (!isUserExists) {
    throw new AppError("User not found", httpStatus.NOT_FOUND);
  }
  return isUserExists;
};
var refreshToken = async (token) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config_default.jwt_refresh_secret
  );
  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError(
      config_default.node_env === "development" ? String(verifiedRefreshToken.error) : "Invalid refresh token",
      httpStatus.UNAUTHORIZED
    );
  }
  const data = verifiedRefreshToken.data;
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user || user.isDeleted || user.isBlocked) {
    throw new AppError("User is inactive or not found", httpStatus.UNAUTHORIZED);
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return { accessToken, refreshToken: refreshToken3 };
};
var googleAuth = async (idToken) => {
  const googleUser = await verficationGoogleToken(idToken);
  let user = await prisma.user.findUnique({
    where: { email: googleUser.email }
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: AuthProvider.GOOGLE,
        role: Role.CUSTOMER
      }
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: googleUser.googleId }
    });
  }
  if (user.isBlocked) {
    throw new AppError("User is blocked", httpStatus.FORBIDDEN);
  }
  if (user.isDeleted) {
    throw new AppError("User is deleted", httpStatus.GONE);
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return { user, accessToken, refreshToken: refreshToken3 };
};
var forgotPassword = async (payload) => {
  const { email } = payload;
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (!isUserExists) {
    throw new AppError("User does not exist", httpStatus.NOT_FOUND);
  }
  if (isUserExists.isBlocked || isUserExists.isDeleted) {
    throw new AppError("User is blocked or deleted", httpStatus.FORBIDDEN);
  }
  if (isUserExists.authProvider !== AuthProvider.CREDENTIAL) {
    throw new AppError(
      "This account uses Google sign-in and has no password to reset",
      httpStatus.BAD_REQUEST
      // FIX: 304/NOT_MODIFIED made no sense here
    );
  }
  const otp = crypto.randomInt(1e5, 1e6).toString();
  const key = `forget-password:${email}`;
  const OTP_EXPIRY_MINUTES = 5 * 60;
  await redisClient.set(key, otp, {
    expiration: { type: "EX", value: OTP_EXPIRY_MINUTES }
  });
  const templatePath = path3.join(
    process.cwd(),
    "src/templates/forgot-password.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name: isUserExists.name,
    OTP: otp,
    OTP_EXPIRY_MINUTES
  });
  await transporter.sendMail({
    from: config_default.email_sender,
    to: isUserExists.email,
    subject: "Forgot password",
    html
  });
};
var resetPassword = async (payload) => {
  const { email, newPassword, otp } = payload;
  const isUserExists = await prisma.user.findUnique({ where: { email } });
  if (!isUserExists) {
    throw new AppError("User does not exist", httpStatus.NOT_FOUND);
  }
  if (isUserExists?.isDeleted || isUserExists?.isBlocked) {
    throw new AppError("This account is not accessible", httpStatus.FORBIDDEN);
  }
  if (isUserExists.authProvider !== AuthProvider.CREDENTIAL) {
    throw new AppError(
      "This account uses Google sign-in and has no password to reset",
      httpStatus.BAD_REQUEST
    );
  }
  const otpKey = `forget-password:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) {
    throw new AppError("OTP expired or invalid", httpStatus.GONE);
  }
  if (storedOtp !== otp) {
    throw new AppError("OTP does not match", httpStatus.BAD_REQUEST);
  }
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config_default.bcrypt_salt_rounds)
  );
  await prisma.user.update({
    where: { email: isUserExists.email },
    data: { password: hashedPassword }
  });
  const templatePath = path3.join(
    process.cwd(),
    "src/templates/reset-password-success.ejs"
  );
  const html = await renderFile(templatePath, {
    name: isUserExists.name
  });
  await redisClient.del(otpKey);
  await transporter.sendMail({
    from: config_default.email_sender,
    to: isUserExists.email,
    subject: "Password is changed",
    html
  });
};
var AuthService = {
  register,
  verifycustomerEmail,
  refreshToken,
  login,
  getMe,
  googleAuth,
  forgotPassword,
  resetPassword
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
import httpStatus2 from "http-status";

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
    statusCode: httpStatus2.CREATED,
    success: true,
    message: "OTP send successfully",
    data: result
  });
});
var verficationEmail = catchAsync(async (req, res, Next) => {
  const payload = req.body;
  const result = await AuthService.verifycustomerEmail(payload);
  sendResponse(res, {
    statusCode: httpStatus2.CREATED,
    success: true,
    message: "verify email successfully",
    data: result
  });
});
var login2 = catchAsync(async (req, res, Next) => {
  const payload = req.body;
  const result = await AuthService.login(payload);
  sendResponse(res, {
    statusCode: httpStatus2.CREATED,
    success: true,
    message: "User Login Successfully",
    data: result
  });
});
var getMe2 = catchAsync(async (req, res) => {
  console.log(req.user);
  const user = req.user;
  if (!user) {
    throw new Error("User information is missing in the request");
  }
  const result = await AuthService.getMe(user);
  sendResponse(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result
  });
});
var refreshToken2 = catchAsync(async (req, res, Next) => {
});
var googleAuth2 = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new AppError("Google idToken is required", httpStatus2.BAD_REQUEST);
  }
  const result = await AuthService.googleAuth(idToken);
  sendResponse(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "Google authentication successful",
    data: { user: result.user }
  });
});
var forgotPassword2 = catchAsync(async (req, res) => {
  const email = req.body;
  const result = await AuthService.forgotPassword(email);
  sendResponse(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "OTP successfully",
    data: result
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.resetPassword(payload);
  sendResponse(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "Reset Password Successfully",
    data: result
  });
});
var logout = catchAsync(async (req, res, Next) => {
});
var AuthControllers = {
  register: register2,
  verficationEmail,
  login: login2,
  getMe: getMe2,
  refreshToken: refreshToken2,
  googleAuth: googleAuth2,
  forgotPassword: forgotPassword2,
  resetPassword: resetPassword2,
  logout
};

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/middlewares/validationRequest.ts
var validateRequest = (schema) => {
  return catchAsync(async (req, res, next) => {
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query
    });
    next();
  });
};

// src/middlewares/checkAuth.ts
import jwt2 from "jsonwebtoken";
import httpStatus3 from "http-status";
var auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies?.accessToken ? req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.headers.authorization;
    console.log("Extracted token:", token);
    if (!token) {
      throw new AppError("You are not authorized", httpStatus3.UNAUTHORIZED);
    }
    let decoded;
    try {
      decoded = jwt2.verify(token, config_default.jwt_access_secret);
    } catch (err) {
      throw new AppError("Invalid or expired token", httpStatus3.UNAUTHORIZED);
    }
    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
    if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
      throw new AppError(
        "You do not have permission to access this resource",
        httpStatus3.FORBIDDEN
        // 403
      );
    }
    next();
  });
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/register", validateRequest(AuthValidation.registerCustomerValidationSchema), AuthControllers.register);
router.post("/verify-email", validateRequest(AuthValidation.verifyEmailValidationSchema), AuthControllers.verficationEmail);
router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthControllers.login);
router.get("/me", auth(Role.CUSTOMER, Role.ADMIN), AuthControllers.getMe);
router.post("/google", AuthControllers.googleAuth);
router.post("/forgot-password", AuthControllers.forgotPassword);
router.post("/refresh-token", AuthControllers.refreshToken);
router.post("/logout", AuthControllers.logout);
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
import httpStatus4 from "http-status";
import { ZodError } from "zod";
var globalErrorHandler = async (err, _req, res, _next) => {
  if (config_default.node_env === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let statusCode = httpStatus4.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  const errorName = err.name || "Internal Server Error";
  let errorDetails = void 0;
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof ZodError) {
    statusCode = httpStatus4.BAD_REQUEST;
    errorMessage = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      path: String(issue.path[issue.path.length - 1]),
      // ✅
      message: issue.message
    }));
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = httpStatus4.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus4.BAD_REQUEST;
      errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus4.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus4.BAD_REQUEST;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else {
      statusCode = httpStatus4.BAD_REQUEST;
      errorMessage = "Database request error";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus4.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please check your credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus4.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = httpStatus4.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }
  const isServerError = statusCode >= 500;
  const shouldMaskMessage = isServerError && config_default.node_env !== "development";
  res.status(statusCode).json({
    success: false,
    statusCode,
    name: config_default.node_env === "development" ? errorName : shouldMaskMessage ? "Error" : errorName,
    message: shouldMaskMessage ? "Something went wrong, please try again later" : errorMessage,
    errorDetails,
    stack: config_default.node_env === "development" ? err.stack : void 0
  });
};

// src/middlewares/not-found.ts
import httpStatus5 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus5.NOT_FOUND).json({
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