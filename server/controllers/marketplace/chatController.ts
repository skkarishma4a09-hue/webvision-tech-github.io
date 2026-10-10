import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { notify } from '../../utils/marketplace';
import { getUserOrThrow } from '../../utils/marketplace';

export async function listConversations(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const convs = await prisma.conversation.findMany({ where: { members: { some: { userId: user.id } } }, include: { members: { include: { user: { include: { profile: true } } } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } });
    const out = [];
    for (const c of convs) {
      const other = c.members.find((m: any) => m.userId !== user.id)?.user;
      const total = await prisma.message.count({ where: { conversationId: c.id, senderId: { not: user.id } } });
      const read = await prisma.message.count({ where: { conversationId: c.id, senderId: { not: user.id }, readAt: { not: null } } });
      out.push({ id: c.id, user: { id: other?.id, name: other?.profile?.name || other?.name || 'User', initials: (other?.name || 'U').split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(), online: false }, lastMsg: c.messages[0]?.text || '', unread: Math.max(0, total - read) });
    }
    res.json({ success: true, data: { conversations: out } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id }, include: { members: true } });
    if (!conv || !conv.members.some((m: any) => m.userId === user.id)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not in conversation' } });
    const messages = await prisma.message.findMany({ where: { conversationId: conv.id }, orderBy: { createdAt: 'asc' } });
    await prisma.message.updateMany({ where: { conversationId: conv.id, senderId: { not: user.id } }, data: { readAt: new Date() } });
    res.json({ success: true, data: { messages: messages.map((m: any) => ({ id: m.id, from: m.senderId === user.id ? 'me' : 'them', text: m.text, time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: !!m.readAt })) } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function startConversation(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const otherId = String(req.body?.userId || req.params.userId || '');
    if (!otherId || otherId === user.id) return res.status(422).json({ success: false, error: { code: 'INVALID', message: 'Invalid recipient' } });
    let conv = await prisma.conversation.findFirst({ where: { AND: [{ members: { some: { userId: user.id } } }, { members: { some: { userId: otherId } } }] }, include: { members: true } });
    if (!conv) {
      conv = await prisma.conversation.create({ data: { members: { create: [{ userId: user.id }, { userId: otherId }] } }, include: { members: true } });
    }
    res.json({ success: true, data: { conversation: conv } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id }, include: { members: true } });
    if (!conv || !conv.members.some((m: any) => m.userId === user.id)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not in conversation' } });
    const text = String(req.body?.text || '').slice(0, 4000);
    if (!text.trim()) return res.status(422).json({ success: false, error: { code: 'EMPTY', message: 'Empty message' } });
    const msg = await prisma.message.create({ data: { conversationId: conv.id, senderId: user.id, text: text.trim() } });
    for (const m of conv.members) if (m.userId !== user.id) await notify(m.userId, 'New message 💬', (user.profile?.name || user.name) + ': ' + text.slice(0, 120), 'MESSAGES');
    res.json({ success: true, data: { message: { id: msg.id, from: 'me', text: msg.text, time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false } } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function markRead(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id }, include: { members: true } });
    if (!conv || !conv.members.some((m: any) => m.userId === user.id)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not in conversation' } });
    await prisma.message.updateMany({ where: { conversationId: conv.id, senderId: { not: user.id } }, data: { readAt: new Date() } });
    res.json({ success: true, data: { message: 'Marked read' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const msg = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!msg || msg.senderId !== user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your message' } });
    await prisma.message.delete({ where: { id: msg.id } });
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (e: any) { res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: e?.message } }); }
}