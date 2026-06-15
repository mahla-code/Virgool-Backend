import { FileInterceptor } from "@nestjs/platform-express";
import{MulterStorage} from "src/common/utils/multer.util"

export function UploadFile(fieldname:string,foldername:string="images"){
    return class UploadUtility extends FileInterceptor(fieldname,{
        storage:MulterStorage("user_profile")
    }){}
}