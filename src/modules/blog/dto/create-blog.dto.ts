import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";

export class CreateBlogDto {
    @ApiProperty()
    @IsNotEmpty()
    @Length(10,150)
    title:string
    @ApiPropertyOptional()
    slug:string
    @ApiProperty()
    @IsNotEmpty()
    time_for_study:string
    @ApiPropertyOptional({format:"binary"})
    image:string
    @ApiProperty()
    @IsNotEmpty()
    @Length(10,150)
    description:string
    @ApiProperty()
    @IsNotEmpty()
    @Length(100)
    content:string
    @ApiProperty({type:"string",isArray:true})
    categories:string[]| string
}
export class FilterBlogDto{
    category:string
    search:string
}
