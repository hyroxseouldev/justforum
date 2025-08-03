import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 샘플 데이터를 생성합니다.
 * 개발 환경에서만 사용하세요.
 */
export const generateSampleData = mutation({
  args: {},
  returns: v.object({
    usersCreated: v.number(),
    subjectsCreated: v.number(),
    postsCreated: v.number(),
  }),
  handler: async (ctx) => {
    // 샘플 사용자 생성
    const sampleUsers = [
      { clerkId: "sample_user_1", name: "김철수" },
      { clerkId: "sample_user_2", name: "이영희" },
      { clerkId: "sample_user_3", name: "박민수" },
      { clerkId: "sample_user_4", name: "정은지" },
      { clerkId: "sample_user_5", name: "최준호" },
    ];

    const userIds = [];
    for (const user of sampleUsers) {
      const userId = await ctx.db.insert("users", user);
      userIds.push(userId);
    }

    // 샘플 주제 생성
    const sampleSubjects = [
      { name: "자유게시판", description: "자유롭게 이야기하는 공간입니다." },
      { name: "공지사항", description: "중요한 공지사항을 확인하세요." },
      {
        name: "기술토론",
        description: "개발 관련 기술 토론을 나누는 곳입니다.",
      },
      {
        name: "질문답변",
        description: "궁금한 것이 있으면 언제든지 질문하세요.",
      },
      { name: "정보공유", description: "유용한 정보를 공유해주세요." },
    ];

    const subjectIds = [];
    for (const subject of sampleSubjects) {
      const subjectId = await ctx.db.insert("subjects", subject);
      subjectIds.push(subjectId);
    }

    // 샘플 포스트 생성 (30개)
    const samplePosts = [
      {
        title: "포럼에 오신 것을 환영합니다!",
        content:
          "안녕하세요! 새로운 포럼이 개설되었습니다. 많은 관심과 참여 부탁드립니다. 자유롭게 의견을 나누고 소통하는 공간이 되었으면 좋겠습니다.",
        type: "notice" as const,
        subjectIndex: 1, // 공지사항
        authorIndex: 0,
      },
      {
        title: "포럼 이용 규칙 안내",
        content:
          "포럼을 이용하실 때 지켜주셔야 할 기본 규칙들입니다:\n\n1. 서로를 존중하는 마음으로 대화해주세요.\n2. 스팸이나 광고성 게시물은 삼가주세요.\n3. 건전한 토론 문화를 만들어가요.\n4. 개인정보 보호에 유의해주세요.\n\n모두가 즐겁게 사용할 수 있는 공간이 되었으면 좋겠습니다.",
        type: "notice" as const,
        subjectIndex: 1, // 공지사항
        authorIndex: 0,
      },
      {
        title: "React 18의 새로운 기능들",
        content:
          "React 18에서 도입된 Concurrent Features에 대해 논의해보고 싶습니다. Suspense, useTransition 등의 새로운 기능들을 실제 프로젝트에 적용해보신 분 계신가요?",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 1,
      },
      {
        title: "Next.js 13 App Router 사용 후기",
        content:
          "Next.js 13의 App Router를 실제 프로젝트에 적용해봤는데, Pages Router와 비교했을 때 장단점이 확실히 있네요. 특히 레이아웃 시스템이 많이 개선되었어요.",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 1,
      },
      {
        title: "Vue 3 Composition API vs Options API",
        content:
          "Vue 3에서 Composition API를 사용해보니 Options API와는 확실히 다른 장점들이 있네요. 특히 타입스크립트와의 호환성이 좋아졌어요. 어떤 방식을 선호하시나요?",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 2,
      },
      {
        title: "Docker와 Kubernetes 입문",
        content:
          "컨테이너 기술에 대해 공부하고 있는데, Docker는 어느 정도 이해했지만 Kubernetes는 아직 어렵네요. 실무에서 어떻게 활용하고 계신지 궁금합니다.",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 3,
      },
      {
        title: "GraphQL vs REST API 선택 기준",
        content:
          "새 프로젝트에서 API 설계를 고민하고 있습니다. GraphQL과 REST API 중 어떤 것을 선택해야 할지 각각의 장단점과 사용 사례를 공유해주세요.",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 4,
      },
      {
        title: "TypeScript 타입 가드 질문",
        content:
          "TypeScript에서 타입 가드를 사용할 때 any 타입을 피하는 좋은 방법이 있을까요? 특히 API 응답을 처리할 때 런타임 타입 체크가 어렵네요.",
        type: "general" as const,
        subjectIndex: 3, // 질문답변
        authorIndex: 2,
      },
      {
        title: "Git merge vs rebase 언제 사용하나요?",
        content:
          "Git을 사용하면서 merge와 rebase 중 어떤 것을 언제 사용해야 하는지 헷갈립니다. 각각의 장단점과 적절한 사용 시점에 대해 알려주세요.",
        type: "general" as const,
        subjectIndex: 3, // 질문답변
        authorIndex: 2,
      },
      {
        title: "CSS Grid와 Flexbox 언제 사용하나요?",
        content:
          "CSS 레이아웃을 구성할 때 Grid와 Flexbox 중 어떤 것을 선택해야 할지 항상 고민됩니다. 각각의 적절한 사용 시나리오를 알려주세요.",
        type: "general" as const,
        subjectIndex: 3, // 질문답변
        authorIndex: 1,
      },
      {
        title: "웹 접근성 테스트 방법",
        content:
          "웹 접근성을 고려한 개발을 하려고 하는데, 어떤 도구나 방법으로 테스트하는 것이 좋을까요? 실무에서 사용하고 있는 방법을 공유해주세요.",
        type: "general" as const,
        subjectIndex: 3, // 질문답변
        authorIndex: 3,
      },
      {
        title: "모바일 앱 개발 프레임워크 추천",
        content:
          "모바일 앱 개발을 시작하려고 하는데 React Native, Flutter, 네이티브 개발 중 어떤 것을 선택해야 할지 고민입니다. 각각의 장단점을 알려주세요.",
        type: "general" as const,
        subjectIndex: 3, // 질문답변
        authorIndex: 4,
      },
      {
        title: "유용한 VS Code 확장 프로그램 추천",
        content:
          "개발 생산성을 높여주는 VS Code 확장 프로그램들을 공유해요!\n\n제가 추천하는 것들:\n- Prettier\n- ESLint\n- Thunder Client\n- GitLens\n\n여러분만의 추천 확장 프로그램이 있다면 댓글로 공유해주세요!",
        type: "general" as const,
        subjectIndex: 4, // 정보공유
        authorIndex: 3,
      },
      {
        title: "개발자를 위한 유용한 Chrome 확장 프로그램",
        content:
          "웹 개발할 때 유용한 Chrome 확장 프로그램들을 정리해봤습니다:\n\n- React Developer Tools\n- Vue.js devtools\n- Redux DevTools\n- Web Developer\n- ColorZilla\n- Wappalyzer\n\n추가로 추천하고 싶은 확장 프로그램이 있으시면 댓글로 알려주세요!",
        type: "general" as const,
        subjectIndex: 4, // 정보공유
        authorIndex: 3,
      },
      {
        title: "무료 개발 리소스 모음",
        content:
          "개발할 때 유용한 무료 리소스들을 정리해봤습니다:\n\n📚 학습 자료:\n- freeCodeCamp\n- MDN Web Docs\n- W3Schools\n\n🎨 디자인:\n- Figma (무료 플랜)\n- Unsplash (무료 이미지)\n- Heroicons\n\n🔧 도구:\n- GitHub (무료 플랜)\n- Vercel (무료 호스팅)\n- MongoDB Atlas (무료 플랜)",
        type: "general" as const,
        subjectIndex: 4, // 정보공유
        authorIndex: 1,
      },
      {
        title: "프론트엔드 성능 최적화 팁",
        content:
          "웹 성능 최적화를 위한 실용적인 팁들을 공유합니다:\n\n1. 이미지 최적화 (WebP, lazy loading)\n2. 코드 분할 (Code Splitting)\n3. 트리 쉐이킹 (Tree Shaking)\n4. CDN 활용\n5. 캐싱 전략\n\n실제로 적용해본 경험이나 추가 팁이 있으시면 공유해주세요!",
        type: "general" as const,
        subjectIndex: 4, // 정보공유
        authorIndex: 2,
      },
      {
        title: "백엔드 개발자를 위한 필수 도구들",
        content:
          "백엔드 개발에 유용한 도구들을 정리해봤습니다:\n\n🔍 API 테스트:\n- Postman\n- Insomnia\n- HTTPie\n\n📊 모니터링:\n- New Relic\n- DataDog\n- Grafana\n\n🗄️ 데이터베이스:\n- DBeaver\n- MongoDB Compass\n- Redis Desktop Manager",
        type: "general" as const,
        subjectIndex: 4, // 정보공유
        authorIndex: 4,
      },
      {
        title: "코드 리뷰 문화에 대한 생각",
        content:
          "팀에서 코드 리뷰를 도입하려고 하는데, 효과적인 코드 리뷰 방법에 대해 의견을 나누고 싶습니다. 어떤 점들을 중점적으로 봐야 할까요?",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 4,
      },
      {
        title: "원격 근무 개발 환경 세팅 팁",
        content:
          "재택근무를 하면서 개발 환경을 효율적으로 구성하는 방법에 대해 이야기해보고 싶습니다. 모니터 구성, 키보드/마우스, 의자 등 여러분의 노하우를 공유해주세요!",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 4,
      },
      {
        title: "개발자의 업무 효율성 향상 방법",
        content:
          "개발 업무의 효율성을 높이기 위해 어떤 방법들을 사용하고 계신가요? 시간 관리, 집중력 향상, 스트레스 관리 등 다양한 측면에서 경험을 공유해주세요.",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 1,
      },
      {
        title: "사이드 프로젝트 경험담",
        content:
          "사이드 프로젝트를 진행하면서 겪은 경험들을 나누고 싶어요. 기획부터 배포까지의 과정에서 어려웠던 점과 배운 점들을 공유해주세요!",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 2,
      },
      {
        title: "개발자 커뮤니티 추천",
        content:
          "개발 관련 정보를 얻거나 네트워킹할 수 있는 좋은 커뮤니티나 모임이 있다면 추천해주세요. 온라인/오프라인 모두 환영합니다!",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 3,
      },
      {
        title: "개발 서적 추천 및 후기",
        content:
          "최근에 읽은 개발 관련 서적 중 추천하고 싶은 책이 있으신가요? 간단한 후기와 함께 공유해주세요. 저는 최근에 '클린 코드'를 다시 읽어봤는데 여전히 유용한 내용이 많더라고요.",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 1,
      },
      {
        title: "개발자 번아웃 극복기",
        content:
          "개발하다 보면 가끔 번아웃이 오는 것 같아요. 비슷한 경험이 있으신 분들은 어떻게 극복하셨나요? 휴식을 취하는 방법이나 동기부여를 다시 찾는 방법을 공유해주세요.",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 2,
      },
      {
        title: "주니어 개발자에게 조언",
        content:
          "개발을 시작한 지 얼마 안 된 주니어 개발자들에게 해주고 싶은 조언이 있다면 무엇인가요? 기술적인 부분뿐만 아니라 커리어나 마인드셋에 관한 이야기도 좋습니다.",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 4,
      },
      {
        title: "개발 트렌드 2024",
        content:
          "2024년 개발 트렌드에 대해 어떻게 생각하시나요? AI/ML의 발전, 새로운 프레임워크들, 개발 방법론의 변화 등 다양한 관점에서 의견을 나눠보아요.",
        type: "general" as const,
        subjectIndex: 0, // 자유게시판
        authorIndex: 3,
      },
      {
        title: "개발 환경 Migration 경험",
        content:
          "기존 시스템을 새로운 기술 스택으로 마이그레이션한 경험이 있으신가요? 계획 수립부터 실행까지의 과정에서 주의해야 할 점들을 공유해주세요.",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 1,
      },
      {
        title: "마이크로서비스 아키텍처 도입기",
        content:
          "모놀리스에서 마이크로서비스로 전환하면서 겪은 경험을 공유합니다. 장점도 많지만 예상치 못한 복잡성도 있더라고요. 도입을 고려 중이신 분들께 도움이 되었으면 좋겠습니다.",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 3,
      },
      {
        title: "TDD 실무 적용 경험",
        content:
          "Test Driven Development를 실제 프로젝트에 적용해보신 분 계신가요? 이론적으로는 좋아 보이는데 실무에서는 시간적 제약 때문에 어려울 것 같아서 망설여집니다.",
        type: "general" as const,
        subjectIndex: 2, // 기술토론
        authorIndex: 2,
      },
      {
        title: "데이터베이스 인덱스 최적화 팁",
        content:
          "대용량 데이터를 다루면서 쿼리 성능 개선을 위해 인덱스를 최적화한 경험을 공유해주세요. 어떤 기준으로 인덱스를 설계하시고, 주의해야 할 점은 무엇인가요?",
        type: "general" as const,
        subjectIndex: 3, // 질문답변
        authorIndex: 4,
      },
    ];

    let postsCreated = 0;
    for (const post of samplePosts) {
      await ctx.db.insert("posts", {
        title: post.title,
        content: post.content,
        views: Math.floor(Math.random() * 100), // 랜덤 조회수
        subjectId: subjectIds[post.subjectIndex],
        type: post.type,
        authorId: userIds[post.authorIndex],
      });
      postsCreated++;
    }

    return {
      usersCreated: sampleUsers.length,
      subjectsCreated: sampleSubjects.length,
      postsCreated,
    };
  },
});

