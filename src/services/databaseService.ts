import * as SQLite from "expo-sqlite";
import { AppUsage } from "../types";
import * as Crypto from "expo-crypto";

const DATABASE_NAME = "launcher.db";

const SYSTEM_LOCKED_PACKAGES = ["com.android.vending", "com.android.settings"];

export { SYSTEM_LOCKED_PACKAGES };

let db: SQLite.SQLiteDatabase | null = null;

async function hashPassword(password: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + "open_zero_launcher_salt_2024",
  );
  return digest;
}

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_usage (
        package_name TEXT PRIMARY KEY,
        usage_count INTEGER DEFAULT 0,
        last_used INTEGER DEFAULT 0
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorite_apps (
        package_name TEXT PRIMARY KEY,
        position INTEGER DEFAULT 0
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS hidden_apps (
        package_name TEXT PRIMARY KEY
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_lock_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        enabled INTEGER DEFAULT 0,
        password_hash TEXT
      );
    `);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locked_apps (
        package_name TEXT PRIMARY KEY
      );
    `);
  }
  return db;
}

export async function getAppUsage(): Promise<AppUsage[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<{
    package_name: string;
    usage_count: number;
    last_used: number;
  }>("SELECT * FROM app_usage ORDER BY usage_count DESC, last_used DESC");

  return result.map((row) => ({
    packageName: row.package_name,
    usageCount: row.usage_count,
    lastUsed: row.last_used,
  }));
}

export async function incrementUsage(packageName: string): Promise<void> {
  const database = await getDatabase();
  const now = Date.now();

  await database.runAsync(
    `INSERT INTO app_usage (package_name, usage_count, last_used) 
     VALUES (?, 1, ?)
     ON CONFLICT(package_name) 
     DO UPDATE SET usage_count = usage_count + 1, last_used = ?`,
    [packageName, now, now],
  );
}

export async function getMostUsedPackages(
  limit: number = 10,
): Promise<string[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<{ package_name: string }>(
    "SELECT package_name FROM app_usage ORDER BY usage_count DESC, last_used DESC LIMIT ?",
    [limit],
  );

  return result.map((row) => row.package_name);
}

export async function getFavoritePackages(): Promise<string[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<{ package_name: string }>(
    "SELECT package_name FROM favorite_apps ORDER BY position ASC",
  );

  return result.map((row) => row.package_name);
}

export async function addFavoritePackage(packageName: string): Promise<void> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ max_pos: number | null }>(
    "SELECT MAX(position) as max_pos FROM favorite_apps",
  );
  const nextPosition = (result?.max_pos ?? -1) + 1;

  await database.runAsync(
    "INSERT OR IGNORE INTO favorite_apps (package_name, position) VALUES (?, ?)",
    [packageName, nextPosition],
  );
}

export async function removeFavoritePackage(
  packageName: string,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM favorite_apps WHERE package_name = ?", [
    packageName,
  ]);
}

export async function setFavoritePackages(
  packageNames: string[],
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM favorite_apps");

  for (let i = 0; i < packageNames.length; i++) {
    await database.runAsync(
      "INSERT INTO favorite_apps (package_name, position) VALUES (?, ?)",
      [packageNames[i], i],
    );
  }
}

export async function getHiddenPackages(): Promise<string[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<{ package_name: string }>(
    "SELECT package_name FROM hidden_apps",
  );

  return result.map((row) => row.package_name);
}

export async function addHiddenPackage(packageName: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR IGNORE INTO hidden_apps (package_name) VALUES (?)",
    [packageName],
  );
}

export async function removeHiddenPackage(packageName: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM hidden_apps WHERE package_name = ?", [
    packageName,
  ]);
}

export async function getAppLockConfig(): Promise<{
  enabled: boolean;
  hasPassword: boolean;
}> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    enabled: number;
    password_hash: string | null;
  }>("SELECT enabled, password_hash FROM app_lock_config WHERE id = 1");

  if (!result) {
    return { enabled: false, hasPassword: false };
  }

  return {
    enabled: result.enabled === 1,
    hasPassword:
      result.password_hash !== null && result.password_hash.length > 0,
  };
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO app_lock_config (id, enabled) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET enabled = ?`,
    [enabled ? 1 : 0, enabled ? 1 : 0],
  );
}

export async function setAppLockPassword(password: string): Promise<void> {
  const database = await getDatabase();
  const hashedPassword = await hashPassword(password);
  await database.runAsync(
    `INSERT INTO app_lock_config (id, password_hash, enabled) VALUES (1, ?, 1)
     ON CONFLICT(id) DO UPDATE SET password_hash = ?`,
    [hashedPassword, hashedPassword],
  );
}

export async function clearAppLockPassword(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE app_lock_config SET password_hash = NULL WHERE id = 1",
  );
}

export async function verifyAppLockPassword(
  password: string,
): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ password_hash: string | null }>(
    "SELECT password_hash FROM app_lock_config WHERE id = 1",
  );

  if (!result || !result.password_hash) {
    return false;
  }

  const hashedInput = await hashPassword(password);
  return hashedInput === result.password_hash;
}

export async function getLockedApps(): Promise<string[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<{ package_name: string }>(
    "SELECT package_name FROM locked_apps",
  );

  return result.map((row) => row.package_name);
}

export async function addLockedApp(packageName: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR IGNORE INTO locked_apps (package_name) VALUES (?)",
    [packageName],
  );
}

export async function removeLockedApp(packageName: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM locked_apps WHERE package_name = ?", [
    packageName,
  ]);
}

export async function clearAllLockedApps(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM locked_apps");
}

export async function isAppLocked(packageName: string): Promise<boolean> {
  const database = await getDatabase();
  const config = await getAppLockConfig();

  if (!config.enabled) {
    return false;
  }

  if (SYSTEM_LOCKED_PACKAGES.includes(packageName)) {
    return true;
  }

  const result = await database.getFirstAsync<{ package_name: string }>(
    "SELECT package_name FROM locked_apps WHERE package_name = ?",
    [packageName],
  );

  return result !== null;
}
