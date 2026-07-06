-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "loanDate" DATETIME NOT NULL,
    "loanAmount" REAL NOT NULL,
    "interestRatePerMonth" REAL NOT NULL,
    "pledgedItemName" TEXT NOT NULL,
    "itemCategory" TEXT NOT NULL DEFAULT 'Jewelry',
    "grossWeight" REAL,
    "stoneWeight" REAL,
    "netWeight" REAL,
    "estimatedItemValue" REAL NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Loan" ("createdAt", "customerName", "estimatedItemValue", "grossWeight", "id", "interestRatePerMonth", "loanAmount", "loanDate", "netWeight", "paymentMode", "pledgedItemName", "status", "stoneWeight") SELECT "createdAt", "customerName", "estimatedItemValue", "grossWeight", "id", "interestRatePerMonth", "loanAmount", "loanDate", "netWeight", "paymentMode", "pledgedItemName", "status", "stoneWeight" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
