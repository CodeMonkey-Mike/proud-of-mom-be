import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field, 
  ObjectType,
  FieldResolver, 
} from "type-graphql";  
import { FieldError } from "../user/resolver";
import Role from "../../db/entities/role.entity";
import { getConnection } from "typeorm";

@ObjectType()
class RoleResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Role, { nullable: true })
  role?: Role;
}

@Resolver(Role)
export class RoleResolver {
  @FieldResolver(() => String)
   

  // List all roles
  @Query(() => [Role], { nullable: true })
  async roleList(): Promise<Role[] | null> {
    const roles = await Role.find();
    return roles;
  }

  // create new role
  @Mutation(() => RoleResponse)
  async create(
    @Arg("name") name: string, 
  ): Promise<RoleResponse> {  
    let role;
    // validate role information are corect  
    // check user existed
    const count = await Role.count({
      where: {
        name: name.toLowerCase()
      }
    });
    if (count > 0) {
      return {
        errors: [
          {
            field: "name",
            message: "The role already existed",
          },
        ],
      }
    } else {
      try { 
        const result = await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Role)
          .values({
            name: name,
          })
          .returning("*")
          .execute();
        role = result.raw[0];
        
      } catch (err) {
        throw new Error(err);
      }
    }  

    return { role };
  }
  // delete new role
  @Mutation(() => Boolean)
  async deleteRole(@Arg("id") id: number)  {
    const role = await Role.find({
      where: {
        id: id
      }
    })
    await Role.remove(role);
    return true;
  } 
  // update role
  @Mutation(()=>RoleResponse)
  async updateRole(
    @Arg("id") id: number,
    @Arg("name") name: string
    ) { 
    await Role.update(
      { id: id },
      { 
        name: name, 
      }
      );  
    const role = await Role.findOne(id);
    return {
      role,
    };
  }
}
