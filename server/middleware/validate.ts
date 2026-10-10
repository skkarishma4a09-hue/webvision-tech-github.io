import { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration(req: Request, res: Response, next: NextFunction) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Missing Fields', message: 'Name must be at least 2 characters long.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Invalid Email', message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Invalid Password', message: 'Password must be at least 6 characters long.' });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Invalid Email', message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing Fields', message: 'Password is required.' });
  }

  next();
}

export function validateJobInput(req: Request, res: Response, next: NextFunction) {
  const { title, company, location, description, salary, employmentType, workMode, experienceLevel } = req.body;

  if (!title || !company || !location || !description || !salary) {
    return res.status(400).json({
      error: 'Missing Fields',
      message: 'Title, company, location, description, and salary are required.',
    });
  }

  const validEmploymentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
  if (employmentType && !validEmploymentTypes.includes(employmentType)) {
    return res.status(400).json({
      error: 'Invalid Field Value',
      message: `employmentType must be one of: ${validEmploymentTypes.join(', ')}`,
    });
  }

  const validWorkModes = ['Remote', 'Hybrid', 'On-site'];
  if (workMode && !validWorkModes.includes(workMode)) {
    return res.status(400).json({
      error: 'Invalid Field Value',
      message: `workMode must be one of: ${validWorkModes.join(', ')}`,
    });
  }

  const validExperienceLevels = ['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Executive'];
  if (experienceLevel && !validExperienceLevels.includes(experienceLevel)) {
    return res.status(400).json({
      error: 'Invalid Field Value',
      message: `experienceLevel must be one of: ${validExperienceLevels.join(', ')}`,
    });
  }

  next();
}

export function validateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  const { status } = req.body;
  const validStatuses = ['Saved', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid Application Status',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  next();
}
