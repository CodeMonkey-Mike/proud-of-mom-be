import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import User from "./user.entity";

export enum GENDERS {
  MALE = "male",
  FEMALE = "female"
}

@ObjectType()
@Entity({ name: "profile" })
export default class Profile extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  picture!: string; 
  
  @Field()
  @Column()
  address1!: string;

  @Field()
  @Column()
  address2!: string; 

  @Field()
  @Column()
  state_province!: string;

  @Field()
  @Column()
  country!: number;
  
  @Field()
  @Column()
  postal_code!: string; 

  @Field()
  @Column()
  user_id!: number;

  @OneToOne(type => User, user => user.info)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Field()
  @Column({
    type: "enum",
    enum: GENDERS,
    default: GENDERS.MALE
  })
  gender!: GENDERS;

  @Field(() => String)
  @CreateDateColumn()
  created_at: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updated_at: Date; 
}
