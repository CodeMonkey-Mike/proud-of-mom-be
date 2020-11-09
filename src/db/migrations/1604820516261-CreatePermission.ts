import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import MigrationUtil from '../../utils/migrationUtil';

export class CreatePermission1604820516261 implements MigrationInterface {

    private static readonly table = new Table({
        name: 'permission',
        columns: [
          ...MigrationUtil.getIDColumn(),
          MigrationUtil.getVarCharColumn({ name: 'name' }),
          { name: 'created_at', type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
          { name: 'updated_at',type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
        ],
      });

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(CreatePermission1604820516261.table);
        await queryRunner.query(`insert into permission (name) values ('admin');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(CreatePermission1604820516261.table);
    }

}
