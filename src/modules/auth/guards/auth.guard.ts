import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import  { Request } from "express";
import { AuthMessage } from "src/common/enums/message.enum";
import { isJWT } from "class-validator";
import { Reflector } from "@nestjs/core";
import { Skip_Auth } from "src/common/decorators/skip_auth.decorator";
import { UserStatus } from "src/modules/user/enums/status.enum";


@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private authSevice:AuthService,
        private reflector:Reflector
    ){}
    async canActivate(context: ExecutionContext):Promise<boolean>{
        const isskippedAuthorization=this.reflector.get<boolean>(Skip_Auth,context.getHandler())
        if(isskippedAuthorization)return true
        const httpContex=context.switchToHttp()
        const request:Request=httpContex.getRequest<Request>() 
        const token=this.ExtractToken(request)
        request.user=await this.authSevice.VaildateAccessToken(token)
        if(request?.user.status===UserStatus.blocked) throw new ForbiddenException(AuthMessage.BlockedUser)
        return true
       
    }
    protected ExtractToken(request:Request){
        const {authorization}=request.headers
        if( ! authorization || authorization?.trim() == ""){
            throw new UnauthorizedException(AuthMessage.LoginIsRequired)
        }
        const [bearer,token]=authorization?.split(" ")
        if(bearer.toLocaleLowerCase() !=="bearer" || ! token || !isJWT(token)){
            throw new UnauthorizedException(AuthMessage.LoginIsRequired)
        }
        return token
    }
    
}