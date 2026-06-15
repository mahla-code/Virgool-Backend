import { Injectable, MiddlewareConsumer, NestMiddleware, NestModule, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "src/modules/auth/auth.service";
import { AuthMessage } from "../enums/message.enum";
import { isJWT } from "class-validator";

@Injectable()
export class AddUserToReqWOV implements NestMiddleware{
    constructor(
        private authSevice:AuthService,
    ){}
    async use(req: Request, res: Response, next: NextFunction) {
        const token=this.ExtractToken(req)
        if(!token) return next()
        try {
            let user=await this.authSevice.VaildateAccessToken(token)
            if(user) req.user=user
                
        } catch (error) {
            console.log(error);    
        }
        next()
    }
    protected ExtractToken(request:Request){
        const {authorization}=request.headers
        if( ! authorization || authorization?.trim() == ""){
            return null
        }
        const [bearer,token]=authorization?.split(" ")
        if(bearer.toLocaleLowerCase() !=="bearer" || ! token || !isJWT(token)){
          return null
        }
        return token
    }
}

