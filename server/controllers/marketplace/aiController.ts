import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { getUserOrThrow, parseJson } from '../../utils/marketplace';
import { sendError } from '../../utils/apiResponse';
import { AiGenerationError, generateAiContent } from '../../services/aiGenerationService';

const generateSchema = z.object({
  toolId: z.enum([
    'blog', 'social', 'caption', 'ad', 'youtube', 'seo', 'product', 'email', 'story',
    'rewrite', 'grammar', 'summary', 'translate', 'tone', 'headline', 'hashtag',
    'ideas', 'pro', 'creative', 'simplify',
  ]),
  input: z.string().trim().min(1).max(4000),
  action: z.enum([
    'Improve', 'Rewrite', 'Shorten', 'Expand', 'Make Professional', 'Make Friendly',
    'Make Creative', 'Simplify',
  ]).optional(),
  settings: z.object({
    tone: z.enum(['Professional', 'Friendly', 'Casual', 'Formal', 'Creative', 'Persuasive', 'Empathetic']).default('Professional'),
    length: z.enum(['Short', 'Medium', 'Long', 'Comprehensive']).default('Medium'),
    language: z.enum(['English', 'Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Hindi', 'Portuguese', 'Arabic']).default('English'),
  }).default({}),
});

export async function generate(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const parsed = generateSchema.safeParse(req.body);
    console.error('Controller diagnostics – GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
    if (!parsed.success) {
      return sendError(res, 'VALIDATION_ERROR', 'Check the tool, brief, and generation settings.', 400, parsed.error.issues);
    }

    const { toolId, input, settings, action } = parsed.data;
    const output = await generateAiContent(toolId, input, settings, action);
    const generation = await prisma.aiGeneration.create({
      data: {
        userId: user.id,
        toolId,
        input,
        output,
        settings: JSON.stringify({ ...settings, ...(action ? { action } : {}) }),
      },
    });
    res.json({ success: true, data: { id: generation.id, toolId, input, output, createdAt: generation.createdAt } });
  } catch (error) {
    if (error instanceof AiGenerationError) {
      return sendError(res, error.code, error.message, error.statusCode);
    }
    console.error('AI generation failed', error);
    return sendError(res, 'SERVER_ERROR', 'The generation could not be saved. Please try again.', 500);
  }
}

export async function history(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const list = await prisma.aiGeneration.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 });
    res.json({ success: true, data: { history: list.map((generation) => ({
      id: generation.id,
      toolId: generation.toolId,
      input: generation.input,
      output: generation.output,
      createdAt: generation.createdAt,
      settings: parseJson(generation.settings, {}),
    })) } });
  } catch (error) {
    console.error('AI history lookup failed', error);
    return sendError(res, 'SERVER_ERROR', 'AI history could not be loaded.', 500);
  }
}

export async function deleteGeneration(req: Request, res: Response) {
  try {
    const user = await getUserOrThrow(req, res);
    if (!user) return;
    const result = await prisma.aiGeneration.deleteMany({ where: { id: req.params.id, userId: user.id } });
    if (!result.count) return sendError(res, 'NOT_FOUND', 'Generation was not found.', 404);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (error) {
    console.error('AI generation delete failed', error);
    return sendError(res, 'SERVER_ERROR', 'AI generation could not be deleted.', 500);
  }
}