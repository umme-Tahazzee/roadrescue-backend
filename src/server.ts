// biome-ignore assist/source/organizeImports: <explanation>
import app from './app';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma';
import { redisClient } from './utils/redis';
import config from './config';
import { transporter } from './lib/nodemailer';


const PORT = config.port;

try {
		await prisma.$connect();
		console.log("Connected to the database successfully.");
		await redisClient.connect();
		console.log("Redis to the database successfully.");
		await transporter.verify();
		console.log("nodemailer connected successfully");

	
		
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}