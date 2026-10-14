-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "courseTaken" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "quote" TEXT NOT NULL,
    "videoUrl" TEXT,
    "thumbnail" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_isPublished_position_idx" ON "Testimonial"("isPublished", "position");

-- Seed: migrate the six testimonials that previously lived in src/data/courses.ts
INSERT INTO "Testimonial" ("id", "name", "role", "category", "courseTaken", "rating", "quote", "videoUrl", "thumbnail", "position", "isPublished", "createdAt", "updatedAt") VALUES
    (gen_random_uuid(), 'Rakesh Sharma', '3D Artist', '3D & Animation', 'Complete 3D Modeling Masterclass', 5, 'The 3D modeling course changed how I approach my projects. I landed my first character modeling gig within two months of finishing it.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Neha Kumari Mishra', 'VFX Artist', 'Rigging', 'Advanced Character Rigging', 5, 'Clear, structured lessons with real industry context. The mentorship pushed me to build a demo reel that actually got me hired.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Pooja Kumari Mishra', 'Motion Designer', '3D & Animation', 'Complete 3D Modeling Masterclass', 5, 'I finally understand why certain techniques work. The founder''s guidance on my portfolio made all the difference in interviews.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Shubam Kumar', 'Video Editor', 'Video Editing', 'Video Editing with Premiere Pro', 5, 'Practical editing projects from day one. I went from cutting home videos to editing commercial projects professionally.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Rahul Kumar Yadav', 'Animator', 'Rigging', 'Advanced Character Rigging', 5, 'Rigging used to feel overwhelming. Step-by-step lessons and timely feedback made it genuinely enjoyable to learn.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Kamal Kashyap', 'Filmmaker', 'Video Editing', 'Video Editing with Premiere Pro', 5, 'One conversation with the founder redirected my career. The course structure is built for real-world filmmaking, not just theory.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
