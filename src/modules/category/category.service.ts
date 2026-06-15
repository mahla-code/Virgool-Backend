import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { conflictMessage, NotFoundMessage, PublicMessage } from 'src/common/enums/message.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationGenerator, PaginatioSolver} from 'src/common/utils/pagination.utils';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository:Repository<CategoryEntity>
  ){}

  async create(createCategoryDto: CreateCategoryDto) {
    let {title,priority}=createCategoryDto
    title=await this.checkExistAndResolveTitle(title)
    const category=this.categoryRepository.create({
      title,
      priority
    })
    await this.categoryRepository.save(category)
    return{
      message:PublicMessage.created
    }
    
  }
  async InsertByTitle(title:string){
    const category=await this.categoryRepository.create({title})
    return await this.categoryRepository.save(category)
  }
  async checkExistAndResolveTitle(title:string){
    title=title?.trim()?.toLocaleLowerCase()
    const category=await this.categoryRepository.findOneBy({title})
    if(category) throw new ConflictException(conflictMessage.ExistTitle)
    return title
  }

  async findAll(PaginationDto:PaginationDto) {
    const {limit,page,skip}=PaginatioSolver(PaginationDto)
    const [categories,count] =await this.categoryRepository.findAndCount({
      where:{},
      skip,
      take:limit
    })
    return{
      pagination:PaginationGenerator(count,page,limit),
      categories
    }
  }

  async findOne(id: number) {
    const category=await this.categoryRepository.findOneBy({id})
    if( ! category) throw new NotFoundException(NotFoundMessage.NotFoundCategory)
    return category
  }
  async findOneByTitle(title:string){
    return await this.categoryRepository.findOneBy({title})
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category=await this.findOne(id)
    const {priority,title}=updateCategoryDto
    if(title) category.title=title
    if(priority) category.priority=priority
    await this.categoryRepository.save(category)
    return{
      message:PublicMessage.updated
    }
  }
  
  async remove(id: number) {
    await this.findOne(id)
    await this.categoryRepository.delete({id})
    return{
      message:PublicMessage.deleted
    }
    
  }
}
