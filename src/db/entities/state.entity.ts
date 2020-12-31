import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity({ name: "state" })
export default class State extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number; 

  @Field()
  @Column()
  name!: string;

  @Field(() => String)
  @Column()
  contry_id!: number;

  @Field(() => String)
  @CreateDateColumn()
  created_at: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updated_at: Date; 
}
