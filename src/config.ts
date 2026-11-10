import dotenv from 'dotenv';
import bunyan from 'bunyan';
dotenv.config({});

class Config {
  public DATABASE_URL: string = process.env.DATABASE_URL || '';
  public JWT_TOKEN: string = process.env.JWT_TOKEN || '';
  public NODE_ENV: string = process.env.NODE_ENV || '';
  public SECRET_KEY_ONE: string = process.env.SECRET_KEY_ONE || '';
  public SECRET_KEY_TWO: string = process.env.SECRET_KEY_TWO || '';
  public CLIENT_URL: string = process.env.CLIENT_URL || '';
  public REDIS_HOST: string = process.env.REDIS_HOST || '';

  private readonly DEFAULT_DATABASE_URL: string =
    'mongodb+srv://emirmustafoski92:emirmustafoski92@cluster0..mongodb.net/myDatabase';

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || 'thisissecretcookiekey';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
  }
  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'string' && value.trim() === '') {
        throw new Error(`${key} is not defined in the environment variables`);
      }
      if (value === undefined) {
        throw new Error(
          `Configuration error: ${key} is not defined in the environment variables`,
        );
      }
    }
  }
}

export const config: Config = new Config();
