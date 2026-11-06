
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
import helmet from "helmet";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bak_url: process.env.BACKEND_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secrect: process.env.GOOGLE_CLIENT_SECRET,
  cloudinary_name: process.env.CLOUDINARY_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  super_admin_name: process.env.SUPER_ADMIN_NAME,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  tester_admin_name: process.env.TESTER_ADMIN_NAME,
  tester_admin_email: process.env.TESTER_ADMIN_EMAIL,
  tester_admin_password: process.env.TESTER_ADMIN_PASSWORD,
  redis_user: process.env.REDIS_USER,
  redis_password: process.env.REDIS_PASSWORD,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  email_user: process.env.EMAIL_USER,
  email_sender: process.env.EMAIL_SENDER,
  email_password: process.env.EMAIL_PASS,
  bkash_url: process.env.BKASH_BASE_URL,
  bkash_username: process.env.BKASH_USERNAME,
  bkash_password: process.env.BKASH_PASSWORD,
  bkash_app_key: process.env.BKASH_APP_KEY,
  bkash_app_secret: process.env.BKASH_APP_SECRET,
  bkash_app_callback: process.env.BKASH_CALLBACK_URL
};

// src/middlewares/globalErrorHandler.ts
import httpStatus from "http-status";
import { ZodError } from "zod";
import { MulterError } from "multer";

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
  "inlineSchema": '// one row for every important thing an admin does (block, approve, refund ...)\nmodel AdminActivity {\n  id          String      @id @default(uuid())\n  adminId     String\n  admin       User        @relation(fields: [adminId], references: [id])\n  action      AdminAction\n  targetType  String // USER, MECHANIC_PROFILE, REFUND\n  targetId    String\n  description String\n  createdAt   DateTime    @default(now())\n\n  @@index([adminId])\n  @@index([action])\n  @@index([createdAt])\n  @@map("admin_activities")\n}\n\nmodel MechanicProfile {\n  id            String         @id @default(uuid())\n  userId        String         @unique\n  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  serviceTypes  String[]\n  vehiclePhoto  String[]\n  licenseDoc    String\n  nidDoc        String\n  status        MechanicStatus @default(PENDING)\n  isAvailable   Boolean        @default(false)\n  currentLat    Float?\n  currentLng    Float?\n  serviceRadius Float          @default(10)\n  rating        Float          @default(0)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n\n  requests ServiceRequest[]\n\n  @@index([isAvailable, status])\n  @@map("mechanic_profiles")\n}\n\nmodel Payment {\n  id        String         @id @default(uuid())\n  requestId String         @unique\n  request   ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n\n  amount   Float\n  currency String @default("BDT")\n\n  merchantInvoiceNumber String  @unique\n  transactionId         String? @unique // bKash TrxID \u0985\u09A5\u09AC\u09BE \u09AF\u09C7\u0995\u09CB\u09A8\u09CB gateway-\u09B0 reference \u2014 generic \u09B0\u09BE\u0996\u09BE \u09B9\u09B2\u09CB\n  gatewayResponse       Json? // raw gateway callback \u09B0\u09BE\u0996\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF, dispute/debug-\u098F \u0995\u09BE\u099C\u09C7 \u09B2\u09BE\u0997\u09AC\u09C7\n\n  status PaymentStatus @default(UNPAID)\n  method PaymentMethod\n\n  confirmedBy String? // FIX: cash payment \u09B9\u09B2\u09C7 \u0995\u09CB\u09A8 mechanic (userId) "\u09AA\u09C7\u09AF\u09BC\u09C7\u099B\u09BF" confirm \u0995\u09B0\u09C7\u099B\u09C7, \u09A4\u09BE\u09B0 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995\n  paidAt      DateTime?\n\n  refunds Refund[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([status])\n  @@index([method])\n  @@map("payments")\n}\n\nmodel Refund {\n  id        String  @id @default(uuid())\n  paymentId String\n  payment   Payment @relation(fields: [paymentId], references: [id])\n\n  amount Float\n  reason String\n  status RefundStatus @default(REQUESTED)\n\n  gatewayRefundId String? @unique\n  gatewayResponse Json?\n\n  requestedBy String // userId \u2014 customer \u09AC\u09BE admin, \u09AF\u09C7 refund \u099A\u09C7\u09AF\u09BC\u09C7\u099B\u09C7\n  processedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([status])\n  @@map("refunds")\n}\n\nmodel Review {\n  id        String         @id @default(uuid())\n  requestId String         @unique\n  request   ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n  userId    String\n  user      User           @relation(fields: [userId], references: [id])\n  rating    Int\n  comment   String?\n  createdAt DateTime       @default(now())\n\n  @@map("reviews")\n}\n\nmodel ServiceRequest {\n  id          String           @id @default(uuid())\n  customerId  String\n  customer    User             @relation(fields: [customerId], references: [id])\n  mechanicId  String?\n  mechanic    MechanicProfile? @relation(fields: [mechanicId], references: [id])\n  serviceType String\n  description String?\n  pickupLat   Float\n  pickupLng   Float\n  status      RequestStatus    @default(PENDING)\n  price       Float?\n  payment     Payment?\n  review      Review?\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n\n  @@index([customerId])\n  @@index([mechanicId])\n  @@index([status])\n  @@map("service_requests")\n}\n\nenum Role {\n  CUSTOMER\n  MECHANIC\n  ADMIN\n}\n\nenum MechanicStatus {\n  PENDING\n  APPROVED\n  REJECTED\n  SUSPENDED\n}\n\nenum RequestStatus {\n  PENDING\n  ACCEPTED\n  EN_ROUTE\n  IN_PROGRESS\n  COMPLETED\n  CANCELLED\n}\n\nenum PaymentMethod {\n  CASH\n  BKASH\n}\n\nenum AuthProvider {\n  GOOGLE\n  CREDENTIAL\n}\n\nenum PaymentStatus {\n  UNPAID\n  PENDING\n  PAID\n  FAILED\n  REFUND_REQUESTED\n  REFUNDED\n  PARTIALLY_REFUNDED\n}\n\nenum RefundStatus {\n  REQUESTED\n  APPROVED\n  PROCESSING\n  COMPLETED\n  REJECTED\n  FAILED\n}\n\nenum AdminAction {\n  USER_BLOCKED\n  USER_UNBLOCKED\n  MECHANIC_APPROVED\n  MECHANIC_REJECTED\n  REFUND_APPROVED\n  REFUND_REJECTED\n  REFUND_PROCESSED\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id           String       @id @default(uuid())\n  name         String\n  email        String       @unique\n  password     String?\n  googleId     String?      @unique\n  authProvider AuthProvider @default(CREDENTIAL)\n  role         Role         @default(CUSTOMER)\n  phone        String?\n\n  needPasswordChange Boolean  @default(false)\n  isBlocked          Boolean  @default(false)\n  isDeleted          Boolean  @default(false)\n  createdAt          DateTime @default(now())\n  updatedAt          DateTime @updatedAt\n\n  mechanicProfile MechanicProfile?\n  requests        ServiceRequest[]\n  reviews         Review[]\n  adminActivities AdminActivity[]\n\n  @@map("users")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"AdminActivity":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"adminId","kind":"scalar","type":"String"},{"name":"admin","kind":"object","type":"User","relationName":"AdminActivityToUser"},{"name":"action","kind":"enum","type":"AdminAction"},{"name":"targetType","kind":"scalar","type":"String"},{"name":"targetId","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"admin_activities","schema":null},"MechanicProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"MechanicProfileToUser"},{"name":"serviceTypes","kind":"scalar","type":"String"},{"name":"vehiclePhoto","kind":"scalar","type":"String"},{"name":"licenseDoc","kind":"scalar","type":"String"},{"name":"nidDoc","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"MechanicStatus"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"currentLat","kind":"scalar","type":"Float"},{"name":"currentLng","kind":"scalar","type":"Float"},{"name":"serviceRadius","kind":"scalar","type":"Float"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"requests","kind":"object","type":"ServiceRequest","relationName":"MechanicProfileToServiceRequest"}],"dbName":"mechanic_profiles","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"request","kind":"object","type":"ServiceRequest","relationName":"PaymentToServiceRequest"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"merchantInvoiceNumber","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"gatewayResponse","kind":"scalar","type":"Json"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"method","kind":"enum","type":"PaymentMethod"},{"name":"confirmedBy","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"refunds","kind":"object","type":"Refund","relationName":"PaymentToRefund"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payments","schema":null},"Refund":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToRefund"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"reason","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"RefundStatus"},{"name":"gatewayRefundId","kind":"scalar","type":"String"},{"name":"gatewayResponse","kind":"scalar","type":"Json"},{"name":"requestedBy","kind":"scalar","type":"String"},{"name":"processedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"refunds","schema":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"request","kind":"object","type":"ServiceRequest","relationName":"ReviewToServiceRequest"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews","schema":null},"ServiceRequest":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"ServiceRequestToUser"},{"name":"mechanicId","kind":"scalar","type":"String"},{"name":"mechanic","kind":"object","type":"MechanicProfile","relationName":"MechanicProfileToServiceRequest"},{"name":"serviceType","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"pickupLat","kind":"scalar","type":"Float"},{"name":"pickupLng","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"RequestStatus"},{"name":"price","kind":"scalar","type":"Float"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToServiceRequest"},{"name":"review","kind":"object","type":"Review","relationName":"ReviewToServiceRequest"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"service_requests","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"authProvider","kind":"enum","type":"AuthProvider"},{"name":"role","kind":"enum","type":"Role"},{"name":"phone","kind":"scalar","type":"String"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isBlocked","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"mechanicProfile","kind":"object","type":"MechanicProfile","relationName":"MechanicProfileToUser"},{"name":"requests","kind":"object","type":"ServiceRequest","relationName":"ServiceRequestToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"adminActivities","kind":"object","type":"AdminActivity","relationName":"AdminActivityToUser"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","user","orderBy","cursor","customer","mechanic","request","payment","refunds","_count","review","requests","mechanicProfile","reviews","adminActivities","admin","AdminActivity.findUnique","AdminActivity.findUniqueOrThrow","AdminActivity.findFirst","AdminActivity.findFirstOrThrow","AdminActivity.findMany","data","AdminActivity.createOne","AdminActivity.createMany","AdminActivity.createManyAndReturn","AdminActivity.updateOne","AdminActivity.updateMany","AdminActivity.updateManyAndReturn","create","update","AdminActivity.upsertOne","AdminActivity.deleteOne","AdminActivity.deleteMany","having","_min","_max","AdminActivity.groupBy","AdminActivity.aggregate","MechanicProfile.findUnique","MechanicProfile.findUniqueOrThrow","MechanicProfile.findFirst","MechanicProfile.findFirstOrThrow","MechanicProfile.findMany","MechanicProfile.createOne","MechanicProfile.createMany","MechanicProfile.createManyAndReturn","MechanicProfile.updateOne","MechanicProfile.updateMany","MechanicProfile.updateManyAndReturn","MechanicProfile.upsertOne","MechanicProfile.deleteOne","MechanicProfile.deleteMany","_avg","_sum","MechanicProfile.groupBy","MechanicProfile.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Refund.findUnique","Refund.findUniqueOrThrow","Refund.findFirst","Refund.findFirstOrThrow","Refund.findMany","Refund.createOne","Refund.createMany","Refund.createManyAndReturn","Refund.updateOne","Refund.updateMany","Refund.updateManyAndReturn","Refund.upsertOne","Refund.deleteOne","Refund.deleteMany","Refund.groupBy","Refund.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","ServiceRequest.findUnique","ServiceRequest.findUniqueOrThrow","ServiceRequest.findFirst","ServiceRequest.findFirstOrThrow","ServiceRequest.findMany","ServiceRequest.createOne","ServiceRequest.createMany","ServiceRequest.createManyAndReturn","ServiceRequest.updateOne","ServiceRequest.updateMany","ServiceRequest.updateManyAndReturn","ServiceRequest.upsertOne","ServiceRequest.deleteOne","ServiceRequest.deleteMany","ServiceRequest.groupBy","ServiceRequest.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","name","email","password","googleId","AuthProvider","authProvider","Role","role","phone","needPasswordChange","isBlocked","isDeleted","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","customerId","mechanicId","serviceType","description","pickupLat","pickupLng","RequestStatus","status","price","requestId","userId","rating","comment","paymentId","amount","reason","RefundStatus","gatewayRefundId","gatewayResponse","requestedBy","processedAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","currency","merchantInvoiceNumber","transactionId","PaymentStatus","PaymentMethod","method","confirmedBy","paidAt","serviceTypes","vehiclePhoto","licenseDoc","nidDoc","MechanicStatus","isAvailable","currentLat","currentLng","serviceRadius","has","hasEvery","hasSome","adminId","AdminAction","action","targetType","targetId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "7gNGcAsPAACNAgAgiAEAAJICADCJAQAAGAAQigEAAJICADCLAQEAAAABmAFAANsBACGrAQEA1gEAIdcBAQDWAQAh2QEAAJMC2QEi2gEBANYBACHbAQEA1gEAIQEAAAABACATAQAAjQIAIAsAAN0BACCIAQAAigIAMIkBAAADABCKAQAAigIAMIsBAQDWAQAhmAFAANsBACGZAUAA2wEAIa8BAACLAtABIrIBAQDWAQAhswEIAP4BACHLAQAAhgIAIMwBAACGAgAgzQEBANYBACHOAQEA1gEAIdABIADaAQAh0QEIAIwCACHSAQgAjAIAIdMBCAD-AQAhAQAAAAMAIBIEAACNAgAgBQAA3AEAIAcAAJsCACAKAACcAgAgiAEAAJkCADCJAQAABQAQigEAAJkCADCLAQEA1gEAIZgBQADbAQAhmQFAANsBACGoAQEA1gEAIakBAQDXAQAhqgEBANYBACGrAQEA1wEAIawBCAD-AQAhrQEIAP4BACGvAQAAmgKvASKwAQgAjAIAIQcEAAC6AwAgBQAAlQMAIAcAAMADACAKAADBAwAgqQEAAJ0CACCrAQAAnQIAILABAACdAgAgEgQAAI0CACAFAADcAQAgBwAAmwIAIAoAAJwCACCIAQAAmQIAMIkBAAAFABCKAQAAmQIAMIsBAQAAAAGYAUAA2wEAIZkBQADbAQAhqAEBANYBACGpAQEA1wEAIaoBAQDWAQAhqwEBANcBACGsAQgA_gEAIa0BCAD-AQAhrwEAAJoCrwEisAEIAIwCACEDAAAABQAgAgAABgAwAwAABwAgAQAAAAMAIBIGAACDAgAgCAAAhAIAIIgBAAD9AQAwiQEAAAoAEIoBAAD9AQAwiwEBANYBACGYAUAA2wEAIZkBQADbAQAhrwEAAIACxwEisQEBANYBACG2AQgA_gEAIboBAAD_AQAgwwEBANYBACHEAQEA1gEAIcUBAQDXAQAhyAEAAIECyAEiyQEBANcBACHKAUAAggIAIQEAAAAKACAPBwAAmAIAIIgBAACWAgAwiQEAAAwAEIoBAACWAgAwiwEBANYBACGYAUAA2wEAIZkBQADbAQAhrwEAAJcCuQEitQEBANYBACG2AQgA_gEAIbcBAQDWAQAhuQEBANcBACG6AQAA_wEAILsBAQDWAQAhvAFAAIICACEEBwAAwAMAILkBAACdAgAgugEAAJ0CACC8AQAAnQIAIA8HAACYAgAgiAEAAJYCADCJAQAADAAQigEAAJYCADCLAQEAAAABmAFAANsBACGZAUAA2wEAIa8BAACXArkBIrUBAQDWAQAhtgEIAP4BACG3AQEA1gEAIbkBAQAAAAG6AQAA_wEAILsBAQDWAQAhvAFAAIICACEDAAAADAAgAgAADQAwAwAADgAgAQAAAAwAIAsBAACNAgAgBgAAgwIAIIgBAACUAgAwiQEAABEAEIoBAACUAgAwiwEBANYBACGYAUAA2wEAIbEBAQDWAQAhsgEBANYBACGzAQIAlQIAIbQBAQDXAQAhAQAAABEAIAEAAAAFACADAAAABQAgAgAABgAwAwAABwAgAwEAALoDACAGAACxAwAgtAEAAJ0CACALAQAAjQIAIAYAAIMCACCIAQAAlAIAMIkBAAARABCKAQAAlAIAMIsBAQAAAAGYAUAA2wEAIbEBAQAAAAGyAQEA1gEAIbMBAgCVAgAhtAEBANcBACEDAAAAEQAgAgAAFQAwAwAAFgAgCw8AAI0CACCIAQAAkgIAMIkBAAAYABCKAQAAkgIAMIsBAQDWAQAhmAFAANsBACGrAQEA1gEAIdcBAQDWAQAh2QEAAJMC2QEi2gEBANYBACHbAQEA1gEAIQEPAAC6AwAgAwAAABgAIAIAABkAMAMAAAEAIAEAAAAFACABAAAAEQAgAQAAABgAIAEAAAABACADAAAAGAAgAgAAGQAwAwAAAQAgAwAAABgAIAIAABkAMAMAAAEAIAMAAAAYACACAAAZADADAAABACAIDwAAvwMAIIsBAQAAAAGYAUAAAAABqwEBAAAAAdcBAQAAAAHZAQAAANkBAtoBAQAAAAHbAQEAAAABARUAACIAIAeLAQEAAAABmAFAAAAAAasBAQAAAAHXAQEAAAAB2QEAAADZAQLaAQEAAAAB2wEBAAAAAQEVAAAkADABFQAAJAAwCA8AAL4DACCLAQEAoQIAIZgBQACmAgAhqwEBAKECACHXAQEAoQIAIdkBAAC1AtkBItoBAQChAgAh2wEBAKECACECAAAAAQAgFQAAJwAgB4sBAQChAgAhmAFAAKYCACGrAQEAoQIAIdcBAQChAgAh2QEAALUC2QEi2gEBAKECACHbAQEAoQIAIQIAAAAYACAVAAApACACAAAAGAAgFQAAKQAgAwAAAAEAIBwAACIAIB0AACcAIAEAAAABACABAAAAGAAgAwkAALsDACAiAAC9AwAgIwAAvAMAIAqIAQAAjgIAMIkBAAAwABCKAQAAjgIAMIsBAQDBAQAhmAFAAMYBACGrAQEAwQEAIdcBAQDBAQAh2QEAAI8C2QEi2gEBAMEBACHbAQEAwQEAIQMAAAAYACACAAAvADAhAAAwACADAAAAGAAgAgAAGQAwAwAAAQAgEwEAAI0CACALAADdAQAgiAEAAIoCADCJAQAAAwAQigEAAIoCADCLAQEAAAABmAFAANsBACGZAUAA2wEAIa8BAACLAtABIrIBAQAAAAGzAQgA_gEAIcsBAACGAgAgzAEAAIYCACDNAQEA1gEAIc4BAQDWAQAh0AEgANoBACHRAQgAjAIAIdIBCACMAgAh0wEIAP4BACEBAAAAMwAgAQAAADMAIAQBAAC6AwAgCwAAlgMAINEBAACdAgAg0gEAAJ0CACADAAAAAwAgAgAANgAwAwAAMwAgAwAAAAMAIAIAADYAMAMAADMAIAMAAAADACACAAA2ADADAAAzACAQAQAAuQMAIAsAAJADACCLAQEAAAABmAFAAAAAAZkBQAAAAAGvAQAAANABArIBAQAAAAGzAQgAAAABywEAAI4DACDMAQAAjwMAIM0BAQAAAAHOAQEAAAAB0AEgAAAAAdEBCAAAAAHSAQgAAAAB0wEIAAAAAQEVAAA6ACAOiwEBAAAAAZgBQAAAAAGZAUAAAAABrwEAAADQAQKyAQEAAAABswEIAAAAAcsBAACOAwAgzAEAAI8DACDNAQEAAAABzgEBAAAAAdABIAAAAAHRAQgAAAAB0gEIAAAAAdMBCAAAAAEBFQAAPAAwARUAADwAMBABAAC4AwAgCwAAggMAIIsBAQChAgAhmAFAAKYCACGZAUAApgIAIa8BAACBA9ABIrIBAQChAgAhswEIANECACHLAQAA_wIAIMwBAACAAwAgzQEBAKECACHOAQEAoQIAIdABIAClAgAh0QEIANMCACHSAQgA0wIAIdMBCADRAgAhAgAAADMAIBUAAD8AIA6LAQEAoQIAIZgBQACmAgAhmQFAAKYCACGvAQAAgQPQASKyAQEAoQIAIbMBCADRAgAhywEAAP8CACDMAQAAgAMAIM0BAQChAgAhzgEBAKECACHQASAApQIAIdEBCADTAgAh0gEIANMCACHTAQgA0QIAIQIAAAADACAVAABBACACAAAAAwAgFQAAQQAgAwAAADMAIBwAADoAIB0AAD8AIAEAAAAzACABAAAAAwAgBwkAALMDACAiAAC2AwAgIwAAtQMAIDQAALQDACA1AAC3AwAg0QEAAJ0CACDSAQAAnQIAIBGIAQAAhQIAMIkBAABIABCKAQAAhQIAMIsBAQDBAQAhmAFAAMYBACGZAUAAxgEAIa8BAACHAtABIrIBAQDBAQAhswEIAOEBACHLAQAAhgIAIMwBAACGAgAgzQEBAMEBACHOAQEAwQEAIdABIADFAQAh0QEIAOMBACHSAQgA4wEAIdMBCADhAQAhAwAAAAMAIAIAAEcAMCEAAEgAIAMAAAADACACAAA2ADADAAAzACASBgAAgwIAIAgAAIQCACCIAQAA_QEAMIkBAAAKABCKAQAA_QEAMIsBAQAAAAGYAUAA2wEAIZkBQADbAQAhrwEAAIACxwEisQEBAAAAAbYBCAD-AQAhugEAAP8BACDDAQEA1gEAIcQBAQAAAAHFAQEAAAAByAEAAIECyAEiyQEBANcBACHKAUAAggIAIQEAAABLACABAAAASwAgBgYAALEDACAIAACyAwAgugEAAJ0CACDFAQAAnQIAIMkBAACdAgAgygEAAJ0CACADAAAACgAgAgAATgAwAwAASwAgAwAAAAoAIAIAAE4AMAMAAEsAIAMAAAAKACACAABOADADAABLACAPBgAAsAMAIAgAAPUCACCLAQEAAAABmAFAAAAAAZkBQAAAAAGvAQAAAMcBArEBAQAAAAG2AQgAAAABugGAAAAAAcMBAQAAAAHEAQEAAAABxQEBAAAAAcgBAAAAyAECyQEBAAAAAcoBQAAAAAEBFQAAUgAgDYsBAQAAAAGYAUAAAAABmQFAAAAAAa8BAAAAxwECsQEBAAAAAbYBCAAAAAG6AYAAAAABwwEBAAAAAcQBAQAAAAHFAQEAAAAByAEAAADIAQLJAQEAAAABygFAAAAAAQEVAABUADABFQAAVAAwDwYAAK8DACAIAADnAgAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhrwEAAOQCxwEisQEBAKECACG2AQgA0QIAIboBgAAAAAHDAQEAoQIAIcQBAQChAgAhxQEBAKICACHIAQAA5QLIASLJAQEAogIAIcoBQADmAgAhAgAAAEsAIBUAAFcAIA2LAQEAoQIAIZgBQACmAgAhmQFAAKYCACGvAQAA5ALHASKxAQEAoQIAIbYBCADRAgAhugGAAAAAAcMBAQChAgAhxAEBAKECACHFAQEAogIAIcgBAADlAsgBIskBAQCiAgAhygFAAOYCACECAAAACgAgFQAAWQAgAgAAAAoAIBUAAFkAIAMAAABLACAcAABSACAdAABXACABAAAASwAgAQAAAAoAIAkJAACqAwAgIgAArQMAICMAAKwDACA0AACrAwAgNQAArgMAILoBAACdAgAgxQEAAJ0CACDJAQAAnQIAIMoBAACdAgAgEIgBAAD2AQAwiQEAAGAAEIoBAAD2AQAwiwEBAMEBACGYAUAAxgEAIZkBQADGAQAhrwEAAPcBxwEisQEBAMEBACG2AQgA4QEAIboBAADvAQAgwwEBAMEBACHEAQEAwQEAIcUBAQDCAQAhyAEAAPgByAEiyQEBAMIBACHKAUAA8AEAIQMAAAAKACACAABfADAhAABgACADAAAACgAgAgAATgAwAwAASwAgAQAAAA4AIAEAAAAOACADAAAADAAgAgAADQAwAwAADgAgAwAAAAwAIAIAAA0AMAMAAA4AIAMAAAAMACACAAANADADAAAOACAMBwAAqQMAIIsBAQAAAAGYAUAAAAABmQFAAAAAAa8BAAAAuQECtQEBAAAAAbYBCAAAAAG3AQEAAAABuQEBAAAAAboBgAAAAAG7AQEAAAABvAFAAAAAAQEVAABoACALiwEBAAAAAZgBQAAAAAGZAUAAAAABrwEAAAC5AQK1AQEAAAABtgEIAAAAAbcBAQAAAAG5AQEAAAABugGAAAAAAbsBAQAAAAG8AUAAAAABARUAAGoAMAEVAABqADAMBwAAqAMAIIsBAQChAgAhmAFAAKYCACGZAUAApgIAIa8BAADyArkBIrUBAQChAgAhtgEIANECACG3AQEAoQIAIbkBAQCiAgAhugGAAAAAAbsBAQChAgAhvAFAAOYCACECAAAADgAgFQAAbQAgC4sBAQChAgAhmAFAAKYCACGZAUAApgIAIa8BAADyArkBIrUBAQChAgAhtgEIANECACG3AQEAoQIAIbkBAQCiAgAhugGAAAAAAbsBAQChAgAhvAFAAOYCACECAAAADAAgFQAAbwAgAgAAAAwAIBUAAG8AIAMAAAAOACAcAABoACAdAABtACABAAAADgAgAQAAAAwAIAgJAACjAwAgIgAApgMAICMAAKUDACA0AACkAwAgNQAApwMAILkBAACdAgAgugEAAJ0CACC8AQAAnQIAIA6IAQAA7QEAMIkBAAB2ABCKAQAA7QEAMIsBAQDBAQAhmAFAAMYBACGZAUAAxgEAIa8BAADuAbkBIrUBAQDBAQAhtgEIAOEBACG3AQEAwQEAIbkBAQDCAQAhugEAAO8BACC7AQEAwQEAIbwBQADwAQAhAwAAAAwAIAIAAHUAMCEAAHYAIAMAAAAMACACAAANADADAAAOACABAAAAFgAgAQAAABYAIAMAAAARACACAAAVADADAAAWACADAAAAEQAgAgAAFQAwAwAAFgAgAwAAABEAIAIAABUAMAMAABYAIAgBAADeAgAgBgAAxgIAIIsBAQAAAAGYAUAAAAABsQEBAAAAAbIBAQAAAAGzAQIAAAABtAEBAAAAAQEVAAB-ACAGiwEBAAAAAZgBQAAAAAGxAQEAAAABsgEBAAAAAbMBAgAAAAG0AQEAAAABARUAAIABADABFQAAgAEAMAgBAADdAgAgBgAAxAIAIIsBAQChAgAhmAFAAKYCACGxAQEAoQIAIbIBAQChAgAhswECAMICACG0AQEAogIAIQIAAAAWACAVAACDAQAgBosBAQChAgAhmAFAAKYCACGxAQEAoQIAIbIBAQChAgAhswECAMICACG0AQEAogIAIQIAAAARACAVAACFAQAgAgAAABEAIBUAAIUBACADAAAAFgAgHAAAfgAgHQAAgwEAIAEAAAAWACABAAAAEQAgBgkAAJ4DACAiAAChAwAgIwAAoAMAIDQAAJ8DACA1AACiAwAgtAEAAJ0CACAJiAEAAOoBADCJAQAAjAEAEIoBAADqAQAwiwEBAMEBACGYAUAAxgEAIbEBAQDBAQAhsgEBAMEBACGzAQIA6wEAIbQBAQDCAQAhAwAAABEAIAIAAIsBADAhAACMAQAgAwAAABEAIAIAABUAMAMAABYAIAEAAAAHACABAAAABwAgAwAAAAUAIAIAAAYAMAMAAAcAIAMAAAAFACACAAAGADADAAAHACADAAAABQAgAgAABgAwAwAABwAgDwQAAI0DACAFAAD3AgAgBwAA-AIAIAoAAPkCACCLAQEAAAABmAFAAAAAAZkBQAAAAAGoAQEAAAABqQEBAAAAAaoBAQAAAAGrAQEAAAABrAEIAAAAAa0BCAAAAAGvAQAAAK8BArABCAAAAAEBFQAAlAEAIAuLAQEAAAABmAFAAAAAAZkBQAAAAAGoAQEAAAABqQEBAAAAAaoBAQAAAAGrAQEAAAABrAEIAAAAAa0BCAAAAAGvAQAAAK8BArABCAAAAAEBFQAAlgEAMAEVAACWAQAwAQAAAAMAIA8EAACLAwAgBQAA1QIAIAcAANYCACAKAADXAgAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhqAEBAKECACGpAQEAogIAIaoBAQChAgAhqwEBAKICACGsAQgA0QIAIa0BCADRAgAhrwEAANICrwEisAEIANMCACECAAAABwAgFQAAmgEAIAuLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGoAQEAoQIAIakBAQCiAgAhqgEBAKECACGrAQEAogIAIawBCADRAgAhrQEIANECACGvAQAA0gKvASKwAQgA0wIAIQIAAAAFACAVAACcAQAgAgAAAAUAIBUAAJwBACABAAAAAwAgAwAAAAcAIBwAAJQBACAdAACaAQAgAQAAAAcAIAEAAAAFACAICQAAmQMAICIAAJwDACAjAACbAwAgNAAAmgMAIDUAAJ0DACCpAQAAnQIAIKsBAACdAgAgsAEAAJ0CACAOiAEAAOABADCJAQAApAEAEIoBAADgAQAwiwEBAMEBACGYAUAAxgEAIZkBQADGAQAhqAEBAMEBACGpAQEAwgEAIaoBAQDBAQAhqwEBAMIBACGsAQgA4QEAIa0BCADhAQAhrwEAAOIBrwEisAEIAOMBACEDAAAABQAgAgAAowEAMCEAAKQBACADAAAABQAgAgAABgAwAwAABwAgFAsAAN0BACAMAADcAQAgDQAA3gEAIA4AAN8BACCIAQAA1QEAMIkBAACqAQAQigEAANUBADCLAQEAAAABjAEBANYBACGNAQEAAAABjgEBANcBACGPAQEAAAABkQEAANgBkQEikwEAANkBkwEilAEBANcBACGVASAA2gEAIZYBIADaAQAhlwEgANoBACGYAUAA2wEAIZkBQADbAQAhAQAAAKcBACABAAAApwEAIBQLAADdAQAgDAAA3AEAIA0AAN4BACAOAADfAQAgiAEAANUBADCJAQAAqgEAEIoBAADVAQAwiwEBANYBACGMAQEA1gEAIY0BAQDWAQAhjgEBANcBACGPAQEA1wEAIZEBAADYAZEBIpMBAADZAZMBIpQBAQDXAQAhlQEgANoBACGWASAA2gEAIZcBIADaAQAhmAFAANsBACGZAUAA2wEAIQcLAACWAwAgDAAAlQMAIA0AAJcDACAOAACYAwAgjgEAAJ0CACCPAQAAnQIAIJQBAACdAgAgAwAAAKoBACACAACrAQAwAwAApwEAIAMAAACqAQAgAgAAqwEAMAMAAKcBACADAAAAqgEAIAIAAKsBADADAACnAQAgEQsAAJIDACAMAACRAwAgDQAAkwMAIA4AAJQDACCLAQEAAAABjAEBAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAZEBAAAAkQECkwEAAACTAQKUAQEAAAABlQEgAAAAAZYBIAAAAAGXASAAAAABmAFAAAAAAZkBQAAAAAEBFQAArwEAIA2LAQEAAAABjAEBAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAZEBAAAAkQECkwEAAACTAQKUAQEAAAABlQEgAAAAAZYBIAAAAAGXASAAAAABmAFAAAAAAZkBQAAAAAEBFQAAsQEAMAEVAACxAQAwEQsAAKgCACAMAACnAgAgDQAAqQIAIA4AAKoCACCLAQEAoQIAIYwBAQChAgAhjQEBAKECACGOAQEAogIAIY8BAQCiAgAhkQEAAKMCkQEikwEAAKQCkwEilAEBAKICACGVASAApQIAIZYBIAClAgAhlwEgAKUCACGYAUAApgIAIZkBQACmAgAhAgAAAKcBACAVAAC0AQAgDYsBAQChAgAhjAEBAKECACGNAQEAoQIAIY4BAQCiAgAhjwEBAKICACGRAQAAowKRASKTAQAApAKTASKUAQEAogIAIZUBIAClAgAhlgEgAKUCACGXASAApQIAIZgBQACmAgAhmQFAAKYCACECAAAAqgEAIBUAALYBACACAAAAqgEAIBUAALYBACADAAAApwEAIBwAAK8BACAdAAC0AQAgAQAAAKcBACABAAAAqgEAIAYJAACeAgAgIgAAoAIAICMAAJ8CACCOAQAAnQIAII8BAACdAgAglAEAAJ0CACAQiAEAAMABADCJAQAAvQEAEIoBAADAAQAwiwEBAMEBACGMAQEAwQEAIY0BAQDBAQAhjgEBAMIBACGPAQEAwgEAIZEBAADDAZEBIpMBAADEAZMBIpQBAQDCAQAhlQEgAMUBACGWASAAxQEAIZcBIADFAQAhmAFAAMYBACGZAUAAxgEAIQMAAACqAQAgAgAAvAEAMCEAAL0BACADAAAAqgEAIAIAAKsBADADAACnAQAgEIgBAADAAQAwiQEAAL0BABCKAQAAwAEAMIsBAQDBAQAhjAEBAMEBACGNAQEAwQEAIY4BAQDCAQAhjwEBAMIBACGRAQAAwwGRASKTAQAAxAGTASKUAQEAwgEAIZUBIADFAQAhlgEgAMUBACGXASAAxQEAIZgBQADGAQAhmQFAAMYBACEOCQAAyAEAICIAANQBACAjAADUAQAgmgEBAAAAAZsBAQAAAAScAQEAAAAEnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQDTAQAhogEBAAAAAaMBAQAAAAGkAQEAAAABDgkAANEBACAiAADSAQAgIwAA0gEAIJoBAQAAAAGbAQEAAAAFnAEBAAAABZ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGhAQEA0AEAIaIBAQAAAAGjAQEAAAABpAEBAAAAAQcJAADIAQAgIgAAzwEAICMAAM8BACCaAQAAAJEBApsBAAAAkQEInAEAAACRAQihAQAAzgGRASIHCQAAyAEAICIAAM0BACAjAADNAQAgmgEAAACTAQKbAQAAAJMBCJwBAAAAkwEIoQEAAMwBkwEiBQkAAMgBACAiAADLAQAgIwAAywEAIJoBIAAAAAGhASAAygEAIQsJAADIAQAgIgAAyQEAICMAAMkBACCaAUAAAAABmwFAAAAABJwBQAAAAASdAUAAAAABngFAAAAAAZ8BQAAAAAGgAUAAAAABoQFAAMcBACELCQAAyAEAICIAAMkBACAjAADJAQAgmgFAAAAAAZsBQAAAAAScAUAAAAAEnQFAAAAAAZ4BQAAAAAGfAUAAAAABoAFAAAAAAaEBQADHAQAhCJoBAgAAAAGbAQIAAAAEnAECAAAABJ0BAgAAAAGeAQIAAAABnwECAAAAAaABAgAAAAGhAQIAyAEAIQiaAUAAAAABmwFAAAAABJwBQAAAAASdAUAAAAABngFAAAAAAZ8BQAAAAAGgAUAAAAABoQFAAMkBACEFCQAAyAEAICIAAMsBACAjAADLAQAgmgEgAAAAAaEBIADKAQAhApoBIAAAAAGhASAAywEAIQcJAADIAQAgIgAAzQEAICMAAM0BACCaAQAAAJMBApsBAAAAkwEInAEAAACTAQihAQAAzAGTASIEmgEAAACTAQKbAQAAAJMBCJwBAAAAkwEIoQEAAM0BkwEiBwkAAMgBACAiAADPAQAgIwAAzwEAIJoBAAAAkQECmwEAAACRAQicAQAAAJEBCKEBAADOAZEBIgSaAQAAAJEBApsBAAAAkQEInAEAAACRAQihAQAAzwGRASIOCQAA0QEAICIAANIBACAjAADSAQAgmgEBAAAAAZsBAQAAAAWcAQEAAAAFnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQDQAQAhogEBAAAAAaMBAQAAAAGkAQEAAAABCJoBAgAAAAGbAQIAAAAFnAECAAAABZ0BAgAAAAGeAQIAAAABnwECAAAAAaABAgAAAAGhAQIA0QEAIQuaAQEAAAABmwEBAAAABZwBAQAAAAWdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABoQEBANIBACGiAQEAAAABowEBAAAAAaQBAQAAAAEOCQAAyAEAICIAANQBACAjAADUAQAgmgEBAAAAAZsBAQAAAAScAQEAAAAEnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQDTAQAhogEBAAAAAaMBAQAAAAGkAQEAAAABC5oBAQAAAAGbAQEAAAAEnAEBAAAABJ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGhAQEA1AEAIaIBAQAAAAGjAQEAAAABpAEBAAAAARQLAADdAQAgDAAA3AEAIA0AAN4BACAOAADfAQAgiAEAANUBADCJAQAAqgEAEIoBAADVAQAwiwEBANYBACGMAQEA1gEAIY0BAQDWAQAhjgEBANcBACGPAQEA1wEAIZEBAADYAZEBIpMBAADZAZMBIpQBAQDXAQAhlQEgANoBACGWASAA2gEAIZcBIADaAQAhmAFAANsBACGZAUAA2wEAIQuaAQEAAAABmwEBAAAABJwBAQAAAASdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABoQEBANQBACGiAQEAAAABowEBAAAAAaQBAQAAAAELmgEBAAAAAZsBAQAAAAWcAQEAAAAFnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQDSAQAhogEBAAAAAaMBAQAAAAGkAQEAAAABBJoBAAAAkQECmwEAAACRAQicAQAAAJEBCKEBAADPAZEBIgSaAQAAAJMBApsBAAAAkwEInAEAAACTAQihAQAAzQGTASICmgEgAAAAAaEBIADLAQAhCJoBQAAAAAGbAUAAAAAEnAFAAAAABJ0BQAAAAAGeAUAAAAABnwFAAAAAAaABQAAAAAGhAUAAyQEAIRUBAACNAgAgCwAA3QEAIIgBAACKAgAwiQEAAAMAEIoBAACKAgAwiwEBANYBACGYAUAA2wEAIZkBQADbAQAhrwEAAIsC0AEisgEBANYBACGzAQgA_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_AQEAAAABwAGAAAAAAcEBgAAAAAHCAYAAAAABBwkAAMgBACAiAAD1AQAgIwAA9QEAIJoBAAAAuQECmwEAAAC5AQicAQAAALkBCKEBAAD0AbkBIgSaAQAAALkBApsBAAAAuQEInAEAAAC5AQihAQAA9QG5ASIQiAEAAPYBADCJAQAAYAAQigEAAPYBADCLAQEAwQEAIZgBQADGAQAhmQFAAMYBACGvAQAA9wHHASKxAQEAwQEAIbYBCADhAQAhugEAAO8BACDDAQEAwQEAIcQBAQDBAQAhxQEBAMIBACHIAQAA-AHIASLJAQEAwgEAIcoBQADwAQAhBwkAAMgBACAiAAD8AQAgIwAA_AEAIJoBAAAAxwECmwEAAADHAQicAQAAAMcBCKEBAAD7AccBIgcJAADIAQAgIgAA-gEAICMAAPoBACCaAQAAAMgBApsBAAAAyAEInAEAAADIAQihAQAA-QHIASIHCQAAyAEAICIAAPoBACAjAAD6AQAgmgEAAADIAQKbAQAAAMgBCJwBAAAAyAEIoQEAAPkByAEiBJoBAAAAyAECmwEAAADIAQicAQAAAMgBCKEBAAD6AcgBIgcJAADIAQAgIgAA_AEAICMAAPwBACCaAQAAAMcBApsBAAAAxwEInAEAAADHAQihAQAA-wHHASIEmgEAAADHAQKbAQAAAMcBCJwBAAAAxwEIoQEAAPwBxwEiEgYAAIMCACAIAACEAgAgiAEAAP0BADCJAQAACgAQigEAAP0BADCLAQEA1gEAIZgBQADbAQAhmQFAANsBACGvAQAAgALHASKxAQEA1gEAIbYBCAD-AQAhugEAAP8BACDDAQEA1gEAIcQBAQDWAQAhxQEBANcBACHIAQAAgQLIASLJAQEA1wEAIcoBQACCAgAhCJoBCAAAAAGbAQgAAAAEnAEIAAAABJ0BCAAAAAGeAQgAAAABnwEIAAAAAaABCAAAAAGhAQgA6QEAIQyaAYAAAAABnQGAAAAAAZ4BgAAAAAGfAYAAAAABoAGAAAAAAaEBgAAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAYAAAAABwQGAAAAAAcIBgAAAAAEEmgEAAADHAQKbAQAAAMcBCJwBAAAAxwEIoQEAAPwBxwEiBJoBAAAAyAECmwEAAADIAQicAQAAAMgBCKEBAAD6AcgBIgiaAUAAAAABmwFAAAAABZwBQAAAAAWdAUAAAAABngFAAAAAAZ8BQAAAAAGgAUAAAAABoQFAAPIBACEUBAAAjQIAIAUAANwBACAHAACbAgAgCgAAnAIAIIgBAACZAgAwiQEAAAUAEIoBAACZAgAwiwEBANYBACGYAUAA2wEAIZkBQADbAQAhqAEBANYBACGpAQEA1wEAIaoBAQDWAQAhqwEBANcBACGsAQgA_gEAIa0BCAD-AQAhrwEAAJoCrwEisAEIAIwCACHcAQAABQAg3QEAAAUAIAOlAQAADAAgpgEAAAwAIKcBAAAMACARiAEAAIUCADCJAQAASAAQigEAAIUCADCLAQEAwQEAIZgBQADGAQAhmQFAAMYBACGvAQAAhwLQASKyAQEAwQEAIbMBCADhAQAhywEAAIYCACDMAQAAhgIAIM0BAQDBAQAhzgEBAMEBACHQASAAxQEAIdEBCADjAQAh0gEIAOMBACHTAQgA4QEAIQSaAQEAAAAF1AEBAAAAAdUBAQAAAATWAQEAAAAEBwkAAMgBACAiAACJAgAgIwAAiQIAIJoBAAAA0AECmwEAAADQAQicAQAAANABCKEBAACIAtABIgcJAADIAQAgIgAAiQIAICMAAIkCACCaAQAAANABApsBAAAA0AEInAEAAADQAQihAQAAiALQASIEmgEAAADQAQKbAQAAANABCJwBAAAA0AEIoQEAAIkC0AEiEwEAAI0CACALAADdAQAgiAEAAIoCADCJAQAAAwAQigEAAIoCADCLAQEA1gEAIZgBQADbAQAhmQFAANsBACGvAQAAiwLQASKyAQEA1gEAIbMBCAD-AQAhywEAAIYCACDMAQAAhgIAIM0BAQDWAQAhzgEBANYBACHQASAA2gEAIdEBCACMAgAh0gEIAIwCACHTAQgA_gEAIQSaAQAAANABApsBAAAA0AEInAEAAADQAQihAQAAiQLQASIImgEIAAAAAZsBCAAAAAWcAQgAAAAFnQEIAAAAAZ4BCAAAAAGfAQgAAAABoAEIAAAAAaEBCADlAQAhFgsAAN0BACAMAADcAQAgDQAA3gEAIA4AAN8BACCIAQAA1QEAMIkBAACqAQAQigEAANUBADCLAQEA1gEAIYwBAQDWAQAhjQEBANYBACGOAQEA1wEAIY8BAQDXAQAhkQEAANgBkQEikwEAANkBkwEilAEBANcBACGVASAA2gEAIZYBIADaAQAhlwEgANoBACGYAUAA2wEAIZkBQADbAQAh3AEAAKoBACDdAQAAqgEAIAqIAQAAjgIAMIkBAAAwABCKAQAAjgIAMIsBAQDBAQAhmAFAAMYBACGrAQEAwQEAIdcBAQDBAQAh2QEAAI8C2QEi2gEBAMEBACHbAQEAwQEAIQcJAADIAQAgIgAAkQIAICMAAJECACCaAQAAANkBApsBAAAA2QEInAEAAADZAQihAQAAkALZASIHCQAAyAEAICIAAJECACAjAACRAgAgmgEAAADZAQKbAQAAANkBCJwBAAAA2QEIoQEAAJAC2QEiBJoBAAAA2QECmwEAAADZAQicAQAAANkBCKEBAACRAtkBIgsPAACNAgAgiAEAAJICADCJAQAAGAAQigEAAJICADCLAQEA1gEAIZgBQADbAQAhqwEBANYBACHXAQEA1gEAIdkBAACTAtkBItoBAQDWAQAh2wEBANYBACEEmgEAAADZAQKbAQAAANkBCJwBAAAA2QEIoQEAAJEC2QEiCwEAAI0CACAGAACDAgAgiAEAAJQCADCJAQAAEQAQigEAAJQCADCLAQEA1gEAIZgBQADbAQAhsQEBANYBACGyAQEA1gEAIbMBAgCVAgAhtAEBANcBACEImgECAAAAAZsBAgAAAAScAQIAAAAEnQECAAAAAZ4BAgAAAAGfAQIAAAABoAECAAAAAaEBAgDIAQAhDwcAAJgCACCIAQAAlgIAMIkBAAAMABCKAQAAlgIAMIsBAQDWAQAhmAFAANsBACGZAUAA2wEAIa8BAACXArkBIrUBAQDWAQAhtgEIAP4BACG3AQEA1gEAIbkBAQDXAQAhugEAAP8BACC7AQEA1gEAIbwBQACCAgAhBJoBAAAAuQECmwEAAAC5AQicAQAAALkBCKEBAAD1AbkBIhQGAACDAgAgCAAAhAIAIIgBAAD9AQAwiQEAAAoAEIoBAAD9AQAwiwEBANYBACGYAUAA2wEAIZkBQADbAQAhrwEAAIACxwEisQEBANYBACG2AQgA_gEAIboBAAD_AQAgwwEBANYBACHEAQEA1gEAIcUBAQDXAQAhyAEAAIECyAEiyQEBANcBACHKAUAAggIAIdwBAAAKACDdAQAACgAgEgQAAI0CACAFAADcAQAgBwAAmwIAIAoAAJwCACCIAQAAmQIAMIkBAAAFABCKAQAAmQIAMIsBAQDWAQAhmAFAANsBACGZAUAA2wEAIagBAQDWAQAhqQEBANcBACGqAQEA1gEAIasBAQDXAQAhrAEIAP4BACGtAQgA_gEAIa8BAACaAq8BIrABCACMAgAhBJoBAAAArwECmwEAAACvAQicAQAAAK8BCKEBAADnAa8BIhQGAACDAgAgCAAAhAIAIIgBAAD9AQAwiQEAAAoAEIoBAAD9AQAwiwEBANYBACGYAUAA2wEAIZkBQADbAQAhrwEAAIACxwEisQEBANYBACG2AQgA_gEAIboBAAD_AQAgwwEBANYBACHEAQEA1gEAIcUBAQDXAQAhyAEAAIECyAEiyQEBANcBACHKAUAAggIAIdwBAAAKACDdAQAACgAgDQEAAI0CACAGAACDAgAgiAEAAJQCADCJAQAAEQAQigEAAJQCADCLAQEA1gEAIZgBQADbAQAhsQEBANYBACGyAQEA1gEAIbMBAgCVAgAhtAEBANcBACHcAQAAEQAg3QEAABEAIAAAAAAB4QEBAAAAAQHhAQEAAAABAeEBAAAAkQECAeEBAAAAkwECAeEBIAAAAAEB4QFAAAAAAQccAAD6AgAgHQAA_QIAIN4BAAD7AgAg3wEAAPwCACDiAQAAAwAg4wEAAAMAIOQBAAAzACALHAAAxwIAMB0AAMwCADDeAQAAyAIAMN8BAADJAgAw4AEAAMoCACDhAQAAywIAMOIBAADLAgAw4wEAAMsCADDkAQAAywIAMOUBAADNAgAw5gEAAM4CADALHAAAuAIAMB0AAL0CADDeAQAAuQIAMN8BAAC6AgAw4AEAALsCACDhAQAAvAIAMOIBAAC8AgAw4wEAALwCADDkAQAAvAIAMOUBAAC-AgAw5gEAAL8CADALHAAAqwIAMB0AALACADDeAQAArAIAMN8BAACtAgAw4AEAAK4CACDhAQAArwIAMOIBAACvAgAw4wEAAK8CADDkAQAArwIAMOUBAACxAgAw5gEAALICADAGiwEBAAAAAZgBQAAAAAGrAQEAAAAB2QEAAADZAQLaAQEAAAAB2wEBAAAAAQIAAAABACAcAAC3AgAgAwAAAAEAIBwAALcCACAdAAC2AgAgARUAAO4DADALDwAAjQIAIIgBAACSAgAwiQEAABgAEIoBAACSAgAwiwEBAAAAAZgBQADbAQAhqwEBANYBACHXAQEA1gEAIdkBAACTAtkBItoBAQDWAQAh2wEBANYBACECAAAAAQAgFQAAtgIAIAIAAACzAgAgFQAAtAIAIAqIAQAAsgIAMIkBAACzAgAQigEAALICADCLAQEA1gEAIZgBQADbAQAhqwEBANYBACHXAQEA1gEAIdkBAACTAtkBItoBAQDWAQAh2wEBANYBACEKiAEAALICADCJAQAAswIAEIoBAACyAgAwiwEBANYBACGYAUAA2wEAIasBAQDWAQAh1wEBANYBACHZAQAAkwLZASLaAQEA1gEAIdsBAQDWAQAhBosBAQChAgAhmAFAAKYCACGrAQEAoQIAIdkBAAC1AtkBItoBAQChAgAh2wEBAKECACEB4QEAAADZAQIGiwEBAKECACGYAUAApgIAIasBAQChAgAh2QEAALUC2QEi2gEBAKECACHbAQEAoQIAIQaLAQEAAAABmAFAAAAAAasBAQAAAAHZAQAAANkBAtoBAQAAAAHbAQEAAAABBgYAAMYCACCLAQEAAAABmAFAAAAAAbEBAQAAAAGzAQIAAAABtAEBAAAAAQIAAAAWACAcAADFAgAgAwAAABYAIBwAAMUCACAdAADDAgAgARUAAO0DADALAQAAjQIAIAYAAIMCACCIAQAAlAIAMIkBAAARABCKAQAAlAIAMIsBAQAAAAGYAUAA2wEAIbEBAQAAAAGyAQEA1gEAIbMBAgCVAgAhtAEBANcBACECAAAAFgAgFQAAwwIAIAIAAADAAgAgFQAAwQIAIAmIAQAAvwIAMIkBAADAAgAQigEAAL8CADCLAQEA1gEAIZgBQADbAQAhsQEBANYBACGyAQEA1gEAIbMBAgCVAgAhtAEBANcBACEJiAEAAL8CADCJAQAAwAIAEIoBAAC_AgAwiwEBANYBACGYAUAA2wEAIbEBAQDWAQAhsgEBANYBACGzAQIAlQIAIbQBAQDXAQAhBYsBAQChAgAhmAFAAKYCACGxAQEAoQIAIbMBAgDCAgAhtAEBAKICACEF4QECAAAAAegBAgAAAAHpAQIAAAAB6gECAAAAAesBAgAAAAEGBgAAxAIAIIsBAQChAgAhmAFAAKYCACGxAQEAoQIAIbMBAgDCAgAhtAEBAKICACEFHAAA6AMAIB0AAOsDACDeAQAA6QMAIN8BAADqAwAg5AEAAAcAIAYGAADGAgAgiwEBAAAAAZgBQAAAAAGxAQEAAAABswECAAAAAbQBAQAAAAEDHAAA6AMAIN4BAADpAwAg5AEAAAcAIA0FAAD3AgAgBwAA-AIAIAoAAPkCACCLAQEAAAABmAFAAAAAAZkBQAAAAAGpAQEAAAABqgEBAAAAAasBAQAAAAGsAQgAAAABrQEIAAAAAa8BAAAArwECsAEIAAAAAQIAAAAHACAcAAD2AgAgAwAAAAcAIBwAAPYCACAdAADUAgAgARUAAOcDADASBAAAjQIAIAUAANwBACAHAACbAgAgCgAAnAIAIIgBAACZAgAwiQEAAAUAEIoBAACZAgAwiwEBAAAAAZgBQADbAQAhmQFAANsBACGoAQEA1gEAIakBAQDXAQAhqgEBANYBACGrAQEA1wEAIawBCAD-AQAhrQEIAP4BACGvAQAAmgKvASKwAQgAjAIAIQIAAAAHACAVAADUAgAgAgAAAM8CACAVAADQAgAgDogBAADOAgAwiQEAAM8CABCKAQAAzgIAMIsBAQDWAQAhmAFAANsBACGZAUAA2wEAIagBAQDWAQAhqQEBANcBACGqAQEA1gEAIasBAQDXAQAhrAEIAP4BACGtAQgA_gEAIa8BAACaAq8BIrABCACMAgAhDogBAADOAgAwiQEAAM8CABCKAQAAzgIAMIsBAQDWAQAhmAFAANsBACGZAUAA2wEAIagBAQDWAQAhqQEBANcBACGqAQEA1gEAIasBAQDXAQAhrAEIAP4BACGtAQgA_gEAIa8BAACaAq8BIrABCACMAgAhCosBAQChAgAhmAFAAKYCACGZAUAApgIAIakBAQCiAgAhqgEBAKECACGrAQEAogIAIawBCADRAgAhrQEIANECACGvAQAA0gKvASKwAQgA0wIAIQXhAQgAAAAB6AEIAAAAAekBCAAAAAHqAQgAAAAB6wEIAAAAAQHhAQAAAK8BAgXhAQgAAAAB6AEIAAAAAekBCAAAAAHqAQgAAAAB6wEIAAAAAQ0FAADVAgAgBwAA1gIAIAoAANcCACCLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGpAQEAogIAIaoBAQChAgAhqwEBAKICACGsAQgA0QIAIa0BCADRAgAhrwEAANICrwEisAEIANMCACEHHAAA3AMAIB0AAOUDACDeAQAA3QMAIN8BAADkAwAg4gEAAAMAIOMBAAADACDkAQAAMwAgBxwAAN8CACAdAADiAgAg3gEAAOACACDfAQAA4QIAIOIBAAAKACDjAQAACgAg5AEAAEsAIAccAADYAgAgHQAA2wIAIN4BAADZAgAg3wEAANoCACDiAQAAEQAg4wEAABEAIOQBAAAWACAGAQAA3gIAIIsBAQAAAAGYAUAAAAABsgEBAAAAAbMBAgAAAAG0AQEAAAABAgAAABYAIBwAANgCACADAAAAEQAgHAAA2AIAIB0AANwCACAIAAAAEQAgAQAA3QIAIBUAANwCACCLAQEAoQIAIZgBQACmAgAhsgEBAKECACGzAQIAwgIAIbQBAQCiAgAhBgEAAN0CACCLAQEAoQIAIZgBQACmAgAhsgEBAKECACGzAQIAwgIAIbQBAQCiAgAhBRwAAN8DACAdAADiAwAg3gEAAOADACDfAQAA4QMAIOQBAACnAQAgAxwAAN8DACDeAQAA4AMAIOQBAACnAQAgDQgAAPUCACCLAQEAAAABmAFAAAAAAZkBQAAAAAGvAQAAAMcBArYBCAAAAAG6AYAAAAABwwEBAAAAAcQBAQAAAAHFAQEAAAAByAEAAADIAQLJAQEAAAABygFAAAAAAQIAAABLACAcAADfAgAgAwAAAAoAIBwAAN8CACAdAADjAgAgDwAAAAoAIAgAAOcCACAVAADjAgAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhrwEAAOQCxwEitgEIANECACG6AYAAAAABwwEBAKECACHEAQEAoQIAIcUBAQCiAgAhyAEAAOUCyAEiyQEBAKICACHKAUAA5gIAIQ0IAADnAgAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhrwEAAOQCxwEitgEIANECACG6AYAAAAABwwEBAKECACHEAQEAoQIAIcUBAQCiAgAhyAEAAOUCyAEiyQEBAKICACHKAUAA5gIAIQHhAQAAAMcBAgHhAQAAAMgBAgHhAUAAAAABCxwAAOgCADAdAADtAgAw3gEAAOkCADDfAQAA6gIAMOABAADrAgAg4QEAAOwCADDiAQAA7AIAMOMBAADsAgAw5AEAAOwCADDlAQAA7gIAMOYBAADvAgAwCosBAQAAAAGYAUAAAAABmQFAAAAAAa8BAAAAuQECtgEIAAAAAbcBAQAAAAG5AQEAAAABugGAAAAAAbsBAQAAAAG8AUAAAAABAgAAAA4AIBwAAPQCACADAAAADgAgHAAA9AIAIB0AAPMCACABFQAA3gMAMA8HAACYAgAgiAEAAJYCADCJAQAADAAQigEAAJYCADCLAQEAAAABmAFAANsBACGZAUAA2wEAIa8BAACXArkBIrUBAQDWAQAhtgEIAP4BACG3AQEA1gEAIbkBAQAAAAG6AQAA_wEAILsBAQDWAQAhvAFAAIICACECAAAADgAgFQAA8wIAIAIAAADwAgAgFQAA8QIAIA6IAQAA7wIAMIkBAADwAgAQigEAAO8CADCLAQEA1gEAIZgBQADbAQAhmQFAANsBACGvAQAAlwK5ASK1AQEA1gEAIbYBCAD-AQAhtwEBANYBACG5AQEA1wEAIboBAAD_AQAguwEBANYBACG8AUAAggIAIQ6IAQAA7wIAMIkBAADwAgAQigEAAO8CADCLAQEA1gEAIZgBQADbAQAhmQFAANsBACGvAQAAlwK5ASK1AQEA1gEAIbYBCAD-AQAhtwEBANYBACG5AQEA1wEAIboBAAD_AQAguwEBANYBACG8AUAAggIAIQqLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGvAQAA8gK5ASK2AQgA0QIAIbcBAQChAgAhuQEBAKICACG6AYAAAAABuwEBAKECACG8AUAA5gIAIQHhAQAAALkBAgqLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGvAQAA8gK5ASK2AQgA0QIAIbcBAQChAgAhuQEBAKICACG6AYAAAAABuwEBAKECACG8AUAA5gIAIQqLAQEAAAABmAFAAAAAAZkBQAAAAAGvAQAAALkBArYBCAAAAAG3AQEAAAABuQEBAAAAAboBgAAAAAG7AQEAAAABvAFAAAAAAQQcAADoAgAw3gEAAOkCADDgAQAA6wIAIOQBAADsAgAwDQUAAPcCACAHAAD4AgAgCgAA-QIAIIsBAQAAAAGYAUAAAAABmQFAAAAAAakBAQAAAAGqAQEAAAABqwEBAAAAAawBCAAAAAGtAQgAAAABrwEAAACvAQKwAQgAAAABAxwAANwDACDeAQAA3QMAIOQBAAAzACADHAAA3wIAIN4BAADgAgAg5AEAAEsAIAMcAADYAgAg3gEAANkCACDkAQAAFgAgDgsAAJADACCLAQEAAAABmAFAAAAAAZkBQAAAAAGvAQAAANABArMBCAAAAAHLAQAAjgMAIMwBAACPAwAgzQEBAAAAAc4BAQAAAAHQASAAAAAB0QEIAAAAAdIBCAAAAAHTAQgAAAABAgAAADMAIBwAAPoCACADAAAAAwAgHAAA-gIAIB0AAP4CACAQAAAAAwAgCwAAggMAIBUAAP4CACCLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGvAQAAgQPQASKzAQgA0QIAIcsBAAD_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gAgDQAAqQIAIIsBAQChAgAhjAEBAKECACGNAQEAoQIAIY4BAQCiAgAhjwEBAKICACGRAQAAowKRASKTAQAApAKTASKUAQEAogIAIZUBIAClAgAhlgEgAKUCACGXASAApQIAIZgBQACmAgAhmQFAAKYCACEQCwAAkgMAIA0AAJMDACAOAACUAwAgiwEBAAAAAYwBAQAAAAGNAQEAAAABjgEBAAAAAY8BAQAAAAGRAQAAAJEBApMBAAAAkwEClAEBAAAAAZUBIAAAAAGWASAAAAABlwEgAAAAAZgBQAAAAAGZAUAAAAABAgAAAKcBACAcAADHAwAgAwAAAKoBACAcAADHAwAgHQAAywMAIBIAAACqAQAgCwAAqAIAIA0AAKkCACAOAACqAgAgFQAAywMAIIsBAQChAgAhjAEBAKECACGNAQEAoQIAIY4BAQCiAgAhjwEBAKICACGRAQAAowKRASKTAQAApAKTASKUAQEAogIAIZUBIAClAgAhlgEgAKUCACGXASAApQIAIZgBQACmAgAhmQFAAKYCACEQCwAAqAIAIA0AAKkCACAOAACqAgAgiwEBAKECACGMAQEAoQIAIY0BAQChAgAhjgEBAKICACGPAQEAogIAIZEBAACjApEBIpMBAACkApMBIpQBAQCiAgAhlQEgAKUCACGWASAApQIAIZcBIAClAgAhmAFAAKYCACGZAUAApgIAIQ4EAACNAwAgBQAA9wIAIAoAAPkCACCLAQEAAAABmAFAAAAAAZkBQAAAAAGoAQEAAAABqQEBAAAAAaoBAQAAAAGrAQEAAAABrAEIAAAAAa0BCAAAAAGvAQAAAK8BArABCAAAAAECAAAABwAgHAAAzAMAIAMAAAAFACAcAADMAwAgHQAA0AMAIBAAAAAFACAEAACLAwAgBQAA1QIAIAoAANcCACAVAADQAwAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhqAEBAKECACGpAQEAogIAIaoBAQChAgAhqwEBAKICACGsAQgA0QIAIa0BCADRAgAhrwEAANICrwEisAEIANMCACEOBAAAiwMAIAUAANUCACAKAADXAgAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhqAEBAKECACGpAQEAogIAIaoBAQChAgAhqwEBAKICACGsAQgA0QIAIa0BCADRAgAhrwEAANICrwEisAEIANMCACEOBgAAsAMAIIsBAQAAAAGYAUAAAAABmQFAAAAAAa8BAAAAxwECsQEBAAAAAbYBCAAAAAG6AYAAAAABwwEBAAAAAcQBAQAAAAHFAQEAAAAByAEAAADIAQLJAQEAAAABygFAAAAAAQIAAABLACAcAADRAwAgAwAAAAoAIBwAANEDACAdAADVAwAgEAAAAAoAIAYAAK8DACAVAADVAwAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhrwEAAOQCxwEisQEBAKECACG2AQgA0QIAIboBgAAAAAHDAQEAoQIAIcQBAQChAgAhxQEBAKICACHIAQAA5QLIASLJAQEAogIAIcoBQADmAgAhDgYAAK8DACCLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGvAQAA5ALHASKxAQEAoQIAIbYBCADRAgAhugGAAAAAAcMBAQChAgAhxAEBAKECACHFAQEAogIAIcgBAADlAsgBIskBAQCiAgAhygFAAOYCACEQDAAAkQMAIA0AAJMDACAOAACUAwAgiwEBAAAAAYwBAQAAAAGNAQEAAAABjgEBAAAAAY8BAQAAAAGRAQAAAJEBApMBAAAAkwEClAEBAAAAAZUBIAAAAAGWASAAAAABlwEgAAAAAZgBQAAAAAGZAUAAAAABAgAAAKcBACAcAADWAwAgAwAAAKoBACAcAADWAwAgHQAA2gMAIBIAAACqAQAgDAAApwIAIA0AAKkCACAOAACqAgAgFQAA2gMAIIsBAQChAgAhjAEBAKECACGNAQEAoQIAIY4BAQCiAgAhjwEBAKICACGRAQAAowKRASKTAQAApAKTASKUAQEAogIAIZUBIAClAgAhlgEgAKUCACGXASAApQIAIZgBQACmAgAhmQFAAKYCACEQDAAApwIAIA0AAKkCACAOAACqAgAgiwEBAKECACGMAQEAoQIAIY0BAQChAgAhjgEBAKICACGPAQEAogIAIZEBAACjApEBIpMBAACkApMBIpQBAQCiAgAhlQEgAKUCACGWASAApQIAIZcBIAClAgAhmAFAAKYCACGZAUAApgIAIQqLAQEAAAABmAFAAAAAAZkBQAAAAAGoAQEAAAABqgEBAAAAAasBAQAAAAGsAQgAAAABrQEIAAAAAa8BAAAArwECsAEIAAAAAQ8BAAC5AwAgiwEBAAAAAZgBQAAAAAGZAUAAAAABrwEAAADQAQKyAQEAAAABswEIAAAAAcsBAACOAwAgzAEAAI8DACDNAQEAAAABzgEBAAAAAdABIAAAAAHRAQgAAAAB0gEIAAAAAdMBCAAAAAECAAAAMwAgHAAA3AMAIAqLAQEAAAABmAFAAAAAAZkBQAAAAAGvAQAAALkBArYBCAAAAAG3AQEAAAABuQEBAAAAAboBgAAAAAG7AQEAAAABvAFAAAAAARALAACSAwAgDAAAkQMAIA4AAJQDACCLAQEAAAABjAEBAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAZEBAAAAkQECkwEAAACTAQKUAQEAAAABlQEgAAAAAZYBIAAAAAGXASAAAAABmAFAAAAAAZkBQAAAAAECAAAApwEAIBwAAN8DACADAAAAqgEAIBwAAN8DACAdAADjAwAgEgAAAKoBACALAACoAgAgDAAApwIAIA4AAKoCACAVAADjAwAgiwEBAKECACGMAQEAoQIAIY0BAQChAgAhjgEBAKICACGPAQEAogIAIZEBAACjApEBIpMBAACkApMBIpQBAQCiAgAhlQEgAKUCACGWASAApQIAIZcBIAClAgAhmAFAAKYCACGZAUAApgIAIRALAACoAgAgDAAApwIAIA4AAKoCACCLAQEAoQIAIYwBAQChAgAhjQEBAKECACGOAQEAogIAIY8BAQCiAgAhkQEAAKMCkQEikwEAAKQCkwEilAEBAKICACGVASAApQIAIZYBIAClAgAhlwEgAKUCACGYAUAApgIAIZkBQACmAgAhAwAAAAMAIBwAANwDACAdAADmAwAgEQAAAAMAIAEAALgDACAVAADmAwAgiwEBAKECACGYAUAApgIAIZkBQACmAgAhrwEAAIED0AEisgEBAKECACGzAQgA0QIAIcsBAAD_AgAgzAEAAIADACDNAQEAoQIAIc4BAQChAgAh0AEgAKUCACHRAQgA0wIAIdIBCADTAgAh0wEIANECACEPAQAAuAMAIIsBAQChAgAhmAFAAKYCACGZAUAApgIAIa8BAACBA9ABIrIBAQChAgAhswEIANECACHLAQAA_wIAIMwBAACAAwAgzQEBAKECACHOAQEAoQIAIdABIAClAgAh0QEIANMCACHSAQgA0wIAIdMBCADRAgAhCosBAQAAAAGYAUAAAAABmQFAAAAAAakBAQAAAAGqAQEAAAABqwEBAAAAAawBCAAAAAGtAQgAAAABrwEAAACvAQKwAQgAAAABDgQAAI0DACAFAAD3AgAgBwAA-AIAIIsBAQAAAAGYAUAAAAABmQFAAAAAAagBAQAAAAGpAQEAAAABqgEBAAAAAasBAQAAAAGsAQgAAAABrQEIAAAAAa8BAAAArwECsAEIAAAAAQIAAAAHACAcAADoAwAgAwAAAAUAIBwAAOgDACAdAADsAwAgEAAAAAUAIAQAAIsDACAFAADVAgAgBwAA1gIAIBUAAOwDACCLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGoAQEAoQIAIakBAQCiAgAhqgEBAKECACGrAQEAogIAIawBCADRAgAhrQEIANECACGvAQAA0gKvASKwAQgA0wIAIQ4EAACLAwAgBQAA1QIAIAcAANYCACCLAQEAoQIAIZgBQACmAgAhmQFAAKYCACGoAQEAoQIAIakBAQCiAgAhqgEBAKECACGrAQEAogIAIawBCADRAgAhrQEIANECACGvAQAA0gKvASKwAQgA0wIAIQWLAQEAAAABmAFAAAAAAbEBAQAAAAGzAQIAAAABtAEBAAAAAQaLAQEAAAABmAFAAAAAAasBAQAAAAHZAQAAANkBAtoBAQAAAAHbAQEAAAABAQ8AAgUJAAoLFAQMBAMNFwgOGgEDAQACCQAJCwgEBAQAAgUJAwcLBQoSCAMGAAQIDwYJAAcBBwAFAQgQAAIBAAIGAAQBCxMAAwsbAA0cAA4dAAABDwACAQ8AAgMJAA8iABAjABEAAAADCQAPIgAQIwARAQEAAgEBAAIFCQAWIgAZIwAaNAAXNQAYAAAAAAAFCQAWIgAZIwAaNAAXNQAYAQYABAEGAAQFCQAfIgAiIwAjNAAgNQAhAAAAAAAFCQAfIgAiIwAjNAAgNQAhAQcABQEHAAUFCQAoIgArIwAsNAApNQAqAAAAAAAFCQAoIgArIwAsNAApNQAqAgEAAgYABAIBAAIGAAQFCQAxIgA0IwA1NAAyNQAzAAAAAAAFCQAxIgA0IwA1NAAyNQAzAgQAAgWZAQMCBAACBZ8BAwUJADoiAD0jAD40ADs1ADwAAAAAAAUJADoiAD0jAD40ADs1ADwAAAMJAEMiAEQjAEUAAAADCQBDIgBEIwBFEAIBER4BEh8BEyABFCEBFiMBFyULGCYMGSgBGioLGysNHiwBHy0BIC4LJDEOJTISJjQDJzUDKDcDKTgDKjkDKzsDLD0LLT4TLkADL0ILMEMUMUQDMkUDM0YLNkkVN0obOEwFOU0FOk8FO1AFPFEFPVMFPlULP1YcQFgFQVoLQlsdQ1wFRF0FRV4LRmEeR2IkSGMGSWQGSmUGS2YGTGcGTWkGTmsLT2wlUG4GUXALUnEmU3IGVHMGVXQLVncnV3gtWHkIWXoIWnsIW3wIXH0IXX8IXoEBC1-CAS5ghAEIYYYBC2KHAS9jiAEIZIkBCGWKAQtmjQEwZ44BNmiPAQRpkAEEapEBBGuSAQRskwEEbZUBBG6XAQtvmAE3cJsBBHGdAQtyngE4c6ABBHShAQR1ogELdqUBOXemAT94qAECeakBAnqsAQJ7rQECfK4BAn2wAQJ-sgELf7MBQIABtQECgQG3AQuCAbgBQYMBuQEChAG6AQKFAbsBC4YBvgFChwG_AUY"
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
  AdminActivityScalarFieldEnum: () => AdminActivityScalarFieldEnum,
  AnyNull: () => AnyNull2,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MechanicProfileScalarFieldEnum: () => MechanicProfileScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  RefundScalarFieldEnum: () => RefundScalarFieldEnum,
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
  AdminActivity: "AdminActivity",
  MechanicProfile: "MechanicProfile",
  Payment: "Payment",
  Refund: "Refund",
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
var AdminActivityScalarFieldEnum = {
  id: "id",
  adminId: "adminId",
  action: "action",
  targetType: "targetType",
  targetId: "targetId",
  description: "description",
  createdAt: "createdAt"
};
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
  currency: "currency",
  merchantInvoiceNumber: "merchantInvoiceNumber",
  transactionId: "transactionId",
  gatewayResponse: "gatewayResponse",
  status: "status",
  method: "method",
  confirmedBy: "confirmedBy",
  paidAt: "paidAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var RefundScalarFieldEnum = {
  id: "id",
  paymentId: "paymentId",
  amount: "amount",
  reason: "reason",
  status: "status",
  gatewayRefundId: "gatewayRefundId",
  gatewayResponse: "gatewayResponse",
  requestedBy: "requestedBy",
  processedAt: "processedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
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
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/enums.ts
var Role = {
  CUSTOMER: "CUSTOMER",
  MECHANIC: "MECHANIC",
  ADMIN: "ADMIN"
};
var MechanicStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED"
};
var RequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EN_ROUTE: "EN_ROUTE",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var AuthProvider = {
  GOOGLE: "GOOGLE",
  CREDENTIAL: "CREDENTIAL"
};
var PaymentStatus = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUND_REQUESTED: "REFUND_REQUESTED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED"
};
var RefundStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  FAILED: "FAILED"
};
var AdminAction = {
  USER_BLOCKED: "USER_BLOCKED",
  USER_UNBLOCKED: "USER_UNBLOCKED",
  MECHANIC_APPROVED: "MECHANIC_APPROVED",
  MECHANIC_REJECTED: "MECHANIC_REJECTED",
  REFUND_APPROVED: "REFUND_APPROVED",
  REFUND_REJECTED: "REFUND_REJECTED",
  REFUND_PROCESSED: "REFUND_PROCESSED"
};

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

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

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = async (err, _req, res, _next) => {
  if (config_default.node_env === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  const errorName = err.name || "Internal Server Error";
  let errorDetails = void 0;
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof MulterError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = err.message;
  } else if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      path: String(issue.path[issue.path.length - 1]),
      // ✅
      message: issue.message
    }));
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Database request error";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please check your credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
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
import httpStatus2 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus2.NOT_FOUND).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/routes/index.ts
import { Router as Router7 } from "express";

