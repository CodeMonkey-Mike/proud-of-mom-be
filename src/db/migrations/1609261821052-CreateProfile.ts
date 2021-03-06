import {MigrationInterface, QueryRunner, Table} from "typeorm";
import MigrationUtil from '../../utils/migrationUtil';

export class CreateProfile1609261821052 implements MigrationInterface {

    private static readonly table = new Table({
        name: 'profile',
        columns: [
          ...MigrationUtil.getIDColumn(),
          MigrationUtil.getVarCharColumn({ name: 'picture', isNullable: true }),
          MigrationUtil.getVarCharColumn({ name: 'address1' , isNullable: true}),
          MigrationUtil.getVarCharColumn({ name: 'address2' , isNullable: true}),
          MigrationUtil.getVarCharColumn({ name: 'state_province' , isNullable: true}),
          MigrationUtil.getVarCharColumn({ name: 'country' , defaultValue: 'US'}),
          MigrationUtil.getVarCharColumn({ name: 'postal_code' ,isNullable: true}),
          MigrationUtil.getVarCharColumn({ name: 'gender'}),
          MigrationUtil.getIntColumn({ name: 'user_id' }),
          { name: 'created_at', type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
          { name: 'updated_at',type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
        ],
        foreignKeys:[
            {
              columnNames: ['country'], 
              referencedTableName: 'country',
              referencedColumnNames: ['code'],
            },
            {
              columnNames: ['user_id'], 
              referencedTableName: 'user',
              referencedColumnNames: ['id'],
            }
          ],
      });

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(CreateProfile1609261821052.table);
        await queryRunner.query(`insert into public.user (username,email,role_id,password,user_status_id) values ('admin', 'admin@proudofmom.com', 1, '$2b$10$ojNuMk0phsC8kTrnn5oKReOZ.FxRJI0vYRGRFT0E/Tk7gPicDSXV6',1);`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(CreateProfile1609261821052.table);
    }
}
