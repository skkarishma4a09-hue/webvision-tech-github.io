import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/database';

export async function createAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { keywords, location, jobType, workMode, experienceLevel, salary, frequency = 'daily' } = req.body;

    if (!keywords || typeof keywords !== 'string' || !keywords.trim()) {
      return res.status(400).json({ error: 'Missing Fields', message: 'Keywords are required to create a job alert.' });
    }

    const db = await getDb();
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO job_alerts (id, userId, keywords, location, jobType, workMode, experienceLevel, salary, frequency, enabled, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        alertId,
        userId,
        keywords.trim(),
        location || null,
        jobType || null,
        workMode || null,
        experienceLevel || null,
        salary || null,
        frequency,
        now,
      ]
    );

    const alert = await db.get('SELECT * FROM job_alerts WHERE id = ?', [alertId]);

    res.status(201).json({
      message: 'Job alert created successfully',
      alert: parseAlertFields(alert),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const db = await getDb();

    const rows = await db.all('SELECT * FROM job_alerts WHERE userId = ? ORDER BY createdAt DESC', [userId]);

    res.json({ alerts: rows.map(parseAlertFields) });
  } catch (err) {
    next(err);
  }
}

export async function updateAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT * FROM job_alerts WHERE id = ? AND userId = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Alert Not Found', message: 'Job alert not found for your account.' });
    }

    const { keywords, location, jobType, workMode, experienceLevel, salary, frequency, enabled } = req.body;

    await db.run(
      `UPDATE job_alerts
       SET keywords = ?, location = ?, jobType = ?, workMode = ?, experienceLevel = ?, salary = ?, frequency = ?, enabled = ?
       WHERE id = ? AND userId = ?`,
      [
        keywords !== undefined ? keywords : existing.keywords,
        location !== undefined ? location : existing.location,
        jobType !== undefined ? jobType : existing.jobType,
        workMode !== undefined ? workMode : existing.workMode,
        experienceLevel !== undefined ? experienceLevel : existing.experienceLevel,
        salary !== undefined ? salary : existing.salary,
        frequency !== undefined ? frequency : existing.frequency,
        enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled,
        id,
        userId,
      ]
    );

    const updated = await db.get('SELECT * FROM job_alerts WHERE id = ?', [id]);

    res.json({
      message: 'Job alert updated',
      alert: parseAlertFields(updated),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT id FROM job_alerts WHERE id = ? AND userId = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Alert Not Found', message: 'Job alert not found for your account.' });
    }

    await db.run('DELETE FROM job_alerts WHERE id = ? AND userId = ?', [id, userId]);

    res.json({ message: 'Job alert deleted successfully', alertId: id });
  } catch (err) {
    next(err);
  }
}

function parseAlertFields(alert: any) {
  return {
    ...alert,
    enabled: Boolean(alert.enabled),
  };
}
