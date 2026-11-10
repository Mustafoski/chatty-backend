import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import dataBaseConnection from './setupDatabase';
import { config } from './config';

class Application {
  public initialize(): void {
    this.loadConfig();
    dataBaseConnection();
    const app: Express = express();

    const server: ChattyServer = new ChattyServer();
    server.start();
  }
  private loadConfig(): void {
    // Load configuration settings here (e.g., environment variables, database connection strings)
    config.validateConfig();
  }
}

const application: Application = new Application();
application.initialize();