/**
 * 모든 샘플 데이터를 삭제합니다.
 * 개발 환경에서만 사용하세요.
 */
export const clearSampleData = mutation({
  args: {},
  returns: v.object({
    usersDeleted: v.number(),
    subjectsDeleted: v.number(),
    postsDeleted: v.number(),
    likesDeleted: v.number(),
    commentsDeleted: v.number(),
  }),
  handler: async (ctx) => {
    // 샘플 사용자들의 clerkId로 식별
    const sampleUserClerkIds = [
      "sample_user_1",
      "sample_user_2",
      "sample_user_3",
      "sample_user_4",
      "sample_user_5",
    ];

    // 샘플 사용자들 찾기
    const sampleUsers = [];
    for (const clerkId of sampleUserClerkIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();
      if (user) {
        sampleUsers.push(user);
      }
    }

    // 샘플 사용자들의 포스트 찾기 및 삭제
    let postsDeleted = 0;
    let likesDeleted = 0;
    let commentsDeleted = 0;

    for (const user of sampleUsers) {
      // 해당 사용자의 포스트들 찾기
      const userPosts = await ctx.db
        .query("posts")
        .withIndex("by_author", (q) => q.eq("authorId", user._id))
        .collect();

      for (const post of userPosts) {
        // 포스트의 좋아요들 삭제
        const postLikes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        for (const like of postLikes) {
          await ctx.db.delete(like._id);
          likesDeleted++;
        }

        // 포스트의 댓글들 삭제
        const postComments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        for (const comment of postComments) {
          await ctx.db.delete(comment._id);
          commentsDeleted++;
        }

        // 포스트 삭제
        await ctx.db.delete(post._id);
        postsDeleted++;
      }
    }

    // 샘플 주제들 삭제 (이름으로 식별)
    const sampleSubjectNames = [
      "자유게시판",
      "공지사항",
      "기술토론",
      "질문답변",
      "정보공유",
    ];
    let subjectsDeleted = 0;

    for (const subjectName of sampleSubjectNames) {
      const subject = await ctx.db
        .query("subjects")
        .withIndex("by_name", (q) => q.eq("name", subjectName))
        .first();

      if (subject) {
        await ctx.db.delete(subject._id);
        subjectsDeleted++;
      }
    }

    // 샘플 사용자들 삭제
    let usersDeleted = 0;
    for (const user of sampleUsers) {
      await ctx.db.delete(user._id);
      usersDeleted++;
    }

    return {
      usersDeleted,
      subjectsDeleted,
      postsDeleted,
      likesDeleted,
      commentsDeleted,
    };
  },
});

