import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.send('Roadside Assistance & Emergency Dispatch Platform API is running');
});

// TODO: mount module routes here via src/routes
// app.use('/api', routes);

// TODO: add globalErrorHandler middleware (src/middlewares) as the last app.use()

export default app;
