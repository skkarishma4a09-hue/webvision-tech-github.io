import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import * as creators from '../controllers/marketplace/creatorController';
import * as services from '../controllers/marketplace/serviceController';
import * as orders from '../controllers/marketplace/orderController';
import * as projects from '../controllers/marketplace/projectController';
import * as reviews from '../controllers/marketplace/reviewController';
import * as social from '../controllers/marketplace/socialController';
import * as chat from '../controllers/marketplace/chatController';
import * as notifs from '../controllers/marketplace/notificationController';
import * as analytics from '../controllers/marketplace/analyticsController';
import * as ai from '../controllers/marketplace/aiController';
import * as search from '../controllers/marketplace/searchController';
import { aiGenerationRateLimiter } from '../middleware/rateLimiter';
import { MultiAgentOrchestrator } from '../services/multiAgentOrchestrator';
import { MLRecommendationEngine } from '../services/mlRecommendationEngine';
import { prisma } from '../config/prisma';

const router = Router();


// ─── Public discovery ───────────────────────────────
router.get('/creators/:id', creators.getCreator);
router.get('/creators', creators.listCreators);
router.get('/services/:id', services.getService);
router.get('/services', services.listServices);
router.get('/reviews', reviews.listReviews);
router.get('/marketplace/stats', analytics.marketplaceStats);
router.get('/search', search.search);

// ─── Creator management ─────────────────────────────
router.use(['/creators/me', '/creators/apply', '/creator/services'], authenticateToken);
router.post('/creators/apply', creators.applyAsCreator);
router.put('/creators/me', creators.updateMe);
router.get('/creator/services', services.myServices);
router.post('/creator/services', requireRole('CREATOR', 'ADMIN'), services.createService);
router.put('/creator/services/:id', services.updateService);
router.delete('/creator/services/:id', services.deleteService);

// ─── Orders ─────────────────────────────────────────
router.use(['/orders', '/projects', '/favorites', '/follows', '/library', '/searches', '/search/history', '/chat', '/notifications', '/analytics/creator', '/ai'], authenticateToken);
// AI Studio routes
router.post('/ai/generate', ai.generate);
router.get('/ai/history', ai.history);
router.delete('/ai/:id', ai.deleteGeneration);
router.post('/orders', orders.createOrder);
router.get('/orders', orders.listOrders);
router.get('/orders/:id', orders.getOrder);
router.patch('/orders/:id/status', orders.updateStatus);
router.post('/orders/:id/revision', orders.requestRevision);
router.post('/orders/:id/dispute', orders.openDispute);

// ─── Projects ───────────────────────────────────────
router.get('/projects', projects.listProjects);
router.get('/projects/:id', projects.getProject);
router.post('/projects', projects.createProject);
router.patch('/projects/:id', projects.updateProject);

// ─── Reviews ────────────────────────────────────────
router.post('/reviews', reviews.createReview);
router.patch('/reviews/:id', reviews.updateReview);
router.delete('/reviews/:id', reviews.deleteReview);
router.post('/reviews/:id/helpful', reviews.helpfulVote);
router.post('/reviews/:id/report', reviews.reportReview);

// ─── Favorites & follows ────────────────────────────
router.post('/favorites/services/:id', social.toggleFavoriteService);
router.post('/favorites/creators/:id', social.toggleFavoriteCreator);
router.get('/favorites', social.listMyFavorites);
router.post('/follows/:id', social.toggleFollow);

// ─── Library ────────────────────────────────────────
router.get('/library', social.listLibrary);
router.post('/library', social.addToLibrary);
router.patch('/library/:id/download', social.markDownloaded);
router.delete('/library/:id', social.removeFromLibrary);

// ─── Saved searches & history ───────────────────────
router.get('/searches', social.listSearches);
router.post('/searches', social.saveSearch);
router.delete('/searches/:id', social.deleteSearch);
router.post('/search/history', social.recordSearchHistory);
router.get('/search/history', social.listSearchHistory);
router.post('/search/history/clear', social.clearSearchHistory);

// ─── Chat ───────────────────────────────────────────
router.get('/chat/conversations', chat.listConversations);
router.post('/chat/conversations', chat.startConversation);
router.get('/chat/conversations/:id/messages', chat.getMessages);
router.post('/chat/conversations/:id/messages', chat.sendMessage);
router.post('/chat/conversations/:id/read', chat.markRead);
router.delete('/chat/messages/:id', chat.deleteMessage);

// ─── Notifications ─────────────────────────────────-
router.get('/notifications', notifs.listNotifications);
router.get('/notifications/unread-count', notifs.unreadCount);
router.patch('/notifications/:id/read', notifs.markOneRead);
router.patch('/notifications/read-all', notifs.markAllRead);
router.delete('/notifications/:id', notifs.deleteNotif);
router.get('/notifications/preferences', notifs.getPrefs);
router.put('/notifications/preferences', notifs.updatePrefs);

// ─── Analytics & admin ──────────────────────────────
router.get('/analytics/creator', analytics.creatorAnalytics);
router.get('/admin/stats', analytics.adminStats);
router.get('/admin/flagged', analytics.listFlaggedContent);

// ─── 10-Agent Autonomous Swarm Studio ──────────────
router.post('/studio/swarm/execute', authenticateToken, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body || {};
    if (!topic) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Topic is required' } });
    }
    const job = await MultiAgentOrchestrator.createJob(
      req.authUser!.id,
      String(topic),
      String(platform || 'YouTube Shorts / TikTok'),
      String(tone || 'Tech Cinematic & High Pacing')
    );

    // Execute background job
    MultiAgentOrchestrator.runJob(job.id).catch((err) => {
      console.error('Swarm job background error:', err);
    });

    res.json({ success: true, data: { job } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Failed to start swarm' } });
  }
});

router.get('/studio/swarm/jobs/:id', authenticateToken, async (req, res) => {
  const job = await MultiAgentOrchestrator.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Swarm job not found' } });
  }
  if (job.userId !== req.authUser!.id && req.authUser!.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied: You do not own this job' } });
  }
  res.json({ success: true, data: { job } });
});


// ─── ML Creator Recommendation ──────────────────────
router.post('/ml/recommend', async (req, res) => {
  try {
    const { title, brief, requiredSkills, maxHourlyRate, minRating, limit } = req.body || {};
    const dbCreators = await prisma.user.findMany({
      where: { role: 'CREATOR', profile: { isNot: null } },
      include: {
        profile: { include: { skills: { include: { skill: true } } } },
      },
      take: 100,
    });

    const candidates = dbCreators.map((u) => ({
      id: u.id,
      name: u.profile?.name || u.name || 'Creator',
      handle: u.profile?.username ? '@' + u.profile.username : '@' + (u.email || 'user').split('@')[0],
      role: u.profile?.headline || 'AI Creator',
      hourlyRate: u.profile?.basePrice || 75,
      rating: 4.9,
      reviewsCount: 24,
      completionRate: u.profile?.completionRate || 98,
      verified: u.profile?.verified || false,
      skills: (u.profile?.skills || []).map((s: any) => s.skill?.name).filter(Boolean),
      bio: u.profile?.about || '',
    }));

    const recommendations = MLRecommendationEngine.rankCreators(
      candidates,
      {
        title: String(title || 'Campaign'),
        brief: String(brief || ''),
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : ['AI'],
        maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
      },
      limit ? Number(limit) : 10
    );

    res.json({ success: true, data: { recommendations } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Recommendation failed' } });
  }
});

export default router;