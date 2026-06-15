namespace NodeJS{
  interface ProcessEnv{
    PORT:number,
    DB_PORT:number,
    DB_NAME:string,
    DB_USERNAME:string,
    DB_PASSWORD:string,
    DB_HOST:string,
    Cookie_Secret:string,
    OTP_Token_Secret:string,
    Access_Token_Secret:string
    Email_Token_Secret:string
    Phone_Token_Secret:string
    SEND_SMS_URL:string
    GOOGLE_CLIENT_ID:string
    GOOGLE_CLIENT_SECRET:string


  }
}