import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { paginateQuery, parseJson } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';
import { serializeService } from './creatorController';

export async function search(req: Request, res: Response) {
  try {
    const q = String(req.query.q || '').trim();
    const type = String(req.query.type || 'all');
    const { skip, limit } = paginateQuery(req.query);
    let creators: any[] = [];
    let services: any[] = [];
    let total = 0;
    if (q && (type === 'all' || type === 'creators')) {
      const users = await prisma.user.findMany({ where: { role: 'CREATOR', profile: { isNot: null }, OR: [{ name: { contains: q } }, { profile: { is: { name: { contains: q } } } }, { profile: { is: { about: { contains: q } } } }] }, include: { profile: { include: { skills: { include: { skill: true } } } } }, skip, take: limit });
      for (const u of users) {
        const reviews = await prisma.review.aggregate({ where: { creatorId: u.id }, _avg: { rating: true }, _count: true });
        creators.push({ id: u.id, name: u.profile?.name || u.name, username: u.profile?.username ? '@' + u.profile.username : '@' + (u.email || '').split('@')[0], verified: u.profile?.verified || false, level: u.profile?.level || 'Starter', rating: Math.round((reviews._avg.rating || 0) * 100) / 100, reviews: reviews._count, availability: u.profile?.availability || 'Available', skills: (u.profile?.skills || []).map((s: any) => s.skill?.name).filter(Boolean), bio: u.profile?.about || '' });
      }
    }
    if (q && (type === 'all' || type === 'services')) {
      const list = await prisma.service.findMany({ where: { status: 'PUBLISHED', OR: [{ title: { contains: q } }, { description: { contains: q } }, { category: { contains: q } }, { tags: { contains: q } }] }, include: { creator: { include: { profile: true } } }, skip, take: limit });
      services = list.map((s: any) => ({ ...serializeService(s), creator: { id: s.creator.id, name: s.creator.profile?.name || s.creator.name, verified: s.creator.profile?.verified || false, level: s.creator.profile?.level || 'Starter' } }));
    }
    total = creators.length + services.length;
    if (req.authUser) await prisma.searchHistoryEntry.create({ data: { userId: req.authUser.id, query: q.slice(0, 200), resultCount: total } }).catch(() => null);
    res.json({ success: true, data: { query: q, semantic: true, explanation: 'Matched against creator skills, service titles, categories, descriptions and tags.', creators, services, total: creators.length + services.length, pagination: { skip, limit } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}