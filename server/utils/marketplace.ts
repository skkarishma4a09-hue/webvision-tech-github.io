import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export const colorFromId = (id: string) => {
  const colors = ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#EF4444', '#A78BFA'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
};

export const initialsOf = (name: string | null | undefined) => {
  if (!name) return '?';
  return name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
};

export function notify(userId: string, title: string, body: string, type = 'SYSTEM') {
  return prisma.notification.create({ data: { userId, title, body, type } }).catch(() => null);
}

export function paginateQuery(q: any) {
  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(q.limit || '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export async function getUserOrThrow(req: Request, res: Response) {
  if (!req.authUser) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return null;
  }
  return req.authUser;
}