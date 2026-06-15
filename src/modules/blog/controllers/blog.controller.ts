import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BlogService } from '../services/blog.service';
import { CreateBlogDto, FilterBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { skipAuth } from 'src/common/decorators/skip_auth.decorator';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { filterBlog } from 'src/common/decorators/filter.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger.consume.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';

@Controller('blog')
@ApiTags("Blog")
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.urlEncodede, SwaggerConsumes.Json)
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }
  @Get('/my')
  myBlog(){
    return this.blogService.myBlog()
  }
  @Get('/')
  @skipAuth()
  @Pagination()
  @filterBlog()
  find(@Query() paginationDto:PaginationDto,filterDto:FilterBlogDto){
    return this.blogService.blogList(paginationDto,filterDto)
  }
  @Get('/by-slug/:slug')
  @Pagination()
  findOneBySlug(@Param('slug') slug:string,@Query() PaginationDto:PaginationDto){
    return this.blogService.findOneBySlug(slug,PaginationDto)
  }
  @Get('/like/:id')
  likeToggle(@Param('id',ParseIntPipe) id:number){
    return this.blogService.likeToggle(id)
  }
  @Get('/bookmark/:id')
  bookMarkToggle(@Param('id',ParseIntPipe) id:number){
    return this.blogService.bookMarkToggle(id)
  }
  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Put(':id')
  @ApiConsumes(SwaggerConsumes.urlEncodede, SwaggerConsumes.Json)
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.blogService.delete(+id);
  }
}
