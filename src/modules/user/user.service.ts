import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import express from 'express';
import { ProfileDto } from './dto/profile.dto';
import { isDate } from 'class-validator';
import { Gender } from './enums/gender.enum';
import { ProfileImage } from './types/files';
import { BadRequestMessage, conflictMessage, NotFoundMessage, PublicMessage } from 'src/common/enums/message.enum';
import { AuthService } from 'src/modules/auth/auth.service';
import { TokenService } from 'src/modules/auth/token.service';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { OtpEntity } from './entities/otp.entity';
import { AuthMethod } from 'src/modules/auth/enums/method.enum';
import e from 'express';
import { FolllowEntity } from './entities/follow.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginationGenerator, PaginatioSolver } from 'src/common/utils/pagination.utils';
import { UserBlockDto } from '../auth/dto/auth.dto';
import { UserStatus } from './enums/status.enum';

@Injectable({scope:Scope.REQUEST})
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
    @InjectRepository(ProfileEntity) private profileRepository:Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository:Repository<OtpEntity>,
    @InjectRepository(FolllowEntity) private followRepository:Repository<FolllowEntity>,
    @Inject(REQUEST) private request:express.Request,
    private AuthServive:AuthService,
    private TokenService:TokenService,
  ){}
  async ChangeProfile(profileDto:ProfileDto , files:ProfileImage, user:UserEntity){
    if(files?.image_profile?.length>0){
      let [image]=files?.image_profile
      profileDto.image_profile=image.path?.slice(7)
    }
    if(files?.bg_image?.length>0){
      let [image]=files?.bg_image
      profileDto.bg_image=image.path?.slice(7)
    }
    const {id:userId,profileId}=user 
    let profile=await this.profileRepository.findOneBy({userId})
    const {bio,birthday,gender,linkedIn_profile,nick_name,image_profile,bg_image}=profileDto
    if(profile){
      if(nick_name) profile.nick_name=nick_name
      if(bio) profile.bio=bio
      if(birthday && isDate(new Date(birthday))) profile.birthday=new Date(birthday)
      if(gender && Object.values(Gender as any).includes(gender)) profile.gender=gender
      if(linkedIn_profile) profile.linkedIn_profile=linkedIn_profile
      if(image_profile) profile.image_profile=image_profile
      if(bg_image) profile.bg_image=bg_image

    }else{
      profile=this.profileRepository.create({
        bio,
        birthday,
        gender,
        linkedIn_profile,
        nick_name,
        userId,
        image_profile,
        bg_image

      })
    }
    profile=await this.profileRepository.save(profile)
    if(!profileId){
      await this.userRepository.update({id:userId},{
        profileId:profile.id

      })
    }
    return{
      message:PublicMessage.updated
    }

  }
  async find(paginationDto: PaginationDto) {
    const {limit, page, skip} = PaginatioSolver(paginationDto)
    const [users, count] = await this.userRepository.findAndCount({
      where: {},
      skip,
      take: limit
    })
    return {
      pagination: PaginationGenerator(count, page, limit),
      users
    }
  }
  profile(user:UserEntity){
    const {id}=user
    return this.userRepository.createQueryBuilder(EntityName.user)
    .where({id})
    .leftJoinAndSelect("user.profile","profile")
    .loadRelationCountAndMap("user.followers","user.followers")
    .loadRelationCountAndMap("user.followings","user.followings")
    .getOne()
  }
  async ChangeEmail(email:string){
    const id =this.request.user?.id
    const user=await this.userRepository.findOneBy({email})
    if(user && user.id !== id) throw new ConflictException(conflictMessage.ExistEmail)
    else if(user && user.id ===id){
      return{
        message:PublicMessage.updated
      }
    }
    await this.userRepository.update({id},{new_email:email})
    const otp=await this.AuthServive.SaveOtp(id!,AuthMethod.email)
    const token=this.TokenService.CreateEmailToken({email})
    return{
      code:otp.code,
      token
    }
  }
  async VerifyEmail(code:string){
    const userId=this.request.user?.id
    const new_email=this.request.user?.new_email
    const token=this.request.cookies?.[CookieKeys.emailOtp]
    if(!token) throw new BadRequestException(BadRequestMessage.ExpiresCode)
    const{email}=this.TokenService.VerifyEmailToken(token)
    if(email !== new_email)throw new BadRequestException(BadRequestMessage.SomeThingWentwrong)
    const otp=await this.CheckOtp(userId!,code)
    if(otp.method !==AuthMethod.email)throw new BadRequestException(BadRequestMessage.SomeThingWentwrong)
    await this.userRepository.update({id:userId},{
      email,
      verify_email:true,
      new_email:null
    })
    return {
      message:PublicMessage.updated
    }
  }
  async ChangePhone(phone:string){
    const id =this.request.user?.id
    const user=await this.userRepository.findOneBy({phone})
    if(user && user.id !== id) throw new ConflictException(conflictMessage.ExistPhone)
    else if(user && user.id ===id){
      return{
        message:PublicMessage.updated
      }
    }
    await this.userRepository.update({id},{new_phone:phone})
    const otp=await this.AuthServive.SaveOtp(id!,AuthMethod.phone)
    const token=this.TokenService.CreatePhoneToken({phone})
    return{
      code:otp.code,
      token
    }
  }
  async VerifyPhone(code:string){
    const userId=this.request.user?.id
    const new_phone=this.request.user?.new_phone
    const token=this.request.cookies?.[CookieKeys.phoneOtp]
    if(!token) throw new BadRequestException(BadRequestMessage.ExpiresCode)
    const{phone}=this.TokenService.VerifyPhoneToken(token)
    if(phone !== new_phone)throw new BadRequestException(BadRequestMessage.SomeThingWentwrong)
    const otp=await this.CheckOtp(userId!,code)
   if(otp.method !==AuthMethod.email)throw new BadRequestException(BadRequestMessage.SomeThingWentwrong)
    await this.userRepository.update({id:userId},{
      phone,
      verify_phone:true,
      new_phone:null
    })
    return {
      message:PublicMessage.updated
    }
  }
  async ChangeUserName(username:string){
    const id =this.request.user?.id
    const user=await this.userRepository.findOneBy({username})
    if(user && user.id !== id) throw new ConflictException(conflictMessage.ExistUsername)
    else if(user && user.id ===id){
      return{
        message:PublicMessage.updated
      }
    }
    await this.userRepository.update({id},{username})
    return{
      message:PublicMessage.updated
    }
  }
  async CheckOtp(userId:number,code:string){
    const otp=await this.otpRepository.findOneBy({userId})
    if(!otp) throw new BadRequestException(NotFoundMessage.NotFoundCode)
    const now=new Date()
    if(otp.expires_in < now)throw new BadRequestException(BadRequestMessage.ExpiresCode)
    if(otp.code !==code)throw new BadRequestException(BadRequestMessage.TryAgain)
    return otp
  }
  async followToggle(followingId:number){
    const userId=this.request.user?.id
    const following=await this.userRepository.findOneBy({id:followingId})
    if(!following) throw new NotFoundException(NotFoundMessage.NotFoundUser)
    const isFollowing=await this.followRepository.findOneBy({followingId,followerId:userId})
    let message=PublicMessage.Followed
    if(isFollowing){
      message=PublicMessage.UnFollowed
      await this.followRepository.remove(isFollowing)
    }else{
      await this.followRepository.insert({
        followingId,
        followerId:userId
      })
    }
    return {
      message
    }
  }
  async followers(paginationDto: PaginationDto) {
    const {limit, page, skip} = PaginatioSolver(paginationDto)
    const userId=this.request.user?.id
    const [followers, count] = await this.followRepository.findAndCount({
      where: {
        followerId:userId
      },
      relations:{
        follower:{
          profile:true
        }
      },
      select:{
        id:true,
        follower:{
          id:true,
          username:true,
          profile:{
            id:true,
            nick_name:true,
            bio:true,
            image_profile:true,
            bg_image:true
          }
        }
      },
      skip,
      take: limit
    })
    return {
      pagination: PaginationGenerator(count, page, limit),
      followers
    }
  }
  async followings(paginationDto: PaginationDto) {
    const {limit, page, skip} = PaginatioSolver(paginationDto)
    const userId=this.request.user?.id
    const [followings, count] = await this.followRepository.findAndCount({
      where: {
        followingId:userId
      },
      relations:{
        following:{
          profile:true
        }
      },
      select:{
        id:true,
        following:{
          id:true,
          username:true,
          profile:{
            id:true,
            nick_name:true,
            bio:true,
            image_profile:true,
            bg_image:true
          }
        }
      },
      skip,
      take: limit
    })
    return {
      pagination: PaginationGenerator(count, page, limit),
      followings
    }
  }
  async blockToggle(blockDto:UserBlockDto){
    const {userId}=blockDto
    const user=await this.userRepository.findOneBy({id:userId})
    if(!user) throw new NotFoundException(NotFoundMessage.NotFoundUser)
    let message=PublicMessage.Blocked
    if(user.status ===UserStatus.blocked){
      message=PublicMessage.UnBlocked
      await this.userRepository.update({id:userId},{status:undefined})
    }else{
      await this.userRepository.update({id:userId},{status:UserStatus.blocked})
    }
    return {
      message
    }
  }
  
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
