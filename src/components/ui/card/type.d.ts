export type StatCardValueColor = 'blue' | 'green' | 'yellow' | 'red' | 'default';

export interface StatCardProps {
  label: string;
  count: number;
  unit: string;
  countColor?: StatCardValueColor;
  unitColor?: StatCardValueColor;
}