// src/modules/auth/auth.validation.ts
import { z } from "zod";
var registerCustomerValidationSchema = z.object({
  body: z.object({
    name: z.string({ error: "Name is required" }).min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    password: z.string({ error: "Password is required" }).min(6, "Password must be at least 6 characters").max(30, "Password must not exceed 30 characters"),
    // only these two roles can self-register (ADMIN can never be chosen here)
    role: z.enum(["CUSTOMER", "MECHANIC"]).optional()
  })
});
var verifyEmailValidationSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    otp: z.string({ error: "OTP is required" }).length(6, "OTP must be exactly 6 digits")
  })
});
var resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase()
  })
});
var forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase()
  })
});
var resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    otp: z.string({ error: "OTP is required" }).length(6, "OTP must be exactly 6 digits"),
    newPassword: z.string({ error: "New password is required" }).min(6, "Password must be at least 6 characters").max(30, "Password must not exceed 30 characters")
  })
});
var loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email is required" }).email("Invalid email format").toLowerCase(),
    password: z.string({ error: "Password is required" }).min(6, "Password must be at least 6 characters")
  })
});
var googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string({ error: "idToken is required" }).min(1, "idToken is required")
  })
});
var AuthValidation = {
  googleAuthSchema,
  registerCustomerValidationSchema,
  verifyEmailValidationSchema,
  resendOtpSchema,
  loginValidationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
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
import httpStatus3 from "http-status";

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
    throw new AppError("Invalid Google Token", 401);
  }
  return {
    email: payload.email,
    name: payload.name || "Google User",
    googleId: payload.sub
  };
};

