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
import User from "../../db/entities/user.entity";
import UsernamePasswordInput from "./UsernamePasswordInput";
import { getConnection } from "typeorm";
import bcrypt from "bcrypt";
import { BaseContext } from "koa";
import { ContextSession } from "koa-session"; 
import { validateRegister } from "./validateRegister"; 

export type UserContext = {
  ctx : BaseContext & { session: ContextSession & { id: number }}
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
  email(@Root() user: User, @Ctx() { ctx }: UserContext) {
    if (ctx.session.id === user.id) {
      return user.email;
    }
    return "";
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { ctx }: UserContext) {
    // you are not logged in
    if (!ctx.session.id) {
      return null;
    }

    return User.findOne(ctx.session.id);
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { ctx }: UserContext
  ): Promise<UserResponse> { 
    const saltRounds = 10; 
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
    ctx.session.id = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,    @Ctx() { ctx }: UserContext
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

    ctx.session.id = user.id;

    return {
      user,
    };
  }
}
