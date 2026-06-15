import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateBlogDto, FilterBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateSlug, randomId } from 'src/common/utils/function.util';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { BlogStatus } from '../enums/status.enum';
import { BadRequestMessage, NotFoundMessage, PublicMessage } from 'src/common/enums/message.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationGenerator, PaginatioSolver } from 'src/common/utils/pagination.utils';
import { BlogCategoryEntity } from '../entities/blog_category.entity';
import { CategoryService } from '../../category/category.service';
import { isArray } from 'class-validator';
import { EntityName } from 'src/common/enums/entity.enum';
import { BlogLikesEntity } from '../entities/likes.entity';
import { BlogBookMarksEntity } from '../entities/bookmark.entity';
import { BlogCommentService } from './comment.service';

@Injectable({scope:Scope.REQUEST})
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity) private blogrepository:Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity) private blogCategoryrepository:Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikesEntity) private blogLikerepository:Repository<BlogLikesEntity>,
    @InjectRepository(BlogBookMarksEntity) private blogBookmarkrepository:Repository<BlogBookMarksEntity>,
    @Inject(REQUEST) private request:Request,
    private categoryService:CategoryService,
    private blogCommentService:BlogCommentService,
    private dataSource:DataSource
  ){}
  async create(createBlogDto: CreateBlogDto) {
    let {title,slug,content,description,time_for_study,image,categories}=createBlogDto
    if(!isArray(categories) && typeof categories==="string"){
      categories=categories.split(",")
    }else if(! isArray(categories)) throw new BadRequestException(BadRequestMessage.InvalidCategories)
    let slugData=slug ?? title
    slug =CreateSlug(slugData)
    const isExist=await this.checkBlogBySlug(slug)
    if(isExist) slug+=`_${randomId()}`
    const user=this.request.user
    let blog=this.blogrepository.create({
      title,
      slug,
      description,
      content,
      image,
      status:BlogStatus.draft,
      time_for_study,
      authorId:user?.id
    })
    blog=await this.blogrepository.save(blog)
    for (const categoryTitle of categories) {
      let category=await this.categoryService.findOneByTitle(categoryTitle)
      if(!category){
        await this.categoryService.InsertByTitle(categoryTitle )
      }
      await this.blogCategoryrepository.insert({
        blogId:blog.id,
        categoryId:category?.id
      })
    }
    return{
      message:PublicMessage.created
    }
  }
  async checkBlogBySlug(slug:string){
    const blog=await this.blogrepository.findOneBy({slug})
    return blog
  }
  async myBlog(){
    const userId=this.request.user?.id
    return this.blogrepository.find({
      where:{
        authorId:userId
      },
      order:{
        id:"DESC"
      }
    })
  }
  async blogList(paginationDto:PaginationDto,filterDto:FilterBlogDto){
    const {limit,page,skip}=PaginatioSolver(paginationDto)
    let{category,search}=filterDto
    let where=''
    if(category){
      category=category.toLowerCase()
      if(where.length>0) where+=' AND '
      where+='category.title= LOWER(:category)'
    }
    if(search){
      if(where.length>0) where+=' AND '
      search=`%${search}%`
      where+='CONCAT(blog.title,blog.description,blog.concat ILIKE:search'
    }
    const [blogs,count]=await this.blogrepository.createQueryBuilder(EntityName.blog)
    .leftJoin("blog.categories","categories")
    .leftJoin("categories.category","category")
    .leftJoin("blog.author","author")
    .leftJoin("author.profile","profile")
    .addSelect(["categories.id","categoty.title","author.username","author.id","profile.nickname"])
    .where(where,{category,search})
    .loadRelationCountAndMap("blog.likes","blog.likes")
    .loadRelationCountAndMap("blog.bookmarks","blog.bookmarks")
    .loadRelationCountAndMap("blog.comments","blog.comments","comments", qb=>
      qb.where("comments.accepted=:accepted",{accepted:true}))
    .skip(skip)
    .take(limit)
    .getManyAndCount()
    // const[blogs,count]=await this.blogrepository.findAndCount({
    //   relations:{
    //     categories:{
    //       category:true
    //     }
    //   },
    //   where,
    //   select:{
    //     categories:{
    //       id:true,
    //       category:{
    //         title:true
    //       }
    //     }
    //   },
    //   order:{
    //     id:'DESC'
    //   },
    //   skip,
    //   take:limit
    // })
    return{
      pagination:PaginationGenerator(count,page,limit),
      blogs
    }
  }
  async findOneBySlug(slug:string,paginationDto:PaginationDto){
    const userId=this.request.user?.id
    const blog=await this.blogrepository.createQueryBuilder(EntityName.blog)
      .leftJoin("blog.categories","categories")
      .leftJoin("categories.category","category")
      .leftJoin("blog.author","author")
      .leftJoin("author.profile","profile")
      .addSelect([
        "categories.id",
        "categoty.title",
        "author.username","author.id","profile.nickname"])
      .where({slug})
      .loadRelationCountAndMap("blog.likes","blog.likes")
      .loadRelationCountAndMap("blog.bookmarks","blog.bookmarks")
      .getOne()
    if(!blog) throw new NotFoundException(NotFoundMessage.NotFoundBlog)
    const commentData=await this.blogCommentService.findCommentsOfBlog(blog.id,paginationDto)
    let isLiked:null |boolean=null
    let isBookMarked:null |boolean=null
    if(userId && !isNaN(userId) && userId>0){
      isLiked=!!(await this.blogLikerepository.findOneBy({userId,blogId:blog.id}))
      isBookMarked=!!(await this.blogBookmarkrepository.findOneBy({userId,blogId:blog.id}))
    }
    const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      const suggestBlogs = await queryRunner.query(`
        WITH suggested_blogs AS (
          SELECT 
            blog.id,
            blog.slug,
            blog.title,
            blog.description,
            blog.time_for_study,
            blog.image,
            json_build_object(
              'username', u.username,
              'author_name', p.nick_name,
              'image', p.image_profile
            ) AS author,
            array_agg(DISTINCT cat.title) AS categories,
            (
              SELECT COUNT(*) FROM blog_likes
              WHERE blog_likes."blogId" = blog.id
            ) AS likes,
            (
              SELECT COUNT(*) FROM blog_bookmarks
              WHERE blog_bookmarks."blogId" = blog.id
            ) AS bookmarks,
            (
              SELECT COUNT(*) FROM blog_comments
              WHERE blog_comments."blogId" = blog.id
            ) AS comments
          FROM blog
          LEFT JOIN public.user u ON blog."authorId" = u.id
          LEFT JOIN profile p ON p."userId" = u.id
          LEFT JOIN blog_category bc ON blog.id = bc."blogId"
          LEFT JOIN category cat ON bc."categoryId" = cat.id
          GROUP BY blog.id, u.username, p.nick_name, p.image_profile
          ORDER BY RANDOM()
          LIMIT 3

        )
        SELECT * FROM suggested_blogs
      `);
    return {
      blog,
      isLiked,
      isBookMarked,
      commentData,
      suggestBlogs
    }
    
  }
  async likeToggle(blogId:number){
    const userId=this.request.user?.id
    const blog=this.checkExistBlogById(blogId)
    const isLiked=await this.blogLikerepository.findOneBy({blogId})
    let message=PublicMessage.Liked
    if(isLiked){
      message=PublicMessage.Disliked
    }else{
      await this.blogLikerepository.insert({
        blogId,
        userId
      })

    }
    return {message}
  }
  async bookMarkToggle(blogId:number){
    const userId=this.request.user?.id
    const blog=this.checkExistBlogById(blogId)
    const isBookMarked=await this.blogBookmarkrepository.findOneBy({blogId})
    let message=PublicMessage.BookMarkrd
    if(isBookMarked){
      message=PublicMessage.UnBookMarked
    }else{
      await this.blogBookmarkrepository.insert({
        blogId,
        userId
      })

    }
    return {message}
  }

  findAll() {
    return `This action returns all blog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  async checkExistBlogById(id:number){
    const blog=await this.blogrepository.findOneBy({id})
    if(!blog) throw new NotFoundException(NotFoundMessage.NotFoundBlog)
      return blog
  }
  async update(id: number, updateBlogDto: UpdateBlogDto) {
    let {title,slug,content,description,time_for_study,image,categories}=updateBlogDto
    const blog=await this.checkExistBlogById(id)
    if(!isArray(categories) && typeof categories==="string"){
      categories=categories.split(",")
    }else if(! isArray(categories)) throw new BadRequestException(BadRequestMessage.InvalidCategories)
    let slugData:string | null=null
    if(title){
      slugData=title,
      blog.title=title
    }
    if(slug){
      slugData=slug
    }
    if(slugData){
      slug =CreateSlug(slugData)
      const isExist=await this.checkBlogBySlug(slug)
      if(isExist && isExist.id !==id) slug+=`_${randomId()}`
      blog.slug=slug
    }
    if(description) blog.description=description
    if(content) blog.content=content
    if(image) blog.image=image
    if(time_for_study) blog.time_for_study=time_for_study
    await this.blogrepository.save(blog)
    if(categories && isArray(categories) && categories.length>0){
      await this.blogCategoryrepository.delete({blogId:blog.id})
    }
    for (const categoryTitle of categories) {
      let category=await this.categoryService.findOneByTitle(categoryTitle)
      if(!category){
        await this.categoryService.InsertByTitle(categoryTitle )
      }
      await this.blogCategoryrepository.insert({
        blogId:blog.id,
        categoryId:category?.id
      })
    }
    return{
      message:PublicMessage.created
    }
  }
  async delete(id: number) {
    await this.checkExistBlogById(id)
    await this.blogrepository.delete({id})
    return{
      message:PublicMessage.deleted
    }
  }
}
