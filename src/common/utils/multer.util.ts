import { BadRequestException } from "@nestjs/common"
import { Request } from "express"
import { mkdirSync } from "fs"
import { extname, join } from "path"
import { ValidMessage } from "../enums/message.enum"
import { diskStorage } from "multer"

export type CallbackDestination=(error:Error | any,destination:string)=>void
export type CallbackFilename=(error:Error | any,filename:string | any)=>void
export type multerfile=Express.Multer.File
export function MulterDestination(fieldname:string){
 return function (req:Request,file:multerfile,callback:CallbackDestination):void{
        let path=join("public","uploads",fieldname)
        mkdirSync(path,{recursive:true})
        callback(null,path)
   }
}
export function MulterFileName(req:Request,file:multerfile,callback:CallbackFilename):void{
    const ext=extname(file.originalname).toLocaleLowerCase()
    if(! isValidImageFormat(ext)){
        callback(new BadRequestException(ValidMessage.InvalidFormat),null)
    }else{
        const filename=`${Date.now()}${ext}`
        callback(null,filename)
    }
}
function isValidImageFormat(ext:string){
    return ['.png','.jpg','jpeg'].includes(ext)

}
export function MulterStorage(foldername:string){
    return diskStorage({
        destination:MulterDestination(foldername),
        filename:MulterFileName
    })
}