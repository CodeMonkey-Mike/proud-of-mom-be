import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  Ctx,
  ObjectType,
  FieldResolver,
  Root,
} from "type-graphql";
import UsernamePasswordInput from "./UsernamePasswordInput";
import { getConnection } from "typeorm";
import bcrypt from "bcrypt";
import { Context } from "koa";
import redisStore from "koa-redis";
import { Session } from "koa-session";
import {v4} from "uuid";
import { validateRegister } from "./validateRegister"; 
import { sendEmail } from "../../utils/sendEmail";
import User from "../../db/entities/user.entity";

const FORGET_PASSWORD_PREFIX = 'forgotPassword';
const SESSION_NAME = "sid";
const saltRounds = 10;

export type UserContext = {
  ctx : Context;
  session: Session;
  redis: redisStore.RedisSessionStore;
}

@ObjectType()
export class FieldError {
  @Field()
  field!: string;
  @Field()
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { ctx, session }: UserContext) {
    if (session.isNew && session.userId  === user.id) {
      return user.email;
    }
    return "";
  }
  // query profile
  @Query(() => User, { nullable: true })
  me(@Ctx() { ctx, session }: UserContext) {
    console.log(ctx.cookies.get('pom:sess'));
    // you are not logged in
    if (!session.userId) {
      return null;
    }

    return User.findOne(session.userId);
  }
  // account register 
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { ctx, session }: UserContext
  ): Promise<UserResponse> {  
    let user;
    // validate user information are corect
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    // check user existed
    const count = await User.count({
      where: {
        email: options.email
      }
    });
    if (count > 0) {
      return {
        errors: [
          {
            field: "email",
            message: "The account already existed",
          },
        ],
      }
    } else {
      try {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(options.password, salt);
        const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({
            username: options.username,
            email: options.email,
            role_id: 2,
            password: hashedPassword,
          })
          .returning("*")
          .execute();
        user = result.raw[0];
        
      } catch (err) {
        throw new Error(err);
      }
    } 
    
    // console.log(ctx);
    session.userId = user.id;
    session.save();

    return { user };
  }
  // acount login
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,    @Ctx() { ctx, redis, session }: UserContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) { 
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username doesn't exist",
          },
        ],
      };
    }
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) { 
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }
    session.userId = user.id;

    return {
      user,
    };
  }
  //forgot password
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() {redis} : UserContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) { 
      return  false;
    }
    
    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      [user.id],
      1000 * 60 * 60 * 24 * 1,
       {
        changed: false,
        rolling: true
      }
    ); // 1 days expire 
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token, 1000 * 60 * 60 * 24 * 1, {rolling:true});
    // console.log('client_id', userId);
    try {
      await sendEmail(
        email,
        `Click to <a href="http://localhost:3000/change-password/${token}">reset your password</a>`
      );
    } catch (error) {
      console.log(error);
    }

    return true;
  }
  // confirm password
  @Mutation(()=>UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, ctx, session } : UserContext
  ): Promise<UserResponse | null> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Length must be greater than 4",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token; 
    const userId = await redis.get(key, undefined, {rolling: undefined});
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    await User.update(
      { id: userIdNum },
      {
        password: hashedPassword,
      }
    );

    await redis.destroy(key);

    // log in user after change password
    session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { ctx }: UserContext) {
    return new Promise((resolve) =>
      ctx.session?.destroy((err:any) => {
        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
