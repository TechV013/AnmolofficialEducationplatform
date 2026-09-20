import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ChevronRight,
  Star,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
  MessageCircle,
  GraduationCap,
  MonitorPlay,
  PartyPopper
} from "lucide-react";
import { getCourseById, getPublishedCourses } from "@/services/courses/courses.service";
import { hasCourseAccess } from "@/services/enrollmentService";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { discountPercent } from "@/lib/course-stats";
import HeroMedia from "@/components/courses/HeroMedia";
import CourseTabs from "@/components/courses/CourseTabs";
import CurriculumList from "@/components/courses/CurriculumList";
import InstructorCard from "@/components/courses/InstructorCard";
import RatingSummary from "@/components/courses/RatingSummary";
import CourseCard from "@/components/home/CourseCard";
import EnrollButton from "./EnrollButton";
import ReviewSection from "./ReviewSection";
import StickyMobileEnrollBar from "./StickyMobileEnrollBar";

const WHATSAPP_NUMBER = "917073345025";

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700"
};

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) {
    return { title: "Course Not Found", robots: { index: false, follow: false } };
  }
  return {
    title: `${course.title} | Anmolofficial`,
    description: course.description || `Learn ${course.title}`,
    alternates: { canonical: `/courses/${course.id}` },
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
      url: `https://www.anmolofficial.com/courses/${course.id}`,
      images: course.thumbnail ? [{ url: course.thumbnail }] : undefined
    },
    robots: { index: true, follow: true }
  };
}

