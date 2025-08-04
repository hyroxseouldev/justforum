import { Id } from "@/convex/_generated/dataModel";

// Subject enum 정의
export const SUBJECTS = {
  QUESTION: "질문",
  FEEDBACK: "피드백",
} as const;

export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS];

// Environment detection
const isProduction = process.env.NODE_ENV === "production";

// Subject ID 매핑 (환경별)
export const SUBJECT_IDS: Record<Subject, Id<"subjects">> = isProduction
  ? {
      [SUBJECTS.QUESTION]: "jh75ndgsxh269gka48ntdxsn8d7mzjw2" as Id<"subjects">,
      [SUBJECTS.FEEDBACK]: "jh7b0ktfcg11y7vn3kajrs08w97mymnz" as Id<"subjects">,
    }
  : {
      [SUBJECTS.QUESTION]: "jn77gxsqpv9ax20e8gs6wkg17x7mzse7" as Id<"subjects">,
      [SUBJECTS.FEEDBACK]: "jn75r4nbsjmyqwmjs7knsax3eh7myk5m" as Id<"subjects">,
    };

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

// Subject ID로 Subject 찾기
export const getSubjectById = (id: Id<"subjects">): Subject | null => {
  const entry = Object.entries(SUBJECT_IDS).find(
    ([, subjectId]) => subjectId === id
  );
  return entry ? (entry[0] as Subject) : null;
};

// Subject로 ID 찾기
export const getSubjectId = (subject: Subject): Id<"subjects"> => {
  return SUBJECT_IDS[subject];
};

// Subject 정보 가져오기
export const getSubjectInfo = (subject: Subject) => {
  return SUBJECT_INFO[subject];
};

// Subject ID로 Subject 정보 가져오기
export const getSubjectInfoById = (id: Id<"subjects">) => {
  const subject = getSubjectById(id);
  return subject ? getSubjectInfo(subject) : null;
};

// 모든 Subject 정보 가져오기
export const getAllSubjectInfo = () => {
  return SUBJECT_LIST.map((subject) => ({
    subject,
    id: getSubjectId(subject),
    info: getSubjectInfo(subject),
  }));
};

// Subject 유효성 검사
export const isValidSubject = (value: string): value is Subject => {
  return Object.values(SUBJECTS).includes(value as Subject);
};

// Subject ID 유효성 검사
export const isValidSubjectId = (id: string): id is Id<"subjects"> => {
  return Object.values(SUBJECT_IDS).includes(id as Id<"subjects">);
};
