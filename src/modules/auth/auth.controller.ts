import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDto, CheckOtpDto } from './dto/auth.dto';
import { SwaggerConsumes } from 'src/common/enums/swagger.consume.enum';
import type{ Request, Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { Roles } from 'src/common/enums/role.enum';



@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('user-existence')
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  userExistence(@Body()  authDto:AuthDto , @Res() res:Response){
   return this.authService.userExistence(authDto ,res)
  }
  @Post('check-otp')
  @ApiConsumes(SwaggerConsumes.urlEncodede,SwaggerConsumes.Json)
  CheckOtp(@Body()  checkotpDto:CheckOtpDto){
   return this.authService.CheckOtp(checkotpDto.code)
  }
  @Get('check-login')
 @AuthDecorator()
 @CanAccess(Roles.Admin,Roles.User)
  Checklogin(@Req() req:Request){
    return req.user
  }
}
