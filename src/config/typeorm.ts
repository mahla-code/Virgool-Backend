import { config } from "dotenv";
import path from "path";
import { DataSource } from "typeorm";
config()
config({path:path.join(process.cwd(),".env")})
const{DB_HOST,DB_NAME,DB_PASSWORD,DB_PORT,DB_USERNAME}=process.env

let dataSource=new DataSource({
    type:"postgres",
    host:DB_HOST,
    password:DB_PASSWORD,
    username:DB_USERNAME,
    database:DB_NAME,
    port:DB_PORT,
    synchronize:false,
    entities:[
        "dist/**/**/**/*.entity{.ts,.js}",
        "dist/**/**/*.entity{.ts,.js}"
    ],
    migrations:[
        "dis/src/migrations/*.{.ts,.js}"
    ],
    migrationsTableName:"virgool_migration_db"
})
export default dataSource