// src/modules/auth/auth.service.ts
import ejs from "ejs";
var register = async (payload) => {
  const { name, email, password, role } = payload;
  const isExistUser = await prisma.user.findUnique({
    where: { email }
  });
  const allowedRoles = [Role.CUSTOMER, Role.MECHANIC];
  const finalRole = role && allowedRoles.includes(role) ? role : Role.CUSTOMER;
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
  const redisUserPayload = { name, email, password: hashedPassword, role: finalRole };
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
    throw new AppError("This account is not accessible", httpStatus3.FORBIDDEN);
  }
  const otpKey = `customer-registration-otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) {
    throw new AppError("OTP expired or invalid", httpStatus3.GONE);
  }
  if (storedOtp !== otp) {
    throw new AppError("OTP does not match", httpStatus3.BAD_REQUEST);
  }
  await redisClient.del(otpKey);
  const customerRegistrationKey = `customer-registration-data:${email}`;
  const redisCustomerData = await redisClient.get(customerRegistrationKey);
  if (!redisCustomerData) {
    throw new AppError(
      "Registration data not found or expired",
      httpStatus3.NOT_FOUND
    );
  }
  const customerPayload = JSON.parse(redisCustomerData);
  const user = await prisma.user.create({
    data: {
      name: customerPayload.name,
      email: customerPayload.email,
      password: customerPayload.password,
      authProvider: AuthProvider.CREDENTIAL,
      role: customerPayload.role
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
var resendOtp = async (payload) => {
  const email = payload.email.trim().toLowerCase();
  const OTP_EXPIRY_SECONDS = 5 * 60;
  const RESEND_COOLDOWN_SECONDS = 30;
  const otpKey = `customer-registration-otp:${email}`;
  const registrationKey = `customer-registration-data:${email}`;
  const cooldownKey = `customer-registration-resend-cooldown:${email}`;
  const redisCustomerData = await redisClient.get(registrationKey);
  if (!redisCustomerData) {
    throw new AppError(
      "Registration data not found or expired. Please register again.",
      httpStatus3.NOT_FOUND
    );
  }
  const onCooldown = await redisClient.get(cooldownKey);
  if (onCooldown) {
    throw new AppError(
      "Please wait before requesting another code",
      httpStatus3.TOO_MANY_REQUESTS
    );
  }
  const customerPayload = JSON.parse(redisCustomerData);
  const isExistUser = await prisma.user.findUnique({ where: { email } });
  if (isExistUser) {
    throw new AppError("A user with this email already exists.", httpStatus3.CONFLICT);
  }
  const otpValue = crypto.randomInt(1e5, 1e6).toString();
  console.log(otpValue, "resend");
  await redisClient.set(otpKey, otpValue, {
    expiration: { type: "EX", value: OTP_EXPIRY_SECONDS }
  });
  await redisClient.set(registrationKey, redisCustomerData, {
    expiration: { type: "EX", value: OTP_EXPIRY_SECONDS }
  });
  await redisClient.set(cooldownKey, "1", {
    expiration: { type: "EX", value: RESEND_COOLDOWN_SECONDS }
  });
  const templatePath = path3.join(
    process.cwd(),
    "src/templates/registration-user-otp.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name: customerPayload.name,
    email,
    otp: otpValue,
    expirationMinutes: OTP_EXPIRY_SECONDS / 60
  });
  await transporter.sendMail({
    from: config_default.email_sender,
    to: email,
    subject: "Email verfication",
    html
  });
};
var login = async (payload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("User not found", httpStatus3.NOT_FOUND);
  }
  if (user.isBlocked) {
    throw new AppError("User is blocked", httpStatus3.FORBIDDEN);
  }
  if (user.isDeleted) {
    throw new AppError("User is deleted", httpStatus3.GONE);
  }
  if (!user.password) {
    throw new AppError(
      "This account uses Google sign-in. Please log in with Google.",
      httpStatus3.BAD_REQUEST
    );
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError("Invalid credentials", httpStatus3.BAD_REQUEST);
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
var getMe = async (user) => {
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus3.UNAUTHORIZED
    );
  }
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { requests: true, reviews: true },
    omit: { password: true }
  });
  if (!isUserExists) {
    throw new AppError("User not found", httpStatus3.NOT_FOUND);
  }
  return isUserExists;
};
var refreshToken = async (token) => {
  const isBlacklisted = await redisClient.get(`blacklist-refresh:${token}`);
  if (isBlacklisted) {
    throw new AppError("Refresh token is no longer valid", httpStatus3.UNAUTHORIZED);
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config_default.jwt_refresh_secret
  );
  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError(
      config_default.node_env === "development" ? String(verifiedRefreshToken.error) : "Invalid refresh token",
      httpStatus3.UNAUTHORIZED
    );
  }
  const data = verifiedRefreshToken.data;
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user || user.isDeleted || user.isBlocked) {
    throw new AppError("User is inactive or not found", httpStatus3.UNAUTHORIZED);
  }
  const remainingTTL = data.exp - Math.floor(Date.now() / 1e3);
  if (remainingTTL > 0) {
    await redisClient.set(`blacklist-refresh:${token}`, "1", {
      expiration: { type: "EX", value: remainingTTL }
    });
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
    throw new AppError("User is blocked", httpStatus3.FORBIDDEN);
  }
  if (user.isDeleted) {
    throw new AppError("User is deleted", httpStatus3.GONE);
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
    throw new AppError("User does not exist", httpStatus3.NOT_FOUND);
  }
  if (isUserExists.isBlocked || isUserExists.isDeleted) {
    throw new AppError("User is blocked or deleted", httpStatus3.FORBIDDEN);
  }
  if (isUserExists.authProvider !== AuthProvider.CREDENTIAL) {
    throw new AppError(
      "This account uses Google sign-in and has no password to reset",
      httpStatus3.BAD_REQUEST
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
    throw new AppError("User does not exist", httpStatus3.NOT_FOUND);
  }
  if (isUserExists?.isDeleted || isUserExists?.isBlocked) {
    throw new AppError("This account is not accessible", httpStatus3.FORBIDDEN);
  }
  if (isUserExists.authProvider !== AuthProvider.CREDENTIAL) {
    throw new AppError(
      "This account uses Google sign-in and has no password to reset",
      httpStatus3.BAD_REQUEST
    );
  }
  const otpKey = `forget-password:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) {
    throw new AppError("OTP expired or invalid", httpStatus3.GONE);
  }
  if (storedOtp !== otp) {
    throw new AppError("OTP does not match", httpStatus3.BAD_REQUEST);
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
  const html = await ejs.renderFile(templatePath, {
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
var logout = async (refreshTokenValue) => {
  if (!refreshTokenValue) {
    return;
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshTokenValue,
    config_default.jwt_refresh_secret
  );
  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    return;
  }
  const data = verifiedRefreshToken.data;
  const remainingTTL = data.exp - Math.floor(Date.now() / 1e3);
  if (remainingTTL > 0) {
    await redisClient.set(`blacklist-refresh:${refreshTokenValue}`, "1", {
      expiration: {
        type: "EX",
        value: remainingTTL
      }
    });
  }
};
var AuthService = {
  register,
  verifycustomerEmail,
  resendOtp,
  refreshToken,
  login,
  getMe,
  googleAuth,
  forgotPassword,
  resetPassword,
  logout
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
import httpStatus4 from "http-status";

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
var isProd = config_default.node_env === "development" ? false : true;
var getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 1e3 * 60 * 15
});
var getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 1e3 * 60 * 60 * 24 * 7
});
var register2 = catchAsync(async (req, res, Next) => {
  const payload = req.body;
  const result = await AuthService.register(payload);
  sendResponse(res, {
    statusCode: httpStatus4.CREATED,
    success: true,
    message: "OTP send successfully",
    data: result
  });
});
var verficationEmail = catchAsync(async (req, res, Next) => {
  const payload = req.body;
  const result = await AuthService.verifycustomerEmail(payload);
  res.cookie("accessToken", result.accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", result.refreshToken, getRefreshTokenCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus4.CREATED,
    success: true,
    message: "verify email successfully",
    data: result
  });
});
var resendOtp2 = catchAsync(async (req, res) => {
  await AuthService.resendOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "A new verification code has been sent to your email",
    data: null
  });
});
var login2 = catchAsync(async (req, res, Next) => {
  const payload = req.body;
  const result = await AuthService.login(payload);
  const { accessToken, refreshToken: refreshToken3 } = result;
  res.cookie(
    "accessToken",
    accessToken,
    getAccessTokenCookieOptions()
  );
  res.cookie("refreshToken", refreshToken3, getRefreshTokenCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    // FIX: login success হলো CREATED (201) না, OK (200) হওয়া উচিত
    success: true,
    message: "User Login Successfully",
    data: result
  });
});
var getMe2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus4.UNAUTHORIZED
    );
  }
  const result = await AuthService.getMe(user);
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result
  });
});
var refreshToken2 = catchAsync(async (req, res) => {
  if (!req.cookies.refreshToken) {
    throw new AppError("Refresh token is missing", httpStatus4.UNAUTHORIZED);
  }
  const result = await AuthService.refreshToken(req.cookies.refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = result;
  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "New tokens generated successfully",
    data: null
    // FIX: cookie-তেই token আছে, body-তে আবার পাঠানোর দরকার নেই (httpOnly-র purpose নষ্ট হয়)
  });
});
var googleAuth2 = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new AppError("Google idToken is required", httpStatus4.BAD_REQUEST);
  }
  const result = await AuthService.googleAuth(idToken);
  res.cookie("accessToken", result.accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", result.refreshToken, getRefreshTokenCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Google authentication successful",
    data: { user: result.user }
  });
});
var forgotPassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.forgotPassword(payload);
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "OTP sent successfully",
    data: result
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.resetPassword(payload);
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Reset Password Successfully",
    data: result
  });
});
var logout2 = catchAsync(async (req, res) => {
  const refreshTokenValue = req.cookies.refreshToken;
  await AuthService.logout(refreshTokenValue);
  res.clearCookie("accessToken", getAccessTokenCookieOptions());
  res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
  sendResponse(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Logged out successfully",
    data: null
  });
});
var AuthControllers = {
  register: register2,
  verficationEmail,
  resendOtp: resendOtp2,
  login: login2,
  getMe: getMe2,
  refreshToken: refreshToken2,
  googleAuth: googleAuth2,
  forgotPassword: forgotPassword2,
  resetPassword: resetPassword2,
  logout: logout2
};

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/middlewares/validationRequest.ts
var validateRequest = (schema) => {
  return catchAsync(async (req, res, next) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query
    });
    if (parsed.body !== void 0) {
      req.body = parsed.body;
    }
    next();
  });
};

