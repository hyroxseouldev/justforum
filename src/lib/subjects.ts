// Subject enum 정의
export const SUBJECTS = {
  QUESTION: "question",
  FEEDBACK: "feedback",
} as const;

export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS];

// Subject 정보 (UI에서 사용할 스타일 정보)
export const SUBJECT_INFO = {
  [SUBJECTS.QUESTION]: {
    label: "질문",
    description: "궁금한 점을 물어보세요",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: "❓",
  },
  [SUBJECTS.FEEDBACK]: {
    label: "피드백",
    description: "의견이나 제안을 남겨주세요",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: "💬",
  },
} as const;

// Subject 배열
export const SUBJECT_LIST = Object.values(SUBJECTS);

// Subject 정보 가져오기
export const getSubjectInfo = (subject: Subject) => {
  return SUBJECT_INFO[subject];
};

// 모든 Subject 정보 가져오기
export const getAllSubjectInfo = () => {
  return SUBJECT_LIST.map((subject) => ({
    subject,
    info: getSubjectInfo(subject),
  }));
};

// Subject 유효성 검사
export const isValidSubject = (value: string): value is Subject => {
  return Object.values(SUBJECTS).includes(value as Subject);
};
