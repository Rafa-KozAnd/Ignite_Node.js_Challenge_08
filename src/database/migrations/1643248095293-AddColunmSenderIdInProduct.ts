import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddColunmSenderIdInProduct1643248095293 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('statements', 'type', new TableColumn({
      name: 'type',
      type: 'enum',
      enum: ['deposit', 'withdraw', 'transfer']
    }))

    await queryRunner.addColumn('statements', new TableColumn({
      name: 'sender_id',
      type: 'uuid',
      isNullable: true,
    }))

    await queryRunner.createForeignKey('statements', new TableForeignKey({
      name: 'FKUserSender',
      columnNames: ['sender_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("statements", 'FKUserSender');
    await queryRunner.dropColumn("statements", "sender_id");
    await queryRunner.changeColumn('statements', 'type', new TableColumn({
      name: 'type',
      type: 'enum',
      enum: ['deposit', 'withdraw'],
    }))
  }

}
