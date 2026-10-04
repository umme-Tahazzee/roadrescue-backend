// src/db/seedAdmin.ts

// biome-ignore assist/source/organizeImports: <explanation>
import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../lib/prisma";
import { AuthProvider, Role } from "../../prisma/generated/prisma/enums";

export const seedAdmin = async () => {
	// env values না থাকলে seed skip করে দেওয়া, crash করানো ঠিক না
	if (
		!config.tester_admin_name ||
		!config.tester_admin_email ||
		!config.tester_admin_password
	) {
		console.log("⚠️  Tester admin env vars missing — skipping admin seed");
		return;
	}

	// idempotent — আগে থেকেই থাকলে দ্বিতীয়বার তৈরি করবে না বা duplicate error দেবে না
	const existingAdmin = await prisma.user.findUnique({
		where: { email: config.tester_admin_email },
	});

	if (existingAdmin) {
		console.log("✅ Tester admin already exists, skipping seed");
		return;
	}

	const hashedPassword = await bcrypt.hash(config.tester_admin_password, 8);

	await prisma.user.create({
		data: {
			name: config.tester_admin_name,
			email: config.tester_admin_email,
			password: hashedPassword,
			authProvider: AuthProvider.CREDENTIAL,
			role: Role.ADMIN,
		},
	});

	console.log(`✅ Tester admin created: ${config.tester_admin_email}`);
};