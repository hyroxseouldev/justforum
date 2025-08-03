import { Id } from "@/convex/_generated/dataModel";

// Subject enum 정의 (클라이언트용)
export const SUBJECTS = {
  QUESTION: "질문",
  FEEDBACK: "피드백",
} as const;

export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS];

// Subject ID 매핑 (클라이언트용)
export const SUBJECT_IDS: Record<Subject, Id<"subjects">> = {
  [SUBJECTS.QUESTION]: "jn77gxsqpv9ax20e8gs6wkg17x7mzse7" as Id<"subjects">,
  [SUBJECTS.FEEDBACK]: "jn75r4nbsjmyqwmjs7knsax3eh7myk5m" as Id<"subjects">,
};

// Subject 정보 (UI에서 사용할 스타일 정보)
export const SUBJECT_INFO = {
  [SUBJECTS.QUESTION]: {
    label: "질문",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  [SUBJECTS.FEEDBACK]: {
    label: "피드백",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
} as const;

// Subject 배열
export const SUBJECT_LIST = Object.values(SUBJECTS);

// Subject ID로 Subject 찾기
export const getSubjectById = (id: Id<"subjects">): Subject | null => {
  for (const [subject, subjectId] of Object.entries(SUBJECT_IDS)) {
    if (subjectId === id) {
      return subject as Subject;
    }
  }
  return null;
};

// Subject로 ID 찾기
export const getSubjectId = (subject: Subject): Id<"subjects"> => {
  return SUBJECT_IDS[subject];
};
