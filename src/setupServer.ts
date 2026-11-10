import express, {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from 'express';
import http from 'http';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import 'express-async-errors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { config } from './config';
import applicationRoutes from './routes';
import Logger from 'bunyan';
import {
  CustomError,
  IErrorResponse,
} from './shared/globals/helpers/ErrorHandler';

const PORT = 5001;
const log: Logger = config.createLogger('setupServer');

export class ChattyServer {
  private app: Application;

  constructor() {
    this.app = express();
  }
  public start(): void {
    this.securityMiddleware(this.app);
    this.standartMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }
  private securityMiddleware(app: Application): void {
    // Implement security measures here (e.g., authentication, authorization)
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
        maxAge: 24 * 7 * 360000, // 1 week
        secure: config.NODE_ENV !== 'development', // Use secure cookies in production
      }),
    );
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      }),
    );
    app.use(helmet());
    app.use(hpp());
  }
  private standartMiddleware(app: Application): void {
    // Implement standard middleware here (e.g., logging, request parsing)
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }
  private routeMiddleware(app: Application): void {
    // Implement route-specific middleware here (e.g., validation, rate limiting)
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    // 404 handler

    app.use((req: Request, res: Response): void => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: `${req.originalUrl} not found`,
      });
    });

    // Global error handler
    app.use(
      (
        error: IErrorResponse,
        req: Request,
        res: Response,
        next: NextFunction,
      ): void => {
        if (error instanceof CustomError) {
          res.status(error.statusCode).json(error.serializeErrors());
          return;
        }

        log.error('Unexpected error:', error);

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          message: 'Internal server error',
        });
      },
    );
  }

  private async startServer(app: Application): Promise<void> {
    // Start the server and listen on the specified port
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.error('Error creating Socket.IO server:', error);
    }
  }
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    // Implement Socket.IO integration here (e.g., real-time communication)
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      },
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.allSettled([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }
  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server has started with process id ${process.pid}`);
    httpServer.listen(PORT, () => {
      log.info(`HTTP server is running on port ${PORT}`);
    });
  }

  private socketIOConnection(io: Server): void {}
}
