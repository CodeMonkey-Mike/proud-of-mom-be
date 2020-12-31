import {MigrationInterface, QueryRunner, Table} from "typeorm";
import MigrationUtil from '../../utils/migrationUtil';

export class CreateUserStatus1588548264941 implements MigrationInterface {
    private static readonly table = new Table({
        name: 'user_status',
        columns: [
          ...MigrationUtil.getIDColumn(),
          MigrationUtil.getVarCharColumn({ name: 'name' }),
          { name: 'created_at', type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
          { name: 'updated_at',type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
        ],
      });
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(CreateUserStatus1588548264941.table);
      await queryRunner.query(`insert into user_status (name) values ('active');insert into user_status (name) values ('banned');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable(CreateUserStatus1588548264941.table);
    }

}
