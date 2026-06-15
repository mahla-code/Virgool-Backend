import { BadRequestException, ConflictException, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { AuthDto, CheckOtpDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isMobilePhone } from 'class-validator';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from 'src/modules/user/entities/profile.entity';
import { AuthMessage, BadRequestMessage, PublicMessage } from 'src/common/enums/message.enum';
import { OtpEntity } from 'src/modules/user/entities/otp.entity';
import { randomInt } from 'crypto';
import { TokenService } from './token.service';
import type { Request, Response } from 'express';
import { AuthResponse, GoogleUserData } from './types/response';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { REQUEST } from '@nestjs/core';
import { CookiesOptionToken } from 'src/common/utils/cookie.util';
import { KavenegarService } from '../http/kavenegar.service';
import { randomId } from 'src/common/utils/function.util';
import { use } from 'passport';

@Injectable({scope:Scope.REQUEST})
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepository:Repository<UserEntity>,
        @InjectRepository(ProfileEntity) private profileRepository:Repository<ProfileEntity>,
        @InjectRepository(OtpEntity) private otpRepository:Repository<OtpEntity>,
        private tokenService:TokenService,
        private kavenegarService:KavenegarService,
        @Inject(REQUEST) private request:Request
    ){}
    async userExistence(authDto:AuthDto,res:Response){
        const{type,method,username}=authDto
        let result:AuthResponse
        switch(type){
            case AuthType.login:
               result= await this.Login(method,username)
               await this.sendOtp(method,username,result.code)
               return this.SendResponse(res,result)
               
            case AuthType.register:
                result= await this.Register(method,username)
                await this.sendOtp(method,username,result.code)
                return this.SendResponse(res,result)
            default:
                throw new UnauthorizedException()
        }
    }
    async SendResponse(res:Response , result:AuthResponse){
        const {code,token}=result
        res.cookie(CookieKeys.otp,token,CookiesOptionToken())
        return res.json({
            message:PublicMessage.SendOtp,
            code, 
        })
    }
    async Login(method:AuthMethod,username:string){
        const ValidUsername=this.UsernameValidator(method,username)
        let user:UserEntity |null =await this.CheckExistUser(method,ValidUsername)
        if(!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount)
        const otp=await this.SaveOtp(user.id,method)
        const token=this.tokenService.CreateOtpToken({userId:user.id})
        return {
            token,
            code:otp.code
        }
    }
    async Register(method:AuthMethod,username:string){
        const ValidUsername=this.UsernameValidator(method,username)
        let user:UserEntity |null =await this.CheckExistUser(method,ValidUsername)
        if( user) throw new ConflictException(AuthMessage.AlreadyExist)
        if(method === AuthMethod.username)throw new BadRequestException(BadRequestMessage.InvalidregisterData)
        user=this.userRepository.create({
            [method]:username
        })
        user=await this.userRepository.save(user)
        user.username=`m_${user.id}`
        await this.userRepository.save(user)
        const otp=await this.SaveOtp(user.id,method)
        const token=this.tokenService.CreateOtpToken({userId:user.id})
        return {
            token,
            code:otp.code
        }
    }
    async sendOtp(method:AuthMethod,username:string,code:string){
        if(method===AuthMethod.email){
            //send email
        }else if(method===AuthMethod.phone){
            await this.kavenegarService.sendVerificationSMS(username,code)
        }
    }
    async CheckOtp(code:string){
        const token=this.request.cookies?.[CookieKeys.otp]
        if(!token) throw new UnauthorizedException(AuthMessage.ExpiresCode)
        const{userId}=this.tokenService.VerifyOtpToken(token)
        const otp=await this.otpRepository.findOneBy({userId})
        if(!otp) throw new UnauthorizedException(AuthMessage.LoginAgain)
        const now=new Date()
        if(otp.expires_in < now)throw new UnauthorizedException(AuthMessage.ExpiresCode)
        if(otp.code !==code)throw new UnauthorizedException(AuthMessage.TryAgain)
        const accessToken=this.tokenService.CreateAccessToken({userId})
        if(otp.method=== AuthMethod.email){
            await this.userRepository.update({id:userId},{
                verify_email:true
            })
        }else if(otp.method=== AuthMethod.phone){
            await this.userRepository.update({id:userId},{
                verify_phone:true
            })
        }
        return{
            accessToken,
            message:PublicMessage.Loggedin
        }


    }
    UsernameValidator(method:AuthMethod,username:string){
        switch (method) {
            case AuthMethod.email:
                if(isEmail(username)) return username
                throw new BadRequestException("email format is incorrect")
            case AuthMethod.phone:
                if(isMobilePhone(username,"fa-IR")) return username
                throw new BadRequestException("phone format is incorrect")
            case AuthMethod.username:
                return username
            default:
                throw new UnauthorizedException("username data is not valid")   
        }
    }
    async CheckExistUser(method:AuthMethod, username:string){
        let user:UserEntity | null
        if(method ===AuthMethod.phone){
            user = await this.userRepository.findOneBy({phone:username})
        }else if(method === AuthMethod.email){
            user = await this.userRepository.findOneBy({email:username})
        }else if(method=== AuthMethod.username){
            user = await this.userRepository.findOneBy({username})
        }else throw new BadRequestException(BadRequestMessage.InvalidLoginData)
        return user
    }
    async SaveOtp(userId:number,method:AuthMethod){
        const code=randomInt(10000,99999).toString()
        const expiresIn=new Date(Date.now()+(1000*60*2))
        let otp=await this.otpRepository.findOneBy({userId})
        let existOtp=false
        if(otp){
            existOtp=true,
            otp.code=code,
            otp.expires_in=expiresIn
            otp.method=method
        }else{
            otp=this.otpRepository.create({
                code,
                expires_in:expiresIn,
                userId,
                method
            })
        }
        otp=await this.otpRepository.save(otp)
        if(! existOtp)
            await this.userRepository.update({id:userId},{
            otpId:otp.id
        })
        return otp
    }
    async VaildateAccessToken(token:string){
        const {userId}=this.tokenService.VerifyAccessToken(token)
        const user=await this.userRepository.findOneBy({id:userId})
        if( ! user) throw new UnauthorizedException(AuthMessage.LoginAgain)
        return user
    }
    async googleAuth(userData:GoogleUserData){
        const{email,firstName,lastName}=userData
        let token:string
        let user=await this.userRepository.findOneBy({email})
        if(user){
            token=this.tokenService.CreateOtpToken({userId:user.id})
        }else{
            user=this.userRepository.create({
                email,
                verify_email:true,
                username:email.split('@')['0']+randomId()
            })
            user=await this.userRepository.save(user)
            let profile=await this.profileRepository.create({
                userId:user.id,
                nick_name:`${firstName}${lastName}`

            })
            user.profileId=profile.id
            await this.userRepository.save(user)
            token=this.tokenService.CreateAccessToken({userId:user.id})
        }
        return{
            token
        }
    }
}
