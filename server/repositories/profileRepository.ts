import { prisma } from '../config/prisma';

export class ProfileRepository {
  static async getFullProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        education: { orderBy: { startDate: 'desc' } },
        experience: { orderBy: { startDate: 'desc' } },
        projects: { orderBy: { createdAt: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        resumes: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  static async updateProfile(userId: string, data: any) {
    return prisma.profile.update({
      where: { userId },
      data,
    });
  }

  // Skills
  static async addSkill(profileId: string, skillName: string, yearsOfExperience?: number, rating?: number) {
    const skill = await prisma.skill.upsert({
      where: { name: skillName.trim() },
      update: {},
      create: { name: skillName.trim() },
    });

    return prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId,
          skillId: skill.id,
        },
      },
      update: {
        yearsOfExperience: yearsOfExperience || undefined,
        rating: rating || undefined,
      },
      create: {
        profileId,
        skillId: skill.id,
        yearsOfExperience: yearsOfExperience || null,
        rating: rating || 3,
      },
      include: { skill: true },
    });
  }

  static async removeSkill(profileId: string, userSkillId: string) {
    return prisma.userSkill.deleteMany({
      where: {
        id: userSkillId,
        profileId,
      },
    });
  }

  // Education
  static async addEducation(profileId: string, data: any) {
    return prisma.education.create({
      data: {
        profileId,
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description || null,
        grade: data.grade || null,
      },
    });
  }

  static async updateEducation(profileId: string, id: string, data: any) {
    return prisma.education.updateMany({
      where: { id, profileId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  static async deleteEducation(profileId: string, id: string) {
    return prisma.education.deleteMany({
      where: { id, profileId },
    });
  }

  // Experience
  static async addExperience(profileId: string, data: any) {
    return prisma.experience.create({
      data: {
        profileId,
        company: data.company,
        title: data.title,
        location: data.location || null,
        employmentType: data.employmentType || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        currentlyWorking: Boolean(data.currentlyWorking),
        description: data.description || null,
      },
    });
  }

  static async updateExperience(profileId: string, id: string, data: any) {
    return prisma.experience.updateMany({
      where: { id, profileId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  static async deleteExperience(profileId: string, id: string) {
    return prisma.experience.deleteMany({
      where: { id, profileId },
    });
  }

  // Projects
  static async addProject(profileId: string, data: any) {
    return prisma.project.create({
      data: {
        profileId,
        title: data.title,
        description: data.description,
        technologies: JSON.stringify(data.technologies || []),
        projectUrl: data.projectUrl || null,
        repositoryUrl: data.repositoryUrl || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  static async deleteProject(profileId: string, id: string) {
    return prisma.project.deleteMany({
      where: { id, profileId },
    });
  }

  // Resumes
  static async addResume(profileId: string, data: any) {
    if (data.isPrimary) {
      await prisma.resume.updateMany({
        where: { profileId },
        data: { isPrimary: false },
      });
    }

    return prisma.resume.create({
      data: {
        profileId,
        title: data.title,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        isPrimary: Boolean(data.isPrimary),
      },
    });
  }

  static async deleteResume(profileId: string, id: string) {
    return prisma.resume.deleteMany({
      where: { id, profileId },
    });
  }
}
