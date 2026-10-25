/**
 * Model capabilities and limits dictionary for Zen free models and OpenAI-compatible models.
 *
 * OpenCode 2.x and OpenChamber require limit (context, output) and capabilities
 * (tools, input/output modalities) so that context compaction, tool execution,
 * and reasoning sliders work properly.
 */

export type ModelLimit = {
  context: number;
  output: number;
};

export type ModelCapabilities = {
  tools: boolean;
  input: string[];
  output: string[];
};

export type ModelVariant = {
  id: string;
  settings: Record<string, string | number | boolean | null>;
};

export type ModelMetadata = {
  limit: ModelLimit;
  capabilities: ModelCapabilities;
  variants?: ModelVariant[];
};

export const REASONING_VARIANTS: ModelVariant[] = [
  { id: 'low', settings: { reasoningEffort: 'low' } },
  { id: 'medium', settings: { reasoningEffort: 'medium' } },
  { id: 'high', settings: { reasoningEffort: 'high' } },
];

export const KNOWN_MODELS: Record<string, Partial<ModelMetadata>> = {
  'deepseek-chat-free': {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
  },
  'deepseek-v3-free': {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
  },
  'deepseek-ai/deepseek-chat-free': {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
  },
  'deepseek-reasoner-free': {
    limit: { context: 131072, output: 16384 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'deepseek-r1-free': {
    limit: { context: 131072, output: 16384 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'deepseek-ai/deepseek-r1-free': {
    limit: { context: 131072, output: 16384 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'deepseek-v4.1-flash-free': {
    limit: { context: 1000000, output: 384000 },
    capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'glm-5.3-flash-free': {
    limit: { context: 1000000, output: 128000 },
    capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'mimo-v2.6-flash-free': {
    limit: { context: 1048576, output: 131072 },
    capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'muse-spark-1.3-contributor-free': {
    limit: { context: 1048576, output: 131072 },
    capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'union-alpha': {
    limit: { context: 262144, output: 131072 },
    capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
  },
  'nemotron-3.5-super-vl-free': {
    limit: { context: 1000000, output: 131072 },
    capabilities: { tools: true, input: ['text', 'image'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'nemotron-3.5-lightning-free': {
    limit: { context: 1000000, output: 16384 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'jev-1.13-free': {
    limit: { context: 131072, output: 8192 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
  },
  'big-pickle': {
    limit: { context: 200000, output: 32000 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
  'big-pickle-free': {
    limit: { context: 200000, output: 32000 },
    capabilities: { tools: true, input: ['text'], output: ['text'] },
    variants: REASONING_VARIANTS,
  },
};

type ModelRule = {
  pattern: RegExp;
  context: number;
  output: number;
  vision?: boolean;
  reasoning?: boolean;
  tools?: boolean;
};

/**
 * Ordered rules: specific models first, vendor patterns next, generic catch-alls last.
 */
const MODEL_RULES: ModelRule[] = [
  // GLM 5.3 family: 1M context, 128k output, multimodal vision, reasoning
  { pattern: /glm[-_]?5\.3/i, context: 1000000, output: 128000, vision: true, reasoning: true, tools: true },
  // GLM 5.2 family: 1M context, 128k output, reasoning
  { pattern: /glm[-_]?5\.2/i, context: 1000000, output: 128000, vision: false, reasoning: true, tools: true },
  // GLM 5 / 5.1: 200k context, 128k output, reasoning
  { pattern: /glm[-_]?5/i, context: 200000, output: 128000, vision: false, reasoning: true, tools: true },
  // GLM 4 vision variants
  { pattern: /glm[-_]?4.*v/i, context: 128000, output: 4096, vision: true, reasoning: true, tools: true },
  // GLM 4.7
  { pattern: /glm[-_]?4\.7/i, context: 200000, output: 48000, vision: false, reasoning: true, tools: true },
  // Generic GLM: 128k context, 4096 output
  { pattern: /glm/i, context: 128000, output: 4096, vision: false, reasoning: false, tools: true },

  // DeepSeek V4.1 family: 1M context, 384k output, multimodal vision, reasoning
  { pattern: /deepseek[-_]?v4[._]1/i, context: 1000000, output: 384000, vision: true, reasoning: true, tools: true },
  // DeepSeek V4 / V4 Pro / V4 Flash: 1M context, 384k output, reasoning
  { pattern: /deepseek[-_]?v4/i, context: 1000000, output: 384000, vision: false, reasoning: true, tools: true },
  // DeepSeek R1 / Reasoner: 128k context, 16384 output, reasoning
  { pattern: /deepseek[-_]?(?:r1|reasoner)/i, context: 131072, output: 16384, vision: false, reasoning: true, tools: true },
  // DeepSeek V3 / Chat: 128k context, 8192 output
  { pattern: /deepseek/i, context: 131072, output: 8192, vision: false, reasoning: false, tools: true },

  // Xiaomi MiMo V2.6 / V2.5: 1.05M context, 131k output, vision, reasoning
  { pattern: /mimo[-_]?v2\.[56]/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },
  // Xiaomi MiMo Omni: 262k context, 131k output, vision, reasoning
  { pattern: /mimo[-_]?omni/i, context: 262144, output: 131072, vision: true, reasoning: true, tools: true },
  // Generic MiMo: 262k context, 131k output, vision, reasoning
  { pattern: /mimo/i, context: 262144, output: 131072, vision: true, reasoning: true, tools: true },

  // OpenCode Free Muse Spark: 1.05M context, 131k output, vision, reasoning
  { pattern: /muse[-_]?spark/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },

  // Space Bunny: 1.05M context, 524k output, vision, reasoning
  { pattern: /space[-_]?bunny/i, context: 1048576, output: 524288, vision: true, reasoning: true, tools: true },

  // Big Pickle: 200k context, 32k output, reasoning
  { pattern: /big[-_]?pickle/i, context: 200000, output: 32000, vision: false, reasoning: true, tools: true },

  // Longcat 2.5: 1M context, 131k output, vision, reasoning
  { pattern: /longcat[-_]?2\.5/i, context: 1000000, output: 131072, vision: true, reasoning: true, tools: true },
  // Longcat 2.0 / generic: 1M context, 131k output, reasoning
  { pattern: /longcat/i, context: 1000000, output: 131072, vision: false, reasoning: true, tools: true },

  // Exo / Fledge Alpha: 1.05M context, 131k output, vision, reasoning
  { pattern: /(?:exo|fledge[-_]?alpha)/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },

  // Union Alpha: 262k context, 131k output, vision
  { pattern: /union[-_]?alpha/i, context: 262144, output: 131072, vision: true, reasoning: false, tools: true },

  // Nemotron 3.5 Super VL: 1M context, 131k output, vision, reasoning
  { pattern: /nemotron.*(?:3\.5.*super.*vl|super.*vl)/i, context: 1000000, output: 131072, vision: true, reasoning: true, tools: true },
  // Nemotron 3.5 Lightning: 1M context, 16k output, reasoning
  { pattern: /nemotron.*(?:3\.5.*lightning|lightning)/i, context: 1000000, output: 16384, vision: false, reasoning: true, tools: true },
  // Nemotron 3.5 generic: 1M context, 65k output, vision, reasoning
  { pattern: /nemotron[-_]?3\.5/i, context: 1000000, output: 65536, vision: true, reasoning: true, tools: true },
  // Older Nemotron VL: 128k context, 4096 output, vision, reasoning
  { pattern: /nemotron.*vl/i, context: 131072, output: 4096, vision: true, reasoning: true, tools: true },
  // Generic Nemotron: 128k context, 4096 output, reasoning
  { pattern: /nemotron/i, context: 131072, output: 4096, vision: false, reasoning: true, tools: true },

  // Flint: 128k context, 8192 output, reasoning
  { pattern: /flint/i, context: 131072, output: 8192, vision: false, reasoning: true, tools: true },

  // Jev / Beam: 128k context, 8192 output
  { pattern: /(?:jev|beam)/i, context: 131072, output: 8192, vision: false, reasoning: false, tools: true },

  // North Mini Code / Ring: 256k context, 64k output, reasoning
  { pattern: /north[-_]?mini/i, context: 256000, output: 64000, vision: false, reasoning: true, tools: true },
  { pattern: /ring[-_]?2\.6/i, context: 262000, output: 66000, vision: false, reasoning: true, tools: true },

  // Qwen 3.5 / Plus / Max: 1M context, 65k output, vision, reasoning
  { pattern: /qwen[-_]?(?:3\.5|plus|max)/i, context: 1000000, output: 65536, vision: true, reasoning: true, tools: true },
  // Qwen Coder: 1M context, 65k output, reasoning
  { pattern: /qwen.*coder/i, context: 1000000, output: 65536, vision: false, reasoning: true, tools: true },
  // Qwen VL: 262k context, 65k output, vision, reasoning
  { pattern: /qwen.*vl/i, context: 262144, output: 65536, vision: true, reasoning: true, tools: true },
  // QwQ: 128k context, 32k output, reasoning
  { pattern: /qwq/i, context: 131072, output: 32768, vision: false, reasoning: true, tools: true },
  // Generic Qwen: 128k context, 8192 output
  { pattern: /qwen/i, context: 131072, output: 8192, vision: false, reasoning: false, tools: true },

  // Kimi K3: 1.05M context, 131k output, vision, reasoning
  { pattern: /kimi[-_]?k3/i, context: 1048576, output: 131072, vision: true, reasoning: true, tools: true },
  // Kimi / Kimi for coding: 262k context, 65k output, vision, reasoning
  { pattern: /kimi/i, context: 262144, output: 65536, vision: true, reasoning: true, tools: true },

  // MiniMax M3: 1M context, 131k output, vision, reasoning
  { pattern: /minimax[-_]?m3/i, context: 1000000, output: 131072, vision: true, reasoning: true, tools: true },
  // MiniMax M2.7: 204k context, 131k output, vision, reasoning
  { pattern: /minimax/i, context: 204800, output: 131072, vision: true, reasoning: true, tools: true },

  // Claude 3.7 / Sonnet 4 / Sonnet 5 / Opus 5: 1M context, 128k output, vision, reasoning
  { pattern: /claude.*(?:3[.-]7|sonnet[-_]?[45]|opus[-_]?[45])/i, context: 1000000, output: 128000, vision: true, reasoning: true, tools: true },
  // Claude 3.5 Sonnet / Haiku: 200k context, 8192 output, vision
  { pattern: /claude.*3[.-]5/i, context: 200000, output: 8192, vision: true, reasoning: false, tools: true },
  // Generic Claude: 200k context, 8192 output, vision
  { pattern: /claude/i, context: 200000, output: 8192, vision: true, reasoning: false, tools: true },

  // OpenAI o1 / o3 / o4: 200k context, 100k output, vision, reasoning
  { pattern: /(?:^|[^a-z0-9])o[134](?:[-_]|$)/i, context: 200000, output: 100000, vision: true, reasoning: true, tools: true },
  // GPT-5 / GPT-6: 1.05M context, 128k output, vision, reasoning
  { pattern: /gpt[-_]?[56]/i, context: 1050000, output: 128000, vision: true, reasoning: true, tools: true },
  // GPT-4o: 128k context, 16384 output, vision
  { pattern: /gpt[-_]?4o/i, context: 128000, output: 16384, vision: true, reasoning: false, tools: true },
  // GPT-4.1: 1M context, 32768 output, vision
  { pattern: /gpt[-_]?4\.1/i, context: 1000000, output: 32768, vision: true, reasoning: false, tools: true },
  // Generic GPT-4: 128k context, 4096 output
  { pattern: /gpt[-_]?4/i, context: 128000, output: 4096, vision: false, reasoning: false, tools: true },

  // Gemini 2.5 / thinking: 1.05M context, 65k output, vision, reasoning
  { pattern: /gemini.*(?:2\.5|thinking)/i, context: 1048576, output: 65536, vision: true, reasoning: true, tools: true },
  // Generic Gemini: 1.05M context, 65k output, vision
  { pattern: /gemini/i, context: 1048576, output: 65536, vision: true, reasoning: false, tools: true },

  // Grok: 256k context, 64k output, vision, reasoning
  { pattern: /grok/i, context: 256000, output: 64000, vision: true, reasoning: true, tools: true },
];

/**
 * Infer or lookup metadata for any model ID.
 * Returns accurate limits, capabilities, and reasoning variants.
 */
export const resolveModelMetadata = (
  rawId: string,
  upstreamData?: Record<string, unknown>,
): ModelMetadata => {
  const normalized = rawId.trim().toLowerCase();

  // 1. Explicit upstream data if available
  if (upstreamData) {
    const rawCtx =
      Number(upstreamData.context_length) ||
      Number(upstreamData.contextLength) ||
      Number(upstreamData.max_context_tokens) ||
      (typeof upstreamData.limit === 'object' && upstreamData.limit
        ? Number((upstreamData.limit as Record<string, unknown>).context)
        : 0);

    const rawOut =
      Number(upstreamData.max_tokens) ||
      Number(upstreamData.max_output_tokens) ||
      Number(upstreamData.maxOutput) ||
      (typeof upstreamData.limit === 'object' && upstreamData.limit
        ? Number((upstreamData.limit as Record<string, unknown>).output)
        : 0);

    if (rawCtx > 0 || rawOut > 0) {
      const isVision =
        normalized.includes('vl') ||
        normalized.includes('vision') ||
        normalized.includes('4v') ||
        normalized.includes('image') ||
        normalized.includes('multimodal');
      const isReasoning =
        normalized.includes('reasoner') ||
        normalized.includes('reasoning') ||
        normalized.includes('r1') ||
        normalized.includes('thinking') ||
        normalized.includes('o1') ||
        normalized.includes('o3');

      return {
        limit: {
          context: rawCtx > 0 ? rawCtx : 131072,
          output: rawOut > 0 ? rawOut : 8192,
        },
        capabilities: {
          tools: true,
          input: isVision ? ['text', 'image'] : ['text'],
          output: ['text'],
        },
        ...(isReasoning ? { variants: REASONING_VARIANTS } : {}),
      };
    }
  }

  // 2. Exact match in KNOWN_MODELS
  const known = KNOWN_MODELS[normalized];
  if (known && known.limit && known.capabilities) {
    return {
      limit: known.limit,
      capabilities: known.capabilities,
      variants: known.variants,
    };
  }

  // 3. Match against ordered rules
  for (const rule of MODEL_RULES) {
    if (rule.pattern.test(normalized)) {
      const isVision =
        rule.vision ??
        (normalized.includes('vl') ||
          normalized.includes('vision') ||
          normalized.includes('4v') ||
          normalized.includes('image') ||
          normalized.includes('multimodal'));

      const isReasoning =
        rule.reasoning ??
        (normalized.includes('reasoner') ||
          normalized.includes('reasoning') ||
          normalized.includes('r1') ||
          normalized.includes('thinking'));

      return {
        limit: {
          context: rule.context,
          output: rule.output,
        },
        capabilities: {
          tools: rule.tools ?? true,
          input: isVision ? ['text', 'image'] : ['text'],
          output: ['text'],
        },
        ...(isReasoning ? { variants: REASONING_VARIANTS } : {}),
      };
    }
  }

  // 4. Fallback heuristics for unlisted models
  const isVision =
    normalized.includes('vl') ||
    normalized.includes('vision') ||
    normalized.includes('4v') ||
    normalized.includes('image') ||
    normalized.includes('multimodal');

  const isReasoning =
    normalized.includes('reasoner') ||
    normalized.includes('reasoning') ||
    normalized.includes('r1') ||
    normalized.includes('thinking') ||
    normalized.includes('o1') ||
    normalized.includes('o3');

  let context = 131072;
  let output = isReasoning ? 16384 : 8192;

  if (normalized.includes('1m') || normalized.includes('1000k')) {
    context = 1048576;
    output = 131072;
  } else if (normalized.includes('500k')) {
    context = 524288;
    output = 65536;
  } else if (normalized.includes('256k') || normalized.includes('200k')) {
    context = 262144;
    output = 65536;
  } else if (normalized.includes('64k')) {
    context = 65536;
    output = 16384;
  } else if (normalized.includes('32k')) {
    context = 32768;
    output = 8192;
  } else if (normalized.includes('16k')) {
    context = 16384;
    output = 4096;
  }

  return {
    limit: { context, output },
    capabilities: {
      tools: true,
      input: isVision ? ['text', 'image'] : ['text'],
      output: ['text'],
    },
    ...(isReasoning ? { variants: REASONING_VARIANTS } : {}),
  };
};
