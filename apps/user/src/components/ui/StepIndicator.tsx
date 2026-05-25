type Step = {
  id: string;
  label: string;
};

type Props = {
  steps: Step[];
  currentStep: string;
};

export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = steps.findIndex((item) => item.id === currentStep) > index;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={[
                "flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition",
                isActive
                  ? "border-black bg-black text-white"
                  : isCompleted
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-black/10 bg-white text-black/45",
              ].join(" ")}
            >
              {index + 1}
            </div>
            <span
              className={[
                "text-sm transition",
                isActive || isCompleted ? "text-black" : "text-black/45",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
