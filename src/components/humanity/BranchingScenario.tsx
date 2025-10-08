'use client'

import { useEffect, useMemo, useState } from 'react'

interface ScenarioOption {
  id: string
  label: string
  outcome: string
  nextStageId?: string
}

interface ScenarioStage {
  id: string
  prompt: string
  options: ScenarioOption[]
}

interface Scenario {
  intro: string
  stages: ScenarioStage[]
}

interface BranchingScenarioProps {
  scenario: Scenario
  onChange?: (path: Array<{ stageId: string; optionId: string; outcome: string }>) => void
}

export default function BranchingScenario({ scenario, onChange }: BranchingScenarioProps) {
  const stageMap = useMemo(() => Object.fromEntries(scenario.stages.map(stage => [stage.id, stage])), [scenario.stages])
  const firstStage = scenario.stages[0]

  const [currentStageId, setCurrentStageId] = useState<string>(firstStage?.id ?? '')
  const [path, setPath] = useState<Array<{ stageId: string; optionId: string; outcome: string }>>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  useEffect(() => {
    onChange?.(path)
  }, [path, onChange])

  const currentStage = currentStageId ? stageMap[currentStageId] : null

  const handleSelectOption = (option: ScenarioOption) => {
    setSelectedOptionId(option.id)
  }

  const handleCommitOption = () => {
    if (!currentStage || !selectedOptionId) return
    const option = currentStage.options.find(opt => opt.id === selectedOptionId)
    if (!option) return

    setPath(prev => [...prev, { stageId: currentStage.id, optionId: option.id, outcome: option.outcome }])

    if (option.nextStageId && stageMap[option.nextStageId]) {
      setCurrentStageId(option.nextStageId)
      setSelectedOptionId(null)
    } else {
      setCurrentStageId('')
      setSelectedOptionId(null)
    }
  }

  const isComplete = !currentStage

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-400">Scenario brief</p>
        <p className="mt-2 text-base text-gray-800">{scenario.intro}</p>
      </div>

      {path.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h4 className="text-sm font-semibold text-gray-800">Your path so far</h4>
          <ol className="mt-3 space-y-2 text-sm text-gray-700">
            {path.map(step => {
              const stage = stageMap[step.stageId]
              const option = stage?.options.find(opt => opt.id === step.optionId)
              return (
                <li key={`${step.stageId}-${step.optionId}`} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="font-semibold text-orange-600">{stage?.prompt}</div>
                  <div className="mt-1">
                    <span className="font-medium text-gray-900">Choice:</span> {option?.label}
                  </div>
                  <div className="text-xs text-gray-500">Outcome: {step.outcome}</div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {currentStage ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">{currentStage.prompt}</h3>
          <div className="mt-4 space-y-3">
            {currentStage.options.map(option => {
              const isSelected = option.id === selectedOptionId
              return (
                <label
                  key={option.id}
                  className={`block cursor-pointer rounded-xl border px-4 py-3 transition ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`stage-${currentStage.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleSelectOption(option)}
                    className="sr-only"
                  />
                  <div className="font-semibold">{option.label}</div>
                  {isSelected && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Immediate ripple:</span> {option.outcome}
                    </div>
                  )}
                </label>
              )
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleCommitOption}
              disabled={!selectedOptionId}
              className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {currentStage.options.find(opt => opt.id === selectedOptionId)?.nextStageId ? 'Lock choice' : 'Finish scenario'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-orange-50 p-6 text-center text-sm text-orange-700">
          Scenario complete. Reflect on what your sequence says about risk, impact, and trade-offs.
        </div>
      )}
    </div>
  )
}
