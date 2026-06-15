import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFiles, ParseFilePipe, UseGuards, Req, Res, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger.consume.enum';
import { ChangeEmailDto, ChangePhoneDto, ChangeUsernameDto, ProfileDto } from './dto/profile.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {  MulterStorage } from 'src/common/utils/multer.util';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { UserEntity } from './entities/user.entity';
import type { Request, Response } from 'express';
import type { ProfileImage } from './types/files';
import { UploadedOptionalFiles } from 'src/common/decorators/uploadfile.decorator';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { CookiesOptionToken } from 'src/common/utils/cookie.util';
import { CheckOtpDto, UserBlockDto } from 'src/modules/auth/dto/auth.dto';
import { PublicMessage } from 'src/common/enums/message.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';

@Controller('user')
@ApiTags('user')
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}
  

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post("/verify_email_otp")
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  async verifyEmail(@Body() OtpDto:CheckOtpDto){
    return this.userService.VerifyEmail(OtpDto.code)
  }
  @Post("/verify_phone_otp")
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  async verifyPhone(@Body() OtpDto:CheckOtpDto){
    return this.userService.VerifyPhone(OtpDto.code)
  }
  @Post("/block")
  @CanAccess(Roles.Admin)
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  async block(@Body() blockDto:UserBlockDto){
    return this.userService.blockToggle(blockDto)
  }

  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
  @Get('/profile')
  profile(@Req() req:Request){
    return this.userService.profile(req.user as UserEntity)
  }
  @Get("/list")
  @Pagination()
  find(@Query() paginationDto: PaginationDto) {
    return this.userService.find(paginationDto)
  }
  @Get('/follow/:follwingId')
  @ApiParam({name:"followingId"})
  follow(@Param("followingId",ParseIntPipe)followingId:number){
    return this.userService.followToggle(followingId)
  }
  @Get('/followers')
  @Pagination()
  followers(@Query() PaginationDto:PaginationDto){
    return this.userService.followers(PaginationDto)
  }
  @Get('/following')
  @Pagination()
  following(@Query() PaginationDto:PaginationDto){
    return this.userService.followings(PaginationDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
  @Put('/profile')
  @ApiConsumes(SwaggerConsumes.multipartData)
  @UseInterceptors(FileFieldsInterceptor(
    [
      {name:"image_profile",maxCount:1},
      {name:"bg_image",maxCount:1}
    ],{
      storage:MulterStorage("user_profile")
    }
  ))
  changeProfile(
    @UploadedOptionalFiles() files:ProfileImage,
    @Body() profileDto:ProfileDto,
    @Req() req:Request){
    return this.userService.ChangeProfile(profileDto,files,req.user as UserEntity)
  
  }
 
  @Patch("/change_email")
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  async changeEmail( @Body() EmailDto:ChangeEmailDto , @Res() res:Response){
    const {token,code,message}=await this.userService.ChangeEmail(EmailDto.email)
    if( message) return res.json({message})
    res.cookie(CookieKeys.emailOtp,token,CookiesOptionToken())
   res.json({
      code,
      message: PublicMessage.SendOtp
    })
  }

  @Patch("/change_phone")
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  async changephone( @Body() phoneDto:ChangePhoneDto , @Res() res:Response){
    const {token,code,message}=await this.userService.ChangePhone(phoneDto.phone)
    if( message) return res.json({message})
    res.cookie(CookieKeys.phoneOtp,token,CookiesOptionToken())
    res.json({
      code,
      message: PublicMessage.SendOtp
    })
  
  }
  
  @Patch('/change_username')
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto:ChangeUsernameDto){
    return this.userService.ChangeUserName(usernameDto.username)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
