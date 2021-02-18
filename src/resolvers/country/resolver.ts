import {
  Resolver,
  Query, 
  FieldResolver
} from "type-graphql"; 
import Country from "../../db/entities/country.entity"; 

@Resolver(Country)
export class CountryResolver {
  @FieldResolver(() => String)

  // Get countries
  @Query(() => [Country], {nullable: true})
  async countries() : Promise < Country[] | null > {
      const countries = await Country.find();
      return countries;
  } 
}
