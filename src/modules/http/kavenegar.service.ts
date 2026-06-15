import {  Injectable, InternalServerErrorException } from "@nestjs/common";
import * as queryString  from "qs";
import { SMSTemplate } from "./enums/SMS-template.enum";
import { catchError, lastValueFrom, map } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class KavenegarService{
    constructor(
        private httpService:HttpService
    ){}
    async sendVerificationSMS(receptor:string,code:string){
        const params=queryString.stringify({
            receptor,
            token:code,
            template:SMSTemplate.Verify
        })
        const {SEND_SMS_URL}=process.env
        const result=await lastValueFrom(
            this.httpService.get(`${SEND_SMS_URL}?${params}`)
            .pipe(
                map(res=>res.data),
                catchError(err=>{
                    console.log(err);
                    throw new InternalServerErrorException("kavenegar")
                    
                })
            )
        )
        return result
    }
}