/**
 * 샘플 좋아요 데이터를 생성합니다.
 */
export const generateSampleLikes = mutation({
  args: {},
  returns: v.object({
    likesCreated: v.number(),
  }),
  handler: async (ctx) => {
    // 모든 샘플 사용자와 포스트 가져오기
    const sampleUserClerkIds = [
      "sample_user_1",
      "sample_user_2",
      "sample_user_3",
      "sample_user_4",
      "sample_user_5",
    ];

    const sampleUsers = [];
    for (const clerkId of sampleUserClerkIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();
      if (user) {
        sampleUsers.push(user);
      }
    }

    const allPosts = await ctx.db.query("posts").collect();

    let likesCreated = 0;

    // 각 포스트에 랜덤하게 좋아요 추가
    for (const post of allPosts) {
      const numberOfLikes = Math.floor(Math.random() * 4); // 0-3개의 좋아요
      const shuffledUsers = [...sampleUsers].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numberOfLikes && i < shuffledUsers.length; i++) {
        // 이미 좋아요가 있는지 확인
        const existingLike = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", shuffledUsers[i]._id).eq("postId", post._id)
          )
          .first();

        if (!existingLike) {
          await ctx.db.insert("likes", {
            userId: shuffledUsers[i]._id,
            postId: post._id,
          });
          likesCreated++;
        }
      }
    }

    return { likesCreated };
  },
});
