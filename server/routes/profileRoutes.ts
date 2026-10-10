import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Core Profile
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);

// Skills
router.post('/skills', ProfileController.addSkill);
router.delete('/skills/:id', ProfileController.removeSkill);

// Education
router.post('/education', ProfileController.addEducation);
router.delete('/education/:id', ProfileController.deleteEducation);

// Experience
router.post('/experience', ProfileController.addExperience);
router.delete('/experience/:id', ProfileController.deleteExperience);

// Projects
router.post('/projects', ProfileController.addProject);
router.delete('/projects/:id', ProfileController.deleteProject);

// Resumes
router.post('/resumes', ProfileController.uploadResume);
router.delete('/resumes/:id', ProfileController.deleteResume);

export default router;
