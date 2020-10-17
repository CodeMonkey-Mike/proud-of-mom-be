import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import MigrationUtil from '../../utils/migrationUtil';

export class CreateRole1602947033659 implements MigrationInterface {

    private static readonly table = new Table({
        name: 'role',
        columns: [
          ...MigrationUtil.getIDColumn(),
          MigrationUtil.getVarCharColumn({ name: 'name' }),
          { name: 'created_at', type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
          { name: 'updated_at',type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
        ],
      });

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(CreateRole1602947033659.table);
        await queryRunner.query(`insert into role (name) values ('admin');insert into role (name) values ('user');`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(CreateRole1602947033659.table);
    }

}
