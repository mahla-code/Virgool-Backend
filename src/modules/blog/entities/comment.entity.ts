import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity(EntityName.blogComment)
export class BlogCommentEntity extends BaseEntity{
    @Column()
    text:Text
    @Column({default:true})
    accepted:boolean
    @Column()
    userId:number
    @Column()
    blogId:number
    @Column({nullable:true})
    parentId:number | null
    @CreateDateColumn()
    created_at:Date
    @ManyToOne(()=>UserEntity,user=>user.blog_comments,{onDelete:"CASCADE"})
    user:UserEntity
    @ManyToOne(()=>BlogEntity,Blog=>Blog.comments,{onDelete:"CASCADE"})
    blog:BlogEntity
    @ManyToOne(()=>BlogCommentEntity,parent=>parent.children)
    parent:BlogCommentEntity
    @OneToMany(()=>BlogCommentEntity,comment=>comment.parent)
    children:BlogCommentEntity[]


    
}