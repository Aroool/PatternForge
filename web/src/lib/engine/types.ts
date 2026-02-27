export type Decision = string;

export type BaseStep = {
  decision: Decision;
  note: string;
};

export type PatternDefinition<TStep extends BaseStep> = {
  id: string;
  name: string;

  // Code shown in code panel
  codeLines: string[];

  // Build animation steps
  buildSteps: (...args: unknown[]) => TStep[];

  // Which line to highlight for a step
  activeLine: (step: TStep) => number;
};