/**
 * HTML 태그를 제거하고 순수 텍스트만 반환합니다.
 * @param html - HTML 문자열
 * @returns 순수 텍스트
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * HTML 엔티티를 일반 문자로 변환합니다.
 * @param html - HTML 문자열
 * @returns 변환된 문자열
 */
export function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * TipTap HTML에서 텍스트만 추출합니다.
 * @param html - TipTap HTML 문자열
 * @returns 순수 텍스트
 */
export function extractTextFromTipTap(html: string): string {
  return decodeHtmlEntities(stripHtml(html));
}

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가합니다.
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * 연속된 공백을 하나로 변환합니다.
 * @param text - 원본 텍스트
 * @returns 정리된 텍스트
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * TipTap HTML에서 미리보기 텍스트를 추출합니다.
 * @param html - TipTap HTML 문자열
 * @param maxLength - 최대 길이 (기본값: 100)
 * @returns 미리보기 텍스트
 */
export function extractPreviewText(
  html: string,
  maxLength: number = 100
): string {
  const text = extractTextFromTipTap(html);
  const normalized = normalizeWhitespace(text);
  return truncateText(normalized, maxLength);
}
