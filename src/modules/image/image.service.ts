import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ImageDto } from './dto/image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { multerfile } from 'src/common/utils/multer.util';
import { NotFoundMessage, PublicMessage } from 'src/common/enums/message.enum';


@Injectable({scope:Scope.REQUEST})
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private imageRepository:Repository<ImageEntity>,
    @Inject(REQUEST) private request:Request
  ){}
  async create(ImageDto: ImageDto,image:multerfile) {
    const userId=this.request.user?.id
    const{alt,name}=ImageDto
    let location=image?.path.slice(7)
    await this.imageRepository.insert({
      alt:alt ?? name,
      name,
      location,
      userId,
    })
    return{
      message:PublicMessage.created
    }
  }

  findAll() {
    const userId=this.request.user?.id
    return this.imageRepository.find({
      where:{userId},
      order:{id:"DESC"}
    })
  }
  
  async findOne(id: number) {
    const userId=this.request.user?.id
    const image=await this.imageRepository.findOne({
      where:{userId,id},
      order:{id:"DESC"}
    })
    if(!image) throw new NotFoundException(NotFoundMessage.NotFoundImage)
    return image
    
  }

  async remove(id: number) {
  const image=await this.findOne(id)
  await this.imageRepository.remove(image)
  return {
    mesage:PublicMessage.deleted
  }
  }
}
