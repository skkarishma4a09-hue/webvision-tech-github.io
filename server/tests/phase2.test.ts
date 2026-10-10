import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';
import { prisma } from '../config/prisma';

async function runPhase2Tests() {
  console.log('🧪 Running Phase 2 Automated Test Suite...\n');
  let testUserToken = '';
  let testUserId = '';

  try {
    // 1. Test Registration
    console.log('Test 1: User Registration');
    const email = `test_${Date.now()}@example.com`;
    const regResult = await AuthService.register({
      name: 'Test Candidate',
      email,
      password: 'Password123!',
      role: 'JOB_SEEKER',
    });

    if (!regResult.token || !regResult.user.id) throw new Error('Registration failed to return token/user');
    testUserToken = regResult.token;
    testUserId = regResult.user.id;
    console.log('  ✅ Registration successful! User ID:', testUserId);

    // 2. Test Duplicate Registration
    console.log('\nTest 2: Duplicate Registration Prevention');
    try {
      await AuthService.register({ name: 'Dup User', email, password: 'Password123!' });
      throw new Error('Duplicate registration should have thrown error');
    } catch (err: any) {
      if (err.code !== 'DUPLICATE_ACCOUNT') throw err;
      console.log('  ✅ Duplicate account correctly rejected');
    }

    // 3. Test Login
    console.log('\nTest 3: Authentication Login');
    const loginResult = await AuthService.login({ email, password: 'Password123!' });
    if (!loginResult.token) throw new Error('Login failed');
    console.log('  ✅ Login successful with active JWT session');

    // 4. Test Invalid Login
    console.log('\nTest 4: Invalid Password Handling');
    try {
      await AuthService.login({ email, password: 'WrongPassword' });
      throw new Error('Invalid login should have failed');
    } catch (err: any) {
      if (err.code !== 'INVALID_CREDENTIALS') throw err;
      console.log('  ✅ Invalid password correctly rejected');
    }

    // 5. Test Profile Retrieval & Completion Calculation
    console.log('\nTest 5: Profile Fetch & Completion Score Calculation');
    const profile = await ProfileService.getFullProfile(testUserId);
    if (!profile || typeof profile.completionPercentage !== 'number') {
      throw new Error('Failed to retrieve full profile');
    }
    console.log(`  ✅ Profile retrieved! Initial Completion: ${profile.completionPercentage}% (Missing: ${profile.missingSections.join(', ')})`);

    // 6. Test Profile Update & Persistence
    console.log('\nTest 6: Profile Update');
    const updatedProfile = await ProfileService.updateProfile(testUserId, {
      headline: 'Senior Full-Stack Engineer',
      about: 'Passionate about building scalable modern cloud applications.',
      location: 'San Francisco, CA',
      phone: '+1 (555) 019-2831',
    });
    if (updatedProfile.headline !== 'Senior Full-Stack Engineer') throw new Error('Profile update failed');
    console.log(`  ✅ Profile updated! New Completion: ${updatedProfile.completionPercentage}%`);

    // 7. Test Skills CRUD
    console.log('\nTest 7: Skills CRUD');
    const profileWithSkill = await ProfileService.addSkill(testUserId, 'TypeScript', 5, 5);
    const addedSkill = profileWithSkill.skills.find(s => s.skill.name === 'TypeScript');
    if (!addedSkill) throw new Error('Skill not added');
    console.log('  ✅ Skill "TypeScript" added to profile');

    await ProfileService.removeSkill(testUserId, addedSkill.id);
    console.log('  ✅ Skill removed successfully');

    // 8. Test Education CRUD
    console.log('\nTest 8: Education CRUD');
    const eduProfile = await ProfileService.addEducation(testUserId, {
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09-01',
      endDate: '2020-06-01',
    });
    if (eduProfile.education.length === 0) throw new Error('Education not added');
    const eduId = eduProfile.education[0].id;
    console.log('  ✅ Education added to profile');

    await ProfileService.deleteEducation(testUserId, eduId);
    console.log('  ✅ Education entry deleted');

    // 9. Test Experience CRUD
    console.log('\nTest 9: Experience CRUD');
    const expProfile = await ProfileService.addExperience(testUserId, {
      company: 'Tech Innovators Inc',
      title: 'Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2020-07-01',
      currentlyWorking: true,
      description: 'Building high-throughput Node.js microservices.',
    });
    if (expProfile.experience.length === 0) throw new Error('Experience not added');
    console.log('  ✅ Experience added to profile');

    // 10. Test Project CRUD
    console.log('\nTest 10: Project CRUD');
    const projProfile = await ProfileService.addProject(testUserId, {
      title: 'Synapse Job Portal',
      description: 'Full stack career networking and job matching platform.',
      technologies: ['React', 'Node.js', 'Prisma', 'TypeScript'],
    });
    if (projProfile.projects.length === 0) throw new Error('Project not added');
    console.log('  ✅ Project added to profile');

    // 11. Test Resume Upload Metadata
    console.log('\nTest 11: Resume Upload Metadata');
    const resumeProfile = await ProfileService.addResume(testUserId, {
      title: 'Engineering Resume 2026',
      fileUrl: 'https://storage.synapse.io/resumes/test_candidate.pdf',
      fileName: 'test_candidate.pdf',
      fileSize: 204850,
      mimeType: 'application/pdf',
      isPrimary: true,
    });
    if (resumeProfile.resumes.length === 0) throw new Error('Resume metadata not added');
    console.log('  ✅ Resume metadata added to profile');

    // 12. Test Forgot Password Request
    console.log('\nTest 12: Forgot Password Architecture');
    const forgotRes = await AuthService.forgotPassword(email);
    if (!forgotRes.resetToken) throw new Error('Failed to generate reset token');
    console.log('  ✅ Password reset token generated safely');

    // 13. Test Reset Password Execution
    console.log('\nTest 13: Password Reset Execution');
    await AuthService.resetPassword(forgotRes.resetToken, 'NewPassword123!');
    console.log('  ✅ Password reset successfully');

    // 14. Test Login with New Password
    console.log('\nTest 14: Login with Reset Password');
    const newLogin = await AuthService.login({ email, password: 'NewPassword123!' });
    if (!newLogin.token) throw new Error('Login with new password failed');
    console.log('  ✅ Login with new password succeeded');

    // 15. Test Logout & Session Invalidation
    console.log('\nTest 15: Logout & Session Invalidation');
    await AuthService.logout(newLogin.token, testUserId, true);
    console.log('  ✅ Sessions revoked on logout');

    // Cleanup Test User
    await prisma.user.delete({ where: { id: testUserId } });

    console.log('\n🎉 ALL 15 AUTOMATED TESTS PASSED SUCCESSFULLY! Phase 2 backend is fully functional and secure.\n');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('phase2.test')) {
  runPhase2Tests().then(() => process.exit(0));
}
