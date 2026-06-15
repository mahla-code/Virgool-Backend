import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TypeORMConfig } from 'src/config/typeorm.config';
import { UserModule } from 'src/modules/user/user.module';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { BlogModule } from '../blog/blog.module';
import { ImageModule } from '../image/image.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [ConfigModule.forRoot({
    envFilePath:join(process.cwd(),'.env'),
    isGlobal:true
  }),
  TypeOrmModule.forRoot(TypeORMConfig()),
  AuthModule,
  UserModule,
  CategoryModule,
  BlogModule,
  ImageModule,
  HttpModule
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
