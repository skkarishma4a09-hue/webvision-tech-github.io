import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { parseJson, paginateQuery, notify } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';

function ser(p: any) {
  return { ...p, milestones: parseJson(p.milestones, []), checklist: parseJson(p.checklist, []), deliverables: parseJson(p.deliverables, []), comments: parseJson(p.comments, []), activity: parseJson(p.activity, []) };
}

export async function listProjects(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const { skip, limit } = paginateQuery(req.query);
    const asCreator = req.query.role === 'creator';
    const where = asCreator ? { creatorId: user.id } : { clientId: user.id };
    const list = await prisma.workProject.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } });
    const total = await prisma.workProject.count({ where });
    res.json({ success: true, data: { projects: list.map(ser), pagination: { skip, limit, total } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const p = await prisma.workProject.findUnique({ where: { id: req.params.id }, include: { creator: { include: { profile: true } }, client: { include: { profile: true } } } });
    if (!p) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    if (p.clientId !== user.id && p.creatorId !== user.id && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your project' } });
    res.json({ success: true, data: { project: { ...ser(p), creatorName: p.creator.profile?.name || p.creator.name, clientName: p.client.profile?.name || p.client.name } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const b = req.body || {};
    const p = await prisma.workProject.create({ data: { clientId: user.id, creatorId: String(b.creatorId || ''), title: b.title || 'New project', description: b.description || null, category: b.category || null, budget: b.budget ? Number(b.budget) : null, deadline: b.deadline ? new Date(b.deadline) : null, milestones: JSON.stringify(b.milestones || []), checklist: JSON.stringify(b.checklist || []), activity: JSON.stringify([{ at: new Date().toISOString(), text: 'Project created' }]) } });
    if (b.creatorId) await notify(String(b.creatorId), 'New project invitation', (user.profile?.name || user.name) + ' invited you to a project.', 'PROJECTS');
    res.json({ success: true, data: { project: ser(p) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const p = await prisma.workProject.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    if (p.clientId !== user.id && p.creatorId !== user.id && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your project' } });
    const b = req.body || {};
    const activity = parseJson(p.activity, []);
    if (b.comment) activity.push({ at: new Date().toISOString(), text: (user.profile?.name || user.name) + ': ' + b.comment });
    if (b.activityNote) activity.push({ at: new Date().toISOString(), text: b.activityNote });
    const upd = await prisma.workProject.update({
      where: { id: p.id },
      data: {
        title: b.title ?? p.title, description: b.description ?? p.description, status: b.status ?? p.status, progress: b.progress != null ? Number(b.progress) : p.progress, budget: b.budget != null ? Number(b.budget) : p.budget, spent: b.spent != null ? Number(b.spent) : p.spent, deadline: b.deadline ? new Date(b.deadline) : p.deadline,
        milestones: b.milestones ? JSON.stringify(b.milestones) : undefined, checklist: b.checklist ? JSON.stringify(b.checklist) : undefined, deliverables: b.deliverables ? JSON.stringify(b.deliverables) : undefined,
        comments: b.comments ? JSON.stringify(b.comments) : undefined, activity: JSON.stringify(activity),
      },
    });
    if (b.status && p.clientId !== p.creatorId) {
      await notify(b.status === 'COMPLETED' ? p.clientId : p.creatorId, 'Project updated', `Project "${upd.title}" is now ${b.status}.`, 'PROJECTS');
    }
    res.json({ success: true, data: { project: ser(upd) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}