import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { getUserOrThrow } from '../../utils/marketplace';

export async function listNotifications(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const list = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: { notifications: list.map((n) => ({ id: n.id, type: n.type, title: n.title, text: n.body, time: timeAgo(n.createdAt), unread: !n.read, createdAt: n.createdAt })) } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function unreadCount(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const c = await prisma.notification.count({ where: { userId: user.id, read: false } });
    res.json({ success: true, data: { count: c } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function markOneRead(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: user.id }, data: { read: true } });
    res.json({ success: true, data: { message: 'Updated' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    res.json({ success: true, data: { message: 'All marked read' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function deleteNotif(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    await prisma.notification.deleteMany({ where: { id: req.params.id, userId: user.id } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function getPrefs(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const p = await prisma.notificationPreference.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    res.json({ success: true, data: { prefs: p } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function updatePrefs(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const p = await prisma.notificationPreference.upsert({ where: { userId: user.id }, update: { email: b.email ?? true, inApp: b.inApp ?? true, messages: b.messages ?? true, orders: b.orders ?? true, reviews: b.reviews ?? true, ai: b.ai ?? true, promotions: b.promotions ?? false }, create: { userId: user.id, email: b.email ?? true, inApp: b.inApp ?? true, messages: b.messages ?? true, orders: b.orders ?? true, reviews: b.reviews ?? true, ai: b.ai ?? true, promotions: b.promotions ?? false } });
    res.json({ success: true, data: { prefs: p } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}