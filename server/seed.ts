import bcrypt from 'bcryptjs';
import { getDb } from './config/database';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  const db = await getDb();

  // Clear existing data for fresh seed
  await db.exec('DELETE FROM job_alerts;');
  await db.exec('DELETE FROM applications;');
  await db.exec('DELETE FROM saved_jobs;');
  await db.exec('DELETE FROM jobs;');
  await db.exec('DELETE FROM users;');

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Demo Admin & Candidate Users
  const adminId = 'usr_admin_demo';
  const candidateId = 'usr_candidate_demo';

  await db.run(
    `INSERT INTO users (id, name, email, password, role, profilePhoto, phone, location, headline, bio, skills, education, experience, preferredJobTitles, preferredLocations, preferredEmploymentType, preferredWorkMode, salaryPreference, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'ADMIN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      adminId,
      'Recruiter Admin',
      'admin@synapse.io',
      passwordHash,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      '+1 (555) 019-2831',
      'San Francisco, CA',
      'Head of Talent Acquisition @ TechCorp',
      'Building world-class engineering teams across North America and Europe.',
      JSON.stringify(['Recruiting', 'Talent Acquisition', 'HR Strategy']),
      JSON.stringify([{ institution: 'Stanford University', degree: 'BS', fieldOfStudy: 'Business', startYear: 2014, endYear: 2018 }]),
      JSON.stringify([{ title: 'Lead Recruiter', company: 'TechCorp', startDate: '2020-01-01', current: true }]),
      JSON.stringify(['Engineering Manager', 'Recruiter']),
      JSON.stringify(['San Francisco, CA', 'Remote']),
      'Full-time',
      'Hybrid',
      180000,
      now,
      now,
    ]
  );

  await db.run(
    `INSERT INTO users (id, name, email, password, role, profilePhoto, phone, location, headline, bio, skills, education, experience, preferredJobTitles, preferredLocations, preferredEmploymentType, preferredWorkMode, salaryPreference, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'USER', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      candidateId,
      'Alex Morgan',
      'alex.morgan@example.com',
      passwordHash,
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      '+1 (555) 392-1049',
      'Austin, TX',
      'Senior Full Stack Engineer | React & Node.js',
      'Passionate software engineer with 6+ years of experience crafting scalable web applications and distributed systems.',
      JSON.stringify(['TypeScript', 'React', 'Node.js', 'GraphQL', 'PostgreSQL', 'Docker', 'AWS']),
      JSON.stringify([{ institution: 'University of Texas at Austin', degree: 'BS', fieldOfStudy: 'Computer Science', startYear: 2016, endYear: 2020 }]),
      JSON.stringify([
        { title: 'Senior Software Engineer', company: 'CloudScale Inc', location: 'Austin, TX', startDate: '2022-03-01', current: true, description: 'Architecting high-throughput microservices using TypeScript and React.' },
        { title: 'Frontend Developer', company: 'WebFlow Studio', location: 'Austin, TX', startDate: '2020-06-01', endDate: '2022-02-28', description: 'Built interactive dashboard components in React and CSS Modules.' }
      ]),
      JSON.stringify(['Full Stack Developer', 'Frontend Developer', 'Backend Developer']),
      JSON.stringify(['Austin, TX', 'Remote', 'New York, NY']),
      'Full-time',
      'Remote',
      145000,
      now,
      now,
    ]
  );

  // 2. Seed Jobs Dataset (12 diverse tech jobs)
  const sampleJobs = [
    {
      id: 'job_se_101',
      title: 'Senior Software Engineer',
      company: 'Apex Cloud Solutions',
      companyLogo: '⚡',
      location: 'San Francisco, CA',
      description: 'We are seeking a Senior Software Engineer to design, scale, and deliver resilient cloud infrastructure and web applications.',
      requirements: ['5+ years of experience with Node.js and TypeScript', 'Solid background in distributed systems and microservices', 'Hands-on experience with Docker, Kubernetes, and AWS'],
      responsibilities: ['Architect scalable backend APIs', 'Collaborate with product and UX teams', 'Mentor junior and mid-level engineers'],
      skills: ['TypeScript', 'Node.js', 'AWS', 'Docker', 'Microservices'],
      salary: '$140,000 - $175,000 / year',
      salaryMin: 140000,
      salaryMax: 175000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Remote',
      experienceLevel: 'Senior',
      category: 'Software Development',
      postedDate: '2026-10-01T08:00:00.000Z',
    },
    {
      id: 'job_fe_102',
      title: 'Frontend Developer',
      company: 'PixelCraft Studio',
      companyLogo: '🎨',
      location: 'New York, NY',
      description: 'Join our creative technology team as a Frontend Developer to craft visually responsive, accessible, and delightful React applications.',
      requirements: ['3+ years building production web apps in React', 'Deep mastery of HTML5, modern CSS/Sass, and TypeScript', 'Experience with state management and Webpack/Vite'],
      responsibilities: ['Implement high-fidelity pixel-perfect UIs', 'Optimize frontend load times and render performance', 'Enforce accessibility (WCAG 2.1 AA) standards'],
      skills: ['React', 'TypeScript', 'CSS3', 'Vite', 'State Management'],
      salary: '$110,000 - $135,000 / year',
      salaryMin: 110000,
      salaryMax: 135000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: 'Mid-level',
      category: 'Software Development',
      postedDate: '2026-10-03T10:30:00.000Z',
    },
    {
      id: 'job_be_103',
      title: 'Backend Developer',
      company: 'DataStream Core',
      companyLogo: '🚀',
      location: 'Austin, TX',
      description: 'DataStream Core is looking for a driven Backend Developer to construct high-throughput REST and GraphQL APIs using Node.js and PostgreSQL.',
      requirements: ['4+ years in backend engineering', 'Expertise in relational database schema optimization and SQL', 'Familiarity with Redis caching and queue systems'],
      responsibilities: ['Develop clean RESTful API endpoints', 'Implement database query tuning and security controls', 'Maintain continuous integration pipelines'],
      skills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'Express'],
      salary: '$125,000 - $155,000 / year',
      salaryMin: 125000,
      salaryMax: 155000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'On-site',
      experienceLevel: 'Mid-level',
      category: 'Software Development',
      postedDate: '2026-10-04T12:00:00.000Z',
    },
    {
      id: 'job_fs_104',
      title: 'Full Stack Developer',
      company: 'NextGen Innovators',
      companyLogo: '🌐',
      location: 'Seattle, WA',
      description: 'Full Stack Developer needed to build end-to-end user features, from React frontend components down to serverless Node backend logic.',
      requirements: ['3+ years full-stack experience', 'Proficiency in React, TypeScript, and serverless architectures', 'Familiarity with CI/CD and cloud deployment'],
      responsibilities: ['Deliver features end-to-end', 'Participate in architectural reviews and design docs', 'Collaborate across design, product, and QA'],
      skills: ['React', 'Node.js', 'TypeScript', 'Serverless', 'MongoDB'],
      salary: '$130,000 - $160,000 / year',
      salaryMin: 130000,
      salaryMax: 160000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Remote',
      experienceLevel: 'Mid-level',
      category: 'Software Development',
      postedDate: '2026-10-05T09:15:00.000Z',
    },
    {
      id: 'job_da_105',
      title: 'Data Analyst',
      company: 'Quantify Metrics',
      companyLogo: '📊',
      location: 'Chicago, IL',
      description: 'Looking for a detail-oriented Data Analyst to turn customer and operational datasets into actionable insights, dashboards, and growth drivers.',
      requirements: ['2+ years of data analytics experience', 'Strong SQL skills and expertise in Tableau or PowerBI', 'Experience with Python or R for statistical analysis'],
      responsibilities: ['Create automated executive dashboards', 'Perform ad-hoc cohort analysis and funnel optimization', 'Present data insights to stakeholders'],
      skills: ['SQL', 'Tableau', 'Python', 'PowerBI', 'Excel'],
      salary: '$85,000 - $110,000 / year',
      salaryMin: 85000,
      salaryMax: 110000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: 'Mid-level',
      category: 'Data Science',
      postedDate: '2026-10-02T11:00:00.000Z',
    },
    {
      id: 'job_ds_106',
      title: 'Data Scientist',
      company: 'Insight AI Labs',
      companyLogo: '🧬',
      location: 'Boston, MA',
      description: 'Join Insight AI Labs as a Data Scientist to build predictive models, recommendation algorithms, and statistical pipelines.',
      requirements: ['MS or PhD in Computer Science, Statistics, or related field', 'Strong programming background in Python, Pandas, and Scikit-Learn', 'Experience deploying ML models into production API endpoints'],
      responsibilities: ['Develop customer churn prediction models', 'Conduct A/B testing experimentations', 'Publish internal research and model documentation'],
      skills: ['Python', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'SQL'],
      salary: '$145,000 - $185,000 / year',
      salaryMin: 145000,
      salaryMax: 185000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Remote',
      experienceLevel: 'Senior',
      category: 'Data Science',
      postedDate: '2026-10-06T14:20:00.000Z',
    },
    {
      id: 'job_mle_107',
      title: 'Machine Learning Engineer',
      company: 'Cognitive Dynamics',
      companyLogo: '🤖',
      location: 'San Jose, CA',
      description: 'Cognitive Dynamics is seeking a Machine Learning Engineer to scale LLM infrastructure, fine-tune models, and deploy high-throughput inference services.',
      requirements: ['4+ years in ML Engineering or AI Infrastructure', 'Deep familiarity with PyTorch, CUDA, and HuggingFace', 'Experience with MLOps pipelines (Kubeflow, MLflow, Triton)'],
      responsibilities: ['Optimize LLM inference latency', 'Manage distributed model training clusters', 'Integrate ML endpoints into core SaaS product'],
      skills: ['PyTorch', 'Python', 'MLOps', 'CUDA', 'HuggingFace'],
      salary: '$165,000 - $210,000 / year',
      salaryMin: 165000,
      salaryMax: 210000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: 'Senior',
      category: 'AI/ML',
      postedDate: '2026-10-05T16:00:00.000Z',
    },
    {
      id: 'job_ui_108',
      title: 'UI/UX Designer',
      company: 'Vivid Experience Agency',
      companyLogo: '✨',
      location: 'Los Angeles, CA',
      description: 'Seeking a vision-driven UI/UX Designer to craft beautiful design systems, interactive prototypes, and intuitive user journeys for mobile and web platforms.',
      requirements: ['3+ years experience as UI/UX or Product Designer', 'Expertise in Figma, wireframing, component design systems, and visual hierarchy', 'Strong portfolio showcasing responsive web and app experiences'],
      responsibilities: ['Design intuitive navigation flows and visual mockups', 'Maintain Figma design token library', 'Conduct usability testing sessions'],
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
      salary: '$95,000 - $125,000 / year',
      salaryMin: 95000,
      salaryMax: 125000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Remote',
      experienceLevel: 'Mid-level',
      category: 'UI/UX',
      postedDate: '2026-10-04T15:45:00.000Z',
    },
    {
      id: 'job_devops_109',
      title: 'DevOps Engineer',
      company: 'ScaleOps Infrastructure',
      companyLogo: '⚙️',
      location: 'Denver, CO',
      description: 'DevOps Engineer needed to automate multi-region cloud deployments, enhance monitoring alerts, and ensure 99.99% system availability.',
      requirements: ['4+ years managing AWS or GCP cloud environments', 'Hands-on experience with Terraform, Ansible, and Kubernetes', 'Proficiency in CI/CD pipeline automation (GitHub Actions, GitLab CI)'],
      responsibilities: ['Maintain Infrastructure as Code (IaC)', 'Configure Prometheus, Grafana, and Datadog monitoring', 'Participate in on-call rotation and security audits'],
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
      salary: '$135,000 - $170,000 / year',
      salaryMin: 135000,
      salaryMax: 170000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Remote',
      experienceLevel: 'Senior',
      category: 'DevOps',
      postedDate: '2026-10-06T10:10:00.000Z',
    },
    {
      id: 'job_test_110',
      title: 'Software Tester',
      company: 'QualityFirst Systems',
      companyLogo: '🛡️',
      location: 'Atlanta, GA',
      description: 'QualityFirst Systems is looking for a Software QA Tester to drive automated e2e testing and maintain software excellence across release cycles.',
      requirements: ['3+ years in QA engineering and automated test suites', 'Proficiency in Cypress, Playwright, or Selenium with JavaScript/TypeScript', 'Familiarity with API testing using Postman or Supertest'],
      responsibilities: ['Write and maintain end-to-end automated tests', 'Perform regression and exploratory testing on new features', 'Track and verify bug fixes in Jira'],
      skills: ['Cypress', 'Playwright', 'API Testing', 'TypeScript', 'QA Automation'],
      salary: '$80,000 - $105,000 / year',
      salaryMin: 80000,
      salaryMax: 105000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: 'Mid-level',
      category: 'Testing',
      postedDate: '2026-10-03T13:30:00.000Z',
    },
    {
      id: 'job_cloud_111',
      title: 'Cloud Architect',
      company: 'Enterprise Sky Networks',
      companyLogo: '☁️',
      location: 'Dallas, TX',
      description: 'Strategic Cloud Architect needed to lead enterprise cloud migration strategies, multi-cloud networking, and zero-trust security postures.',
      requirements: ['7+ years experience in cloud architecture', 'AWS Certified Solutions Architect Professional or GCP Cloud Architect certification', 'Proven leadership in enterprise security, IAM, and networking'],
      responsibilities: ['Define enterprise cloud migration roadmap', 'Oversee cost optimization and cloud governance', 'Conduct architecture review boards'],
      skills: ['AWS', 'GCP', 'Cloud Security', 'Enterprise Architecture', 'Terraform'],
      salary: '$175,000 - $220,000 / year',
      salaryMin: 175000,
      salaryMax: 220000,
      currency: 'USD',
      employmentType: 'Contract',
      workMode: 'Remote',
      experienceLevel: 'Lead',
      category: 'Cloud',
      postedDate: '2026-10-01T09:00:00.000Z',
    },
    {
      id: 'job_pm_112',
      title: 'Product Manager',
      company: 'ProductPulse Tech',
      companyLogo: '💡',
      location: 'San Francisco, CA',
      description: 'Product Manager needed to lead cross-functional roadmap strategy, user interview discovery, and feature execution for our core B2B SaaS platform.',
      requirements: ['4+ years product management experience in SaaS', 'Proven track record of defining product metrics and roadmaps', 'Strong analytical mindset and user empathy'],
      responsibilities: ['Define product strategy and backlog prioritization', 'Run sprint planning with engineering teams', 'Analyze funnel analytics and retention metrics'],
      skills: ['Product Management', 'Agile', 'User Discovery', 'Roadmapping', 'Analytics'],
      salary: '$135,000 - $165,000 / year',
      salaryMin: 135000,
      salaryMax: 165000,
      currency: 'USD',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      experienceLevel: 'Senior',
      category: 'Product Management',
      postedDate: '2026-10-05T11:20:00.000Z',
    },
  ];

  for (const job of sampleJobs) {
    await db.run(
      `INSERT INTO jobs (id, title, company, companyLogo, location, description, requirements, responsibilities, skills, salary, salaryMin, salaryMax, currency, employmentType, workMode, experienceLevel, postedDate, applicationUrl, source, status, category, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Internal', 'active', ?, ?, ?)`,
      [
        job.id,
        job.title,
        job.company,
        job.companyLogo,
        job.location,
        job.description,
        JSON.stringify(job.requirements),
        JSON.stringify(job.responsibilities),
        JSON.stringify(job.skills),
        job.salary,
        job.salaryMin,
        job.salaryMax,
        job.currency,
        job.employmentType,
        job.workMode,
        job.experienceLevel,
        job.postedDate,
        'https://synapse.io/careers/' + job.id,
        job.category,
        now,
        now,
      ]
    );
  }

  // 3. Seed Sample Saved Job & Application for Candidate User
  await db.run(
    `INSERT INTO saved_jobs (id, userId, jobId, createdAt) VALUES (?, ?, ?, ?)`,
    ['saved_demo_1', candidateId, 'job_se_101', now]
  );

  await db.run(
    `INSERT INTO applications (id, userId, jobId, status, appliedAt, notes, resumeUsed, coverLetter)
     VALUES (?, ?, ?, 'Applied', ?, ?, ?, ?)`,
    [
      'app_demo_1',
      candidateId,
      'job_fe_102',
      now,
      'Submitted resume via Synapse portal.',
      'https://synapse.io/resumes/alex_morgan.pdf',
      'Excited to contribute to PixelCraft Studio as a Frontend Developer!',
    ]
  );

  // 4. Seed Job Alert for Candidate
  await db.run(
    `INSERT INTO job_alerts (id, userId, keywords, location, jobType, workMode, experienceLevel, salary, frequency, enabled, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      'alert_demo_1',
      candidateId,
      'React TypeScript',
      'Remote',
      'Full-time',
      'Remote',
      'Senior',
      140000,
      'daily',
      now,
    ]
  );

  console.log('✅ Seeding completed successfully!');
  console.log(`- Created Admin user: admin@synapse.io (Password: password123)`);
  console.log(`- Created Candidate user: alex.morgan@example.com (Password: password123)`);
  console.log(`- Seeded ${sampleJobs.length} realistic tech jobs across multiple engineering domains.`);
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
