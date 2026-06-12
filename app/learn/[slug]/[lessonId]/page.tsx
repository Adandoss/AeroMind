import { LearnClient } from "@/components/learn/LearnClient";
import { prisma } from "@/lib/server/db";
import { Metadata } from "next";

async function getLessonMetadata(lessonId: string) {
  "use cache";
  try {
    return await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true },
    });
  } catch (error) {
    console.warn(`Database connection failed during build for lesson metadata ID ${lessonId}:`, error);
    return {
      title: "Lesson Player",
    };
  }
}

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;

  if (!lessonId || lessonId.startsWith("[") || lessonId.startsWith("%")) {
    return {
      title: "Lesson Player - AeroMind",
    };
  }

  const lesson = await getLessonMetadata(lessonId);

  if (!lesson) {
    return {
      title: "Lesson Player - AeroMind",
    };
  }

  return {
    title: `${lesson.title} - AeroMind`,
  };
}

export default async function LearnPage({ params }: PageProps) {
  const { slug, lessonId } = await params;

  return <LearnClient slug={slug} lessonId={lessonId} />;
}
