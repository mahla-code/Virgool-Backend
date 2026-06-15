import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, isEmail, IsEnum, isLatLong, IsMobilePhone, IsOptional, IsString, Length } from "class-validator"
import { Gender } from "../enums/gender.enum"
import { ValidMessage } from "src/common/enums/message.enum"

export class ProfileDto{
    @ApiPropertyOptional()
    @IsOptional()
    @Length(3,100)
    nick_name:string
    @ApiPropertyOptional({nullable:true})
    @IsOptional()    
    @Length(3,100)
    bio:string
    @ApiPropertyOptional({nullable:true,format:"binary"})
    image_profile:string
    @ApiPropertyOptional({nullable:true,format:"binary"})
    //background image
    bg_image:string
    @ApiPropertyOptional({nullable:true,enum:Gender})
    @IsEnum(Gender)
    @IsOptional() 
    gender:string
    @ApiPropertyOptional({nullable:true,example:"1999-05-20T12:09:32"})
    birthday:string
    @ApiPropertyOptional({nullable:true})
    linkedIn_profile:string

}
export class ChangeEmailDto{
    @ApiProperty()
    @IsEmail({},{message:ValidMessage.InvalidEmailFormat})
    email:string
}
export class ChangePhoneDto{
    @ApiProperty()
    @IsMobilePhone("fa-IR",{},{message:ValidMessage.InvalidPhoneFormat})
    phone:string
}
export class ChangeUsernameDto{
    @ApiProperty()
    @IsString()
    @Length(3,100)
    username:string
}