// src/middlewares/checkAuth.ts
import jwt2 from "jsonwebtoken";
import httpStatus5 from "http-status";
var auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies?.accessToken ? req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.headers.authorization;
    if (!token) {
      throw new AppError("You are not authorized", httpStatus5.UNAUTHORIZED);
    }
    let decoded;
    try {
      decoded = jwt2.verify(token, config_default.jwt_access_secret);
    } catch (err) {
      throw new AppError("Invalid or expired token", httpStatus5.UNAUTHORIZED);
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
        httpStatus5.FORBIDDEN
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
router.post("/resend-otp", validateRequest(AuthValidation.resendOtpSchema), AuthControllers.resendOtp);
router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthControllers.login);
router.get("/me", auth(Role.CUSTOMER, Role.MECHANIC, Role.ADMIN), AuthControllers.getMe);
router.post("/refresh-token", AuthControllers.refreshToken);
router.post("/google", validateRequest(AuthValidation.googleAuthSchema), AuthControllers.googleAuth);
router.post("/forgot-password", validateRequest(AuthValidation.forgotPasswordSchema), AuthControllers.forgotPassword);
router.post("/reset-password", validateRequest(AuthValidation.resetPasswordSchema), AuthControllers.resetPassword);
router.post("/logout", AuthControllers.logout);
var AuthRoutes = router;

