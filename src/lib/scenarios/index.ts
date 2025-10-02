import { ScenarioInfo } from '../types';
import { SCENARIO_INFO as CRISIS_INFO } from './crisis';
import { SCENARIO_INFO as REMIX_INFO } from './remix';

// Registry of all available scenarios
export const AVAILABLE_SCENARIOS: ScenarioInfo[] = [
  CRISIS_INFO,
  REMIX_INFO,
  // Add more scenarios here as they're created
];

// Helper function to get scenario by path
export function getScenarioByPath(path: string): ScenarioInfo | undefined {
  return AVAILABLE_SCENARIOS.find(scenario => scenario.path === path);
}