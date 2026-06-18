import { EntityName } from "src/common/enums/entity.enum";
import { Roles } from "src/common/enums/role.enum";
import { UserStatus } from "src/modules/user/enums/status.enum";
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class  $npmConfigName1781624372504 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name:EntityName.user,
                columns:[
                    {name:"id",type:"serial",isPrimary:true,isNullable:false},
                    {name:"username",type:"character varying(50)",isNullable:true,isUnique:true},
                    {name:"phone",type:"character varying(12)",isNullable:false,isUnique:true},
                    {name:"email",type:"character varying(100)",isNullable:false,isUnique:true},
                    {name:"role",type:"enum",enum:[Roles.Admin,Roles.User]},
                    {name:"status",type:"enum",enum:[UserStatus.blocked,UserStatus.reported],isNullable:true},
                    {name:"profileId",type:"int",isUnique:true,isNullable:true},
                    {name:"new_email",type:"varchar",isNullable:true},
                    {name:"new_phone",type:"varchar",isNullable:true},
                    {name:"verify_email",type:"boolean",isNullable:true,default:false},
                    {name:"verify_phone",type:"boolean",isNullable:true,default:false},
                    {name:"password",type:"varchar(20)",isNullable:true},
                    {name:"created_at",type:"timestamp",default:"now()"},
                ]
            }),
            true,
        )
        const balance=await queryRunner.hasColumn(EntityName.user,"balance")
        if(!balance) {
            await queryRunner.addColumn(EntityName.user,
                new TableColumn({
                name: "balance", type: "numeric", default: 0, isNullable: true,
            }))
        }
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "mobile" TO "phone"`)
        
        await queryRunner.createTable(
            new Table({
                name:EntityName.profile,
                columns:[
                    {name:"id",type:"int",isPrimary:true,isGenerated:true,generationStrategy:"increment"},
                    {name:"nick_name",type:"varchar(50)",isNullable:true,},
                    {name:"bio",type:"varchar",isNullable:true,},
                    {name:"image_profile",type:"varchar",isNullable:true,},
                    {name:"userId",type:"int",isNullable:false,isUnique:true},
                ],
            }),true
        )
        await queryRunner.createForeignKey(EntityName.profile,new TableForeignKey({
            columnNames:['userId'],
            referencedColumnNames:['id'],
            referencedTableName:EntityName.user,
            onDelete:"CASCADE"
        }))
        await queryRunner.createForeignKey(EntityName.user,new TableForeignKey({
            columnNames:['profileId'],
            referencedColumnNames:['id'],
            referencedTableName:EntityName.profile,
        }))
        await queryRunner.createTable(
            new Table({
                name:EntityName.blog,
                columns:[
                    {name:"id",type:"int",isPrimary:true,isGenerated:true,generationStrategy:"increment"},
                    {name:"title",type:"varchar(150)",isNullable:false,},
                    {name:"content",type:"text",isNullable:false,},
                    {name:"userId",type:"int",isNullable:false,isUnique:true},
                ],
            }),true
        )
        await queryRunner.createForeignKey(EntityName.blog,new TableForeignKey({
            columnNames:['userId'],
            referencedColumnNames:['id'],
            referencedTableName:EntityName.user,
            onDelete:"CASCADE"
        }))
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.dropColumn(EntityName.user,"balance")
        const profile=await queryRunner.getTable(EntityName.profile)
        if(profile){
            const userFk=profile.foreignKeys.find(fk=>fk.columnNames.indexOf("userId") !==-1)
            if(userFk)await queryRunner.dropForeignKey(EntityName.profile,userFk)
        }
        const user=await queryRunner.getTable(EntityName.user)
        if(user){
            const profileFk=user.foreignKeys.find(fk=>fk.columnNames.indexOf("profileId") !==-1)
            if(profileFk)await queryRunner.dropForeignKey(EntityName.user,profileFk)
        }
        const blog=await queryRunner.getTable(EntityName.blog)
        if(blog){
            const userBlogFk=blog.foreignKeys.find(fk=>fk.columnNames.indexOf("userId") !==-1)
            if(userBlogFk)await queryRunner.dropForeignKey(EntityName.blog,userBlogFk)
        }

        await queryRunner.dropTable(EntityName.blog,true)
        await queryRunner.dropTable(EntityName.profile,true)
        await queryRunner.dropTable(EntityName.user,true)
    }

}