// src/modules/mechanic/mechanic.controller.ts
import httpStatus7 from "http-status";

// src/modules/mechanic/mechanic.service.ts
import httpStatus6 from "http-status";

// src/utils/geo.ts
var getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// src/utils/logAdminActivity.ts
var logAdminActivity = async (payload) => {
  try {
    await prisma.adminActivity.create({ data: payload });
  } catch (error) {
    console.error("Failed to save admin activity:", error);
  }
};

// src/modules/mechanic/mechanic.service.ts
var createProfile = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", httpStatus6.NOT_FOUND);
  }
  if (user.role !== Role.MECHANIC) {
    throw new AppError(
      "Only mechanic accounts can create a mechanic profile",
      httpStatus6.FORBIDDEN
    );
  }
  const existingProfile = await prisma.mechanicProfile.findUnique({
    where: { userId }
  });
  if (existingProfile) {
    throw new AppError(
      "Mechanic profile already exists for this user",
      httpStatus6.CONFLICT
    );
  }
  const profile = await prisma.mechanicProfile.create({
    data: {
      userId,
      serviceTypes: payload.serviceTypes,
      licenseDoc: payload.licenseDoc,
      nidDoc: payload.nidDoc,
      vehiclePhoto: payload.vehiclePhoto,
      serviceRadius: payload.serviceRadius ?? 10
    }
  });
  return profile;
};
var getMyProfile = async (userId) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  return profile;
};
var toggleAvailability = async (userId, isAvailable) => {
  const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  if (profile.status !== "APPROVED" && isAvailable) {
    throw new AppError(
      "Your account is not yet approved. You cannot go online.",
      httpStatus6.FORBIDDEN
    );
  }
  return prisma.mechanicProfile.update({
    where: { userId },
    data: { isAvailable }
  });
};
var updateLocation = async (userId, lat, lng) => {
  if (typeof lat !== "number" || typeof lng !== "number" || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new AppError(
      "Invalid coordinates. lat must be -90 to 90, lng must be -180 to 180",
      httpStatus6.BAD_REQUEST
    );
  }
  const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  return prisma.mechanicProfile.update({
    where: { userId },
    data: { currentLat: lat, currentLng: lng },
    select: { id: true, currentLat: true, currentLng: true, updatedAt: true }
  });
};
var getMyJobs = async (userId, status) => {
  if (status && !Object.values(RequestStatus).includes(status)) {
    throw new AppError("Invalid status filter", httpStatus6.BAD_REQUEST);
  }
  const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  return prisma.serviceRequest.findMany({
    where: {
      mechanicId: profile.id,
      ...status && { status }
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      payment: true
    },
    orderBy: { updatedAt: "desc" }
  });
};
var getMyStats = async (userId) => {
  const profile = await prisma.mechanicProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  const [byStatus, paid, unpaid] = await Promise.all([
    prisma.serviceRequest.groupBy({
      by: ["status"],
      where: { mechanicId: profile.id },
      _count: { _all: true }
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", request: { mechanicId: profile.id } },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ["UNPAID", "PENDING"] },
        request: { mechanicId: profile.id }
      },
      _sum: { amount: true }
    })
  ]);
  const count = (s) => byStatus.find((row) => row.status === s)?._count._all ?? 0;
  return {
    jobs: {
      active: count("ACCEPTED") + count("EN_ROUTE") + count("IN_PROGRESS"),
      completed: count("COMPLETED"),
      cancelled: count("CANCELLED")
    },
    earnings: {
      paid: paid._sum.amount ?? 0,
      unpaid: unpaid._sum.amount ?? 0
    },
    rating: profile.rating
  };
};
var searchNearby = async (query) => {
  const candidates = await prisma.mechanicProfile.findMany({
    where: {
      status: MechanicStatus.APPROVED,
      isAvailable: true,
      currentLat: { not: null },
      currentLng: { not: null },
      ...query.serviceType && { serviceTypes: { has: query.serviceType } }
    },
    select: {
      id: true,
      rating: true,
      serviceTypes: true,
      serviceRadius: true,
      currentLat: true,
      currentLng: true,
      user: { select: { name: true } },
      _count: { select: { requests: { where: { status: "COMPLETED" } } } }
    }
  });
  const round = (n) => Math.round(n * 1e3) / 1e3;
  return candidates.map((m) => ({
    id: m.id,
    name: m.user.name,
    rating: m.rating,
    serviceTypes: m.serviceTypes,
    serviceRadius: m.serviceRadius,
    completedJobs: m._count.requests,
    lat: round(m.currentLat),
    lng: round(m.currentLng),
    distanceKm: getDistanceInKm(
      query.lat,
      query.lng,
      m.currentLat,
      m.currentLng
    )
  })).filter((m) => m.distanceKm <= query.radiusKm && m.distanceKm <= m.serviceRadius).sort((a, b) => a.distanceKm - b.distanceKm || b.rating - a.rating);
};
var getAllProfiles = async (status) => {
  if (status && !Object.values(MechanicStatus).includes(status)) {
    throw new AppError("Invalid status filter", httpStatus6.BAD_REQUEST);
  }
  return prisma.mechanicProfile.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var approveProfile = async (mechanicProfileId, adminId) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { id: mechanicProfileId }
  });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  if (profile.status !== "PENDING") {
    throw new AppError(
      "Only pending profiles can be approved",
      httpStatus6.BAD_REQUEST
    );
  }
  const updated = await prisma.mechanicProfile.update({
    where: { id: mechanicProfileId },
    data: { status: "APPROVED" },
    include: { user: { select: { email: true } } }
  });
  await logAdminActivity({
    adminId,
    action: AdminAction.MECHANIC_APPROVED,
    targetType: "MECHANIC_PROFILE",
    targetId: mechanicProfileId,
    description: `Approved mechanic ${updated.user.email}`
  });
  return updated;
};
var rejectProfile = async (mechanicProfileId, adminId) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { id: mechanicProfileId }
  });
  if (!profile) {
    throw new AppError("Mechanic profile not found", httpStatus6.NOT_FOUND);
  }
  if (profile.status !== MechanicStatus.PENDING) {
    throw new AppError(
      "Only pending profiles can be rejected",
      httpStatus6.BAD_REQUEST
    );
  }
  const updated = await prisma.mechanicProfile.update({
    where: { id: mechanicProfileId },
    data: { status: MechanicStatus.REJECTED },
    include: { user: { select: { email: true } } }
  });
  await logAdminActivity({
    adminId,
    action: AdminAction.MECHANIC_REJECTED,
    targetType: "MECHANIC_PROFILE",
    targetId: mechanicProfileId,
    description: `Rejected mechanic ${updated.user.email}`
  });
  return updated;
};
var MechanicService = {
  createProfile,
  getMyProfile,
  toggleAvailability,
  updateLocation,
  getMyJobs,
  getMyStats,
  searchNearby,
  getAllProfiles,
  approveProfile,
  rejectProfile
};

// src/modules/mechanic/mechanic.validation.ts
import { z as z3 } from "zod";

// src/utils/commonValidation.ts
import { z as z2 } from "zod";
var idParams = z2.object({
  id: z2.uuid("Invalid id")
});
var latitude = z2.number({ error: "Latitude must be a number" }).min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90");
var longitude = z2.number({ error: "Longitude must be a number" }).min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180");
var phone = z2.string({ error: "Phone must be a string" }).regex(/^\+?[0-9]{7,15}$/, "Invalid phone number");

