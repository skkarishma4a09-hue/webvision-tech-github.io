import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { parseJson, paginateQuery } from '../../utils/marketplace';
import { getUserOrThrow, notify } from '../../utils/marketplace';
import { z } from 'zod';

const createOrderSchema = z.object({
  serviceId: z.string().min(1),
  packageName: z.enum(['basic', 'standard', 'premium']).default('standard'),
  addons: z.array(z.object({ label: z.string().min(1).max(100) })).max(3).default([]),
  requirements: z.string().max(5000).optional(),
});

const ORDER_ADDONS: Record<string, number> = {
  'Extra Fast Delivery (24h)': 25,
  'Source Files Included': 15,
  'Social Media Formatting': 20,
};
const TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['DELIVERED', 'CANCELLED', 'DISPUTED'],
  DELIVERED: ['REVIEW', 'ACTIVE', 'DISPUTED'],
  REVIEW: ['COMPLETED', 'DISPUTED'],
  CANCELLED: [],
  DISPUTED: ['ACTIVE', 'CANCELLED', 'COMPLETED'],
  COMPLETED: [],
};

export async function createOrder(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid order details' } });
    const b = parsed.data;
    const service = await prisma.service.findUnique({ where: { id: String(b.serviceId) } });
    if (!service || service.status !== 'PUBLISHED') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Service not found' } });
    if (service.creatorId === user.id) return res.status(400).json({ success: false, error: { code: 'INVALID_ORDER', message: 'You cannot order your own service' } });
    const packages = parseJson(service.packages, {} as any);
    const pkg = packages[b.packageName];
    if (!pkg || !Number.isFinite(Number(pkg.price)) || Number(pkg.price) < 0) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PACKAGE', message: 'The selected package is not available' } });
    }
    const labels = b.addons.map((addon) => addon.label);
    if (new Set(labels).size !== labels.length || labels.some((label) => !Object.prototype.hasOwnProperty.call(ORDER_ADDONS, label))) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ADDON', message: 'One or more selected add-ons are not available' } });
    }
    const addons = labels.map((label) => ({ label, price: ORDER_ADDONS[label] }));
    const amount = Number(pkg.price) + addons.reduce((total, addon) => total + addon.price, 0);
    const order = await prisma.order.create({
      data: {
        serviceId: service.id, buyerId: user.id, creatorId: service.creatorId,
        packageName: b.packageName || 'standard', amount, addons: JSON.stringify(addons),
        requirements: b.requirements?.trim() || null, deadline: null,
        milestones: JSON.stringify([]),
        timeline: JSON.stringify([{ status: 'PENDING', at: new Date().toISOString(), note: 'Order created' }]),
      },
    });
    await notify(service.creatorId, 'New order received 🎉', `${user.profile?.name || user.name} ordered ${service.title} (${pkg.name}).`, 'ORDERS');
    await notify(user.id, 'Order placed', `Your order for ${service.title} is pending.`, 'ORDERS');
    res.json({ success: true, data: { order } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function listOrders(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const { skip, limit } = paginateQuery(req.query);
    const role = req.query.role === 'seller' ? 'seller' : 'buyer';
    const where = role === 'seller' ? { creatorId: user.id } : { buyerId: user.id };
    const list = await prisma.order.findMany({ where, include: { service: true }, skip, take: limit, orderBy: { createdAt: 'desc' } });
    const total = await prisma.order.count({ where });
    res.json({ success: true, data: { orders: list.map((o) => serializeOrder(o)), pagination: { skip, limit, total } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export function serializeOrder(o: any) {
  const creatorId = o.creatorId;
  const buyerId = o.buyerId;
  const addons = parseJson(o.addons, []);
  const milestones = parseJson(o.milestones, []);
  let timeline = parseJson(o.timeline, []);
  if (!Array.isArray(timeline) || !timeline.length) timeline = [{ status: o.status, at: o.createdAt, note: 'Created' }];
  return { ...o, addons, milestones, timeline, creatorId, buyerId };
}

export async function getOrder(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const o = await prisma.order.findUnique({ where: { id: req.params.id }, include: { service: true, buyer: { include: { profile: true } }, creator: { include: { profile: true } } } });
    if (!o) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (o.buyerId !== user.id && o.creatorId !== user.id && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your order' } });
    res.json({ success: true, data: { order: serializeOrder(o), buyer: { id: o.buyer.id, name: o.buyer.profile?.name || o.buyer.name }, creator: { id: o.creator.id, name: o.creator.profile?.name || o.creator.name } } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const o = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!o) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    const allowed = TRANSITIONS[o.status] || [];
    const next = String(req.body?.status || '').toUpperCase();
    if (!allowed.includes(next)) return res.status(422).json({ success: false, error: { code: 'INVALID_TRANSITION', message: `Cannot move order from ${o.status} to ${next}` } });
    const isBuyer = o.buyerId === user.id;
    const isCreator = o.creatorId === user.id;
    if (!isBuyer && !isCreator && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } });
    if (next === 'COMPLETED' && !isBuyer && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the buyer can approve' } });
    if (next === 'ACTIVE' && !isCreator && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the creator can start the order' } });
    const timeline = parseJson(o.timeline, []);
    timeline.push({ status: next, at: new Date().toISOString(), note: req.body?.note || statusLabel(next) });
    let workspace = o.workspace ? null : null;
    const updated = await prisma.order.update({
      where: { id: o.id },
      data: { status: next, timeline: JSON.stringify(timeline), cancelReason: req.body?.cancelReason ?? o.cancelReason, disputeReason: req.body?.disputeReason ?? o.disputeReason, revisionNotes: req.body?.revisionNotes ?? o.revisionNotes, revisionsUsed: next === 'ACTIVE' && req.body?.revision ? o.revisionsUsed + 1 : o.revisionsUsed },
    });
    if (next === 'ACTIVE') {
      await prisma.workProject.upsert({
        where: { orderId: o.id },
        create: { orderId: o.id, clientId: o.buyerId, creatorId: o.creatorId, title: o.service?.title || 'Project', category: o.service?.category || null, budget: o.amount, milestones: JSON.stringify(parseJson(o.milestones, [])), activity: JSON.stringify([{ at: new Date().toISOString(), text: 'Project workspace created' }]) },
        update: {},
      });
    }
    await notify(o.buyerId, `Order ${statusLabel(next)}`, `Order #${o.id.slice(0, 8)} is now ${next.toLowerCase()}.`, 'ORDERS');
    await notify(o.creatorId, `Order ${statusLabel(next)}`, `Order #${o.id.slice(0, 8)} is now ${next.toLowerCase()}.`, 'ORDERS');
    res.json({ success: true, data: { order: serializeOrder({ ...updated, service: o.service }), workspace } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

function statusLabel(s: string) {
  return { PENDING: 'is pending', ACTIVE: 'has started', DELIVERED: 'was delivered', REVIEW: 'is in review', COMPLETED: 'was completed', CANCELLED: 'was cancelled', DISPUTED: 'is disputed' }[s] || s;
}

export async function requestRevision(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const o = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!o) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (o.buyerId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only buyer can request revisions' } });
    if (o.status !== 'DELIVERED') return res.status(422).json({ success: false, error: { code: 'INVALID_STATE', message: 'Revisions are only available after delivery' } });
    const timeline = parseJson(o.timeline, []);
    timeline.push({ status: 'REVISION_REQUESTED', at: new Date().toISOString(), note: `Revision requested: ${req.body?.note || 'Please adjust'}` });
    const updated = await prisma.order.update({ where: { id: o.id }, data: { status: 'ACTIVE', revisionsUsed: o.revisionsUsed + 1, revisionNotes: req.body?.note || null, timeline: JSON.stringify(timeline) } });
    await notify(o.creatorId, 'Revision requested', (user.profile?.name || user.name) + ' requested revisions.', 'ORDERS');
    res.json({ success: true, data: { order: serializeOrder({ ...updated }) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}

export async function openDispute(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const o = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!o) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    if (o.buyerId !== user.id && o.creatorId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } });
    const timeline = parseJson(o.timeline, []);
    timeline.push({ status: 'DISPUTED', at: new Date().toISOString(), note: `Dispute opened: ${req.body?.reason || ''}` });
    const updated = await prisma.order.update({ where: { id: o.id }, data: { status: 'DISPUTED', disputeReason: req.body?.reason || null, timeline: JSON.stringify(timeline) } });
    await notify((o.buyerId === user.id ? o.creatorId : o.buyerId), 'Dispute opened', 'A dispute was opened on an order.', 'ORDERS');
    res.json({ success: true, data: { order: serializeOrder({ ...updated }) } });
  } catch (e: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } });
  }
}