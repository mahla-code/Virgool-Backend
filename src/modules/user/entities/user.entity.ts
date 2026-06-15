import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";
import { BlogLikesEntity } from "src/modules/blog/entities/likes.entity";
import { BlogBookMarksEntity } from "src/modules/blog/entities/bookmark.entity";
import { BlogCommentEntity } from "src/modules/blog/entities/comment.entity";
import { ImageEntity } from "src/modules/image/entities/image.entity";
import { Roles } from "src/common/enums/role.enum";
import { FolllowEntity } from "./follow.entity";

@Entity(EntityName.user)
export class UserEntity extends BaseEntity{
    @Column({unique:true,nullable:true})
    username:string
    @Column({unique:true,nullable:true})
    phone:string
    @Column({unique:true,nullable:true})
    email:string
    @Column({default:Roles.User})
    role:string
    @Column({nullable:true})
    status:string
    @Column({nullable:true})
    new_email:string|null
    @Column({nullable:true})
    new_phone:string|null
    @Column({nullable:true,default:false})
    verify_email:boolean
    @Column({nullable:true,default:false})
    verify_phone:boolean
    @Column({unique:true,nullable:true})
    password:string
    @CreateDateColumn()
    created_at:Date
    @UpdateDateColumn()
    updated_at:Date
    @Column({nullable:true})
    otpId:number
    @Column({nullable:true})
    profileId:number
    @OneToOne(()=>OtpEntity,otp=>otp.user,{nullable:true})
    @JoinColumn()
    otp:OtpEntity
    @OneToOne(()=>ProfileEntity,Profile=>Profile.user,{nullable:true})
    @JoinColumn()
    profile:ProfileEntity
    @OneToMany(()=>BlogEntity,blog=>blog.author)
    blogs:BlogEntity[]
    @OneToMany(()=>BlogLikesEntity,blog=>blog.user)
    blog_likes:BlogLikesEntity[]
    @OneToMany(()=>BlogBookMarksEntity,blog=>blog.user)
    blog_bookmarks:BlogBookMarksEntity[]
    @OneToMany(()=>BlogCommentEntity,blog=>blog.user)
    blog_comments:BlogCommentEntity[]
    @OneToMany(()=>ImageEntity,image=>image.user)
    images:ImageEntity[]
    @OneToMany(()=>FolllowEntity,follow=>follow.following)
    followers:FolllowEntity[]
    @OneToMany(()=>FolllowEntity,follow=>follow.follower)
    followings:FolllowEntity[]
    
}