// src/modules/mechanic/mechanic.validation.ts
var toggleAvailabilitySchema = z3.object({
  body: z3.object({
    isAvailable: z3.boolean({ error: "isAvailable must be a boolean (true or false)" })
  })
});
var updateLocationSchema = z3.object({
  body: z3.object({
    lat: latitude,
    lng: longitude
  })
});
var listProfilesSchema = z3.object({
  query: z3.object({
    status: z3.enum(MechanicStatus, { error: "Invalid status filter" }).optional()
  })
});
var listJobsSchema = z3.object({
  query: z3.object({
    status: z3.enum(RequestStatus, { error: "Invalid status filter" }).optional()
  })
});
var nearbySearchSchema = z3.object({
  query: z3.object({
    lat: z3.coerce.number({ error: "lat must be a number" }).min(-90).max(90),
    lng: z3.coerce.number({ error: "lng must be a number" }).min(-180).max(180),
    serviceType: z3.string().trim().toLowerCase().max(50).optional(),
    radiusKm: z3.coerce.number({ error: "radiusKm must be a number" }).positive("radiusKm must be greater than zero").max(50, "radiusKm must not exceed 50").default(15)
  })
});
var profileIdSchema = z3.object({
  params: idParams
});
var MechanicValidation = {
  toggleAvailabilitySchema,
  updateLocationSchema,
  listProfilesSchema,
  listJobsSchema,
  nearbySearchSchema,
  profileIdSchema
};

// src/lib/cloudinary.ts
import { v2 as Cloudinary } from "cloudinary";
Cloudinary.config({
  cloud_name: config_default.cloudinary_name,
  api_key: config_default.cloudinary_api_key,
  api_secret: config_default.cloudinary_api_secret
});
var cloudinary = Cloudinary;

// src/utils/uploadToCloudinary.ts
var uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `roadside/${folder}`,
        // e.g. roadside/nid
        resource_type: "auto"
        // image + pdf dutoi support kore
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};
var deleteFromCloudinary = async (publicIds) => {
  await Promise.allSettled(
    publicIds.map((id) => cloudinary.uploader.destroy(id))
  );
};

// src/modules/mechanic/mechanic.controller.ts
var MAX_SERVICE_TYPES = 10;
var MAX_LENGTH = 40;
var getRequestUser = (req) => {
  const user = req.user;
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus7.UNAUTHORIZED
    );
  }
  return user;
};
var parseServiceTypes = (raw3) => {
  let value = raw3;
  if (typeof value === "string") {
    const str = value.trim();
    if (str.startsWith("[")) {
      try {
        value = JSON.parse(str);
      } catch {
        throw new AppError(
          "serviceTypes is not valid JSON",
          httpStatus7.BAD_REQUEST
        );
      }
    } else {
      value = str.split(",");
    }
  }
  if (!Array.isArray(value)) {
    throw new AppError("serviceTypes must be a list", httpStatus7.BAD_REQUEST);
  }
  const cleaned = value.filter((v) => typeof v === "string").map((v) => v.trim().replace(/\s+/g, " ").toLowerCase()).filter((v) => v !== "");
  const unique = [...new Set(cleaned)];
  if (unique.length === 0) {
    throw new AppError(
      "At least one service type is required",
      httpStatus7.BAD_REQUEST
    );
  }
  if (unique.length > MAX_SERVICE_TYPES) {
    throw new AppError(
      `Maximum ${MAX_SERVICE_TYPES} service types allowed`,
      httpStatus7.BAD_REQUEST
    );
  }
  if (unique.some((v) => v.length > MAX_LENGTH)) {
    throw new AppError(
      `Each service type must be at most ${MAX_LENGTH} characters`,
      httpStatus7.BAD_REQUEST
    );
  }
  return unique;
};
var createProfile2 = catchAsync(async (req, res) => {
  const user = getRequestUser(req);
  const files = req.files;
  const nid = files?.nidDoc?.[0];
  const license = files?.licenseDoc?.[0];
  const vehiclePhotos = files?.vehiclePhoto ?? [];
  if (!nid || !license || vehiclePhotos.length === 0) {
    throw new AppError(
      "nidDoc, licenseDoc and vehiclePhoto are required",
      httpStatus7.BAD_REQUEST
    );
  }
  const serviceTypes = parseServiceTypes(req.body.serviceTypes);
  const serviceRadius = req.body.serviceRadius ? Number(req.body.serviceRadius) : void 0;
  if (serviceRadius !== void 0 && (Number.isNaN(serviceRadius) || serviceRadius <= 0)) {
    throw new AppError(
      "serviceRadius must be a positive number",
      httpStatus7.BAD_REQUEST
    );
  }
  const results = await Promise.allSettled([
    uploadToCloudinary(nid, "nid"),
    uploadToCloudinary(license, "license"),
    ...vehiclePhotos.map((photo) => uploadToCloudinary(photo, "vehicle"))
  ]);
  const uploaded = results.filter(
    (r) => r.status === "fulfilled"
  ).map((r) => r.value);
  if (uploaded.length !== results.length) {
    await deleteFromCloudinary(uploaded.map((u) => u.public_id));
    throw new AppError(
      "File upload failed, please try again",
      httpStatus7.BAD_GATEWAY
    );
  }
  const [nidRes, licenseRes, ...vehicleRes] = uploaded;
  try {
    const profile = await MechanicService.createProfile(user.userId, {
      serviceTypes,
      serviceRadius,
      nidDoc: nidRes.secure_url,
      licenseDoc: licenseRes.secure_url,
      vehiclePhoto: vehicleRes.map((v) => v.secure_url)
    });
    sendResponse(res, {
      statusCode: httpStatus7.CREATED,
      success: true,
      message: "Mechanic profile created",
      data: profile
    });
  } catch (err) {
    await deleteFromCloudinary([
      nidRes.public_id,
      licenseRes.public_id,
      ...vehicleRes.map((v) => v.public_id)
    ]);
    throw err;
  }
});
var getMyProfile2 = catchAsync(async (req, res) => {
  const user = getRequestUser(req);
  const result = await MechanicService.getMyProfile(user.userId);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Mechanic profile fetched successfully",
    data: result
  });
});
var toggleAvailability2 = catchAsync(async (req, res) => {
  const user = getRequestUser(req);
  const { isAvailable } = req.body;
  if (typeof isAvailable !== "boolean") {
    throw new AppError(
      "isAvailable must be a boolean (true or false)",
      httpStatus7.BAD_REQUEST
    );
  }
  const result = await MechanicService.toggleAvailability(
    user.userId,
    isAvailable
  );
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: isAvailable ? "You are now online" : "You are now offline",
    data: result
  });
});
var updateLocation2 = catchAsync(async (req, res) => {
  const user = getRequestUser(req);
  const { lat, lng } = req.body;
  const result = await MechanicService.updateLocation(user.userId, lat, lng);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Location updated successfully",
    data: result
  });
});
var getMyJobs2 = catchAsync(async (req, res) => {
  const user = getRequestUser(req);
  const status = req.query.status;
  const result = await MechanicService.getMyJobs(user.userId, status);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Jobs fetched successfully",
    data: result
  });
});
var getMyStats2 = catchAsync(async (req, res) => {
  const user = getRequestUser(req);
  const result = await MechanicService.getMyStats(user.userId);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Mechanic stats fetched successfully",
    data: result
  });
});
var searchNearby2 = catchAsync(async (req, res) => {
  const query = MechanicValidation.nearbySearchSchema.shape.query.parse(req.query);
  const result = await MechanicService.searchNearby(query);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Nearby mechanics fetched successfully",
    data: result
  });
});
var getAllProfiles2 = catchAsync(async (req, res) => {
  const status = req.query.status;
  const result = await MechanicService.getAllProfiles(status);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Mechanic profiles fetched successfully",
    data: result
  });
});
var approveProfile2 = catchAsync(async (req, res) => {
  const admin = getRequestUser(req);
  const profileId = req.params.id;
  const result = await MechanicService.approveProfile(profileId, admin.userId);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Mechanic profile approved successfully",
    data: result
  });
});
var rejectProfile2 = catchAsync(async (req, res) => {
  const profileId = req.params.id;
  const admin = getRequestUser(req);
  const result = await MechanicService.rejectProfile(profileId, admin.userId);
  sendResponse(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: "Mechanic profile rejected",
    data: result
  });
});
var MechanicController = {
  createProfile: createProfile2,
  getMyProfile: getMyProfile2,
  toggleAvailability: toggleAvailability2,
  updateLocation: updateLocation2,
  getMyJobs: getMyJobs2,
  getMyStats: getMyStats2,
  searchNearby: searchNearby2,
  getAllProfiles: getAllProfiles2,
  approveProfile: approveProfile2,
  rejectProfile: rejectProfile2
};

// src/modules/mechanic/mechanic.router.ts
import { Router as Router2 } from "express";

// src/middlewares/upload.ts
import multer from "multer";
import httpStatus8 from "http-status";
var ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(
        new AppError("Only JPG, PNG, WEBP or PDF allowed", httpStatus8.BAD_REQUEST)
      );
    }
    cb(null, true);
  }
});
var mechanicDocs = upload.fields([
  { name: "nidDoc", maxCount: 1 },
  { name: "licenseDoc", maxCount: 1 },
  { name: "vehiclePhoto", maxCount: 5 }
]);

// src/modules/mechanic/mechanic.router.ts
var router2 = Router2();
router2.post(
  "/profile",
  auth(Role.MECHANIC),
  mechanicDocs,
  MechanicController.createProfile
);
router2.get("/profile/me", auth(Role.MECHANIC), MechanicController.getMyProfile);
router2.patch("/availability", auth(Role.MECHANIC), validateRequest(MechanicValidation.toggleAvailabilitySchema), MechanicController.toggleAvailability);
router2.patch("/location", auth(Role.MECHANIC), validateRequest(MechanicValidation.updateLocationSchema), MechanicController.updateLocation);
router2.get("/jobs", auth(Role.MECHANIC), validateRequest(MechanicValidation.listJobsSchema), MechanicController.getMyJobs);
router2.get("/nearby", auth(Role.CUSTOMER), validateRequest(MechanicValidation.nearbySearchSchema), MechanicController.searchNearby);
router2.get("/stats", auth(Role.MECHANIC), MechanicController.getMyStats);
router2.get("/", auth(Role.ADMIN), validateRequest(MechanicValidation.listProfilesSchema), MechanicController.getAllProfiles);
router2.patch("/:id/approve", auth(Role.ADMIN), validateRequest(MechanicValidation.profileIdSchema), MechanicController.approveProfile);
router2.patch("/:id/reject", auth(Role.ADMIN), validateRequest(MechanicValidation.profileIdSchema), MechanicController.rejectProfile);
var MechanicRoutes = router2;

// src/modules/customer/customer.route.ts
import { Router as Router3 } from "express";

// src/modules/customer/customer.controller.ts
import httpStatus10 from "http-status";

// src/modules/customer/customer.service.ts
import httpStatus9 from "http-status";
var getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true }
  });
  if (!user) {
    throw new AppError("User not found", httpStatus9.NOT_FOUND);
  }
  if (user.role !== Role.CUSTOMER) {
    throw new AppError(
      "This profile does not belong to a customer account",
      httpStatus9.FORBIDDEN
    );
  }
  return user;
};
var updateProfile = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", httpStatus9.NOT_FOUND);
  }
  if (user.role !== Role.CUSTOMER) {
    throw new AppError(
      "This profile does not belong to a customer account",
      httpStatus9.FORBIDDEN
    );
  }
  const { name, phone: phone2 } = payload;
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...name && { name },
      ...phone2 && { phone: phone2 }
    },
    omit: { password: true }
  });
};
var getMyRequests = async (userId, status) => {
  return prisma.serviceRequest.findMany({
    where: {
      customerId: userId,
      ...status && { status }
    },
    include: {
      mechanic: {
        select: {
          id: true,
          rating: true,
          user: {
            select: {
              name: true,
              phone: true
            }
          }
        }
      },
      payment: true,
      review: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var deactivateAccount = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", httpStatus9.NOT_FOUND);
  }
  if (user.isDeleted) {
    throw new AppError(
      "Account is already deactivated",
      httpStatus9.BAD_REQUEST
    );
  }
  return prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true },
    omit: { password: true }
  });
};
var CustomerService = {
  getProfile,
  updateProfile,
  getMyRequests,
  deactivateAccount
};

// src/modules/customer/customer.controller.ts
var getRequestUser2 = (req) => {
  const user = req.user;
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus10.UNAUTHORIZED
    );
  }
  return user;
};
var getProfile2 = catchAsync(async (req, res) => {
  const user = getRequestUser2(req);
  const result = await CustomerService.getProfile(user.userId);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Customer profile fetched successfully",
    data: result
  });
});
var updateProfile2 = catchAsync(async (req, res) => {
  const user = getRequestUser2(req);
  const result = await CustomerService.updateProfile(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Customer profile updated successfully",
    data: result
  });
});
var getMyRequests2 = catchAsync(async (req, res) => {
  const user = getRequestUser2(req);
  const status = req.query.status;
  const result = await CustomerService.getMyRequests(user.userId, status);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Service request history fetched successfully",
    data: result
  });
});
var deactivateAccount2 = catchAsync(async (req, res) => {
  const user = getRequestUser2(req);
  const result = await CustomerService.deactivateAccount(user.userId);
  sendResponse(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Account deactivated successfully",
    data: result
  });
});
var CustomerControllers = {
  getProfile: getProfile2,
  updateProfile: updateProfile2,
  getMyRequests: getMyRequests2,
  deactivateAccount: deactivateAccount2
};

// src/modules/customer/customer.validation.ts
import { z as z4 } from "zod";
var updateProfileSchema = z4.object({
  body: z4.object({
    name: z4.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters").optional(),
    phone: phone.optional()
  }).refine((data) => data.name !== void 0 || data.phone !== void 0, {
    message: "Send at least one field to update (name or phone)"
  })
});
var listMyRequestsSchema = z4.object({
  query: z4.object({
    status: z4.enum(RequestStatus, { error: "Invalid status filter" }).optional()
  })
});
var CustomerValidation = {
  updateProfileSchema,
  listMyRequestsSchema
};

// src/modules/customer/customer.route.ts
var router3 = Router3();
router3.get("/profile", auth(Role.CUSTOMER), CustomerControllers.getProfile);
router3.patch("/profile", auth(Role.CUSTOMER), validateRequest(CustomerValidation.updateProfileSchema), CustomerControllers.updateProfile);
router3.get("/requests", auth(Role.CUSTOMER), validateRequest(CustomerValidation.listMyRequestsSchema), CustomerControllers.getMyRequests);
router3.delete("/account", auth(Role.CUSTOMER), CustomerControllers.deactivateAccount);
var CustomerRoutes = router3;

// src/modules/service-request/service.route.ts
import { Router as Router4 } from "express";

// src/modules/service-request/request.controller.ts
import httpStatus12 from "http-status";

