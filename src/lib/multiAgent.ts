// Multi-agent scenario simulation engine.
// Uses callLLM (OpenRouter) to fan out agents, debate, verify, synthesize.
// Each phase calls the LLM with a structured prompt. Agents are simulated
// as distinct personas (Strategist, Antagonist, Analyst, Synthesizer).

import { callLLM } from './openrouterClient';
import { Trait, SimulatorScenario } from '../types';
import { z } from 'zod';

const AGENTS = ['Strategist', 'Antagonist', 'Analyst', 'Synthesizer'] as const;
export type AgentName = (typeof AGENTS)[number];

export interface AgentContribution {
  agent: AgentName;
  phase: 'explore' | 'debate' | 'verify' | 'synthesize';
  text: string;
  parsed?: ExploreResponse | DebateResponse | VerifyResponse | SynthesizeResponse;
}

export interface SimulationResult {
  scenarioId: string;
  contributions: AgentContribution[];
  finalVerdict: string;
  finalScore: number;
  selectedOptionId?: string;
}

const DEBATE_ROUNDS = 2;

// Zod schemas for strict LLM response validation
const ExploreResponseSchema = z.object({
  analysis: z.string().min(1),
  proposedAction: z.string().min(1),
  confidence: z.number().int().min(0).max(100),
});
export type ExploreResponse = z.infer<typeof ExploreResponseSchema>;

const DebateResponseSchema = z.object({
  argument: z.string().min(1),
  supportingTraits: z.array(z.string()).min(1),
  concession: z.string().min(1),
});
export type DebateResponse = z.infer<typeof DebateResponseSchema>;

const VerifyScoreSchema = z.object({
  agent: z.string().min(1),
  score: z.number().int().min(0).max(100),
  reason: z.string().min(1),
});
const VerifyResponseSchema = z.object({
  scores: z.array(VerifyScoreSchema).min(1),
  bestAgent: z.string().min(1),
  rationale: z.string().min(1),
});
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;

const SynthesizeResponseSchema = z.object({
  finalPlan: z.string().min(1),
  alignmentScore: z.number().int().min(0).max(100),
  traitShifts: z.array(z.string()),
  selectedOptionId: z.string().optional(),
});
export type SynthesizeResponse = z.infer<typeof SynthesizeResponseSchema>;

