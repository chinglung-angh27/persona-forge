import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import {
  runSimulation,
  buildExplorePrompt,
  buildDebatePrompt,
  buildVerifyPrompt,
  buildSynthesizePrompt,
  ExploreResponseSchema,
  DebateResponseSchema,
  VerifyResponseSchema,
  SynthesizeResponseSchema,
  ParseError,
} from '../lib/multiAgent';
import { SimulatorScenario, Trait } from '../types';

// Mock callLLM
vi.mock('../lib/openrouterClient', () => ({
  callLLM: vi.fn(),
  LLMUnavailableError: class extends Error {},
  LLMTimeoutError: class extends Error {},
  LLMCircuitOpenError: class extends Error {},
}));

import { callLLM } from '../lib/openrouterClient';
const mockCallLLM = callLLM as Mock;

const mockTraits: Trait[] = [
  { id: 'd1', name: 'Discipline', value: 75, icon: 'i', description: 'd', category: 'behavioral' },
  { id: 'c1', name: 'Confidence', value: 82, icon: 'i', description: 'd', category: 'emotional' },
];

const mockScenario: SimulatorScenario = {
  id: 'scenario-1',
  title: 'Test Scenario',
  context: 'Test context',
  difficulty: 'Critical',
  category: 'Test',
  options: [
    { id: 'opt-1', text: 'Option A', traitWeights: {}, feedback: '', alignmentScore: 90 },
    { id: 'opt-2', text: 'Option B', traitWeights: {}, feedback: '', alignmentScore: 50 },
  ],
};

describe('multiAgent prompt builders', () => {
  it('buildExplorePrompt includes DNA and options', () => {
    const prompt = buildExplorePrompt(mockScenario, mockTraits);
    expect(prompt).toContain('Discipline: 75');
    expect(prompt).toContain('Confidence: 82');
    expect(prompt).toContain('Option A');
    expect(prompt).toContain('Option B');
    expect(prompt).toContain('Test Scenario');
  });

  it('buildDebatePrompt includes round and prior positions', () => {
    const prompt = buildDebatePrompt(mockScenario, mockTraits, 1, ['Position 1', 'Position 2']);
    expect(prompt).toContain('Debate round 1');
    expect(prompt).toContain('Position 1');
    expect(prompt).toContain('Position 2');
  });

  it('buildVerifyPrompt includes all arguments', () => {
    const prompt = buildVerifyPrompt(mockScenario, mockTraits, 'Argument 1\nArgument 2');
    expect(prompt).toContain('Analyst judge');
    expect(prompt).toContain('Argument 1');
    expect(prompt).toContain('Argument 2');
  });

  it('buildSynthesizePrompt includes best argument and options with IDs', () => {
    const prompt = buildSynthesizePrompt(mockScenario, mockTraits, 'Best argument');
    expect(prompt).toContain('Best argument');
    expect(prompt).toContain('opt-1');
    expect(prompt).toContain('opt-2');
  });
});

describe('Zod schemas', () => {
  it('ExploreResponseSchema validates correct shape', () => {
    const valid = {
      analysis: 'Test analysis',
      proposedAction: 'Test action',
      confidence: 85,
    };
    expect(ExploreResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('ExploreResponseSchema rejects missing fields', () => {
    const invalid = { analysis: 'Test' };
    expect(ExploreResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it('DebateResponseSchema validates correct shape', () => {
    const valid = {
      argument: 'Test argument',
      supportingTraits: ['Discipline', 'Confidence'],
      concession: 'Test concession',
    };
    expect(DebateResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('VerifyResponseSchema validates scores array', () => {
    const valid = {
      scores: [{ agent: 'Strategist', score: 90, reason: 'R1' }],
      bestAgent: 'Strategist',
      rationale: 'Best overall',
    };
    expect(VerifyResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('SynthesizeResponseSchema validates optional selectedOptionId', () => {
    const valid = {
      finalPlan: 'Plan',
      alignmentScore: 85,
      traitShifts: ['Discipline +2'],
      selectedOptionId: 'opt-1',
    };
    expect(SynthesizeResponseSchema.safeParse(valid).success).toBe(true);
  });
});

describe('ParseError', () => {
  it('captures raw text and issues', () => {
    const error = new ParseError('Failed', 'raw text', [{ message: 'issue1' } as any]);
    expect(error.rawText).toBe('raw text');
    expect(error.issues).toHaveLength(1);
    expect(error.message).toBe('Failed');
  });
});

describe('runSimulation integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns SimulationResult with all phases', async () => {
    // Mock LLM responses for each phase
    // Total: 4 explore + 4 debate (2 rounds x 2 agents) + 1 verify + 1 synthesize = 10 calls
    const mockResponses = [
      // 4 explore calls
      JSON.stringify({ analysis: 'A1', proposedAction: 'P1', confidence: 80 }),
      JSON.stringify({ analysis: 'A2', proposedAction: 'P2', confidence: 75 }),
      JSON.stringify({ analysis: 'A3', proposedAction: 'P3', confidence: 85 }),
      JSON.stringify({ analysis: 'A4', proposedAction: 'P4', confidence: 70 }),
      // 4 debate calls (2 rounds x 2 agents)
      JSON.stringify({ argument: 'D1', supportingTraits: ['Discipline'], concession: 'C1' }),
      JSON.stringify({ argument: 'D2', supportingTraits: ['Confidence'], concession: 'C2' }),
      JSON.stringify({ argument: 'D3', supportingTraits: ['Discipline'], concession: 'C3' }),
      JSON.stringify({ argument: 'D4', supportingTraits: ['Confidence'], concession: 'C4' }),
      // verify
      JSON.stringify({
        scores: [
          { agent: 'Strategist', score: 90, reason: 'R1' },
          { agent: 'Antagonist', score: 80, reason: 'R2' },
        ],
        bestAgent: 'Strategist',
        rationale: 'Best',
      }),
      // synthesize
      JSON.stringify({
        finalPlan: 'Final plan',
        alignmentScore: 92,
        traitShifts: ['Discipline +2'],
        selectedOptionId: 'opt-1',
      }),
    ];

    mockCallLLM.mockImplementation(() => Promise.resolve(mockResponses.shift()));

    const result = await runSimulation(mockScenario, mockTraits);

    expect(result.scenarioId).toBe('scenario-1');
    expect(result.contributions.length).toBe(10); // 4 explore + 4 debate + 1 verify + 1 synthesize
    expect(result.finalVerdict).toBe('Final plan');
    expect(result.finalScore).toBe(92);
    expect(result.selectedOptionId).toBe('opt-1');
  });
});