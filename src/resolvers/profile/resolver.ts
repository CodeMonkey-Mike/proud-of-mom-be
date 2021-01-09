import {
  Resolver, 
  Arg,
  Mutation,
  Field,
  ObjectType,
  FieldResolver
} from "type-graphql";
import {FieldError} from "../user/resolver";
import Profile from "../../db/entities/profile.entity"; 
import ProfileTypes from "./types";
import { getConnection } from "typeorm";

@ObjectType()
class ProfileResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => Profile, {nullable: true})
  profile?: Profile;
}

@Resolver(Profile)
export class ProfileResolver {
  @FieldResolver(() => String) 
  // update role
  @Mutation(() => ProfileResponse)
  async updateProfile(
    @Arg("options") options: ProfileTypes
    ) {
      const profile = await Profile.findOne(options.user_id);
      if(profile) {
        await Profile.update({user_id: options.user_id},
          {
            address1: options.address1,
            address2: options.address2,
            country: options.country,
            state_province: options.state_province,
            postal_code: options.postal_code,
            gender: options.gender,
          });
      } else {
        await getConnection()
          .createQueryBuilder()
          .insert()
          .into(Profile)
          .values({
            ...options
          })
          .execute();
      }
       
      return await Profile.findOne(options.user_id);
  }
}
