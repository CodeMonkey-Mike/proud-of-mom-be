import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();
import processEnv from "./env";

processEnv();

import Koa, { Context } from "koa"; 
import session from "koa-session";
import cors from "@koa/cors"; 
import { ApolloServer } from "apollo-server-koa";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user/resolver";
import { createConnection } from "typeorm";
import config from "./utils/ormconfig"; 
import { RoleResolver } from "./resolvers/role/resolver";
import { graphqlUploadKoa } from "graphql-upload";
import { MediaResolver } from "./resolvers/media/resolver";
import { CountryResolver } from "./resolvers/country/resolver";
import { ProfileResolver } from "./resolvers/profile/resolver";
// import { PermissionResolver } from "./resolvers/permission/resolver";

const app = new Koa();
const path = "/graphql";
const PORT = process.env.HTTP_PORT || 4000; 
app.keys = [process.env.SESSION_SECRET||'qowiueojwojfalksdjoqiwueo']; 
const isProd = process.env.NODE_ENV === 'production' ? true : false;
app.proxy = true;
const SESSION_CONFIG:any = {
  key: 'pom:sess',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days 
  overwrite: true, 
  autoCommit: true,
  httpOnly: !isProd,
  signed: true,  
  rolling: true,
  renew: false,
  secure: isProd,
  domain: isProd ? process.env.DOMAIN || '.proudofmom.com' : 'localhost'
};

const main = async () => {
  try {
    const connection = await createConnection(config);
    // await connection.dropDatabase(); // only test under local env 
    await connection.runMigrations();
    console.log("DB connecting!");
    const schema = await buildSchema({
      resolvers: [UserResolver, RoleResolver, MediaResolver, CountryResolver, ProfileResolver],
    }); 
    
    // Enable cors with default options
    const corsOptions = {
      credentials: true
    };
    app.use(cors(corsOptions));
    app.use(session(SESSION_CONFIG, app));
    
    const apolloServer = new ApolloServer({
      schema,
      introspection: true,
      playground: !isProd,
      tracing: true,
      context: ({ctx}: Context) => ({
        ctx,
        session: ctx.session, 
      }),
    });
    apolloServer.applyMiddleware({ app, path, bodyParserConfig: true });  
    app.use(graphqlUploadKoa({ maxFileSize: 1000*5, maxFiles: 10 }));
    app.listen(PORT, () => {
      console.log(`🚀 started ${PORT}${path}`);
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

main();
