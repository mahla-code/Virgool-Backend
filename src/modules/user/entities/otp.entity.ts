import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityName.otp)
export class OtpEntity extends BaseEntity{
    @Column()
    code:string
    @Column()
    expires_in:Date
    @Column()
    userId:number
    @Column({nullable:true})
    method:string
    @OneToOne(()=>UserEntity,user=>user.otp)
    user:UserEntity
}