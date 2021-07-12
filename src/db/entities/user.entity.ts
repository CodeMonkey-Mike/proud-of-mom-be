import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import Profile from "./profile.entity";

export enum STATUSS {
  ACTIVE = 1,
  BANNED = 0
}
@ObjectType()
@Entity({ name: "user" })
export default class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @OneToOne(() => Profile, profile => profile.user)
  @Field(() => Profile, { nullable: true})
  info: Profile;
  
  @Field()
  @Column()
  role_id!: number; 

  @Column()
  password!: string;

  @Field()
  @Column({
    type: "enum",
    enum: STATUSS,
    default: STATUSS.ACTIVE
  })
  user_status_id: STATUSS;

  @Field(() => String)
  @CreateDateColumn()
  created_at: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updated_at: Date; 
}
