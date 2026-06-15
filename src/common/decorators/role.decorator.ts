import { SetMetadata } from "@nestjs/common"
import { Roles } from "../enums/role.enum"

export const Role_Key="Roles"
export const CanAccess=(...roles:Roles[])=>SetMetadata(Role_Key,roles)