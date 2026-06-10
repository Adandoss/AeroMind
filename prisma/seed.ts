import "dotenv/config";
import { hashSync } from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, Category } from "../generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

type LessonSeed = {
  title: string;
  durationMin: number;
  content: string;
  isFreePreview?: boolean;
};

type ModuleSeed = { title: string; lessons: LessonSeed[] };

type CourseSeed = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  priceCents: number;
  weeks: number;
  rating: number;
  ratingCount: number;
  instructor: string;
  modules: ModuleSeed[];
};

const lesson = (
  title: string,
  durationMin: number,
  body: string,
  isFreePreview = false,
): LessonSeed => ({
  title,
  durationMin,
  content: `${body}\n\n> Practice: apply this concept in a small exercise before moving on.`,
  isFreePreview,
});

const courses: CourseSeed[] = [
  {
    slug: "ui-ux-masterclass",
    title: "AeroMind: UI/UX Masterclass",
    description:
      "A rigorous walk through layout systems, proportions and visual hierarchy for interface designers.",
    category: Category.DESIGN,
    priceCents: 6999,
    weeks: 10,
    rating: 4.9,
    ratingCount: 1450,
    instructor: "Elena Rossi",
    modules: [
      {
        title: "Module 1: Layout Fundamentals",
        lessons: [
          lesson(
            "1.1 Introduction to Grids",
            4,
            "Grids bring order to interfaces. A grid divides the canvas into columns and gutters, giving every element a predictable place.",
            true,
          ),
          lesson(
            "1.2 The 8-Point Grid System",
            7,
            "The 8-point grid sizes and spaces elements in multiples of 8px. It keeps spacing consistent across screens and aligns with common display densities.",
          ),
        ],
      },
      {
        title: "Module 2: Advanced Proportions",
        lessons: [
          lesson(
            "2.1 The Golden Ratio",
            12,
            "The Golden Ratio (~1.618) appears when the ratio of two quantities equals the ratio of their sum to the larger one. Dividing a 1200px container by 1.618 yields ~742px for content and ~458px for a sidebar.",
          ),
          lesson(
            "2.2 The Rule of Thirds",
            8,
            "Splitting a composition into thirds places focal points on intersection lines. It is a faster, looser cousin of the Golden Ratio for everyday layout work.",
          ),
          lesson(
            "2.3 Designing with Modular Scales",
            10,
            "A modular scale multiplies a base size by a fixed ratio to produce a harmonious set of font sizes and spacing tokens.",
          ),
        ],
      },
    ],
  },
  {
    slug: "advanced-swiss-typography",
    title: "Advanced Swiss Typography",
    description:
      "Master the typographic principles of the International Style: hierarchy, whitespace and grid-driven composition.",
    category: Category.DESIGN,
    priceCents: 4999,
    weeks: 6,
    rating: 4.8,
    ratingCount: 320,
    instructor: "Markus Keller",
    modules: [
      {
        title: "Module 1: Foundations",
        lessons: [
          lesson(
            "1.1 The International Style",
            6,
            "Swiss typography favors objective clarity: sans-serif faces, flush-left text and mathematical grids.",
            true,
          ),
          lesson(
            "1.2 Choosing a Typeface",
            8,
            "A small set of well-chosen weights beats a large family. Evaluate x-height, aperture and rhythm before committing.",
          ),
        ],
      },
      {
        title: "Module 2: Hierarchy in Practice",
        lessons: [
          lesson(
            "2.1 Scale and Weight",
            9,
            "Hierarchy is built with size, weight and space - in that order. Reach for color only when those three are exhausted.",
          ),
          lesson(
            "2.2 Whitespace as a Tool",
            7,
            "Whitespace groups related elements and separates unrelated ones. Generous margins are a feature, not wasted space.",
          ),
        ],
      },
    ],
  },
  {
    slug: "interaction-design-systems",
    title: "Interaction Design Systems",
    description:
      "Design scalable interaction patterns: states, feedback loops and motion that communicates intent.",
    category: Category.INTERFACE,
    priceCents: 5999,
    weeks: 12,
    rating: 4.9,
    ratingCount: 1200,
    instructor: "Sofia Lindqvist",
    modules: [
      {
        title: "Module 1: States and Feedback",
        lessons: [
          lesson(
            "1.1 The Anatomy of a Component State",
            8,
            "Every interactive component needs visible default, hover, focus, active, disabled and error states.",
            true,
          ),
          lesson(
            "1.2 Feedback Timing",
            6,
            "Respond to user input within 100ms, show progress past 1s, and explain delays past 10s.",
          ),
        ],
      },
      {
        title: "Module 2: Motion with Meaning",
        lessons: [
          lesson(
            "2.1 Easing and Duration",
            7,
            "Motion should explain spatial relationships, not decorate. Keep UI transitions between 150 and 300ms.",
          ),
          lesson(
            "2.2 Choreography",
            9,
            "When several elements move, stagger them slightly so the eye can follow cause and effect.",
          ),
        ],
      },
    ],
  },
  {
    slug: "frontend-precision-for-designers",
    title: "Front-end Precision for Designers",
    description:
      "Bridge the gap between design files and shipped interfaces with HTML, CSS and component thinking.",
    category: Category.ENGINEERING,
    priceCents: 4499,
    weeks: 8,
    rating: 4.7,
    ratingCount: 540,
    instructor: "Jonas Weber",
    modules: [
      {
        title: "Module 1: From Mockup to Markup",
        lessons: [
          lesson(
            "1.1 Semantic Structure",
            7,
            "Markup mirrors meaning: headings outline the document, lists group items, buttons trigger actions and links navigate.",
            true,
          ),
          lesson(
            "1.2 Layout with Flexbox and Grid",
            10,
            "Flexbox distributes space along one axis; CSS Grid controls two. Pick per component, not per project.",
          ),
        ],
      },
      {
        title: "Module 2: Design Tokens in Code",
        lessons: [
          lesson(
            "2.1 Custom Properties",
            6,
            "CSS custom properties carry your color, spacing and type scales into code as a single source of truth.",
          ),
          lesson(
            "2.2 Responsive Type",
            8,
            "Fluid type with clamp() keeps hierarchy intact from phone to desktop without breakpoint jumps.",
          ),
        ],
      },
    ],
  },
  {
    slug: "applied-software-architecture",
    title: "Applied Software Architecture",
    description:
      "Structural engineering for modern software systems, focused on reliability, speed and maintainability.",
    category: Category.ENGINEERING,
    priceCents: 7499,
    weeks: 16,
    rating: 5.0,
    ratingCount: 540,
    instructor: "Anna Kowalska",
    modules: [
      {
        title: "Module 1: Boundaries",
        lessons: [
          lesson(
            "1.1 Modules and Contracts",
            9,
            "Good architecture is mostly deciding what may not know about what. Define module boundaries by contracts, not folders.",
            true,
          ),
          lesson(
            "1.2 Layering Without Ceremony",
            8,
            "Layers earn their keep when they isolate change. Three thin layers beat seven empty ones.",
          ),
        ],
      },
      {
        title: "Module 2: Trade-offs",
        lessons: [
          lesson(
            "2.1 Architecture Decision Records",
            7,
            "An ADR captures context, alternatives and trade-offs while they are still fresh. Future maintainers read decisions, not minds.",
          ),
          lesson(
            "2.2 Choosing Boring Technology",
            6,
            "Every novel tool spends innovation tokens. Spend them on the problem, not the stack.",
          ),
        ],
      },
    ],
  },
  {
    slug: "precision-growth-strategy",
    title: "Precision Growth Strategy",
    description:
      "Deconstruct the metrics that matter and build a sustainable engine for institutional growth.",
    category: Category.MARKETING,
    priceCents: 2999,
    weeks: 8,
    rating: 4.7,
    ratingCount: 850,
    instructor: "Claire Dubois",
    modules: [
      {
        title: "Module 1: Metrics that Matter",
        lessons: [
          lesson(
            "1.1 North Star Metrics",
            6,
            "A north star metric ties product usage to delivered value. Pick one; guard it against vanity numbers.",
            true,
          ),
          lesson(
            "1.2 Funnels and Retention",
            8,
            "Acquisition means little without retention. Cohort curves expose whether value compounds or leaks.",
          ),
        ],
      },
      {
        title: "Module 2: Experimentation",
        lessons: [
          lesson(
            "2.1 Hypothesis Design",
            7,
            "A testable hypothesis names the audience, the change, the expected effect and the metric that will move.",
          ),
          lesson(
            "2.2 Reading Results Honestly",
            6,
            "Statistical significance is not business significance. Decide the decision rule before the data arrives.",
          ),
        ],
      },
    ],
  },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@aeromind.dev",
      name: "Ada Admin",
      passwordHash: hashSync("Admin123!", 10),
      role: "ADMIN",
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: "alex@aeromind.dev",
      name: "Alex Fischer",
      passwordHash: hashSync("Student123!", 10),
      role: "STUDENT",
    },
  });

  console.log("Creating courses...");
  for (const c of courses) {
    await prisma.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        category: c.category,
        priceCents: c.priceCents,
        weeks: c.weeks,
        rating: c.rating,
        ratingCount: c.ratingCount,
        instructor: c.instructor,
        published: true,
        modules: {
          create: c.modules.map((m, mi) => ({
            title: m.title,
            order: mi + 1,
            lessons: {
              create: m.lessons.map((l, li) => ({
                title: l.title,
                content: l.content,
                durationMin: l.durationMin,
                order: li + 1,
                isFreePreview: l.isFreePreview ?? false,
              })),
            },
          })),
        },
      },
    });
  }

  console.log("Creating subscription, order and progress for Alex...");
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.subscription.create({
    data: {
      userId: alex.id,
      plan: "PROFESSIONAL",
      status: "ACTIVE",
      currentPeriodEnd: in30Days,
    },
  });
  await prisma.order.create({
    data: {
      userId: alex.id,
      plan: "PROFESSIONAL",
      amountCents: 7900,
      status: "PAID",
    },
  });

  // Enroll Alex in two courses; complete a few lessons spread over the
  // last week so the dashboard chart has data.
  const daysAgo = (n: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const enrollmentPlan: { slug: string; completed: [number, number, number][] }[] = [
    // [moduleIndex, lessonIndex, daysAgo]
    {
      slug: "ui-ux-masterclass",
      completed: [
        [0, 0, 6],
        [0, 1, 4],
        [1, 0, 1],
      ],
    },
    {
      slug: "advanced-swiss-typography",
      completed: [
        [0, 0, 5],
        [0, 1, 2],
      ],
    },
  ];

  for (const plan of enrollmentPlan) {
    const course = await prisma.course.findUniqueOrThrow({
      where: { slug: plan.slug },
      include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
    });
    const enrollment = await prisma.enrollment.create({
      data: { userId: alex.id, courseId: course.id, enrolledAt: daysAgo(7, 9) },
    });
    for (const [mi, li, days] of plan.completed) {
      await prisma.lessonProgress.create({
        data: {
          enrollmentId: enrollment.id,
          lessonId: course.modules[mi].lessons[li].id,
          completedAt: daysAgo(days, 19),
        },
      });
    }
  }

  console.log(`Seed complete: ${courses.length} courses, 2 users (${admin.email}, ${alex.email}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
