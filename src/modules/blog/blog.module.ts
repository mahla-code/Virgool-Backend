import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './services/blog.service';
import { BlogController } from './controllers/blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';
import { BlogCategoryEntity } from './entities/blog_category.entity';
import { BlogBookMarksEntity } from './entities/bookmark.entity';
import { BlogCommentEntity } from './entities/comment.entity';
import { BlogCommentService } from './services/comment.service';
import { AddUserToReqWOV } from 'src/common/middleware/addUserToReqWOV.middleware';

@Module({
  imports:[AuthModule,TypeOrmModule.forFeature([
    BlogEntity,
    CategoryEntity,
    BlogCategoryEntity,
    BlogBookMarksEntity,
    BlogCommentEntity
  ])],
  controllers: [BlogController],
  providers: [BlogService,CategoryService,BlogCommentService],
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddUserToReqWOV).forRoutes("/blog/by-slug/:slug")
  }
}
