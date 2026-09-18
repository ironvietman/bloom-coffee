CREATE TYPE "DrinkTemperature" AS ENUM ('HOT', 'COLD');

ALTER TABLE "Drink" ADD COLUMN "supportsHot" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Drink" ADD COLUMN "supportsCold" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "OrderItem" ADD COLUMN "temperature" "DrinkTemperature" NOT NULL DEFAULT 'HOT';
