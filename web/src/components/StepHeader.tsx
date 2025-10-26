/**
 * Stepper UI for Demo Console flow
 */
interface StepHeaderProps {
  step: number | string;
  title?: string;
}

export function StepHeader({ step, title }: StepHeaderProps) {
  const stepNum = typeof step === 'string' ? parseInt(step) : step;
  
  return (
    <div className="mb-6">
      {title && <h2 className="text-xl font-semibold mb-4 text-ink">{title}</h2>}
      <div className="flex items-center gap-3 text-sm">
        <Chip active={stepNum >= 1}>1 Event Details</Chip>
        <Divider />
        <Chip active={stepNum >= 2}>2 Ticket Setup</Chip>
        <Divider />
        <Chip active={stepNum >= 3}>3 Review & Deploy</Chip>
      </div>
    </div>
  );
}

function Chip({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full border border-white/12 px-2.5 py-1 font-medium ${
        active
          ? 'bg-[#4DA2FF]/20 text-white'
          : 'bg-white/[0.06] text-white/70'
      }`}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <span className="h-px w-6 bg-white/12" />;
}
