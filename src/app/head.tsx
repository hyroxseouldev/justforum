import Head from "next/head";
import { Metadata } from "next";

interface HeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tag?: string;
  siteName?: string;
  locale?: string;
}

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tag?: string;
  siteName?: string;
  locale?: string;
}

// Default values for the forum
const DEFAULT_VALUES = {
  siteName: "JustForum",
  title: "JustForum - 한국어 커뮤니티 포럼",
  description:
    "질문과 피드백을 나누는 한국어 커뮤니티 포럼입니다. 개발자와 사용자들이 소통하며 지식을 공유하는 공간입니다.",
  keywords: "포럼, 커뮤니티, 질문, 피드백, 개발, 한국어, 토론, Q&A",
  image: "/og-image.jpg", // 추후 실제 OG 이미지로 교체
  locale: "ko_KR",
  type: "website" as const,
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://justforum.com",
};

/**
 * 동적 메타데이터 생성 함수 (Next.js 15 App Router용)
 * 각 페이지에서 사용할 수 있는 메타데이터를 생성합니다.
 */
export function generateSEOMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tag,
  siteName = DEFAULT_VALUES.siteName,
  locale = DEFAULT_VALUES.locale,
}: GenerateMetadataProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${DEFAULT_VALUES.siteName}`
    : DEFAULT_VALUES.title;

  const metaDescription = description || DEFAULT_VALUES.description;
  const metaKeywords = keywords || DEFAULT_VALUES.keywords;
  const metaImage = image || DEFAULT_VALUES.image;
  const canonicalUrl = url
    ? `${DEFAULT_VALUES.baseUrl}${url}`
    : DEFAULT_VALUES.baseUrl;

  const metadata: Metadata = {
    title: fullTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: author ? [{ name: author }] : undefined,

    // Open Graph
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: siteName,
      locale: locale,
      type: type,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        section,
        tags: tag ? [tag] : undefined,
        authors: author ? [author] : undefined,
      }),
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [metaImage],
      creator: author ? `@${author}` : undefined,
    },

    // Alternative languages
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "ko-KR": canonicalUrl,
        ko: canonicalUrl,
      },
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // App specific
    applicationName: DEFAULT_VALUES.siteName,
    generator: "Next.js",
    referrer: "origin-when-cross-origin",

    // Format detection
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    // Verification (추후 실제 값으로 교체)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: {
        "naver-site-verification": process.env.NAVER_SITE_VERIFICATION || "",
      },
    },
  };

  return metadata;
}

/**
 * 게시글 페이지용 특화 메타데이터 생성
 */
export function generatePostMetadata({
  title,
  content,
  author,
  publishedTime,
  category,
}: {
  title: string;
  content: string;
  author: string;
  publishedTime: string;
  category: string;
  views?: number;
  likes?: number;
}): Metadata {
  // HTML 태그 제거하고 미리보기 텍스트 생성
  const cleanContent = content.replace(/<[^>]*>/g, "").trim();
  const description =
    cleanContent.length > 160
      ? `${cleanContent.substring(0, 157)}...`
      : cleanContent;

  const keywords = `${category}, ${author}, 포럼, 질문, 답변, ${DEFAULT_VALUES.keywords}`;

  return generateSEOMetadata({
    title,
    description,
    keywords,
    type: "article",
    publishedTime,
    author,
    section: category,
    tag: category,
  });
}

/**
 * 검색 결과 페이지용 메타데이터 생성
 */
export function generateSearchMetadata({
  query,
  category,
  resultsCount,
}: {
  query?: string;
  category?: string;
  resultsCount?: number;
}): Metadata {
  let title = "검색 결과";
  let description = "포럼에서 검색한 결과입니다.";

  if (query) {
    title = `'${query}' 검색 결과`;
    description = `'${query}'에 대한 검색 결과입니다.`;
  }

  if (category) {
    title += ` - ${category}`;
    description += ` ${category} 카테고리에서 검색했습니다.`;
  }

  if (resultsCount !== undefined) {
    description += ` 총 ${resultsCount}개의 결과를 찾았습니다.`;
  }

  return generateSEOMetadata({
    title,
    description,
    keywords: `검색, ${query || ""}, ${category || ""}, ${
      DEFAULT_VALUES.keywords
    }`,
  });
}

/**
 * 레거시 Head 컴포넌트 (Pages Router용)
 * 필요시 사용할 수 있도록 유지
 */
export function CustomHead({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tag,
  siteName = DEFAULT_VALUES.siteName,
  locale = DEFAULT_VALUES.locale,
}: HeadProps) {
  const fullTitle = title
    ? `${title} | ${DEFAULT_VALUES.siteName}`
    : DEFAULT_VALUES.title;

  const metaDescription = description || DEFAULT_VALUES.description;
  const metaKeywords = keywords || DEFAULT_VALUES.keywords;
  const metaImage = image || DEFAULT_VALUES.image;
  const canonicalUrl = url
    ? `${DEFAULT_VALUES.baseUrl}${url}`
    : DEFAULT_VALUES.baseUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {author && <meta name="author" content={author} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta
        name="googlebot"
        content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
      />

      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="ko" />
      <meta name="language" content="ko" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Article specific OG tags */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {type === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      {type === "article" && tag && (
        <meta property="article:tag" content={tag} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      {author && <meta name="twitter:creator" content={`@${author}`} />}

      {/* App specific */}
      <meta name="application-name" content={siteName} />
      <meta name="generator" content="Next.js" />

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Theme */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="color-scheme" content="light dark" />

      {/* Verification */}
      {process.env.GOOGLE_SITE_VERIFICATION && (
        <meta
          name="google-site-verification"
          content={process.env.GOOGLE_SITE_VERIFICATION}
        />
      )}
      {process.env.NAVER_SITE_VERIFICATION && (
        <meta
          name="naver-site-verification"
          content={process.env.NAVER_SITE_VERIFICATION}
        />
      )}

      {/* Structured Data for Forum */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            description: metaDescription,
            url: canonicalUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${canonicalUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
            inLanguage: "ko-KR",
          }),
        }}
      />
    </Head>
  );
}

export default CustomHead;
