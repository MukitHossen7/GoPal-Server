-- AlterTable
ALTER TABLE "travelers" ALTER COLUMN "travelInterests" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "visitedCountries" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'TRAVELER';
