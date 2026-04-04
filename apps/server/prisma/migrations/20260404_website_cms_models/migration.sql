-- Pricing Plans
CREATE TABLE IF NOT EXISTS "pricing_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "monthly_price" INTEGER NOT NULL DEFAULT 0,
    "yearly_price" INTEGER NOT NULL DEFAULT 0,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "max_students" INTEGER,
    "features" JSONB NOT NULL DEFAULT '[]',
    "badge" TEXT,
    "cta_text" TEXT NOT NULL DEFAULT 'Start 14-Day Trial',
    "cta_link" TEXT NOT NULL DEFAULT '/signup.html',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "pricing_plans_slug_key" ON "pricing_plans"("slug");

-- Platform Blog Posts
CREATE TABLE IF NOT EXISTS "platform_blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "author" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta_title" TEXT,
    "meta_description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_blog_posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "platform_blog_posts_slug_key" ON "platform_blog_posts"("slug");
CREATE INDEX IF NOT EXISTS "platform_blog_posts_status_published_at_idx" ON "platform_blog_posts"("status", "published_at");

-- Team Members
CREATE TABLE IF NOT EXISTS "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "email" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- SEO Keywords
CREATE TABLE IF NOT EXISTS "seo_keywords" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "difficulty" INTEGER NOT NULL DEFAULT 0,
    "linked_pages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blog_post_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "auto_linked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seo_keywords_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "seo_keywords_keyword_key" ON "seo_keywords"("keyword");

-- Seed default pricing plans
INSERT INTO "pricing_plans" ("id", "name", "slug", "description", "monthly_price", "yearly_price", "is_custom", "max_students", "features", "badge", "cta_text", "cta_link", "sort_order", "is_active", "updated_at")
VALUES
  (gen_random_uuid(), 'Starter', 'starter', 'For small to mid-size schools up to 500 students.', 7999, 79990, false, 500,
   '["Dashboard & Analytics","Up to 500 students","All core modules","Finance (fee management, reports)","Exams & Report Cards","Attendance (manual + QR code)","Communication (announcements, circulars)","Email support (24hr response)"]',
   NULL, 'Start 14-Day Trial', '/signup.html', 0, true, NOW()),
  (gen_random_uuid(), 'Professional', 'professional', 'For growing schools up to 2,000 students.', 15999, 159990, false, 2000,
   '["Everything in Starter +","Up to 2,000 students","All modules + add-ons","LMS (courses, quizzes, video)","Operations (transport, hostel, assets)","Parent Portal + Custom branding","1,000 SMS/month included","5 admins, unlimited staff, 10GB"]',
   'Most Popular', 'Start 14-Day Trial', '/signup.html', 1, true, NOW()),
  (gen_random_uuid(), 'Enterprise', 'enterprise', 'For large institutions, unlimited scale.', 0, 0, true, NULL,
   '["Everything in Professional +","Unlimited students","Priority support (dedicated manager)","Advanced Attendance (biometric)","Multi-branch + API access","SSO + White-label option","Custom Reports Builder","Unlimited admins, 50GB storage"]',
   NULL, 'Contact Sales', '#contact', 2, true, NOW())
ON CONFLICT DO NOTHING;
