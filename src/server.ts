import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import Koa, { Context } from "koa";
// import session, { ContextSession } from "koa-session";
import session from "koa-session";
import cors from "@koa/cors";
// import redisStore from "koa-redis";
import { ApolloServer } from "apollo-server-koa";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user/resolver";
import { createConnection } from "typeorm";
import config from "./utils/ormconfig";
// import { logger } from "./utils/logger"; 
import { RoleResolver } from "./resolvers/role/resolver";

const app = new Koa();
const path = "/graphql";
const PORT = process.env.HTTP_PORT || 4000; 
app.keys = [process.env.SESSION_SECRET||'qowiueojwojfalksdjoqiwueo'];
// const redis = redisStore({
//   url: process.env.REDIS_URL
// })
const isProd = process.env.NODE_ENV === 'production' ? true : false;
const SESSION_CONFIG:any = {
  key: 'pom:sess',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  // store: redis,
  overwrite: true, 
  autoCommit: true,
  httpOnly: isProd,
  signed: true, 
  rolling: true,
  renew: false,
  secure: isProd,
};

const main = async () => { 
  try {
    const connection = await createConnection(config);
    // await connection.dropDatabase(); // only test under local env
    await connection.runMigrations();
    console.log("DB connecting!");
    const schema = await buildSchema({
      resolvers: [UserResolver, RoleResolver],
    }); 
    
    // Enable cors with default options
    const corsOptions = {
      credentials: true
    };
    app.use(cors(corsOptions));
    // Enable logger
    // app.use(logger());
    app.use(session(SESSION_CONFIG, app));
    const apolloServer = new ApolloServer({
      schema,
      introspection: true,
      playground: true,
      tracing: true,
      context: ({ctx}: Context) => ({
        ctx,
        session: ctx.session,
        // redis
      }),
    });
    apolloServer.applyMiddleware({ app, path, bodyParserConfig: true });  
    app.listen(PORT, () => { 
      const HOST = app.env === 'development' ? 'http://localhost' : 'http://www.proudofmom.com';
      console.log(`🚀 started ${HOST}:${PORT}${path}`);
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

main();
