export interface DilemmaOption {
  text: string;
  analysis: string;
  reason: string;
  alternative: string;
  integrityScoreDelta: number;
  isBestChoice?: boolean;
}

export interface MoralDilemma {
  id: number;
  title: string;
  video_desc: string;
  theory: string;
  options: DilemmaOption[];
}

export interface MoralUserChoice {
  dilemmaId: number;
  optionIndex: number;
  selectedOption: DilemmaOption;
}

export interface IntegrityReport {
  scorePercentage: number;
  moralCourageScore: number;
  honestyScore: number;
  independenceScore: number;
  trendScores: number[];
}
