-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'AWAITING_DOCS', 'QUOTED', 'CLOSED', 'NOT_INTERESTED', 'SPAM');

-- CreateEnum
CREATE TYPE "LeadFormType" AS ENUM ('CAR_ACT', 'ACCIDENT', 'PROPERTY', 'OTHER');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('CAR_ACT', 'ACCIDENT', 'PROPERTY');

-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('CAR_ACT', 'ACCIDENT', 'PROPERTY', 'GENERAL', 'FAQ');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpCodeHash" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "resetTokenHash" TEXT,
    "resetExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "formType" "LeadFormType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "province" TEXT,
    "details" JSONB,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT true,
    "emailError" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAttachment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "bannerImage" TEXT,
    "bannerAlt" TEXT,
    "summary" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "premium" TEXT NOT NULL,
    "conditions" TEXT,
    "pdfUrl" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonTable" (
    "id" TEXT NOT NULL,
    "insurancePageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComparisonTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanRow" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "coverageItem" TEXT NOT NULL,
    "planValues" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlanRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverAlt" TEXT,
    "category" "ArticleCategory" NOT NULL DEFAULT 'GENERAL',
    "insurancePageId" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoMeta" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "keywords" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_formType_idx" ON "Lead"("formType");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_expiresAt_idx" ON "Lead"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePage_slug_key" ON "InsurancePage"("slug");

-- CreateIndex
CREATE INDEX "InsurancePage_type_idx" ON "InsurancePage"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonTable_insurancePageId_key" ON "ComparisonTable"("insurancePageId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMeta_pageKey_key" ON "SeoMeta"("pageKey");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- AddForeignKey
ALTER TABLE "LeadAttachment" ADD CONSTRAINT "LeadAttachment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonTable" ADD CONSTRAINT "ComparisonTable_insurancePageId_fkey" FOREIGN KEY ("insurancePageId") REFERENCES "InsurancePage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRow" ADD CONSTRAINT "PlanRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "ComparisonTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_insurancePageId_fkey" FOREIGN KEY ("insurancePageId") REFERENCES "InsurancePage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
