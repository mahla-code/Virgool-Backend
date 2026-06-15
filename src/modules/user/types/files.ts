import { multerfile } from "src/common/utils/multer.util"

export type ProfileImage={
    image_profile:multerfile[]
    bg_image:multerfile[]
}