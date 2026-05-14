export interface Requirement {
  label: string;
  test: (value: string) => boolean;
}

interface FieldRequirementsProps {
  value: string;
  requirements: Requirement[];
  variant?: 'light' | 'dark';
}

export const usernameRequirements: Requirement[] = [
  { label: 'At least 3 characters', test: v => v.length >= 3 },
  { label: 'Max 30 characters', test: v => v.length <= 30 },
  { label: 'Letters, numbers, _ and - only', test: v => /^[a-zA-Z0-9_-]*$/.test(v) },
];

export const passwordRequirements: Requirement[] = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
];

export function filterUsername(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
}

export default function FieldRequirements({ value, requirements, variant = 'light' }: FieldRequirementsProps) {
  const hasValue = value.length > 0;

  const neutral = variant === 'dark' ? 'text-white/40' : 'text-brand-burgundy/40';
  const pass = variant === 'dark' ? 'text-green-400' : 'text-green-600';
  const fail = variant === 'dark' ? 'text-red-400' : 'text-red-500';

  return (
    <ul className="mt-2 space-y-1">
      {requirements.map((req) => {
        const met = req.test(value);
        let colour = neutral;
        let icon = '●';
        if (hasValue) {
          colour = met ? pass : fail;
          icon = met ? '✓' : '✗';
        }
        return (
          <li key={req.label} className={`flex items-center gap-1.5 text-sm font-body ${colour}`}>
            <span className="w-3.5 text-center leading-none shrink-0 font-bold">{icon}</span>
            {req.label}
          </li>
        );
      })}
    </ul>
  );
}
