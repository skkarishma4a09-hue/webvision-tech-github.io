import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { parseJson, paginateQuery, notify } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';

export async function toggleFavoriteService(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const id = String(req.params.id);
    const existing = await prisma.favoriteService.findUnique({ where: { userId_serviceId: { userId: user.id, serviceId: id } } });
    if (existing) await prisma.favoriteService.delete({ where: { id: existing.id } });
    else await prisma.favoriteService.create({ data: { userId: user.id, serviceId: id } });
    res.json({ success: true, data: { favorited: !existing } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function toggleFavoriteCreator(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const id = String(req.params.id);
    const existing = await prisma.creatorFavorite.findUnique({ where: { userId_creatorId: { userId: user.id, creatorId: id } } });
    if (existing) await prisma.creatorFavorite.delete({ where: { id: existing.id } });
    else await prisma.creatorFavorite.create({ data: { userId: user.id, creatorId: id } });
    res.json({ success: true, data: { favorited: !existing } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function toggleFollow(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const id = String(req.params.id);
    if (id === user.id) return res.status(422).json({ success: false, error: { code: 'INVALID', message: 'Cannot follow yourself' } });
    const existing = await prisma.creatorFollow.findUnique({ where: { followerId_creatorId: { followerId: user.id, creatorId: id } } });
    if (existing) { await prisma.creatorFollow.delete({ where: { id: existing.id } }); await notify(id, 'Unfollowed', (user.profile?.name || user.name) + ' stopped following you.', 'FOLLOWS'); }
    else { await prisma.creatorFollow.create({ data: { followerId: user.id, creatorId: id } }); await notify(id, 'New follower 👋', (user.profile?.name || user.name) + ' started following you.', 'FOLLOWS'); }
    res.json({ success: true, data: { following: !existing } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function listMyFavorites(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const favServices = await prisma.favoriteService.findMany({ where: { userId: user.id }, include: { service: true }, orderBy: { createdAt: 'desc' } });
    const favCreators = await prisma.creatorFavorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    const creators = [];
    for (const f of favCreators) {
      const c = await prisma.user.findUnique({ where: { id: f.creatorId }, include: { profile: true } });
      if (c) creators.push({ id: c.id, name: c.profile?.name || c.name, username: c.profile?.username ? '@' + c.profile.username : '', verified: c.profile?.verified || false, level: c.profile?.level || 'Starter', availability: c.profile?.availability || 'Available' });
    }
    res.json({ success: true, data: { services: favServices.map((f) => ({ ...parseJson(f.service?.packages, {}), id: f.serviceId, title: f.service?.title, category: f.service?.category, rating: f.service?.rating, favoritedAt: f.createdAt })), creators } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function listLibrary(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const list = await prisma.libraryItem.findMany({ where: { ownerId: user.id }, include: { service: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { items: list.map((i) => ({ id: i.id, serviceId: i.serviceId, title: i.title, kind: i.kind, downloaded: i.downloaded, createdAt: i.createdAt, price: i.service ? parseJson(i.service.packages, {} as any).standard?.price || parseJson(i.service.packages, {} as any).basic?.price || 0 : 0, serviceTitle: i.service?.title })) } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function addToLibrary(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const item = await prisma.libraryItem.create({ data: { ownerId: user.id, serviceId: b.serviceId ? String(b.serviceId) : null, title: String(b.title || 'Untitled item').slice(0, 300), kind: String(b.kind || 'SAVED') } });
    res.json({ success: true, data: { item } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function markDownloaded(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const item = await prisma.libraryItem.update({ where: { id: req.params.id }, data: { downloaded: true } });
    res.json({ success: true, data: { item } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function removeFromLibrary(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const item = await prisma.libraryItem.findUnique({ where: { id: req.params.id } });
    if (!item || item.ownerId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your item' } });
    await prisma.libraryItem.delete({ where: { id: item.id } });
    res.json({ success: true, data: { message: 'Removed' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function saveSearch(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const s = await prisma.savedSearch.create({ data: { userId: user.id, name: String(b.name || 'Saved search').slice(0, 100), query: b.query ? String(b.query) : null, filters: JSON.stringify(b.filters || {}) } });
    res.json({ success: true, data: { search: s } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function listSearches(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const list = await prisma.savedSearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { searches: list.map((s) => ({ ...s, filters: parseJson(s.filters, {}) })) } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function deleteSearch(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    await prisma.savedSearch.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function recordSearchHistory(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    await prisma.searchHistoryEntry.create({ data: { userId: user.id, query: String(req.body?.query || '').slice(0, 200), resultCount: req.body?.resultCount ? Number(req.body.resultCount) : null } });
    res.json({ success: true, data: { message: 'Recorded' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function clearSearchHistory(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    await prisma.searchHistoryEntry.deleteMany({ where: { userId: user.id } });
    res.json({ success: true, data: { message: 'Cleared' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}
export async function listSearchHistory(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const list = await prisma.searchHistoryEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ success: true, data: { history: list.map(function (s: any) { return { id: s.id, query: s.query, resultCount: s.resultCount, at: s.createdAt }; }) } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}