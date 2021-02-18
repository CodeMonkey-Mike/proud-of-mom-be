import { InputType, Field } from "type-graphql";
import { GENDERS } from "../../db/entities/profile.entity";

@InputType()
export default class ProfileTypes {
  @Field()
  address1!: string;
  @Field()
  address2!: string;
  @Field()
  country!: string;
  @Field()
  state_province!: string;
  @Field()
  postal_code!: string;
  @Field()
  gender!: GENDERS;
  @Field()
  user_id!: number;
}
