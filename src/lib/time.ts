/**
 * 타임스탬프를 "~전" 형태의 상대적 시간으로 변환합니다.
 * @param timestamp - 밀리초 단위의 타임스탬프
 * @returns "3분 전", "1시간 전" 등의 문자열
 */
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years}년 전`;
  } else if (months > 0) {
    return `${months}개월 전`;
  } else if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return "방금 전";
  }
};

/**
 * 타임스탬프를 "YYYY년 MM월 DD일 HH:mm" 형태로 변환합니다.
 * @param timestamp - 밀리초 단위의 타임스탬프
 * @returns "2024년 1월 15일 14:30" 형태의 문자열
 */
export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

/**
 * 오늘인지 확인합니다.
 * @param timestamp - 밀리초 단위의 타임스탬프
 * @returns 오늘인 경우 true
 */
export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * 어제인지 확인합니다.
 * @param timestamp - 밀리초 단위의 타임스탬프
 * @returns 어제인 경우 true
 */
export const isYesterday = (timestamp: number): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * 스마트한 시간 표시 (오늘은 시간만, 어제는 "어제", 그 외는 날짜)
 * @param timestamp - 밀리초 단위의 타임스탬프
 * @returns 스마트한 시간 문자열
 */
export const formatSmartTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  if (isToday(timestamp)) {
    return `${hours}:${minutes}`;
  } else if (isYesterday(timestamp)) {
    return `어제 ${hours}:${minutes}`;
  } else {
    return formatDateTime(timestamp);
  }
};
