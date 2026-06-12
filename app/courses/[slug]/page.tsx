import { CourseDetailClient } from "@/components/courses/CourseDetailClient";
import { prisma } from "@/lib/server/db";
import { Metadata } from "next";

async function getCourseMetadata(slug: string) {
  "use cache";
  try {
    return await prisma.course.findUnique({
      where: { slug },
      select: { title: true, description: true },
    });
  } catch (error) {
    console.warn(`Database connection failed during build for metadata slug ${slug}:`, error);
    return {
      title: slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
      description: "A course on AeroMind.",
    };
  }
}

export async function generateStaticParams() {
  try {
    const courses = await prisma.course.findMany({
      select: { slug: true },
    });
    if (courses.length === 0) {
      return [{ slug: "advanced-swiss-typography" }];
    }
    return courses.map((c) => ({
      slug: c.slug,
    }));
  } catch (error) {
    console.warn("Database connection failed during build for generateStaticParams:", error);
    return [{ slug: "advanced-swiss-typography" }];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  if (!slug || slug.startsWith("[") || slug.startsWith("%")) {
    return {
      title: "Course Details - AeroMind",
    };
  }

  const course = await getCourseMetadata(slug);

  if (!course) {
    return {
      title: "Course Not Found - AeroMind",
    };
  }

  return {
    title: `${course.title} - AeroMind`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return <CourseDetailClient slug={slug} />;
}