class ParseError extends Error {
  constructor(
    message: string,
    public readonly rawText: string,
    public readonly issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

function parseLLMResponse<T>(text: string, schema: z.ZodSchema<T>): T {
  // Extract JSON from potential markdown/code fences
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : text;

  const result = schema.safeParse(JSON.parse(jsonText));
  if (!result.success) {
    throw new ParseError(
      `LLM response failed validation: ${result.error.issues.map(e => e.message).join(', ')}`,
      text,
      result.error.issues
    );
  }
  return result.data;
}

function buildExplorePrompt(scenario: SimulatorScenario, traits: Trait[]): string {
  const dna = traits.map((t) => `${t.name}: ${t.value}`).join(', ');
  const optionsText = scenario.options
    .map((o, i) => `${i + 1}. ${o.text}`)
    .join('\n');
  return `You are a ${scenario.difficulty}-stakes scenario: "${scenario.title}".
DNA: {${dna}}.

Act as an independent Strategist. Analyze the scenario and propose your tactical response.
Available options:
${optionsText}

Respond JSON: {"analysis":"...","proposedAction":"...","confidence":0-100}
Scenario context: ${scenario.context}`;
}

function buildDebatePrompt(scenario: SimulatorScenario, traits: Trait[], round: number, priorPositions: string[]): string {
  const dna = traits.map((t) => `${t.name}: ${t.value}`).join(', ');
  const positionContext = priorPositions.map((p, i) => `Agent ${i + 1}: ${p}`).join('\n');
  return `Debate round ${round}. Scenario: "${scenario.title}". DNA: {${dna}}.
Previous positions:
${positionContext}

You are ${AGENTS[round % AGENTS.length]}. Challenge or refine the previous positions.
Respond JSON: {"argument":"...","supportingTraits":["..."],"concession":"..."}.`;
}

function buildVerifyPrompt(scenario: SimulatorScenario, traits: Trait[], argumentsText: string): string {
  const dna = traits.map((t) => `${t.name}: ${t.value}`).join(', ');
  return `You are the Analyst judge. Scenario: "${scenario.title}". DNA: {${dna}}.
Arguments collected:
${argumentsText}

Score each argument's alignment with the persona DNA (0-100).
Respond JSON: {"scores":[{"agent":"...","score":0-100,"reason":"..."}],"bestAgent":"...","rationale":"..."}.`;
}

function buildSynthesizePrompt(scenario: SimulatorScenario, traits: Trait[], bestArgument: string): string {
  const dna = traits.map((t) => `${t.name}: ${t.value}`).join(', ');
  const optionsText = scenario.options
    .map((o, i) => `${i + 1}. ${o.text} (id: ${o.id})`)
    .join('\n');
  return `Synthesize the best position for: "${scenario.title}". DNA: {${dna}}.
Winning argument: ${bestArgument}
Available options:
${optionsText}

Produce the final unified tactical plan and select the best option.
Respond JSON: {"finalPlan":"...","alignmentScore":0-100,"traitShifts":["..."],"selectedOptionId":"..."}.`;
}

export async function runSimulation(
  scenario: SimulatorScenario,
  traits: Trait[]
): Promise<SimulationResult> {
  const contributions: AgentContribution[] = [];

  // Phase 1: EXPLORE — each agent independently proposes
  const exploreResults = await Promise.all(
    AGENTS.map((agent) =>
      callLLM({
        model: 'openai/gpt-4o-mini',
        contents: buildExplorePrompt(scenario, traits),
        config: { maxOutputTokens: 256, temperature: 0.8 },
      }).then((text) => {
        const parsed = parseLLMResponse(text, ExploreResponseSchema);
        return { agent, phase: 'explore' as const, text, parsed };
      })
    )
  );
  contributions.push(...exploreResults);

  // Phase 2: DEBATE — round-robin challenge
  let debateText = exploreResults.map((r) => r.parsed?.proposedAction ?? r.text).join('\n');
  for (let round = 1; round <= DEBATE_ROUNDS; round++) {
    const debateResults = await Promise.all(
      AGENTS.slice(0, 2).map((agent, i) =>
        callLLM({
          model: 'openai/gpt-4o-mini',
          contents: buildDebatePrompt(scenario, traits, round, exploreResults.map((r) => r.parsed?.proposedAction ?? r.text)),
          config: { maxOutputTokens: 256, temperature: 0.9 },
        }).then((text) => {
          const parsed = parseLLMResponse(text, DebateResponseSchema);
          return { agent, phase: 'debate' as const, text, parsed };
        })
      )
    );
    contributions.push(...debateResults);
    debateText += '\n' + debateResults.map((r) => r.parsed?.argument ?? r.text).join('\n');
  }

  // Phase 3: VERIFY — Analyst scores all arguments
  const verifyRaw = await callLLM({
    model: 'openai/gpt-4o-mini',
    contents: buildVerifyPrompt(scenario, traits, debateText),
    config: { maxOutputTokens: 256 },
  });
  const verifyData = parseLLMResponse(verifyRaw, VerifyResponseSchema);
  contributions.push({ agent: 'Analyst', phase: 'verify', text: verifyRaw, parsed: verifyData });

  const bestAgent = verifyData.bestAgent;
  const bestArgument = exploreResults.find((r) => r.agent === bestAgent)?.parsed?.proposedAction
    ?? exploreResults[0].parsed?.proposedAction
    ?? exploreResults[0].text;

  // Phase 4: SYNTHESIZE — unify winning position
  const synthesizeRaw = await callLLM({
    model: 'openai/gpt-4o-mini',
    contents: buildSynthesizePrompt(scenario, traits, bestArgument),
    config: { maxOutputTokens: 256 },
  });
  const synthesizeData = parseLLMResponse(synthesizeRaw, SynthesizeResponseSchema);
  contributions.push({ agent: 'Synthesizer', phase: 'synthesize', text: synthesizeRaw, parsed: synthesizeData });

  return {
    scenarioId: scenario.id,
    contributions,
    finalVerdict: synthesizeData.finalPlan,
    finalScore: synthesizeData.alignmentScore,
    selectedOptionId: synthesizeData.selectedOptionId,
  };
}

export {
  AGENTS,
  ParseError,
  buildExplorePrompt,
  buildDebatePrompt,
  buildVerifyPrompt,
  buildSynthesizePrompt,
  ExploreResponseSchema,
  DebateResponseSchema,
  VerifyResponseSchema,
  SynthesizeResponseSchema,
};