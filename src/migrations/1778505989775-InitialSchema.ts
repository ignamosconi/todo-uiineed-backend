import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778505989775 implements MigrationInterface {
    name = 'InitialSchema1778505989775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lists" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL DEFAULT '', "url" character varying NOT NULL, "creation_date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4bbc2bad181e982d50a6a50bfbb" UNIQUE ("url"), CONSTRAINT "PK_268b525e9a6dd04d0685cb2aaaa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."todos_status_enum" AS ENUM('created', 'completed')`);
        await queryRunner.query(`CREATE TABLE "todos" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(126) NOT NULL, "position" double precision NOT NULL, "status" "public"."todos_status_enum" NOT NULL DEFAULT 'created', "isEliminated" boolean NOT NULL DEFAULT false, "listId" integer, CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ad674f38b992767be3a6d99cb0" ON "todos" ("listId", "position") `);
        await queryRunner.query(`ALTER TABLE "todos" ADD CONSTRAINT "FK_61b8fcea29ab7f96909fcd87ac7" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_61b8fcea29ab7f96909fcd87ac7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ad674f38b992767be3a6d99cb0"`);
        await queryRunner.query(`DROP TABLE "todos"`);
        await queryRunner.query(`DROP TYPE "public"."todos_status_enum"`);
        await queryRunner.query(`DROP TABLE "lists"`);
    }

}
