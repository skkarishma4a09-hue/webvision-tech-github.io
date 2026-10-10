import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { getUserOrThrow, parseJson } from '../../utils/marketplace';

export async function creatorAnalytics(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const days = Math.min(365, Math.max(7, Number(req.query.days || 30)));
    const since = new Date(Date.now() - days * 86400000);
    const [orders, services, reviews, follows, ai, n] = await Promise.all([
      prisma.order.findMany({ where: { creatorId: user.id, createdAt: { gte: since } }, select: { status: true, amount: true, createdAt: true } }),
      prisma.service.findMany({ where: { creatorId: user.id }, select: { views: true, reviewCount: true, title: true, orders: { select: { status: true, amount: true, createdAt: true } } } }),
      prisma.review.aggregate({ where: { creatorId: user.id, createdAt: { gte: since } }, _avg: { rating: true }, _count: true }),
      prisma.creatorFollow.count({ where: { creatorId: user.id, createdAt: { gte: since } } }),
      prisma.aiGeneration.count({ where: { userId: user.id, createdAt: { gte: since } } }),
      prisma.order.count({ where: { creatorId: user.id, createdAt: { gte: since } } }),
    ]);
    const earnings = orders.filter((o) => o.status === 'COMPLETED').reduce((a, o) => a + o.amount, 0);
    const views = services.reduce((a, s) => a + (s.views || 0), 0);
    const completed = orders.filter((o) => o.status === 'COMPLETED').length;
    const monthly: Record<string, number> = {};
    for (const o of orders) { const k = new Date(o.createdAt).toISOString().slice(0, 7); monthly[k] = (monthly[k] || 0) + o.amount; }
    res.json({ success: true, data: { kpis: { revenue: earnings, orders: n, views, avgRating: Math.round((reviews._avg.rating || 0) * 10) / 10, reviews: reviews._count, followersGained: follows, aiUsage: ai, conversion: n ? Math.round((completed / n) * 100) : 0, completion: n ? Math.round(((n - orders.filter((o) => o.status === 'CANCELLED').length) / n) * 100) : 0 }, monthly, topServices: services.sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((s: any) => ({ ...s, orders: undefined })), recentOrders: orders.slice(-8).reverse() } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function marketplaceStats(req: Request, res: Response) {
  try {
    const [creators, services, projects, reviews, users, orders] = await Promise.all([
      prisma.user.count({ where: { role: 'CREATOR' } }),
      prisma.service.count({ where: { status: 'PUBLISHED' } }),
      prisma.workProject.count(),
      prisma.review.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
    ]);
    res.json({ success: true, data: { stats: { creators, services, projects, countries: 80, satisfaction: 98, avgDelivery: 3, members: users, orders } } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function adminStats(req: Request, res: Response) {
  try {
    if (req.authUser?.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } });
    const [users, services, orders, reviews, disputes, flagged] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.order.count({ where: { status: 'DISPUTED' } }),
      prisma.review.count({ where: { status: 'FLAGGED' } }),
    ]);
    res.json({ success: true, data: { stats: { users, services, orders, reviews, disputes, flaggedReviews: flagged } } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function listFlaggedContent(req: Request, res: Response) {
  try {
    if (req.authUser?.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } });
    const flagged = await prisma.review.findMany({ where: { status: 'FLAGGED' }, include: { author: true }, orderBy: { updatedAt: 'desc' }, take: 50 });
    const admin = await prisma.user.findUnique({ where: { email: 'admin@synapse.io' }, include: { profile: true } });
    res.json({ success: true, data: { flagged } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}