import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";

@Controller("/auth/google")
@ApiTags(" google auth")
@UseGuards(AuthGuard('google'))
export class GoogleAuthController{
    @Get()
    googleLogin(@Req() req){}
    googleRedirect(@Req() req){
        return req.user
    }
}