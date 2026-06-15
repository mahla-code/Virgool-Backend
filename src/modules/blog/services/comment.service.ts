import { BadRequestException, forwardRef, Inject, Injectable,NotFoundException,Scope } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { IsNull, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BlogCommentEntity } from '../entities/comment.entity';
import { BlogService } from './blog.service';
import { BadRequestMessage, NotFoundMessage, PublicMessage } from 'src/common/enums/message.enum';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationGenerator, PaginatioSolver } from 'src/common/utils/pagination.utils';

@Injectable({scope:Scope.REQUEST})
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogEntity) private blogrepository:Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity) private blogCommentrepository:Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request:Request,
    @Inject(forwardRef(()=>BlogService))private blogService:BlogService
  ){}
  async create(createCommentDto: CreateCommentDto) {
    const {text,parentId,blogId}=createCommentDto
    const userId=this.request.user?.id
    const blog=await this.blogService.checkExistBlogById(blogId)
    let parent:null | BlogCommentEntity=null
    if(parentId && isNaN(parentId)){
      parent=await this.blogCommentrepository.findOneBy({id:+parentId})
    }
    await this.blogCommentrepository.insert({
      text,
      accepted:true,
      blogId,
      userId,
      parentId:parent?parentId:null
    })
    return{
      message:PublicMessage.CreatedComment
    }

  }
  async find(paginationDto:PaginationDto){
    const {limit,page,skip}=PaginatioSolver(paginationDto)
    const [comments,count]=await this.blogCommentrepository.findAndCount({
      where:{},
      relations:{
        blog:true,
        user:true
      },
      select:{
        blog:{
          title:true
        },
        user:{
          username:true,
          profile:{
            nick_name:true
          }
        }
      },
      skip,
      take:limit,
      order:{
        id:"DESC"
      }
    })
    return{
      pagination:PaginationGenerator(count,page,limit),
      comments
    }
  }
  async findCommentsOfBlog(blogId:number,paginationDto:PaginationDto){
    const {limit,page,skip}=PaginatioSolver(paginationDto)
    const [comments,count]=await this.blogCommentrepository.findAndCount({
      where:{
        blogId,
        parentId:IsNull()
      },
      relations:{
        user:{
          profile:true
        },
        children:{
          user:{
            profile:true
          },
          children:{
            user:{
              profile:true
            }
          }
        }
      },
      select:{
        user:{
          username:true,
          profile:{
            nick_name:true
          }
        },
        children:{
          text:true,
          created_at:true,
          parentId:true,
          user:{
            username:true,
            profile:{
              nick_name:true
            }
          },
          children:{
            text:true,
            created_at:true,
            parentId:true,
            user:{
              username:true,
              profile:{
                nick_name:true
              }
           },
          }
        }
      },
      skip,
      take:limit,
      order:{
        id:"DESC"
      }
    })
    return{
      pagination:PaginationGenerator(count,page,limit),
      comments
    }
  }
  async checkExistById(id:number){
    const comment=await this.blogCommentrepository.findOneBy({id})
    if(!comment) throw new NotFoundException(NotFoundMessage.NotFoundComment)
    return comment
  }
  async accept(id:number){
    const comment=await this.checkExistById(id)
    if(comment.accepted) throw new BadRequestException(BadRequestMessage.AlreadyAccepted)
    comment.accepted=true
    await this.blogCommentrepository.save(comment)
    return{
      message:PublicMessage.updated
    }
  }
  async reject(id:number){
    const comment=await this.checkExistById(id)
    if(!comment.accepted) throw new BadRequestException(BadRequestMessage.AlreadyRejected)
    comment.accepted=false
    await this.blogCommentrepository.save(comment)
    return{
      message:PublicMessage.updated
    }
  }
}
