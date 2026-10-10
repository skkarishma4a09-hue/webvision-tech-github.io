import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/database';
import { parseUserFields } from './authController';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const db = await getDb();

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found', message: 'User profile not found.' });
    }

    delete user.password;
    res.json({ profile: parseUserFields(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const db = await getDb();

    const {
      name,
      phone,
      location,
      headline,
      bio,
      profilePhoto,
      resume,
      skills,
      education,
      experience,
    } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found', message: 'User profile not found.' });
    }

    const updatedName = name !== undefined ? name : user.name;
    const updatedPhone = phone !== undefined ? phone : user.phone;
    const updatedLocation = location !== undefined ? location : user.location;
    const updatedHeadline = headline !== undefined ? headline : user.headline;
    const updatedBio = bio !== undefined ? bio : user.bio;
    const updatedPhoto = profilePhoto !== undefined ? profilePhoto : user.profilePhoto;
    const updatedResume = resume !== undefined ? resume : user.resume;
    const updatedSkills = skills !== undefined ? JSON.stringify(skills) : user.skills;
    const updatedEducation = education !== undefined ? JSON.stringify(education) : user.education;
    const updatedExperience = experience !== undefined ? JSON.stringify(experience) : user.experience;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE users
       SET name = ?, phone = ?, location = ?, headline = ?, bio = ?, profilePhoto = ?, resume = ?, skills = ?, education = ?, experience = ?, updatedAt = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedPhone,
        updatedLocation,
        updatedHeadline,
        updatedBio,
        updatedPhoto,
        updatedResume,
        updatedSkills,
        updatedEducation,
        updatedExperience,
        now,
        userId,
      ]
    );

    const freshUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    delete freshUser.password;

    res.json({
      message: 'Profile updated successfully',
      profile: parseUserFields(freshUser),
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const db = await getDb();

    const {
      preferredJobTitles,
      preferredLocations,
      preferredEmploymentType,
      preferredWorkMode,
      salaryPreference,
    } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found', message: 'User profile not found.' });
    }

    const updatedTitles = preferredJobTitles !== undefined ? JSON.stringify(preferredJobTitles) : user.preferredJobTitles;
    const updatedLocs = preferredLocations !== undefined ? JSON.stringify(preferredLocations) : user.preferredLocations;
    const updatedEmp = preferredEmploymentType !== undefined ? preferredEmploymentType : user.preferredEmploymentType;
    const updatedMode = preferredWorkMode !== undefined ? preferredWorkMode : user.preferredWorkMode;
    const updatedSalary = salaryPreference !== undefined ? salaryPreference : user.salaryPreference;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE users
       SET preferredJobTitles = ?, preferredLocations = ?, preferredEmploymentType = ?, preferredWorkMode = ?, salaryPreference = ?, updatedAt = ?
       WHERE id = ?`,
      [updatedTitles, updatedLocs, updatedEmp, updatedMode, updatedSalary, now, userId]
    );

    const freshUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    delete freshUser.password;

    res.json({
      message: 'Preferences updated successfully',
      profile: parseUserFields(freshUser),
    });
  } catch (err) {
    next(err);
  }
}
