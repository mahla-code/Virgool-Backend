import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app:INestApplication):void{
    const document=new DocumentBuilder()
    .setTitle("virgool")
    .setDescription("virgool backend")
    .addBearerAuth(SwaggerAuthConfig(),"authorization")
    .setVersion("v0.0.1")
    .build()
    const swaggerDocument=SwaggerModule.createDocument(app,document)
    SwaggerModule.setup("/swagger",app,swaggerDocument)

}
function SwaggerAuthConfig():SecuritySchemeObject{
    return{
        type:"http",
        bearerFormat:"JWT",
        in:"header",
        scheme:"bearer"
    }
}
