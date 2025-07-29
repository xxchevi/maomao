-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_offline_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "targetId" TEXT,
    "duration" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalRepeat" INTEGER NOT NULL DEFAULT 1,
    "currentRepeat" INTEGER NOT NULL DEFAULT 1,
    "lastProcessedRepeat" INTEGER NOT NULL DEFAULT 0,
    "expReward" INTEGER NOT NULL DEFAULT 0,
    "itemRewards" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offline_tasks_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_offline_tasks" ("characterId", "completedAt", "createdAt", "currentRepeat", "duration", "expReward", "id", "itemRewards", "progress", "startedAt", "status", "targetId", "totalRepeat", "type", "updatedAt") SELECT "characterId", "completedAt", "createdAt", "currentRepeat", "duration", "expReward", "id", "itemRewards", "progress", "startedAt", "status", "targetId", "totalRepeat", "type", "updatedAt" FROM "offline_tasks";
DROP TABLE "offline_tasks";
ALTER TABLE "new_offline_tasks" RENAME TO "offline_tasks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
