import { ConnectionOptions } from "typeorm";
import path from "path";
import {
  HOST,
  PORT,
  USERNAME,
  PASSWORD,
  DATABASE,
  ENTITIES,
  MIGRATIONS,
  MIGRATIONS_DIR,
} from "./constants";

const config: ConnectionOptions = {
  type: "postgres",
  host: HOST,
  port: Number(PORT),
  username: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  logging: true,
  entities: [ENTITIES || 'src/db/entities/*.entity{.ts,.js}'],
  migrations: [MIGRATIONS || 'src/db/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: path.join(__dirname, "./" + MIGRATIONS_DIR),
  },
};
export default config;
