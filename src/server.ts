import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import Koa, { BaseContext } from "koa";
import session from "koa-session";
import { ApolloServer } from "apollo-server-koa";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user/resolver";
import { createConnection } from "typeorm";
import config from "./utils/ormconfig";

const app = new Koa();
const path = "/graphql";
const PORT = process.env.HTTP_PORT || 4000;
app.keys = [process.env.SESSION_SECRET||'qowiueojwojfalksdjoqiwueo'];
const SESSION_CONFIG:any = {
  key: 'koa:sess',
  maxAge: 86400000,
  overwrite: true, 
  httpOnly: process.env.NODE_ENV === 'production' ? true : false, 
  signed: true, 
  rolling: false,
  renew: false,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: 'none',
};

const main = async () => { 
  try {
    const connection = await createConnection(config);
    await connection.runMigrations();
    console.log("Migration done!");
    const schema = await buildSchema({
      resolvers: [UserResolver],
    }); 
    const apolloServer = new ApolloServer({
      schema,
      introspection: true,
      playground: true,
      tracing: true,
      context: (ctx: BaseContext) => ctx,
    });
    app.use(session(SESSION_CONFIG, app));
    apolloServer.applyMiddleware({ app, path, bodyParserConfig: true });  
    app.listen(PORT, () => {
      console.log(`🚀 started http://localhost:${PORT}${path}`);
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

main();
