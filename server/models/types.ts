export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  profilePhoto?: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  resume?: string;
  preferredJobTitles: string[];
  preferredLocations: string[];
  preferredEmploymentType: string;
  preferredWorkMode: string;
  salaryPreference?: number;
  createdAt: string;
  updatedAt: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead' | 'Executive';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  postedDate: string;
  applicationUrl?: string;
  source?: string;
  status: 'active' | 'closed';
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  job?: Job;
}

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
  resumeUsed?: string;
  coverLetter?: string;
  interviewDate?: string;
  job?: Job;
}

export type AlertFrequency = 'daily' | 'weekly';

export interface JobAlert {
  id: string;
  userId: string;
  keywords: string;
  location?: string;
  jobType?: EmploymentType;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  salary?: number;
  frequency: AlertFrequency;
  enabled: boolean;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
