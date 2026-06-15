import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger.consume.enum';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Pagination()
  findAll(@Query()  paginatiodto:PaginationDto) {
    return this.categoryService.findAll(paginatiodto);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
