import { ProfileRepository } from '../repositories/profileRepository';

export class ProfileService {
  static calculateCompletion(profile: any) {
    const missing: string[] = [];
    let score = 0;

    if (profile.name) score += 15; else missing.push('Basic Information');
    if (profile.headline) score += 15; else missing.push('Professional Headline');
    if (profile.about) score += 15; else missing.push('About / Bio Summary');
    if (profile.profilePhoto) score += 10; else missing.push('Profile Photo');
    if (profile.skills && profile.skills.length > 0) score += 15; else missing.push('Skills');
    if (profile.education && profile.education.length > 0) score += 10; else missing.push('Education');
    if (profile.experience && profile.experience.length > 0) score += 10; else missing.push('Work Experience');
    if (profile.resumes && profile.resumes.length > 0) score += 10; else missing.push('Resume Upload');

    return {
      completionPercentage: Math.min(100, score),
      missingSections: missing,
    };
  }

  static async getFullProfile(userId: string) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) {
      throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };
    }

    const { completionPercentage, missingSections } = this.calculateCompletion(profile);

    return {
      ...profile,
      completionPercentage,
      missingSections,
    };
  }

  static async updateProfile(userId: string, data: any) {
    await ProfileRepository.updateProfile(userId, data);
    return this.getFullProfile(userId);
  }

  static async addSkill(userId: string, skillName: string, years?: number, rating?: number) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.addSkill(profile.id, skillName, years, rating);
    return this.getFullProfile(userId);
  }

  static async removeSkill(userId: string, skillId: string) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.removeSkill(profile.id, skillId);
    return this.getFullProfile(userId);
  }

  static async addEducation(userId: string, data: any) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.addEducation(profile.id, data);
    return this.getFullProfile(userId);
  }

  static async deleteEducation(userId: string, id: string) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.deleteEducation(profile.id, id);
    return this.getFullProfile(userId);
  }

  static async addExperience(userId: string, data: any) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.addExperience(profile.id, data);
    return this.getFullProfile(userId);
  }

  static async deleteExperience(userId: string, id: string) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.deleteExperience(profile.id, id);
    return this.getFullProfile(userId);
  }

  static async addProject(userId: string, data: any) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.addProject(profile.id, data);
    return this.getFullProfile(userId);
  }

  static async deleteProject(userId: string, id: string) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.deleteProject(profile.id, id);
    return this.getFullProfile(userId);
  }

  static async addResume(userId: string, data: any) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.addResume(profile.id, data);
    return this.getFullProfile(userId);
  }

  static async deleteResume(userId: string, id: string) {
    const profile = await ProfileRepository.getFullProfileByUserId(userId);
    if (!profile) throw { code: 'PROFILE_NOT_FOUND', message: 'User profile not found.' };

    await ProfileRepository.deleteResume(profile.id, id);
    return this.getFullProfile(userId);
  }
}
