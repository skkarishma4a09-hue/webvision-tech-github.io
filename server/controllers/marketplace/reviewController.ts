import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { parseJson, paginateQuery, notify } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';

async function updateServiceRating(serviceId: string | null) {
  if (!serviceId) return;
  const agg = await prisma.review.aggregate({ where: { serviceId, status: 'APPROVED' }, _avg: { rating: true }, _count: true });
  await prisma.service.update({ where: { id: serviceId }, data: { rating: Math.round((agg._avg.rating || 0) * 100) / 100, reviewCount: agg._count } }).catch(() => null);
}

export async function listReviews(req: Request, res: Response) {
  try {
    const q = req.query;
    const { skip, limit } = paginateQuery(q);
    const where: any = { status: 'APPROVED' };
    if (q.creatorId) where.creatorId = String(q.creatorId);
    if (q.serviceId) where.serviceId = String(q.serviceId);
    const list = await prisma.review.findMany({ where, include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: q.sort === 'rating' ? 'desc' : 'desc' }, skip, take: limit });
    const total = await prisma.review.count({ where });
    const dist = await prisma.review.groupBy({ by: ['rating'], where: { ...where, creatorId: q.creatorId ? String(q.creatorId) : undefined }, _count: true });
    res.json({ success: true, data: { reviews: list.map((r) => ({ ...r, authorName: r.author?.name || 'User', authorInitials: (r.author?.name || 'U').split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(), helpful: parseJson(r.helpfulVotes, []) })), distribution: dist, pagination: { skip, limit, total } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const rating = Math.min(5, Math.max(1, Number(b.rating) || 5));
    let verified = false;
    if (b.orderId) {
      const o = await prisma.order.findUnique({ where: { id: String(b.orderId) } });
      verified = !!(o && o.buyerId === user.id && o.status === 'COMPLETED');
    }
    const review = await prisma.review.create({ data: { creatorId: String(b.creatorId), serviceId: b.serviceId ? String(b.serviceId) : null, orderId: b.orderId ? String(b.orderId) : null, authorId: user.id, rating, text: String(b.text || '').slice(0, 2000), verified } });
    await updateServiceRating(b.serviceId ? String(b.serviceId) : null);
    await notify(String(b.creatorId), 'New review ⭐', (user.profile?.name || user.name) + ` rated you ${rating} stars.`, 'REVIEWS');
    res.json({ success: true, data: { review } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function updateReview(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const r = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    if (r.authorId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your review' } });
    const b = req.body || {};
    const upd = await prisma.review.update({ where: { id: r.id }, data: { rating: b.rating ? Math.min(5, Math.max(1, Number(b.rating))) : r.rating, text: b.text != null ? String(b.text).slice(0, 2000) : r.text } });
    await updateServiceRating(r.serviceId);
    res.json({ success: true, data: { review: upd } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const r = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    if (r.authorId !== user.id && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your review' } });
    await prisma.review.delete({ where: { id: r.id } });
    await updateServiceRating(r.serviceId);
    res.json({ success: true, data: { message: 'Review deleted' } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function helpfulVote(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const r = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    const votes = parseJson<string[]>(r.helpfulVotes, []);
    const idx = votes.indexOf(user.id);
    if (idx >= 0) votes.splice(idx, 1); else votes.push(user.id);
    const upd = await prisma.review.update({ where: { id: r.id }, data: { helpfulVotes: JSON.stringify(votes) } });
    res.json({ success: true, data: { helpful: votes } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function reportReview(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const upd = await prisma.review.update({ where: { id: req.params.id }, data: { reports: { increment: 1 }, status: 'FLAGGED' } });
    await notify('admin', 'Review reported', `Review #${req.params.id} was reported.`, 'REVIEWS').catch(() => null);
    res.json({ success: true, data: { review: upd } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}