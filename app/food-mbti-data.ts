export type ScaleKey = "financial" | "personal" | "effort" | "trait";

export interface ScaleDefinition {
  key: ScaleKey;
  title: string;
  left: {
    letter: string;
    label: string;
  };
  right: {
    letter: string;
    label: string;
  };
}

export const FOOD_MBTI_SCALES: ScaleDefinition[] = [
  {
    key: "financial",
    title: "Financial",
    left: { letter: "B", label: "Budget-focused" },
    right: { letter: "V", label: "Value-focused" },
  },
  {
    key: "personal",
    title: "Personal",
    left: { letter: "W", label: "Wellness-focused" },
    right: { letter: "E", label: "Enjoyment-focused" },
  },
  {
    key: "effort",
    title: "Effort-based",
    left: { letter: "C", label: "Convenience-leaning" },
    right: { letter: "A", label: "Adventure-leaning" },
  },
  {
    key: "trait",
    title: "Trait-driven",
    left: { letter: "I", label: "Impulsive" },
    right: { letter: "H", label: "Habitual" },
  },
];
