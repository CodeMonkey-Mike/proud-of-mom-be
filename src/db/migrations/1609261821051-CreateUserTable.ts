import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import MigrationUtil from '../../utils/migrationUtil';

export class CreateUserTable1609261821051 implements MigrationInterface {
  private static readonly table = new Table({
    name: 'user',
    columns: [
      ...MigrationUtil.getIDColumn(),
      MigrationUtil.getVarCharColumn({ name: 'username' }),
      MigrationUtil.getVarCharColumn({ name: 'email' }),
      MigrationUtil.getIntColumn({ name: 'role_id' }),
      MigrationUtil.getVarCharColumn({ name: 'password' }),
      MigrationUtil.getIntColumn({ name: 'user_status_id' }),
      { name: 'created_at', type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
      { name: 'updated_at',type: "timestamp with time zone", default: "timezone('utc'::text, now())"},
    ],
    foreignKeys:[
      {
        columnNames: ['user_status_id'], 
        referencedTableName: 'user_status', 
        referencedColumnNames: ['id'],
      }
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(CreateUserTable1609261821051.table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(CreateUserTable1609261821051.table);
  }
}
