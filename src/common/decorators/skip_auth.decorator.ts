import { SetMetadata } from "@nestjs/common"

export const Skip_Auth="skip_auth"
export const skipAuth=()=>SetMetadata(Skip_Auth,true)