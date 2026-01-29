-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "prepTime" INTEGER NOT NULL,
    "cookTime" INTEGER NOT NULL,
    "ingredients" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "servings" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "tips" TEXT,
    "nutrition" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiPromptUsed" TEXT
);
INSERT INTO "new_Recipe" ("aiPromptUsed", "cookTime", "cuisine", "description", "generatedAt", "id", "ingredients", "instructions", "prepTime", "servings", "title") SELECT "aiPromptUsed", "cookTime", "cuisine", "description", "generatedAt", "id", "ingredients", "instructions", "prepTime", "servings", "title" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
