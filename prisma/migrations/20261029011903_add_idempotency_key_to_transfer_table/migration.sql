/*
  Warnings:

  - Added the required column `idempotencyKey` to the `transfers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "idempotencyKey" UUID NOT NULL;
