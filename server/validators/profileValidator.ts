import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  headline: z.string().max(200).optional().nullable(),
  about: z.string().max(2000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  profilePhoto: z.string().optional().nullable(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'CONNECTIONS']).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  fieldOfStudy: z.string().min(2, 'Field of study is required'),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  description: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
});

export const experienceSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  title: z.string().min(2, 'Job title is required'),
  location: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  currentlyWorking: z.boolean().optional().default(false),
  description: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string().min(5, 'Description is required'),
  technologies: z.array(z.string()).optional().default([]),
  projectUrl: z.string().url().optional().nullable().or(z.literal('')),
  repositoryUrl: z.string().url().optional().nullable().or(z.literal('')),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  yearsOfExperience: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
});
