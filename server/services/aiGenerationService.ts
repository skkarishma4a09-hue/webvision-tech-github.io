// import removed – using process.env directly

export interface AiGenerationSettings {
  tone: string;
  length: string;
  language: string;
}

export class AiGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AiGenerationError';
  }
}

const TOOL_INSTRUCTIONS: Record<string, string> = {
  blog: 'Write a useful, well-structured blog article with a strong title, clear sections, and practical takeaways.',
  social: 'Write an engaging social media post with a strong opening and a natural call to action.',
  caption: 'Write several concise, platform-ready caption options with distinct hooks.',
  ad: 'Write conversion-focused ad copy with a clear benefit, a specific audience, and a direct call to action.',
  youtube: 'Write a spoken-video script with an attention-grabbing hook, clear transitions, and an engaging close.',
  seo: 'Create useful search-focused content with a descriptive title, relevant headings, and natural keyword use.',
  product: 'Write a compelling, accurate product description focused on customer benefits.',
  email: 'Write a clear email with a relevant subject line, a human opening, and one primary call to action.',
  story: 'Write an engaging narrative with a clear premise, vivid details, and a satisfying ending.',
  rewrite: 'Rewrite the supplied content while preserving its meaning and improving clarity and flow.',
  grammar: 'Correct grammar, spelling, and punctuation while preserving the author’s meaning and voice.',
  summary: 'Summarize the supplied content, retaining its most important facts and conclusions.',
  translate: 'Translate the supplied content into the requested language, preserving meaning and tone.',
  tone: 'Rewrite the supplied content to match the requested voice while preserving its meaning.',
  headline: 'Generate a set of specific, compelling headline options for the supplied topic.',
  hashtag: 'Suggest a focused set of relevant hashtags for the supplied topic and platform.',
  ideas: 'Generate distinct, actionable content ideas tailored to the supplied niche.',
  pro: 'Write polished professional content with clear reasoning and a confident, credible voice.',
  creative: 'Write original, vivid content that explores the supplied creative brief.',
  simplify: 'Rewrite the supplied content in plain language without losing important details.',
};

const ACTION_INSTRUCTIONS: Record<string, string> = {
  Improve: 'Improve clarity, structure, specificity, and usefulness.',
  Rewrite: 'Rewrite from scratch while preserving the original meaning.',
  Shorten: 'Make the content substantially shorter while preserving the key points.',
  Expand: 'Add useful detail and examples without introducing unsupported facts.',
  'Make Professional': 'Use a polished, professional voice.',
  'Make Friendly': 'Use a warm, approachable voice.',
  'Make Creative': 'Use a more imaginative, vivid voice.',
  Simplify: 'Use plain language and short, easy-to-follow sentences.',
};

const OUTPUT_TOKENS: Record<string, number> = {
  Short: 512,
  Medium: 1200,
  Long: 2400,
  Comprehensive: 4096,
};

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

export async function generateAiContent(
  toolId: string,
  input: string,
  settings: AiGenerationSettings,
  action?: string,
): Promise<string> {
  console.error('DEBUG: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
  if (!process.env.GEMINI_API_KEY) {
    throw new AiGenerationError(
      'AI Studio is not configured yet. Add GEMINI_API_KEY to the server environment and restart the backend.',
      'AI_PROVIDER_NOT_CONFIGURED',
      503,
    );
  }
  if (process.env.MOCK_AI_GENERATION === 'true') {
    return 'Mocked AI output';
  }

  const instruction = TOOL_INSTRUCTIONS[toolId];
  if (!instruction) {
    throw new AiGenerationError('The selected AI tool is not supported.', 'INVALID_AI_TOOL', 400);
  }

  const actionInstruction = action ? ACTION_INSTRUCTIONS[action] : undefined;
  if (action && !actionInstruction) {
    throw new AiGenerationError('The selected rewrite action is not supported.', 'INVALID_AI_ACTION', 400);
  }

  const prompt = [
    `Task: ${instruction}`,
    `Writing tone: ${settings.tone}.`,
    `Output length: ${settings.length}.`,
    `Output language: ${settings.language}.`,
    actionInstruction ? `Additional editing instruction: ${actionInstruction}` : '',
    'Use the brief as source material. Do not invent factual claims, statistics, or citations.',
    'Return only the requested content, without commentary about the generation process.',
    '',
    '<brief>',
    input,
    '</brief>',
  ].filter(Boolean).join('\n');

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL ?? 'gemini-2.5-flash')}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: OUTPUT_TOKENS[settings.length] ?? OUTPUT_TOKENS.Medium,
          },
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new AiGenerationError('The AI provider took too long to respond. Please try again.', 'AI_PROVIDER_TIMEOUT', 504);
    }
    throw new AiGenerationError('Could not reach the AI provider. Please try again shortly.', 'AI_PROVIDER_UNAVAILABLE', 502);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new AiGenerationError('The AI provider is busy. Please wait a moment and try again.', 'AI_PROVIDER_BUSY', 503);
    }
    if (response.status === 401 || response.status === 403) {
      throw new AiGenerationError('The AI provider rejected its server credentials. Check GEMINI_API_KEY.', 'AI_PROVIDER_CONFIGURATION', 503);
    }
    throw new AiGenerationError('The AI provider could not complete this request. Please try again.', 'AI_PROVIDER_ERROR', 502);
  }

  let result: GeminiResponse;
  try {
    result = await response.json() as GeminiResponse;
  } catch {
    throw new AiGenerationError('The AI provider returned an invalid response. Please try again.', 'AI_INVALID_RESPONSE', 502);
  }
  if (result.promptFeedback?.blockReason) {
    throw new AiGenerationError('The request was blocked by the AI provider’s safety filters. Revise the brief and try again.', 'AI_CONTENT_BLOCKED', 422);
  }

  const output = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!output) {
    throw new AiGenerationError('The AI provider returned no content. Please revise the brief and try again.', 'AI_EMPTY_RESPONSE', 502);
  }

  return output;
}
