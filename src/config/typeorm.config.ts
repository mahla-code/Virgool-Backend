import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function TypeORMConfig():TypeOrmModuleOptions{
    const{DB_HOST,DB_PASSWORD,DB_PORT,DB_USERNAME,DB_NAME}=process.env
    return{
        type:"postgres",
        port:+DB_PORT,
        host:DB_HOST,
        username:DB_USERNAME,
        password:DB_PASSWORD,
        database:DB_NAME,
        autoLoadEntities:false,
        synchronize:false,
        entities:[
            "dist/**/**/**/*.entity{.ts,.js}",
            "dist/**/**/*.entity{.ts,.js}"
        ]
    }
}