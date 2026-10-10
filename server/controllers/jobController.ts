import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/database';
import { Job } from '../models/types';

export async function getJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const { keyword, location, employmentType, workMode, experienceLevel, category, page = '1', limit = '20' } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM jobs WHERE status = "active"';
    const params: any[] = [];

    if (keyword) {
      query += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ? OR skills LIKE ?)';
      const term = `%${keyword}%`;
      params.push(term, term, term, term);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (employmentType) {
      query += ' AND employmentType = ?';
      params.push(employmentType);
    }

    if (workMode) {
      query += ' AND workMode = ?';
      params.push(workMode);
    }

    if (experienceLevel) {
      query += ' AND experienceLevel = ?';
      params.push(experienceLevel);
    }

    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }

    query += ' ORDER BY createdAt DESC';

    const p = Math.max(1, parseInt(page as string, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (p - 1) * l;

    const countResult = await db.get(query.replace('SELECT *', 'SELECT COUNT(*) as count'), params);
    const total = countResult ? countResult.count : 0;

    query += ' LIMIT ? OFFSET ?';
    params.push(l, offset);

    const rows = await db.all(query, params);
    const jobs = rows.map(parseJobFields);

    res.json({
      jobs,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!job) {
      return res.status(404).json({ error: 'Invalid Job ID', message: 'No job found matching the specified ID.' });
    }

    res.json({ job: parseJobFields(job) });
  } catch (err) {
    next(err);
  }
}

export async function createJob(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      title,
      company,
      companyLogo,
      location,
      description,
      requirements = [],
      responsibilities = [],
      skills = [],
      salary,
      salaryMin,
      salaryMax,
      currency = 'USD',
      employmentType = 'Full-time',
      workMode = 'Remote',
      experienceLevel = 'Mid-level',
      applicationUrl,
      source = 'Internal',
      category = 'Software Development',
    } = req.body;

    const db = await getDb();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO jobs (id, title, company, companyLogo, location, description, requirements, responsibilities, skills, salary, salaryMin, salaryMax, currency, employmentType, workMode, experienceLevel, postedDate, applicationUrl, source, status, category, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [
        jobId,
        title.trim(),
        company.trim(),
        companyLogo || '',
        location.trim(),
        description.trim(),
        JSON.stringify(requirements),
        JSON.stringify(responsibilities),
        JSON.stringify(skills),
        salary,
        salaryMin || null,
        salaryMax || null,
        currency,
        employmentType,
        workMode,
        experienceLevel,
        now,
        applicationUrl || '',
        source,
        category,
        now,
        now,
      ]
    );

    const createdJob = await db.get('SELECT * FROM jobs WHERE id = ?', [jobId]);

    res.status(201).json({
      message: 'Job created successfully',
      job: parseJobFields(createdJob),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Invalid Job ID', message: 'No job found matching the specified ID.' });
    }

    const {
      title,
      company,
      companyLogo,
      location,
      description,
      requirements,
      responsibilities,
      skills,
      salary,
      salaryMin,
      salaryMax,
      currency,
      employmentType,
      workMode,
      experienceLevel,
      status,
      category,
    } = req.body;

    const now = new Date().toISOString();

    await db.run(
      `UPDATE jobs
       SET title = ?, company = ?, companyLogo = ?, location = ?, description = ?, requirements = ?, responsibilities = ?, skills = ?, salary = ?, salaryMin = ?, salaryMax = ?, currency = ?, employmentType = ?, workMode = ?, experienceLevel = ?, status = ?, category = ?, updatedAt = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        company !== undefined ? company : existing.company,
        companyLogo !== undefined ? companyLogo : existing.companyLogo,
        location !== undefined ? location : existing.location,
        description !== undefined ? description : existing.description,
        requirements !== undefined ? JSON.stringify(requirements) : existing.requirements,
        responsibilities !== undefined ? JSON.stringify(responsibilities) : existing.responsibilities,
        skills !== undefined ? JSON.stringify(skills) : existing.skills,
        salary !== undefined ? salary : existing.salary,
        salaryMin !== undefined ? salaryMin : existing.salaryMin,
        salaryMax !== undefined ? salaryMax : existing.salaryMax,
        currency !== undefined ? currency : existing.currency,
        employmentType !== undefined ? employmentType : existing.employmentType,
        workMode !== undefined ? workMode : existing.workMode,
        experienceLevel !== undefined ? experienceLevel : existing.experienceLevel,
        status !== undefined ? status : existing.status,
        category !== undefined ? category : existing.category,
        now,
        id,
      ]
    );

    const updated = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    res.json({
      message: 'Job updated successfully',
      job: parseJobFields(updated),
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Invalid Job ID', message: 'No job found matching the specified ID.' });
    }

    await db.run('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ message: 'Job deleted successfully', jobId: id });
  } catch (err) {
    next(err);
  }
}

export function parseJobFields(job: any): Job {
  return {
    ...job,
    requirements: typeof job.requirements === 'string' ? JSON.parse(job.requirements || '[]') : job.requirements || [],
    responsibilities: typeof job.responsibilities === 'string' ? JSON.parse(job.responsibilities || '[]') : job.responsibilities || [],
    skills: typeof job.skills === 'string' ? JSON.parse(job.skills || '[]') : job.skills || [],
  };
}