// src/modules/service-request/request.service.ts
import httpStatus11 from "http-status";
var createRequest = async (customerId, payload) => {
  const { serviceType, description, pickupLat, pickupLng } = payload;
  if (typeof serviceType !== "string" || serviceType.trim() === "") {
    throw new AppError("serviceType is required", httpStatus11.BAD_REQUEST);
  }
  if (typeof pickupLat !== "number" || typeof pickupLng !== "number" || pickupLat < -90 || pickupLat > 90 || pickupLng < -180 || pickupLng > 180) {
    throw new AppError("Invalid pickup coordinates", httpStatus11.BAD_REQUEST);
  }
  const activeRequest = await prisma.serviceRequest.findFirst({
    where: {
      customerId,
      status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS] }
    }
  });
  if (activeRequest) {
    throw new AppError(
      "You already have an active service request",
      httpStatus11.CONFLICT
    );
  }
  const request = await prisma.serviceRequest.create({
    data: {
      customerId,
      serviceType,
      description,
      pickupLat,
      pickupLng,
      status: RequestStatus.PENDING
    }
  });
  const nearbyMechanics = await findNearbyMechanics(
    pickupLat,
    pickupLng,
    serviceType
  );
  return { request, nearbyMechanicsCount: nearbyMechanics.length };
};
var findNearbyMechanics = async (pickupLat, pickupLng, serviceType) => {
  const candidates = await prisma.mechanicProfile.findMany({
    where: {
      status: "APPROVED",
      isAvailable: true,
      serviceTypes: { has: serviceType },
      currentLat: { not: null },
      currentLng: { not: null }
    },
    include: {
      user: { select: { id: true, name: true, phone: true } }
    }
  });
  return candidates.map(({ nidDoc: _nid, licenseDoc: _license, ...m }) => ({
    ...m,
    distanceKm: getDistanceInKm(
      pickupLat,
      pickupLng,
      m.currentLat,
      m.currentLng
    )
  })).filter((m) => m.distanceKm <= m.serviceRadius).sort((a, b) => a.distanceKm - b.distanceKm);
};
var getNearbyMechanicsForRequest = async (requestId, customerId) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId }
  });
  if (!request) {
    throw new AppError("Service request not found", httpStatus11.NOT_FOUND);
  }
  if (request.customerId !== customerId) {
    throw new AppError(
      "You can only view mechanics for your own request",
      httpStatus11.FORBIDDEN
    );
  }
  return findNearbyMechanics(
    request.pickupLat,
    request.pickupLng,
    request.serviceType
  );
};
var getPendingRequestsForMechanic = async (mechanicUserId) => {
  const mechanicProfile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicUserId }
  });
  if (!mechanicProfile) {
    throw new AppError("Mechanic profile not found", httpStatus11.NOT_FOUND);
  }
  if (mechanicProfile.status !== "APPROVED" || !mechanicProfile.isAvailable) {
    throw new AppError(
      "You must be approved and online to view requests",
      httpStatus11.FORBIDDEN
    );
  }
  if (mechanicProfile.currentLat === null || mechanicProfile.currentLng === null) {
    throw new AppError(
      "Update your location before viewing nearby requests",
      httpStatus11.BAD_REQUEST
    );
  }
  const pendingRequests = await prisma.serviceRequest.findMany({
    where: {
      status: RequestStatus.PENDING,
      serviceType: { in: mechanicProfile.serviceTypes }
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } }
    }
  });
  return pendingRequests.map((r) => ({
    ...r,
    distanceKm: getDistanceInKm(
      mechanicProfile.currentLat,
      mechanicProfile.currentLng,
      r.pickupLat,
      r.pickupLng
    )
  })).filter((r) => r.distanceKm <= mechanicProfile.serviceRadius).sort((a, b) => a.distanceKm - b.distanceKm);
};
var acceptRequest = async (requestId, mechanicUserId) => {
  const mechanicProfile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicUserId }
  });
  if (!mechanicProfile) {
    throw new AppError("Mechanic profile not found", httpStatus11.NOT_FOUND);
  }
  if (mechanicProfile.status !== "APPROVED" || !mechanicProfile.isAvailable) {
    throw new AppError(
      "You must be approved and online to accept a request",
      httpStatus11.FORBIDDEN
    );
  }
  const result = await prisma.serviceRequest.updateMany({
    where: { id: requestId, status: RequestStatus.PENDING },
    data: {
      mechanicId: mechanicProfile.id,
      status: RequestStatus.ACCEPTED
    }
  });
  if (result.count === 0) {
    throw new AppError(
      "This request is no longer available (already accepted or cancelled)",
      httpStatus11.CONFLICT
    );
  }
  return prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { customer: { select: { name: true, phone: true } } }
  });
};
var updateRequestStatus = async (requestId, mechanicUserId, newStatus) => {
  const mechanicProfile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicUserId }
  });
  if (!mechanicProfile) {
    throw new AppError("Mechanic profile not found", httpStatus11.NOT_FOUND);
  }
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId }
  });
  if (!request) {
    throw new AppError("Service request not found", httpStatus11.NOT_FOUND);
  }
  if (request.mechanicId !== mechanicProfile.id) {
    throw new AppError(
      "You are not assigned to this request",
      httpStatus11.FORBIDDEN
    );
  }
  const validTransitions = {
    ACCEPTED: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"]
  };
  if (!validTransitions[request.status]?.includes(newStatus)) {
    throw new AppError(
      `Cannot move from ${request.status} to ${newStatus}`,
      httpStatus11.BAD_REQUEST
    );
  }
  return prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: newStatus }
  });
};
var completeService = async (requestId, mechanicUserId, payload) => {
  const mechanicProfile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicUserId }
  });
  if (!mechanicProfile) {
    throw new AppError("Mechanic profile not found", httpStatus11.NOT_FOUND);
  }
  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    throw new AppError("Service request not found", httpStatus11.NOT_FOUND);
  }
  if (request.mechanicId !== mechanicProfile.id) {
    throw new AppError("You are not assigned to this request", httpStatus11.FORBIDDEN);
  }
  if (request.status !== RequestStatus.IN_PROGRESS) {
    throw new AppError(
      `Cannot complete a request that is ${request.status}`,
      httpStatus11.BAD_REQUEST
    );
  }
  if (payload.finalPrice <= 0) {
    throw new AppError("Final price must be greater than zero", httpStatus11.BAD_REQUEST);
  }
  const invoiceNumber = `RR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const [updatedRequest, payment] = await prisma.$transaction([
    prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: "COMPLETED", price: payload.finalPrice }
    }),
    prisma.payment.create({
      data: {
        requestId,
        amount: payload.finalPrice,
        merchantInvoiceNumber: invoiceNumber,
        method: payload.method,
        status: payload.method === "CASH" ? "UNPAID" : "PENDING"
      }
    })
  ]);
  return { request: updatedRequest, payment };
};
var confirmCashPayment = async (paymentId, mechanicUserId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { request: true }
  });
  if (!payment) {
    throw new AppError("Payment not found", httpStatus11.NOT_FOUND);
  }
  if (payment.method !== "CASH") {
    throw new AppError("This payment is not a cash payment", httpStatus11.BAD_REQUEST);
  }
  if (payment.status === "PAID") {
    throw new AppError("Payment already confirmed", httpStatus11.CONFLICT);
  }
  const mechanicProfile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicUserId }
  });
  if (payment.request.mechanicId !== mechanicProfile?.id) {
    throw new AppError("You are not authorized to confirm this payment", httpStatus11.FORBIDDEN);
  }
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
      paidAt: /* @__PURE__ */ new Date(),
      confirmedBy: mechanicUserId
    }
  });
};
var trackingInclude = {
  customer: { select: { id: true, name: true, phone: true } },
  mechanic: {
    select: {
      id: true,
      rating: true,
      currentLat: true,
      currentLng: true,
      serviceTypes: true,
      updatedAt: true,
      user: { select: { name: true, phone: true } }
    }
  },
  payment: true,
  review: true
};
var withDistance = (request) => {
  const m = request.mechanic;
  const distanceKm = m && m.currentLat !== null && m.currentLng !== null ? getDistanceInKm(request.pickupLat, request.pickupLng, m.currentLat, m.currentLng) : null;
  return { ...request, distanceKm };
};
var getActiveRequest = async (customerId) => {
  const request = await prisma.serviceRequest.findFirst({
    where: {
      customerId,
      status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.EN_ROUTE, RequestStatus.IN_PROGRESS] }
    },
    include: trackingInclude,
    orderBy: { createdAt: "desc" }
  });
  return request ? withDistance(request) : null;
};
var getRequestById = async (requestId, userId, role) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { ...trackingInclude, mechanic: { select: { ...trackingInclude.mechanic.select, userId: true } } }
  });
  if (!request) {
    throw new AppError("Service request not found", httpStatus11.NOT_FOUND);
  }
  const isOwner = request.customerId === userId;
  const isAssignedMechanic = request.mechanic?.userId === userId;
  if (role !== "ADMIN" && !isOwner && !isAssignedMechanic) {
    throw new AppError("You cannot view this request", httpStatus11.FORBIDDEN);
  }
  return withDistance(request);
};
var createReview = async (requestId, customerId, payload) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { review: true }
  });
  if (!request) {
    throw new AppError("Service request not found", httpStatus11.NOT_FOUND);
  }
  if (request.customerId !== customerId) {
    throw new AppError("You can only review your own request", httpStatus11.FORBIDDEN);
  }
  if (request.status !== RequestStatus.COMPLETED || !request.mechanicId) {
    throw new AppError("You can review only a completed job", httpStatus11.BAD_REQUEST);
  }
  if (request.review) {
    throw new AppError("You already reviewed this job", httpStatus11.CONFLICT);
  }
  const mechanicId = request.mechanicId;
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        requestId,
        userId: customerId,
        rating: payload.rating,
        comment: payload.comment
      }
    });
    const agg = await tx.review.aggregate({
      where: { request: { mechanicId } },
      _avg: { rating: true }
    });
    await tx.mechanicProfile.update({
      where: { id: mechanicId },
      data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 }
    });
    return review;
  });
};
var cancelRequest = async (requestId, customerId) => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId }
  });
  if (!request) {
    throw new AppError("Service request not found", httpStatus11.NOT_FOUND);
  }
  if (request.customerId !== customerId) {
    throw new AppError(
      "You can only cancel your own request",
      httpStatus11.FORBIDDEN
    );
  }
  if (request.status === RequestStatus.IN_PROGRESS || request.status === RequestStatus.COMPLETED) {
    throw new AppError(
      `Cannot cancel a request that is already ${request.status}`,
      httpStatus11.BAD_REQUEST
    );
  }
  return prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: RequestStatus.CANCELLED }
  });
};
var RequestService = {
  createRequest,
  getNearbyMechanicsForRequest,
  getPendingRequestsForMechanic,
  acceptRequest,
  updateRequestStatus,
  completeService,
  confirmCashPayment,
  cancelRequest,
  getActiveRequest,
  getRequestById,
  createReview
};

// src/modules/service-request/request.controller.ts
var getRequestUser3 = (req) => {
  const user = req.user;
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus12.UNAUTHORIZED
    );
  }
  return user;
};
var createRequest2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const result = await RequestService.createRequest(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus12.CREATED,
    success: true,
    message: "Service request created successfully",
    data: result
  });
});
var getNearbyMechanics = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const requestId = req.params.id;
  const result = await RequestService.getNearbyMechanicsForRequest(
    requestId,
    user.userId
  );
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Nearby mechanics fetched successfully",
    data: result
  });
});
var cancelRequest2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const requestId = req.params.id;
  const result = await RequestService.cancelRequest(requestId, user.userId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Service request cancelled successfully",
    data: result
  });
});
var getPendingRequests = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const result = await RequestService.getPendingRequestsForMechanic(user.userId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Pending nearby requests fetched successfully",
    data: result
  });
});
var acceptRequest2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const requestId = req.params.id;
  const result = await RequestService.acceptRequest(requestId, user.userId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Service request accepted successfully",
    data: result
  });
});
var updateRequestStatus2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const requestId = req.params.id;
  const { status } = req.body;
  if (status !== "IN_PROGRESS") {
    throw new AppError(
      "status must be IN_PROGRESS (use the complete endpoint to finish a job)",
      httpStatus12.BAD_REQUEST
    );
  }
  const result = await RequestService.updateRequestStatus(
    requestId,
    user.userId,
    status
  );
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: `Request marked as ${status}`,
    data: result
  });
});
var completeService2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const requestId = req.params.id;
  const { finalPrice, method } = req.body;
  if (typeof finalPrice !== "number" || finalPrice <= 0) {
    throw new AppError(
      "finalPrice must be a positive number",
      httpStatus12.BAD_REQUEST
    );
  }
  if (!["CASH", "BKASH"].includes(method)) {
    throw new AppError(
      "method must be CASH or BKASH",
      httpStatus12.BAD_REQUEST
    );
  }
  const result = await RequestService.completeService(requestId, user.userId, {
    finalPrice,
    method
  });
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Service completed. Payment record created.",
    data: result
  });
});
var confirmCashPayment2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const paymentId = req.params.id;
  const result = await RequestService.confirmCashPayment(paymentId, user.userId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Cash payment confirmed successfully",
    data: result
  });
});
var getActiveRequest2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const result = await RequestService.getActiveRequest(user.userId);
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Active request fetched successfully",
    data: result
  });
});
var getRequestById2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const result = await RequestService.getRequestById(
    req.params.id,
    user.userId,
    user.role
  );
  sendResponse(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Service request fetched successfully",
    data: result
  });
});
var createReview2 = catchAsync(async (req, res) => {
  const user = getRequestUser3(req);
  const result = await RequestService.createReview(
    req.params.id,
    user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus12.CREATED,
    success: true,
    message: "Thanks for your review",
    data: result
  });
});
var RequestControllers = {
  createRequest: createRequest2,
  getNearbyMechanics,
  cancelRequest: cancelRequest2,
  getPendingRequests,
  acceptRequest: acceptRequest2,
  updateRequestStatus: updateRequestStatus2,
  completeService: completeService2,
  confirmCashPayment: confirmCashPayment2,
  getActiveRequest: getActiveRequest2,
  getRequestById: getRequestById2,
  createReview: createReview2
};

// src/modules/service-request/request.validation.ts
import { z as z5 } from "zod";
var createRequestSchema = z5.object({
  body: z5.object({
    serviceType: z5.string({ error: "serviceType is required" }).trim().toLowerCase().min(1, "serviceType is required").max(50, "serviceType must not exceed 50 characters"),
    description: z5.string().trim().max(500, "Description must not exceed 500 characters").optional(),
    pickupLat: latitude,
    pickupLng: longitude
  })
});
var requestIdSchema = z5.object({
  params: idParams
});
var updateStatusSchema = z5.object({
  params: idParams,
  body: z5.object({
    status: z5.literal("IN_PROGRESS", {
      error: "status must be IN_PROGRESS (use the complete endpoint to finish a job)"
    })
  })
});
var completeServiceSchema = z5.object({
  params: idParams,
  body: z5.object({
    finalPrice: z5.number({ error: "finalPrice must be a number" }).positive("finalPrice must be a positive number").max(1e6, "finalPrice is too large"),
    method: z5.enum(["CASH", "BKASH"], { error: "method must be CASH or BKASH" })
  })
});
var createReviewSchema = z5.object({
  params: idParams,
  body: z5.object({
    rating: z5.number({ error: "rating must be a number" }).int("rating must be a whole number").min(1, "rating must be 1 to 5").max(5, "rating must be 1 to 5"),
    comment: z5.string().trim().max(500, "Comment must not exceed 500 characters").optional()
  })
});
var RequestValidation = {
  createReviewSchema,
  createRequestSchema,
  requestIdSchema,
  updateStatusSchema,
  completeServiceSchema
};

// src/modules/service-request/service.route.ts
var router4 = Router4();
router4.get("/pending", auth(Role.MECHANIC), RequestControllers.getPendingRequests);
router4.get("/active", auth(Role.CUSTOMER), RequestControllers.getActiveRequest);
router4.post("/:id/review", auth(Role.CUSTOMER), validateRequest(RequestValidation.createReviewSchema), RequestControllers.createReview);
router4.post("/", auth(Role.CUSTOMER), validateRequest(RequestValidation.createRequestSchema), RequestControllers.createRequest);
router4.get("/:id/nearby-mechanics", auth(Role.CUSTOMER), validateRequest(RequestValidation.requestIdSchema), RequestControllers.getNearbyMechanics);
router4.patch("/:id/cancel", auth(Role.CUSTOMER), validateRequest(RequestValidation.requestIdSchema), RequestControllers.cancelRequest);
router4.patch("/:id/accept", auth(Role.MECHANIC), validateRequest(RequestValidation.requestIdSchema), RequestControllers.acceptRequest);
router4.patch("/:id/status", auth(Role.MECHANIC), validateRequest(RequestValidation.updateStatusSchema), RequestControllers.updateRequestStatus);
router4.patch("/:id/complete", auth(Role.MECHANIC), validateRequest(RequestValidation.completeServiceSchema), RequestControllers.completeService);
router4.patch("/payments/:id/confirm-cash", auth(Role.MECHANIC), validateRequest(RequestValidation.requestIdSchema), RequestControllers.confirmCashPayment);
router4.get("/:id", auth(), validateRequest(RequestValidation.requestIdSchema), RequestControllers.getRequestById);
var RequestRoutes = router4;

// src/modules/admin/admin.route.ts
import { Router as Router5 } from "express";

// src/modules/admin/admin.controller.ts
import httpStatus14 from "http-status";

// src/modules/admin/admin.service.ts
import httpStatus13 from "http-status";
var getProfile3 = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true }
  });
  if (!user) {
    throw new AppError("User not found", httpStatus13.NOT_FOUND);
  }
  if (user.role !== Role.ADMIN) {
    throw new AppError("This account is not an admin account", httpStatus13.FORBIDDEN);
  }
  return user;
};
var getAllUsers = async (role) => {
  if (role && !Object.values(Role).includes(role)) {
    throw new AppError("Invalid role filter", httpStatus13.BAD_REQUEST);
  }
  return prisma.user.findMany({
    where: role ? { role } : {},
    omit: { password: true },
    orderBy: { createdAt: "desc" }
  });
};
var getUserById = async (targetUserId) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    omit: { password: true },
    include: {
      mechanicProfile: true,
      requests: true,
      reviews: true
    }
  });
  if (!user) {
    throw new AppError("User not found", httpStatus13.NOT_FOUND);
  }
  return user;
};
var toggleBlockUser = async (targetUserId, isBlocked, adminId) => {
  if (targetUserId === adminId) {
    throw new AppError("You cannot block your own account", httpStatus13.BAD_REQUEST);
  }
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) {
    throw new AppError("User not found", httpStatus13.NOT_FOUND);
  }
  if (user.role === Role.ADMIN) {
    throw new AppError("Admin accounts cannot be blocked", httpStatus13.FORBIDDEN);
  }
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { isBlocked },
    omit: { password: true }
  });
  await logAdminActivity({
    adminId,
    action: isBlocked ? AdminAction.USER_BLOCKED : AdminAction.USER_UNBLOCKED,
    targetType: "USER",
    targetId: targetUserId,
    description: `${isBlocked ? "Blocked" : "Unblocked"} ${user.role.toLowerCase()} ${user.email}`
  });
  return updatedUser;
};
var getActivities = async (query) => {
  const { page, limit, action } = query;
  const where = action ? { action } : {};
  const [items, total] = await Promise.all([
    prisma.adminActivity.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.adminActivity.count({ where })
  ]);
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};
var getDashboardStats = async () => {
  const [
    totalCustomers,
    totalMechanics,
    pendingMechanics,
    approvedMechanics,
    totalRequests,
    pendingRequests,
    completedRequests,
    cancelledRequests
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.CUSTOMER, isDeleted: false } }),
    prisma.user.count({ where: { role: Role.MECHANIC, isDeleted: false } }),
    prisma.mechanicProfile.count({ where: { status: MechanicStatus.PENDING } }),
    prisma.mechanicProfile.count({ where: { status: MechanicStatus.APPROVED } }),
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({ where: { status: RequestStatus.PENDING } }),
    prisma.serviceRequest.count({ where: { status: RequestStatus.COMPLETED } }),
    prisma.serviceRequest.count({ where: { status: RequestStatus.CANCELLED } })
  ]);
  return {
    users: {
      totalCustomers,
      totalMechanics
    },
    mechanics: {
      pendingApproval: pendingMechanics,
      approved: approvedMechanics
    },
    requests: {
      total: totalRequests,
      pending: pendingRequests,
      completed: completedRequests,
      cancelled: cancelledRequests
    }
  };
};
var getAllRequests = async (status) => {
  if (status && !Object.values(RequestStatus).includes(status)) {
    throw new AppError("Invalid status filter", httpStatus13.BAD_REQUEST);
  }
  return prisma.serviceRequest.findMany({
    where: status ? { status } : {},
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      mechanic: {
        select: {
          id: true,
          user: { select: { name: true, phone: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var AdminService = {
  getProfile: getProfile3,
  getAllUsers,
  getUserById,
  toggleBlockUser,
  getActivities,
  getDashboardStats,
  getAllRequests
};

// src/modules/admin/admin.validation.ts
import { z as z6 } from "zod";
var listUsersSchema = z6.object({
  query: z6.object({
    role: z6.enum(Role, { error: "Invalid role filter" }).optional()
  })
});
var userIdSchema = z6.object({
  params: idParams
});
var toggleBlockSchema = z6.object({
  params: idParams,
  body: z6.object({
    isBlocked: z6.boolean({ error: "isBlocked must be a boolean (true or false)" })
  })
});
var listRequestsSchema = z6.object({
  query: z6.object({
    status: z6.enum(RequestStatus, { error: "Invalid status filter" }).optional()
  })
});
var listActivitiesQuery = z6.object({
  page: z6.coerce.number().int().min(1).default(1),
  limit: z6.coerce.number().int().min(1).max(100).default(20),
  action: z6.enum(AdminAction, { error: "Invalid action filter" }).optional()
});
var listActivitiesSchema = z6.object({
  query: listActivitiesQuery
});
var AdminValidation = {
  listActivitiesQuery,
  listActivitiesSchema,
  listUsersSchema,
  userIdSchema,
  toggleBlockSchema,
  listRequestsSchema
};

// src/modules/admin/admin.controller.ts
var getRequestUser4 = (req) => {
  const user = req.user;
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus14.UNAUTHORIZED
    );
  }
  return user;
};
var getProfile4 = catchAsync(async (req, res) => {
  const admin = getRequestUser4(req);
  const result = await AdminService.getProfile(admin.userId);
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Admin profile fetched successfully",
    data: result
  });
});
var getAllUsers2 = catchAsync(async (req, res) => {
  const role = req.query.role;
  const result = await AdminService.getAllUsers(role);
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Users fetched successfully",
    data: result
  });
});
var getUserById2 = catchAsync(async (req, res) => {
  const targetUserId = req.params.id;
  const result = await AdminService.getUserById(targetUserId);
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "User details fetched successfully",
    data: result
  });
});
var toggleBlockUser2 = catchAsync(async (req, res) => {
  const admin = getRequestUser4(req);
  const targetUserId = req.params.id;
  const { isBlocked } = req.body;
  if (typeof isBlocked !== "boolean") {
    throw new AppError(
      "isBlocked must be a boolean (true or false)",
      httpStatus14.BAD_REQUEST
    );
  }
  const result = await AdminService.toggleBlockUser(
    targetUserId,
    isBlocked,
    admin.userId
  );
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
    data: result
  });
});
var getActivities2 = catchAsync(async (req, res) => {
  const query = AdminValidation.listActivitiesQuery.parse(req.query);
  const result = await AdminService.getActivities(query);
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Admin activities fetched successfully",
    data: result
  });
});
var getDashboardStats2 = catchAsync(async (req, res) => {
  const result = await AdminService.getDashboardStats();
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result
  });
});
var getAllRequests2 = catchAsync(async (req, res) => {
  const status = req.query.status;
  const result = await AdminService.getAllRequests(status);
  sendResponse(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Service requests fetched successfully",
    data: result
  });
});
var AdminControllers = {
  getProfile: getProfile4,
  getAllUsers: getAllUsers2,
  getUserById: getUserById2,
  toggleBlockUser: toggleBlockUser2,
  getActivities: getActivities2,
  getDashboardStats: getDashboardStats2,
  getAllRequests: getAllRequests2
};

// src/modules/admin/admin.route.ts
var router5 = Router5();
router5.get("/profile", auth(Role.ADMIN), AdminControllers.getProfile);
router5.get("/dashboard", auth(Role.ADMIN), AdminControllers.getDashboardStats);
router5.get("/users", auth(Role.ADMIN), validateRequest(AdminValidation.listUsersSchema), AdminControllers.getAllUsers);
router5.get("/users/:id", auth(Role.ADMIN), validateRequest(AdminValidation.userIdSchema), AdminControllers.getUserById);
router5.patch("/users/:id/block", auth(Role.ADMIN), validateRequest(AdminValidation.toggleBlockSchema), AdminControllers.toggleBlockUser);
router5.get("/activities", auth(Role.ADMIN), validateRequest(AdminValidation.listActivitiesSchema), AdminControllers.getActivities);
router5.get("/requests", auth(Role.ADMIN), validateRequest(AdminValidation.listRequestsSchema), AdminControllers.getAllRequests);
var AdminRoutes = router5;

// src/modules/payment/payment.route.ts
import { Router as Router6 } from "express";

// src/modules/payment/payment.controller.ts
import httpStatus16 from "http-status";

// src/modules/payment/payment.service.ts
import httpStatus15 from "http-status";
var getPaymentById = async (paymentId, userId, role) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      request: {
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          mechanic: { select: { id: true, userId: true, user: { select: { name: true } } } }
        }
      },
      refunds: true
    }
  });
  if (!payment) {
    throw new AppError("Payment not found", httpStatus15.NOT_FOUND);
  }
  const isOwner = payment.request.customerId === userId;
  const isAssignedMechanic = payment.request.mechanic?.userId === userId;
  if (role !== Role.ADMIN && !isOwner && !isAssignedMechanic) {
    throw new AppError(
      "You are not authorized to view this payment",
      httpStatus15.FORBIDDEN
    );
  }
  return payment;
};
var getMyPayments = async (customerId, status) => {
  if (status && !Object.values(PaymentStatus).includes(status)) {
    throw new AppError("Invalid status filter", httpStatus15.BAD_REQUEST);
  }
  return prisma.payment.findMany({
    where: {
      request: { customerId },
      ...status && { status }
    },
    include: {
      request: { select: { id: true, serviceType: true, status: true } },
      refunds: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var initiateBkashPayment = async (paymentId, customerId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { request: true }
  });
  if (!payment) {
    throw new AppError("Payment not found", httpStatus15.NOT_FOUND);
  }
  if (payment.request.customerId !== customerId) {
    throw new AppError(
      "You are not authorized to pay for this request",
      httpStatus15.FORBIDDEN
    );
  }
  if (payment.method !== "BKASH") {
    throw new AppError("This payment is not a bKash payment", httpStatus15.BAD_REQUEST);
  }
  if (!["UNPAID", "PENDING", "FAILED"].includes(payment.status)) {
    throw new AppError(
      `Payment cannot be started because it is ${payment.status}`,
      httpStatus15.CONFLICT
    );
  }
  const mockBkashPaymentID = `BKS-${Date.now()}`;
  const mockCheckoutUrl = `https://sandbox.payment.bkash.com/checkout/${mockBkashPaymentID}`;
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "PENDING",
      gatewayResponse: { bkashPaymentID: mockBkashPaymentID, initiatedAt: (/* @__PURE__ */ new Date()).toISOString() }
    }
  });
  return {
    bkashPaymentID: mockBkashPaymentID,
    checkoutUrl: mockCheckoutUrl
  };
};
var handleBkashCallback = async (payload) => {
  const payment = await prisma.payment.findFirst({
    where: {
      gatewayResponse: { path: ["bkashPaymentID"], equals: payload.paymentID }
    }
  });
  if (!payment) {
    throw new AppError("Payment not found for this bKash transaction", httpStatus15.NOT_FOUND);
  }
  if (payment.status === "PAID") {
    return payment;
  }
  const existingGatewayResponse = payment.gatewayResponse ? JSON.parse(JSON.stringify(payment.gatewayResponse)) : {};
  if (payload.status === "success") {
    return prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        transactionId: payload.trxID,
        paidAt: /* @__PURE__ */ new Date(),
        gatewayResponse: {
          ...existingGatewayResponse,
          callback: JSON.parse(JSON.stringify(payload))
        }
      }
    });
  }
  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      gatewayResponse: {
        ...existingGatewayResponse,
        callback: JSON.parse(JSON.stringify(payload))
      }
    }
  });
};
var confirmCashPayment3 = async (paymentId, mechanicUserId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { request: true }
  });
  if (!payment) {
    throw new AppError("Payment not found", httpStatus15.NOT_FOUND);
  }
  if (payment.method !== "CASH") {
    throw new AppError("This payment is not a cash payment", httpStatus15.BAD_REQUEST);
  }
  if (payment.status === "PAID") {
    throw new AppError("Payment already confirmed", httpStatus15.CONFLICT);
  }
  const mechanicProfile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicUserId }
  });
  if (payment.request.mechanicId !== mechanicProfile?.id) {
    throw new AppError(
      "You are not authorized to confirm this payment",
      httpStatus15.FORBIDDEN
    );
  }
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
      paidAt: /* @__PURE__ */ new Date(),
      confirmedBy: mechanicUserId
    }
  });
};
var requestRefund = async (paymentId, customerId, payload) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { request: true, refunds: true }
  });
  if (!payment) {
    throw new AppError("Payment not found", httpStatus15.NOT_FOUND);
  }
  if (payment.request.customerId !== customerId) {
    throw new AppError(
      "You can only request a refund for your own payment",
      httpStatus15.FORBIDDEN
    );
  }
  if (payment.status !== "PAID") {
    throw new AppError(
      "Only completed payments can be refunded",
      httpStatus15.BAD_REQUEST
    );
  }
  if (payload.amount <= 0 || payload.amount > payment.amount) {
    throw new AppError(
      `Refund amount must be between 0 and ${payment.amount}`,
      httpStatus15.BAD_REQUEST
    );
  }
  const hasPendingRefund = payment.refunds.some(
    (r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "PROCESSING"
  );
  if (hasPendingRefund) {
    throw new AppError(
      "A refund is already in progress for this payment",
      httpStatus15.CONFLICT
    );
  }
  const refund = await prisma.refund.create({
    data: {
      paymentId,
      amount: payload.amount,
      reason: payload.reason,
      requestedBy: customerId,
      status: "REQUESTED"
    }
  });
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUND_REQUESTED" }
  });
  return refund;
};
var getAllRefunds = async (status) => {
  if (status && !Object.values(RefundStatus).includes(status)) {
    throw new AppError("Invalid status filter", httpStatus15.BAD_REQUEST);
  }
  return prisma.refund.findMany({
    where: status ? { status } : {},
    include: {
      payment: {
        include: {
          request: { select: { id: true, serviceType: true, customer: { select: { name: true, phone: true } } } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var approveRefund = async (refundId, adminId) => {
  const refund = await prisma.refund.findUnique({ where: { id: refundId } });
  if (!refund) {
    throw new AppError("Refund request not found", httpStatus15.NOT_FOUND);
  }
  if (refund.status !== "REQUESTED") {
    throw new AppError(
      "Only requested refunds can be approved",
      httpStatus15.BAD_REQUEST
    );
  }
  const approved = await prisma.refund.update({
    where: { id: refundId },
    data: { status: "APPROVED" }
  });
  await logAdminActivity({
    adminId,
    action: AdminAction.REFUND_APPROVED,
    targetType: "REFUND",
    targetId: refundId,
    description: `Approved refund of ${refund.amount} BDT`
  });
  return approved;
};
var rejectRefund = async (refundId, adminId) => {
  const refund = await prisma.refund.findUnique({ where: { id: refundId } });
  if (!refund) {
    throw new AppError("Refund request not found", httpStatus15.NOT_FOUND);
  }
  if (refund.status !== "REQUESTED") {
    throw new AppError(
      "Only requested refunds can be rejected",
      httpStatus15.BAD_REQUEST
    );
  }
  const [updatedRefund] = await prisma.$transaction([
    prisma.refund.update({
      where: { id: refundId },
      data: { status: "REJECTED" }
    }),
    prisma.payment.update({
      where: { id: refund.paymentId },
      data: { status: "PAID" }
      // reject হলে payment আগের PAID অবস্থায় ফিরে যাবে
    })
  ]);
  await logAdminActivity({
    adminId,
    action: AdminAction.REFUND_REJECTED,
    targetType: "REFUND",
    targetId: refundId,
    description: `Rejected refund of ${refund.amount} BDT`
  });
  return updatedRefund;
};
var processRefund = async (refundId, adminId) => {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { payment: true }
  });
  if (!refund) {
    throw new AppError("Refund request not found", httpStatus15.NOT_FOUND);
  }
  if (refund.status !== "APPROVED") {
    throw new AppError(
      "Only approved refunds can be processed",
      httpStatus15.BAD_REQUEST
    );
  }
  await prisma.refund.update({
    where: { id: refundId },
    data: { status: "PROCESSING" }
  });
  const mockGatewayRefundId = `RFD-${Date.now()}`;
  const isFullRefund = refund.amount === refund.payment.amount;
  const [updatedRefund] = await prisma.$transaction([
    prisma.refund.update({
      where: { id: refundId },
      data: {
        status: "COMPLETED",
        gatewayRefundId: mockGatewayRefundId,
        processedAt: /* @__PURE__ */ new Date()
      }
    }),
    prisma.payment.update({
      where: { id: refund.paymentId },
      data: {
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED"
      }
    })
  ]);
  await logAdminActivity({
    adminId,
    action: AdminAction.REFUND_PROCESSED,
    targetType: "REFUND",
    targetId: refundId,
    description: `Processed refund of ${refund.amount} BDT`
  });
  return updatedRefund;
};
var getAllPayments = async (status) => {
  if (status && !Object.values(PaymentStatus).includes(status)) {
    throw new AppError("Invalid status filter", httpStatus15.BAD_REQUEST);
  }
  return prisma.payment.findMany({
    where: status ? { status } : {},
    include: {
      request: {
        select: {
          id: true,
          serviceType: true,
          customer: { select: { name: true, phone: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var PaymentService = {
  getPaymentById,
  getMyPayments,
  initiateBkashPayment,
  handleBkashCallback,
  confirmCashPayment: confirmCashPayment3,
  requestRefund,
  getAllRefunds,
  approveRefund,
  rejectRefund,
  processRefund,
  getAllPayments
};

// src/modules/payment/payment.controller.ts
var getRequestUser5 = (req) => {
  const user = req.user;
  if (!user) {
    throw new AppError(
      "User information is missing in the request",
      httpStatus16.UNAUTHORIZED
    );
  }
  return user;
};
var getPaymentById2 = catchAsync(async (req, res) => {
  const user = getRequestUser5(req);
  const paymentId = req.params.id;
  const result = await PaymentService.getPaymentById(paymentId, user.userId, user.role);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Payment details fetched successfully",
    data: result
  });
});
var getMyPayments2 = catchAsync(async (req, res) => {
  const user = getRequestUser5(req);
  const status = req.query.status;
  const result = await PaymentService.getMyPayments(user.userId, status);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Your payments fetched successfully",
    data: result
  });
});
var initiateBkashPayment2 = catchAsync(async (req, res) => {
  const user = getRequestUser5(req);
  const paymentId = req.params.id;
  const result = await PaymentService.initiateBkashPayment(paymentId, user.userId);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "bKash payment initiated",
    data: result
  });
});
var bkashCallback = catchAsync(async (req, res) => {
  const result = await PaymentService.handleBkashCallback(req.body);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Callback processed",
    data: result
  });
});
var confirmCashPayment4 = catchAsync(async (req, res) => {
  const user = getRequestUser5(req);
  const paymentId = req.params.id;
  const result = await PaymentService.confirmCashPayment(paymentId, user.userId);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Cash payment confirmed successfully",
    data: result
  });
});
var requestRefund2 = catchAsync(async (req, res) => {
  const user = getRequestUser5(req);
  const paymentId = req.params.id;
  const { amount, reason } = req.body;
  if (typeof amount !== "number" || amount <= 0) {
    throw new AppError("amount must be a positive number", httpStatus16.BAD_REQUEST);
  }
  if (!reason || typeof reason !== "string") {
    throw new AppError("reason is required", httpStatus16.BAD_REQUEST);
  }
  const result = await PaymentService.requestRefund(paymentId, user.userId, {
    amount,
    reason
  });
  sendResponse(res, {
    statusCode: httpStatus16.CREATED,
    success: true,
    message: "Refund request submitted successfully",
    data: result
  });
});
var getAllRefunds2 = catchAsync(async (req, res) => {
  const status = req.query.status;
  const result = await PaymentService.getAllRefunds(status);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Refunds fetched successfully",
    data: result
  });
});
var approveRefund2 = catchAsync(async (req, res) => {
  const admin = getRequestUser5(req);
  const refundId = req.params.id;
  const result = await PaymentService.approveRefund(refundId, admin.userId);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Refund approved successfully",
    data: result
  });
});
var rejectRefund2 = catchAsync(async (req, res) => {
  const admin = getRequestUser5(req);
  const refundId = req.params.id;
  const result = await PaymentService.rejectRefund(refundId, admin.userId);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Refund rejected",
    data: result
  });
});
var processRefund2 = catchAsync(async (req, res) => {
  const admin = getRequestUser5(req);
  const refundId = req.params.id;
  const result = await PaymentService.processRefund(refundId, admin.userId);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Refund processed successfully",
    data: result
  });
});
var getAllPayments2 = catchAsync(async (req, res) => {
  const status = req.query.status;
  const result = await PaymentService.getAllPayments(status);
  sendResponse(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Payments fetched successfully",
    data: result
  });
});
var PaymentControllers = {
  getPaymentById: getPaymentById2,
  getMyPayments: getMyPayments2,
  initiateBkashPayment: initiateBkashPayment2,
  bkashCallback,
  confirmCashPayment: confirmCashPayment4,
  requestRefund: requestRefund2,
  getAllRefunds: getAllRefunds2,
  approveRefund: approveRefund2,
  rejectRefund: rejectRefund2,
  processRefund: processRefund2,
  getAllPayments: getAllPayments2
};

