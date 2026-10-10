import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/database';
import { parseJobFields } from './jobController';

export async function applyToJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { jobId, notes, resumeUsed, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Missing Fields', message: 'jobId is required.' });
    }

    const db = await getDb();

    const job = await db.get('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Invalid Job ID', message: 'Target job does not exist.' });
    }

    const existing = await db.get('SELECT id FROM applications WHERE userId = ? AND jobId = ?', [userId, jobId]);
    if (existing) {
      return res.status(400).json({
        error: 'Duplicate Application',
        message: 'You have already submitted an application for this job.',
      });
    }

    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO applications (id, userId, jobId, status, appliedAt, notes, resumeUsed, coverLetter)
       VALUES (?, ?, ?, 'Applied', ?, ?, ?, ?)`,
      [appId, userId, jobId, now, notes || null, resumeUsed || null, coverLetter || null]
    );

    const application = await db.get('SELECT * FROM applications WHERE id = ?', [appId]);

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
}

export async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const db = await getDb();

    const rows = await db.all(
      `SELECT a.*, j.title as jobTitle, j.company as jobCompany, j.location as jobLocation, j.salary as jobSalary, j.employmentType as jobEmpType, j.workMode as jobWorkMode, j.companyLogo as jobLogo
       FROM applications a
       JOIN jobs j ON a.jobId = j.id
       WHERE a.userId = ?
       ORDER BY a.appliedAt DESC`,
      [userId]
    );

    const applications = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      jobId: row.jobId,
      status: row.status,
      appliedAt: row.appliedAt,
      notes: row.notes,
      resumeUsed: row.resumeUsed,
      coverLetter: row.coverLetter,
      interviewDate: row.interviewDate,
      job: {
        id: row.jobId,
        title: row.jobTitle,
        company: row.jobCompany,
        location: row.jobLocation,
        salary: row.jobSalary,
        employmentType: row.jobEmpType,
        workMode: row.jobWorkMode,
        companyLogo: row.jobLogo,
      },
    }));

    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status, notes, interviewDate } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM applications WHERE id = ? AND userId = ?', [id, userId]);

    if (!existing) {
      return res.status(404).json({
        error: 'Application Not Found',
        message: 'No application record found for your account matching this ID.',
      });
    }

    const updatedNotes = notes !== undefined ? notes : existing.notes;
    const updatedInterview = interviewDate !== undefined ? interviewDate : existing.interviewDate;

    await db.run(
      `UPDATE applications
       SET status = ?, notes = ?, interviewDate = ?
       WHERE id = ? AND userId = ?`,
      [status, updatedNotes, updatedInterview, id, userId]
    );

    const updated = await db.get('SELECT * FROM applications WHERE id = ?', [id]);

    res.json({
      message: 'Application status updated',
      application: updated,
    });
  } catch (err) {
    next(err);
  }
}
