import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { parseJson, colorFromId, initialsOf, paginateQuery } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';

async function creatorStats(user: any) {
  const [reviews, orders, followers, services] = await Promise.all([
    prisma.review.findMany({ where: { creatorId: user.id }, select: { rating: true, text: true, author: { select: { id: true, name: true, profile: { select: { profilePhoto: true } } } }, createdAt: true, verified: true } }),
    prisma.order.findMany({ where: { creatorId: user.id }, select: { amount: true, status: true, createdAt: true } }),
    prisma.creatorFollow.count({ where: { creatorId: user.id } }),
    prisma.service.findMany({ where: { creatorId: user.id, status: 'PUBLISHED' } }),
  ]);
  const p = user.profile;
  const totalEarnings = orders.filter((o) => o.status === 'COMPLETED').reduce((a, o) => a + (o.amount || 0), 0);
  const completed = orders.filter((o) => o.status === 'COMPLETED').length;
  const rating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const views = services.reduce((a, s) => a + (s.views || 0), 0);
  return {
    id: user.id,
    name: p?.name || user.name,
    username: p?.username ? '@' + p.username : '@' + (user.email || 'user').split('@')[0],
    initials: initialsOf(p?.name || user.name),
    color: colorFromId(user.id),
    verified: p?.verified || false,
    level: p?.level || (completed >= 100 ? 'Elite' : completed >= 50 ? 'Expert' : completed >= 10 ? 'Professional' : 'Starter'),
    rating: Math.round(rating * 100) / 100,
    reviews: reviews.length,
    reviewsList: reviews,
    jobs: completed,
    price: p?.basePrice || 0,
    responseTime: p?.responseTime || '~ 2 hrs',
    availability: p?.availability || 'Available',
    bio: p?.about || '',
    headline: p?.headline || '',
    location: p?.location || '',
    responseRate: 98,
    completionRate: p?.completionRate || 97,
    tags: [p?.verified ? 'Verified Creator' : null, rating >= 4.8 ? 'Top Creator' : null].filter(Boolean) as string[],
    joined: user.createdAt?.toISOString().slice(0, 10),
    country: p?.country || '',
    earnings: totalEarnings,
    views,
    followers,
    skills: (p?.skills || []).map((s: any) => s.skill?.name).filter(Boolean),
  };
}

export async function listCreators(req: Request, res: Response) {
  try {
    const q = req.query;
    const { page, limit, skip } = paginateQuery(q);

    const where: any = {
      role: 'CREATOR',
      profile: { isNot: null },
    };

    if (q.level) {
      where.profile = { ...where.profile, level: String(q.level) };
    }
    if (q.availability) {
      where.profile = { ...where.profile, availability: String(q.availability) };
    }
    if (q.query) {
      const term = String(q.query).trim();
      where.OR = [
        { name: { contains: term } },
        { profile: { name: { contains: term } } },
        { profile: { headline: { contains: term } } },
        { profile: { about: { contains: term } } },
        { profile: { skills: { some: { skill: { name: { contains: term } } } } } },
      ];
    }
    if (q.skill) {
      where.profile = {
        ...where.profile,
        skills: { some: { skill: { name: { contains: String(q.skill).trim() } } } },
      };
    }

    const [total, us] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          profile: { include: { skills: { include: { skill: true } } } },
          ordersAsSeller: { select: { amount: true, status: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: q.sort === 'new' ? 'desc' : 'asc' },
      }),
    ]);

    const creators = await Promise.all(us.map((u) => creatorStats(u)));
    if (q.sort === 'rating') creators.sort((a, b) => b.rating - a.rating);
    if (q.sort === 'price_low') creators.sort((a, b) => a.price - b.price);
    if (q.sort === 'reviews') creators.sort((a, b) => b.reviews - a.reviews);

    res.json({
      success: true,
      data: {
        creators,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message || 'Failed to load creators' } });
  }
}

export async function getCreator(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { profile: { include: { skills: { include: { skill: true } }, education: true, experience: true } }, ordersAsSeller: { select: { amount: true, status: true } } },
    });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Creator not found' } });
    const stats = await creatorStats(user);
    const services = await prisma.service.findMany({ where: { creatorId: user.id, status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { creator: { ...stats, education: user.profile?.education || [], experience: user.profile?.experience || [] }, services: services.map(serializeService), following: req.authUser ? (await prisma.creatorFollow.count({ where: { followerId: req.authUser.id, creatorId: user.id } })) > 0 : false } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export function serializeService(s: any) {
  return {
    ...s,
    tags: parseJson(s.tags, []),
    packages: parseJson(s.packages, {}),
    gallery: parseJson(s.gallery, []),
    faqs: parseJson(s.faqs, []),
  };
}

export async function applyAsCreator(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'CREATOR', profile: { update: { name: req.body?.name || undefined, headline: req.body?.headline || undefined, about: req.body?.bio || undefined, location: req.body?.location || undefined, country: req.body?.country || undefined, availability: req.body?.availability || undefined, responseTime: req.body?.responseTime || undefined, basePrice: req.body?.basePrice ? Number(req.body.basePrice) : undefined, username: req.body?.username || undefined } } },
      include: { profile: true },
    });
    res.json({ success: true, data: { user: updated } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { profile: { update: { name: b.name || undefined, headline: b.headline || undefined, about: b.bio || undefined, location: b.location || undefined, country: b.country || undefined, availability: b.availability || undefined, responseTime: b.responseTime || undefined, completionRate: b.completionRate ? Number(b.completionRate) : undefined, basePrice: b.basePrice != null ? Number(b.basePrice) : undefined, username: b.username || undefined } } },
      include: { profile: true },
    });
    res.json({ success: true, data: { user: updated } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}