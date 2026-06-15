import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload, CookiePayload, EmailTokenPayload, PhoneTokenPayload } from "./types/payload";
import { AuthMessage, BadRequestMessage } from "src/common/enums/message.enum";

@Injectable()
export class TokenService{
    constructor(
        private jwtService:JwtService
    ){}
    CreateOtpToken(payload:CookiePayload){
        const token=this.jwtService.sign(payload,{
            secret:process.env.OTP_Token_Secret,
            expiresIn:60*2
        })
        return token
    }
    VerifyOtpToken(token:string):CookiePayload{
        try {
            return this.jwtService.verify(token,{
                secret:process.env.OTP_Token_Secret,
            })
            
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.TryAgain)
        }
    }
    CreateAccessToken(payload:AccessTokenPayload){
        const token=this.jwtService.sign(payload,{
            secret:process.env.Access_Token_Secret,
            expiresIn:"1y"
        })
        return token
    }
    VerifyAccessToken(token:string):AccessTokenPayload{
        try {
            return this.jwtService.verify(token,{
                secret:process.env.Access_Token_Secret,
            })
            
        } catch (error) {
            throw new UnauthorizedException(AuthMessage.LoginAgain)
        }
    }
    CreateEmailToken(payload:EmailTokenPayload){
        const token=this.jwtService.sign(payload,{
            secret:process.env.Email_Token_Secret,
            expiresIn:60*2
        })
        return token
    }
    VerifyEmailToken(token:string):EmailTokenPayload{
        try {
            return this.jwtService.verify(token,{
                secret:process.env.Email_Token_Secret,
            })
            
        } catch (error) {
            throw new BadRequestException(BadRequestMessage.SomeThingWentwrong)
        }
    }
    CreatePhoneToken(payload:PhoneTokenPayload){
        const token=this.jwtService.sign(payload,{
            secret:process.env.Phone_Token_Secret,
            expiresIn:60*2
        })
        return token
    }
    VerifyPhoneToken(token:string):PhoneTokenPayload{
        try {
            return this.jwtService.verify(token,{
                secret:process.env.Phone_Token_Secret,
            })
            
        } catch (error) {
            throw new BadRequestException(BadRequestMessage.SomeThingWentwrong)
        }
    }
}