const STAR_MAP = [1, 2, 3, 4, 5];

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  // Server-side draft/archive access control (no client-side hiding)
  if (course.status !== "PUBLISHED") {
    const viewer = await getCurrentUser();
    if (!viewer) notFound();
    if (viewer.role === "ADMIN") {
      // admin allowed
    } else if (viewer.role === "INSTRUCTOR") {
      const assignment = await prisma.courseInstructor.findUnique({
        where: { courseId_userId: { courseId: course.id, userId: viewer.id } }
      });
      if (!assignment) notFound();
    } else {
      notFound();
    }
  }

  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);
  const isEnrolled = user ? await hasCourseAccess(user.id, course.id) : false;

  const reviews = await prisma.review.findMany({
    where: { courseId: course.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, repliedBy: { select: { name: true } } }
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const distribution = STAR_MAP.map((n) => ({
    rating: n,
    count: reviews.filter((r) => r.rating === n).length
  }));
  const reviewItems = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    reply: r.reply,
    createdByName: r.user.name || "Student"
  }));

  const related = (await getPublishedCourses())
    .filter((c) => c.id !== course.id)
    .sort((a, b) =>
      (b.category === course.category ? 1 : 0) - (a.category === course.category ? 1 : 0) ||
      b.students - a.students
    )
    .slice(0, 3);

  const discount = course.priceOld && course.priceOld > course.price
    ? (discountPercent(course.price, course.priceOld) ?? 0)
    : 0;

  const priceLabel = `₹${course.price.toLocaleString("en-IN")}`;
  const mrpLabel = course.priceOld && course.priceOld > course.price
    ? `₹${course.priceOld.toLocaleString("en-IN")}`
    : undefined;

  const faqItems = [
    {
      q: "How do I access the course?",
      a: "As soon as you enroll, every lesson unlocks in your My Learning dashboard. Start immediately and learn at your own pace — on any device."
    },
    {
      q: "Do I need any prior experience?",
      a: course.requirements.length > 0
        ? `This course is designed to be approachable. Recommended starting points: ${course.requirements.join(", ")}.`
        : "No. This course is designed to take you from the basics all the way through, step by step."
    },
    {
      q: "Will I get a certificate?",
      a: "Yes. Complete the lessons and assignments to unlock a shareable certificate of completion."
    },
    {
      q: "What if it's not the right fit?",
      a: "You're covered by a 30-day money-back guarantee. If it isn't right for you, reach out on WhatsApp and we'll refund you, no questions asked."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/courses" className="hover:text-primary">Courses</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="max-w-[18rem] truncate font-semibold text-text">{course.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Left: hero + tabs */}
          <div className="min-w-0">
            <HeroMedia thumbnail={course.thumbnail || undefined} title={course.title} category={course.category} promoVideoUrl={course.promoVideoUrl} />

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-soft-blue px-3 py-1 text-xs font-bold text-primary">{course.category}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${LEVEL_STYLES[course.level] ?? "bg-slate-100 text-slate-600"}`}>
                  {course.level}
                </span>
                {course.isFree ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">FREE</span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Paid</span>
                )}
                {course.status === "DRAFT" && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">DRAFT — PREVIEW ONLY</span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{course.title}</h1>
              <p className="mt-3 text-muted">{course.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-text">{avgRating.toFixed(1)}</span>
                  <span className="flex gap-0.5">
                    {STAR_MAP.map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                      />
                    ))}
                  </span>
                  <span>({reviews.length === 0 ? "no ratings" : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`})</span>
                </span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> {course.students.toLocaleString()} students</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> {course.totalLessons} lessons</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {course.duration}</span>
              </div>
            </div>

            <div className="mt-4">
              <CourseTabs
                about={
                  <div className="space-y-8">
                    <section>
                      <h2 className="mb-4 text-lg font-bold text-text">What you&apos;ll learn</h2>
                      {course.whatYouWillLearn.length > 0 ? (
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {course.whatYouWillLearn.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-3 text-sm text-text">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">Learning outcomes are being finalized.</p>
                      )}
                    </section>

                    <section>
                      <h2 className="mb-3 text-lg font-bold text-text">Requirements</h2>
                      {course.requirements.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted">
                          {course.requirements.map((req, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-primary">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">No special requirements — just bring your curiosity.</p>
                      )}
                    </section>

                    <section>
                      <h2 className="mb-3 text-lg font-bold text-text">Description</h2>
                      <p className="text-sm leading-relaxed text-muted">{course.description}</p>
                    </section>
                  </div>
                }
                curriculum={<CurriculumList modules={course.modules} />}
                reviews={
                  <div className="space-y-6">
                    <RatingSummary avgRating={avgRating} reviewsCount={reviews.length} distribution={distribution} />
                    <ReviewSection courseId={course.id} reviews={reviewItems} canReview={isEnrolled} />
                  </div>
                }
              />
            </div>
          </div>

          {/* Right: sticky enrollment + instructor + help */}
          <aside className="space-y-5 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              {course.isFree ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-text">Free</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">100% off</span>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-extrabold text-text">{priceLabel}</span>
                  {mrpLabel && (
                    <>
                      <span className="pb-1 text-lg text-muted line-through">{mrpLabel}</span>
                      <span className="mb-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{discount}% off</span>
                    </>
                  )}
                </div>
              )}

              <div className="mt-5">
                <EnrollButton courseId={course.id} isFree={course.isFree} isEnrolled={isEnrolled} isSignedIn={isSignedIn} />
              </div>

              {!course.isFree && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  30-day money-back guarantee
                </div>
              )}

              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">This course includes</p>
                <ul className="space-y-2.5 text-sm text-text">
                  <li className="flex items-center gap-3"><MonitorPlay className="h-4 w-4 text-primary" /> {course.totalLessons} lessons on demand</li>
                  <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" /> {course.duration} of content</li>
                  <li className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-primary" /> Certificate of completion</li>
                  <li className="flex items-center gap-3"><PartyPopper className="h-4 w-4 text-primary" /> Lifetime access</li>
                </ul>
              </div>
            </div>

            <InstructorCard name={course.instructorName || "Anmolofficial Team"} />

            <div className="rounded-xl border border-border bg-gradient-to-br from-[#172554] to-primary/90 p-5 text-white">
              <p className="flex items-center gap-2 font-bold"><BadgeCheck className="h-4 w-4" /> Still have questions?</p>
              <p className="mt-1 text-xs text-white/80">Chat with our team and we&apos;ll help you choose the right course.</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I have a question about a course.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-soft-blue"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>

        {/* Related courses */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-xl font-bold text-text">Related courses</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold text-text">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqItems.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-white open:bg-soft-blue/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-text">
                  {f.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-4 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <StickyMobileEnrollBar
        courseId={course.id}
        isFree={course.isFree}
        isEnrolled={isEnrolled}
        isSignedIn={isSignedIn}
        priceLabel={priceLabel}
        mrpLabel={mrpLabel}
        discount={discount}
      />
    </div>
  );
}