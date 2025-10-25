/**
 * Stepper UI for Demo Console flow
 */
interface StepHeaderProps {
  step: 1 | 2;
}

export function StepHeader({ step }: StepHeaderProps) {
  return (
    <div className="mb-6 flex items-center gap-3 text-sm">
      <Chip active={step >= 1}>1 Mint & List</Chip>
      <Divider />
      <Chip active={step >= 2}>2 Buy & Approve</Chip>
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
