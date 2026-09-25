import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: '*',  },
  
});

io.on('connection', (socket:any) => {
  console.log('socket connected:', socket.id);
 
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
