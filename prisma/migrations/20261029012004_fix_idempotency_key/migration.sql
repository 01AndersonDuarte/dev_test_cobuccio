/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `transfers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transfers_idempotencyKey_key" ON "transfers"("idempotencyKey");
