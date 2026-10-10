import { prisma } from '../config/prisma';

export async function logAuditEvent({
  actorId,
  action,
  resource,
  result = 'SUCCESS',
  metadata,
  ipAddress,
  userAgent,
}: {
  actorId?: string | null;
  action: string;
  resource: string;
  result?: 'SUCCESS' | 'FAILURE';
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        resource,
        result,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]: Failed to record audit log', err);
  }
}
