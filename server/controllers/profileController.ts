import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profileService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  updateProfileSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  skillSchema,
} from '../validators/profileValidator';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const profile = await ProfileService.getFullProfile(userId);
      return sendSuccess(res, profile);
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 404);
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid profile fields', 400, parsed.error.format());
      }

      const updated = await ProfileService.updateProfile(userId, parsed.data);
      return sendSuccess(res, updated, 200, 'Profile updated successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  // Skills
  static async addSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const parsed = skillSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid skill input', 400, parsed.error.format());
      }

      const updated = await ProfileService.addSkill(
        userId,
        parsed.data.name,
        parsed.data.yearsOfExperience,
        parsed.data.rating
      );
      return sendSuccess(res, updated, 201, 'Skill added successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  static async removeSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const { id } = req.params;
      const updated = await ProfileService.removeSkill(userId, id);
      return sendSuccess(res, updated, 200, 'Skill removed successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  // Education
  static async addEducation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const parsed = educationSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid education input', 400, parsed.error.format());
      }

      const updated = await ProfileService.addEducation(userId, parsed.data);
      return sendSuccess(res, updated, 201, 'Education added successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  static async deleteEducation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const { id } = req.params;
      const updated = await ProfileService.deleteEducation(userId, id);
      return sendSuccess(res, updated, 200, 'Education entry deleted');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  // Experience
  static async addExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const parsed = experienceSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid experience input', 400, parsed.error.format());
      }

      const updated = await ProfileService.addExperience(userId, parsed.data);
      return sendSuccess(res, updated, 201, 'Experience added successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  static async deleteExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const { id } = req.params;
      const updated = await ProfileService.deleteExperience(userId, id);
      return sendSuccess(res, updated, 200, 'Experience entry deleted');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  // Projects
  static async addProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const parsed = projectSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid project input', 400, parsed.error.format());
      }

      const updated = await ProfileService.addProject(userId, parsed.data);
      return sendSuccess(res, updated, 201, 'Project added successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const { id } = req.params;
      const updated = await ProfileService.deleteProject(userId, id);
      return sendSuccess(res, updated, 200, 'Project entry deleted');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  // Resumes
  static async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const { title, fileUrl, fileName, fileSize, mimeType, isPrimary } = req.body;

      if (!title || !fileUrl || !fileName) {
        return sendError(res, 'VALIDATION_ERROR', 'Title, fileUrl, and fileName are required for resume upload', 400);
      }

      const updated = await ProfileService.addResume(userId, {
        title,
        fileUrl,
        fileName,
        fileSize: fileSize || 1024,
        mimeType: mimeType || 'application/pdf',
        isPrimary: isPrimary ?? true,
      });

      return sendSuccess(res, updated, 201, 'Resume metadata uploaded successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }

  static async deleteResume(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.authUser!.id;
      const { id } = req.params;
      const updated = await ProfileService.deleteResume(userId, id);
      return sendSuccess(res, updated, 200, 'Resume removed successfully');
    } catch (err: any) {
      if (err.code) return sendError(res, err.code, err.message, 400);
      next(err);
    }
  }
}
