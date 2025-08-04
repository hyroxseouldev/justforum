"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { toast } from "sonner";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  ImageIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PreventForm from "@/components/ui/prevent-form";
import { SUBJECT_LIST } from "@/lib/subjects";

// 기존의 categories와 subjectId 제거하고 클라이언트용 enum 사용
const categories = SUBJECT_LIST;

// Zod 스키마 정의
const writePostSchema = z.object({
  category: z.enum(SUBJECT_LIST as [string, ...string[]]),
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(100, "제목은 100자 이내로 입력해주세요."),
  content: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(10000, "내용은 10,000자 이내로 입력해주세요."),
});

type WritePostFormData = z.infer<typeof writePostSchema>;

// 카테고리 버튼 컴포넌트
interface CategoryButtonProps {
  category: (typeof categories)[number];
  isSelected: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isSelected,
  onClick,
}) => (
  <Button
    type="button"
    onClick={onClick}
    variant={isSelected ? "default" : "outline"}
    className="px-4 py-2 text-sm font-medium"
  >
    {category}
  </Button>
);

// 툴바 버튼 컴포넌트
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  children,
  title,
}) => (
  <Button
    type="button"
    onClick={onClick}
    title={title}
    variant={isActive ? "default" : "ghost"}
    size="sm"
    className="p-2"
  >
    {children}
  </Button>
);

// 메인 글쓰기 폼 컴포넌트
export const WritePostForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  const createPost = useMutation(api.posts.createWithSubject);

  const form = useForm<WritePostFormData>({
    resolver: zodResolver(writePostSchema),
    defaultValues: {
      category: "question",
      title: "",
      content: "",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isDirty },
  } = form;

  const watchedValues = watch();

  // 변경사항 감지
  useEffect(() => {
    const isFormDirty =
      isDirty ||
      (watchedValues.title && watchedValues.title.trim() !== "") ||
      (watchedValues.content && watchedValues.content.trim() !== "");

    console.log("Form state:", {
      isDirty,
      title: watchedValues.title,
      content: watchedValues.content,
      isFormDirty,
      hasUnsavedChanges: Boolean(isFormDirty),
    });

    setHasUnsavedChanges(Boolean(isFormDirty));
  }, [isDirty, watchedValues.title, watchedValues.content]);

  // TipTap 에디터 설정
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setValue("content", content, { shouldValidate: true });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // 툴바 액션들
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();
  const setH1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const setH2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run();

  const addLink = () => {
    const url = window.prompt("URL을 입력하세요:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: WritePostFormData) => {
    try {
      setIsSubmitting(true);

      await createPost({
        title: data.title,
        content: data.content,
        subject: data.category as "question" | "feedback",
        type: "general",
      });

      // convext muation
      toast.success("글이 성공적으로 작성되었습니다!");

      // 폼 리셋
      setValue("title", "");
      setValue("content", "");
      editor?.commands.clearContent();

      // 변경사항 없음으로 설정
      setHasUnsavedChanges(false);

      router.push("/");
    } catch (error) {
      toast.error("글 작성 중 오류가 발생했습니다.");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <PreventForm
      hasUnsavedChanges={hasUnsavedChanges}
      isSubmitting={isSubmitting}
    >
      <div className="max-w-4xl mx-auto p-6 bg-white">
        {/* 페이지 제목 */}
        {/* back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <p className="">뒤로가기</p>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">글쓰기</h1>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 카테고리 선택 */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {categories.map((category) => (
                        <CategoryButton
                          key={category}
                          category={category}
                          isSelected={field.value === category}
                          onClick={() => field.onChange(category)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    글의 카테고리를 선택해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제목 입력 */}
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="제목을 입력해주세요" {...field} />
                  </FormControl>
                  <FormDescription>
                    글의 제목을 입력해주세요. (최대 100자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 에디터 */}
            <FormField
              control={control}
              name="content"
              render={() => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      {/* 툴바 */}
                      <div className="flex items-center gap-1 p-3 bg-gray-50 border-b border-gray-200">
                        <ToolbarButton onClick={undo} title="실행 취소">
                          <Undo size={16} />
                        </ToolbarButton>
                        <ToolbarButton onClick={redo} title="다시 실행">
                          <Redo size={16} />
                        </ToolbarButton>

                        <div className="w-px h-5 bg-gray-300 mx-1" />

                        <ToolbarButton onClick={setH1} title="제목 1">
                          <span className="text-sm font-bold">H1</span>
                        </ToolbarButton>
                        <ToolbarButton onClick={setH2} title="제목 2">
                          <span className="text-sm font-bold">H2</span>
                        </ToolbarButton>

                        <div className="w-px h-5 bg-gray-300 mx-1" />

                        <ToolbarButton
                          onClick={toggleBold}
                          isActive={editor.isActive("bold")}
                          title="굵게"
                        >
                          <Bold size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={toggleItalic}
                          isActive={editor.isActive("italic")}
                          title="기울임"
                        >
                          <Italic size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={toggleUnderline}
                          isActive={editor.isActive("underline")}
                          title="밑줄"
                        >
                          <Underline size={16} />
                        </ToolbarButton>
                        <ToolbarButton
                          onClick={toggleStrike}
                          isActive={editor.isActive("strike")}
                          title="취소선"
                        >
                          <Strikethrough size={16} />
                        </ToolbarButton>

                        <div className="w-px h-5 bg-gray-300 mx-1" />

                        <ToolbarButton onClick={addLink} title="링크 삽입">
                          <LinkIcon size={16} />
                        </ToolbarButton>
                        <ToolbarButton onClick={addImage} title="이미지 삽입">
                          <ImageIcon size={16} />
                        </ToolbarButton>
                      </div>

                      {/* 에디터 콘텐츠 */}
                      <div className="min-h-[400px]">
                        <EditorContent editor={editor} />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    글의 내용을 작성해주세요. (최대 10,000자)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼 */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    작성 중...
                  </>
                ) : (
                  "작성 완료"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PreventForm>
  );
};

export default WritePostForm;
