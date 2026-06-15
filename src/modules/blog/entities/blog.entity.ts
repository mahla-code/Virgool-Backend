import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { BlogStatus } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BlogLikesEntity } from "./likes.entity";
import { BlogBookMarksEntity } from "./bookmark.entity";
import { BlogCommentEntity } from "./comment.entity";
import {IsNumberString} from "class-validator";
import { BlogCategoryEntity } from "./blog_category.entity";
@Entity(EntityName.blog)
export class BlogEntity extends BaseEntity {
    @Column()
    title:string
    @Column()
    description:string 
    @Column()
    content:string
    @Column({nullable:true})
    image:string
    @Column({unique:true})
    slug:string
    @Column()
    @IsNumberString()
    time_for_study:string
    @Column({default:BlogStatus.draft})
    status:string
    @Column()
    authorId:number
    @CreateDateColumn()
    created_at:Date
    @UpdateDateColumn()
    updated_at:Date
    @ManyToOne(()=> UserEntity,user=>user.blogs,{onDelete:"CASCADE"})
    author:UserEntity
    @OneToMany(()=>BlogLikesEntity,like=>like.blog)
    likes:BlogLikesEntity[]
    @OneToMany(()=>BlogCategoryEntity,category=>category.blog)
    categories:BlogCategoryEntity[]
    @OneToMany(()=>BlogBookMarksEntity,blogBookmark=>blogBookmark.blog)
    bookmarks:BlogBookMarksEntity[]
    @OneToMany(()=>BlogCommentEntity,comment=>comment.blog)
    comments:BlogCommentEntity[]
}
