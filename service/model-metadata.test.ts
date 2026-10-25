import { describe, expect, it } from 'bun:test';

import { resolveModelMetadata, REASONING_VARIANTS } from './model-metadata.ts';

describe('resolveModelMetadata', () => {
  it('resolves known DeepSeek chat model', () => {
    const meta = resolveModelMetadata('deepseek-chat-free');
    expect(meta.limit.context).toBe(131072);
    expect(meta.limit.output).toBe(8192);
    expect(meta.capabilities.tools).toBe(true);
    expect(meta.capabilities.input).toEqual(['text']);
    expect(meta.variants).toBeUndefined();
  });

  it('resolves DeepSeek R1 reasoning model with variants', () => {
    const meta = resolveModelMetadata('deepseek-r1-free');
    expect(meta.limit.context).toBe(131072);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
    expect(meta.variants?.map((v) => v.id)).toEqual(['low', 'medium', 'high']);
  });

  it('resolves GLM 5.3 Flash with 1M context, 128k output, vision, and reasoning', () => {
    const meta = resolveModelMetadata('glm-5.3-flash-free');
    expect(meta.limit.context).toBe(1000000);
    expect(meta.limit.output).toBe(128000);
    expect(meta.capabilities.input).toEqual(['text', 'image']);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
  });

  it('resolves DeepSeek V4.1 Flash with 1M context, 384k output, vision, and reasoning', () => {
    const meta = resolveModelMetadata('deepseek-v4.1-flash-free');
    expect(meta.limit.context).toBe(1000000);
    expect(meta.limit.output).toBe(384000);
    expect(meta.capabilities.input).toEqual(['text', 'image']);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
  });

  it('resolves Xiaomi MiMo V2.6 with 1M context and reasoning', () => {
    const meta = resolveModelMetadata('mimo-v2.6-flash-free');
    expect(meta.limit.context).toBe(1048576);
    expect(meta.limit.output).toBe(131072);
    expect(meta.capabilities.input).toEqual(['text', 'image']);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
  });

  it('resolves Nemotron 3.5 Super VL with 1M context, 128k output, vision, and reasoning', () => {
    const meta = resolveModelMetadata('nemotron-3.5-super-vl-free');
    expect(meta.limit.context).toBe(1000000);
    expect(meta.limit.output).toBe(131072);
    expect(meta.capabilities.input).toEqual(['text', 'image']);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
  });

  it('resolves Nemotron 3.5 Lightning with 1M context, 16k output, and reasoning', () => {
    const meta = resolveModelMetadata('nemotron-3.5-lightning-free');
    expect(meta.limit.context).toBe(1000000);
    expect(meta.limit.output).toBe(16384);
    expect(meta.capabilities.input).toEqual(['text']);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
  });

  it('resolves Jev 1.13 with 128k context and 8k output', () => {
    const meta = resolveModelMetadata('jev-1.13-free');
    expect(meta.limit.context).toBe(131072);
    expect(meta.limit.output).toBe(8192);
    expect(meta.capabilities.input).toEqual(['text']);
  });

  it('resolves Big Pickle with 200k context, 32k output, and reasoning', () => {
    const meta = resolveModelMetadata('big-pickle');
    expect(meta.limit.context).toBe(200000);
    expect(meta.limit.output).toBe(32000);
    expect(meta.capabilities.input).toEqual(['text']);
    expect(meta.variants).toEqual(REASONING_VARIANTS);
  });

  it('detects vision capabilities for multimodal models', () => {
    const meta = resolveModelMetadata('glm-4v-free');
    expect(meta.capabilities.input).toEqual(['text', 'image']);

    const customVision = resolveModelMetadata('custom-model-vl-free');
    expect(customVision.capabilities.input).toEqual(['text', 'image']);
  });

  it('detects reasoning variants heuristically', () => {
    const meta = resolveModelMetadata('my-custom-r1-thinking-model');
    expect(meta.variants).toBeDefined();
    expect(meta.variants?.length).toBe(3);
  });

  it('applies fallback context limits', () => {
    const meta1m = resolveModelMetadata('large-1m-free');
    expect(meta1m.limit.context).toBe(1048576);

    const metaNormal = resolveModelMetadata('random-model-free');
    expect(metaNormal.limit.context).toBe(131072);
  });

  it('respects explicit upstream metadata when supplied', () => {
    const meta = resolveModelMetadata('custom-api-model', {
      context_length: 500000,
      max_output_tokens: 32000,
    });
    expect(meta.limit.context).toBe(500000);
    expect(meta.limit.output).toBe(32000);
  });
});
