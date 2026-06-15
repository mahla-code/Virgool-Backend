import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Role_Key } from "src/common/decorators/role.decorator";
import { Roles } from "src/common/enums/role.enum";

@Injectable()
export class RoleGuard implements CanActivate{
    constructor(
    private reflector:Reflector
    ){}
    canActivate(context: ExecutionContext) {
        const RequiredRoles=this.reflector.getAllAndOverride<Roles[]>(
            Role_Key,
            [
                context.getHandler(),
                context.getClass()
            ]
        )
        if(!RequiredRoles || RequiredRoles.length===0) return true
        const request:Request=context.switchToHttp().getRequest<Request>()
        const user=request.user
        const userRole=user?.role ?? Roles.User
        if(user?.role ===Roles.Admin)return true
        if(RequiredRoles.includes(userRole as Roles)) return true
        throw new ForbiddenException()
        
    }
    
}