import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/database';
import { parseJobFields } from './jobController';

export async function saveJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Missing Fields', message: 'jobId is required.' });
    }

    const db = await getDb();

    const job = await db.get('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Invalid Job ID', message: 'Target job does not exist.' });
    }

    const existing = await db.get('SELECT id FROM saved_jobs WHERE userId = ? AND jobId = ?', [userId, jobId]);
    if (existing) {
      return res.status(400).json({ error: 'Duplicate Saved Job', message: 'You have already saved this job.' });
    }

    const id = `saved_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO saved_jobs (id, userId, jobId, createdAt) VALUES (?, ?, ?, ?)',
      [id, userId, jobId, now]
    );

    res.status(201).json({
      message: 'Job saved successfully',
      savedJob: { id, userId, jobId, createdAt: now },
    });
  } catch (err) {
    next(err);
  }
}

export async function unsaveJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { jobId } = req.params;

    const db = await getDb();
    const existing = await db.get('SELECT id FROM saved_jobs WHERE userId = ? AND jobId = ?', [userId, jobId]);

    if (!existing) {
      return res.status(404).json({ error: 'Saved Job Not Found', message: 'Job was not found in your saved list.' });
    }

    await db.run('DELETE FROM saved_jobs WHERE userId = ? AND jobId = ?', [userId, jobId]);

    res.json({ message: 'Job unsaved successfully', jobId });
  } catch (err) {
    next(err);
  }
}

export async function getSavedJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const db = await getDb();

    const rows = await db.all(
      `SELECT sj.id as savedId, sj.createdAt as savedAt, j.*
       FROM saved_jobs sj
       JOIN jobs j ON sj.jobId = j.id
       WHERE sj.userId = ?
       ORDER BY sj.createdAt DESC`,
      [userId]
    );

    const savedJobs = rows.map((row) => ({
      id: row.savedId,
      userId,
      jobId: row.id,
      createdAt: row.savedAt,
      job: parseJobFields(row),
    }));

    res.json({ savedJobs });
  } catch (err) {
    next(err);
  }
}
