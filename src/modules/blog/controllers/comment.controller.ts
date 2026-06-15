import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BlogCommentService } from '../services/comment.service';
import { SwaggerConsumes } from 'src/common/enums/swagger.consume.enum';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@Controller('blog_comment')
@ApiTags("blog")
@AuthDecorator()
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}
  @Post()
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.blogCommentService.create(createCommentDto);
  }
  @Get()
  @Pagination()
  find(@Query() PaginationDto: PaginationDto) {
    return this.blogCommentService.find(PaginationDto);
  }
  @Put("/accept/:id")
  accept(@Param("id",ParseIntPipe) id:number){
    return this.blogCommentService.accept(id)
  }
  @Put("/reject/:id")
  reject(@Param("id",ParseIntPipe) id:number){
    return this.blogCommentService.reject(id)
  }

}
