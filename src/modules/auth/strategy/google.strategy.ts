import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import{Strategy, VerifyCallback }from "passport-google-oauth20"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,'google'){
    constructor(){
        super({
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:"http://localhost:3000/auth/google/redirect",
            scope:['email','profile']
        })
    }
    validate(accessToken:string,refreshToken:string,profile:any,done:VerifyCallback){
        const{name,email,photo}=profile
        const{givenName:firstName,familyName:lastName}=name
        const[emailData]=email
        const[image]=photo
        const user={
            firstName,
            lastName,
            email:emailData?.value,
            profile_image:image?.value,
            accessToken
        }
        done(null,user)
    }
}