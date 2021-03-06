import { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';

class MigrationUtil {
  public static getIDColumn(): TableColumnOptions[] {
    const columns: TableColumnOptions[] = [];
    columns.push({
      name: 'id',
      type: 'int',
      isPrimary: true,
      isNullable: false,
      isGenerated: true,
      generationStrategy: 'increment',
    });

    return columns;
  }

  public static getVarCharColumn({
    name = '',
    length = '255',
    isPrimary = false,
    isNullable = false,
    isUnique = false,
    defaultValue = '',
  }): TableColumnOptions {
    return {
      name,
      length,
      isPrimary,
      isNullable,
      isUnique,
      default: `'${defaultValue || null}'`,
      type: 'varchar',
    };
  }

  public static getIntColumn({
    name = '',
    isPrimary = false,
    isNullable = false,
    isUnique = false
  }): TableColumnOptions {
    return {
      name,
      isPrimary,
      isNullable,
      isUnique,
      type: 'integer',
    };
  }
}
export default MigrationUtil;
