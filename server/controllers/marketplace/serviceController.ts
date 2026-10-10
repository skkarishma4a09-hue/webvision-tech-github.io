import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { parseJson, paginateQuery } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';
import { serializeService } from './creatorController';

async function enrich(list: any[]) {
  const out = [];
  for (const s of list) {
    const creator = await prisma.user.findUnique({ where: { id: s.creatorId }, include: { profile: true } });
    out.push({ ...serializeService(s), creator: { id: creator?.id, name: creator?.profile?.name || creator?.name, initials: (creator?.name || '?').split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(), username: creator?.profile?.username ? '@' + creator.profile.username : '@' + (creator?.email || 'u').split('@')[0], verified: creator?.profile?.verified || false, level: creator?.profile?.level || 'Starter', avatar: creator?.profile?.profilePhoto || '', availability: creator?.profile?.availability || 'Available', rating: s.rating, jobs: s.reviewCount } });
  }
  return out;
}

export async function listServices(req: Request, res: Response) {
  try {
    const q = req.query;
    const { skip, limit } = paginateQuery(q);
    const where: any = { status: 'PUBLISHED' };
    if (q.category) where.category = String(q.category);
    if (q.creatorId) where.creatorId = String(q.creatorId);
    if (q.query) {
      const t = String(q.query).toLowerCase();
      where.OR = [{ title: { contains: t } }, { description: { contains: t } }, { tags: { contains: t } }, { category: { contains: t } }];
    }
    const list = await prisma.service.findMany({ where, skip, take: limit, orderBy: { createdAt: q.sort === 'rating' ? 'desc' : 'desc' } });
    const total = await prisma.service.count({ where });
    let out = await enrich(list);
    if (q.sort === 'price_low') out.sort((a: any, b: any) => (a.packages?.basic?.price || 0) - (b.packages?.basic?.price || 0));
    if (q.sort === 'price_high') out.sort((a: any, b: any) => (b.packages?.basic?.price || 0) - (a.packages?.basic?.price || 0));
    if (q.sort === 'rating') out.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    res.json({ success: true, data: { services: out.slice(skip, skip + limit), pagination: { page: q.page || 1, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function getService(req: Request, res: Response) {
  try {
    const s = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!s) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
    await prisma.service.update({ where: { id: s.id }, data: { views: { increment: 1 } } });
    const creator = await prisma.user.findUnique({ where: { id: s.creatorId }, include: { profile: true } });
    const reviews = await prisma.review.findMany({
      where: { serviceId: s.id, status: 'APPROVED' },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const related = await prisma.service.findMany({ where: { category: s.category, id: { not: s.id }, status: 'PUBLISHED' }, take: 4 });
    res.json({ success: true, data: { service: { ...serializeService(s), creator: { id: creator?.id, name: creator?.profile?.name || creator?.name, username: creator?.profile?.username ? '@' + creator.profile.username : '', verified: creator?.profile?.verified || false, level: creator?.profile?.level || 'Starter', availability: creator?.profile?.availability || 'Available', rating: s.rating } }, reviews: reviews.map((r) => ({ ...r, authorName: r.author?.name || 'User', authorInitials: (r.author?.name || 'U').split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase() })), related: await enrich(related) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function createService(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const s = await prisma.service.create({
      data: {
        creatorId: user.id, category: b.category || 'Content', title: b.title || 'Untitled', description: b.description || '',
        tags: JSON.stringify(b.tags || []), packages: JSON.stringify(b.packages || { basic: { name: 'Basic', price: 20, delivery: '3 days', desc: 'Basic package', revisions: 1 }, standard: { name: 'Standard', price: 50, delivery: '5 days', desc: 'Standard package', revisions: 2 }, premium: { name: 'Premium', price: 100, delivery: '7 days', desc: 'Premium package', revisions: 3 } }),
        gallery: JSON.stringify(b.gallery || []), faqs: JSON.stringify(b.faqs || []), deliveryTime: b.deliveryTime || '3 days', revisions: b.revisions || 3, featured: b.featured || false, status: b.status || 'PUBLISHED',
      },
    });
    res.json({ success: true, data: { service: serializeService(s) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const s = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!s || s.creatorId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your service' } });
    const b = req.body || {};
    const upd = await prisma.service.update({ where: { id: s.id }, data: { category: b.category ?? s.category, title: b.title ?? s.title, description: b.description ?? s.description, tags: b.tags ? JSON.stringify(b.tags) : undefined, packages: b.packages ? JSON.stringify(b.packages) : undefined, deliveryTime: b.deliveryTime ?? undefined, revisions: b.revisions ?? undefined, status: b.status ?? undefined } });
    res.json({ success: true, data: { service: serializeService(upd) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const s = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!s || s.creatorId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your service' } });
    await prisma.service.delete({ where: { id: s.id } });
    res.json({ success: true, data: { message: 'Service deleted' } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function myServices(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const list = await prisma.service.findMany({ where: { creatorId: user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { services: await enrich(list) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}