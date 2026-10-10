import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { env } from './env';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.run('PRAGMA foreign_keys = ON;');

  await initSchema(dbInstance);

  return dbInstance;
}

async function initSchema(db: Database) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      profilePhoto TEXT,
      phone TEXT,
      location TEXT,
      headline TEXT,
      bio TEXT,
      skills TEXT DEFAULT '[]',
      education TEXT DEFAULT '[]',
      experience TEXT DEFAULT '[]',
      resume TEXT,
      preferredJobTitles TEXT DEFAULT '[]',
      preferredLocations TEXT DEFAULT '[]',
      preferredEmploymentType TEXT,
      preferredWorkMode TEXT,
      salaryPreference INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Jobs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      companyLogo TEXT,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT DEFAULT '[]',
      responsibilities TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      salary TEXT NOT NULL,
      salaryMin INTEGER,
      salaryMax INTEGER,
      currency TEXT DEFAULT 'USD',
      employmentType TEXT NOT NULL,
      workMode TEXT NOT NULL,
      experienceLevel TEXT NOT NULL,
      postedDate TEXT NOT NULL,
      applicationUrl TEXT,
      source TEXT DEFAULT 'Internal',
      status TEXT DEFAULT 'active',
      category TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Saved Jobs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_jobs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      jobId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE(userId, jobId)
    );
  `);

  // Applications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      jobId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Applied',
      appliedAt TEXT NOT NULL,
      notes TEXT,
      resumeUsed TEXT,
      coverLetter TEXT,
      interviewDate TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE(userId, jobId)
    );
  `);

  // Job Alerts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS job_alerts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      keywords TEXT NOT NULL,
      location TEXT,
      jobType TEXT,
      workMode TEXT,
      experienceLevel TEXT,
      salary INTEGER,
      frequency TEXT DEFAULT 'daily',
      enabled INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}
