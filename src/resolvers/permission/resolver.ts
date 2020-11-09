import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  ObjectType,
  FieldResolver
} from "type-graphql";
import {FieldError} from "../user/resolver";
import Permission from "../../db/entities/permission.entity";
import {getConnection} from "typeorm";

@ObjectType()
class PermissionResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => Permission, {nullable: true})
  permission?: Permission;
}

@Resolver(Permission)
export class PermissionResolver {
  @FieldResolver(() => String)

  // List all roles
  @Query(() => [Permission], {nullable: true})
  async permissionList() : Promise < Permission[] | null > {
      const permissions = await Permission.find();
      return permissions;
  }

  // create new Permission
  @Mutation(() => PermissionResponse)
  async create(@Arg("name")name : string,) : Promise < PermissionResponse > {
      let permission;
      // validate role information are corect check user existed
      const count = await Permission.count({
          where: {
              name: name.toLowerCase()
          }
      });
      if (count > 0) {
          return {
              errors: [
                  {
                      field: "name",
                      message: "The permission already existed"
                  }
              ]
          }
      } else {
          try {
              const result = await getConnection()
                  .createQueryBuilder()
                  .insert()
                  .into(Permission)
                  .values({name: name})
                  .returning("*")
                  .execute();
              permission = result.raw[0];

          } catch (err) {
              throw new Error(err);
          }
      }

      return {permission};
  }
  // delete new role
  @Mutation(() => Boolean)
  async deletePermission(@Arg("id")id : number) {
      const permission = await Permission.find({
          where: {
              id: id
          }
      })
      await Permission.remove(permission);
      return true;
  }
  // update role
  @Mutation(() => PermissionResponse)
  async updatePermission(@Arg("id")id : number, @Arg("name")name : string) {
      await Permission.update({
          id: id
      }, {name: name});
      const permission = await Permission.findOne(id);
      return {permission};
  }
}
