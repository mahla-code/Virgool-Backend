import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ProfileEntity } from './entities/profile.entity';
import { OtpEntity } from './entities/otp.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FolllowEntity } from './entities/follow.entity';

@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature([UserEntity,ProfileEntity,OtpEntity,FolllowEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService,TypeOrmModule]
})
export class UserModule {}