// src/modules/payment/payment.validation.ts
import { z as z7 } from "zod";
var paymentIdSchema = z7.object({
  params: idParams
});
var listPaymentsSchema = z7.object({
  query: z7.object({
    status: z7.enum(PaymentStatus, { error: "Invalid status filter" }).optional()
  })
});
var listRefundsSchema = z7.object({
  query: z7.object({
    status: z7.enum(RefundStatus, { error: "Invalid status filter" }).optional()
  })
});
var requestRefundSchema = z7.object({
  params: idParams,
  body: z7.object({
    amount: z7.number({ error: "amount must be a number" }).positive("amount must be greater than zero"),
    reason: z7.string({ error: "reason is required" }).trim().min(3, "Reason must be at least 3 characters").max(500, "Reason must not exceed 500 characters")
  })
});
var bkashCallbackSchema = z7.object({
  body: z7.looseObject({
    paymentID: z7.string({ error: "paymentID is required" }).min(1, "paymentID is required"),
    status: z7.enum(["success", "failure", "cancel"], {
      error: "status must be success, failure or cancel"
    }),
    trxID: z7.string().optional(),
    amount: z7.string().optional()
  })
});
var PaymentValidation = {
  paymentIdSchema,
  listPaymentsSchema,
  listRefundsSchema,
  requestRefundSchema,
  bkashCallbackSchema
};

// src/modules/payment/payment.route.ts
var router6 = Router6();
router6.post("/bkash/callback", validateRequest(PaymentValidation.bkashCallbackSchema), PaymentControllers.bkashCallback);
router6.get("/", auth(Role.ADMIN), validateRequest(PaymentValidation.listPaymentsSchema), PaymentControllers.getAllPayments);
router6.get("/refunds", auth(Role.ADMIN), validateRequest(PaymentValidation.listRefundsSchema), PaymentControllers.getAllRefunds);
router6.patch("/refunds/:id/approve", auth(Role.ADMIN), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.approveRefund);
router6.patch("/refunds/:id/reject", auth(Role.ADMIN), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.rejectRefund);
router6.patch("/refunds/:id/process", auth(Role.ADMIN), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.processRefund);
router6.get("/my", auth(Role.CUSTOMER), validateRequest(PaymentValidation.listPaymentsSchema), PaymentControllers.getMyPayments);
router6.post("/:id/bkash/initiate", auth(Role.CUSTOMER), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.initiateBkashPayment);
router6.post("/:id/refund", auth(Role.CUSTOMER), validateRequest(PaymentValidation.requestRefundSchema), PaymentControllers.requestRefund);
router6.patch("/:id/confirm-cash", auth(Role.MECHANIC), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.confirmCashPayment);
router6.get("/:id", auth(), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.getPaymentById);
var PaymentRoutes = router6;

// src/routes/index.ts
var router7 = Router7();
var moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/admin", route: AdminRoutes },
  { path: "/mechanics", route: MechanicRoutes },
  { path: "/customers", route: CustomerRoutes },
  { path: "/requests", route: RequestRoutes },
  { path: "/payments", route: PaymentRoutes }
];
moduleRoutes.forEach(({ path: path4, route }) => router7.use(path4, route));
var routes_default = router7;

// src/app.ts
var app = express();
app.set("trust proxy", 1);
var allowedOrigins = config_default.frontend_url;
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/v1", routes_default);
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;

// src/utils/seedAdmin.ts
import bcrypt2 from "bcryptjs";
var seedAdmin = async () => {
  if (!config_default.tester_admin_name || !config_default.tester_admin_email || !config_default.tester_admin_password) {
    console.log("\u26A0\uFE0F  Tester admin env vars missing \u2014 skipping admin seed");
    return;
  }
  const existingAdmin = await prisma.user.findUnique({
    where: { email: config_default.tester_admin_email }
  });
  if (existingAdmin) {
    console.log("\u2705 Tester admin already exists, skipping seed");
    return;
  }
  const hashedPassword = await bcrypt2.hash(config_default.tester_admin_password, 8);
  await prisma.user.create({
    data: {
      name: config_default.tester_admin_name,
      email: config_default.tester_admin_email,
      password: hashedPassword,
      authProvider: AuthProvider.CREDENTIAL,
      role: Role.ADMIN
    }
  });
  console.log(`\u2705 Tester admin created: ${config_default.tester_admin_email}`);
};

// src/server.ts
var PORT = config_default.port;
try {
  await prisma.$connect();
  console.log("Connected to the database successfully.");
  await seedAdmin();
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