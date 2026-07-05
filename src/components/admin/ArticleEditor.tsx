"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticleAction, updateArticleAction } from "@/actions/articles";
import { uploadImageAction } from "@/actions/uploads";
import { ArticleCategory } from "@/generated/prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ArticleEditorProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    coverAlt: string | null;
    category: ArticleCategory;
    insurancePageId: string | null;
    seoTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    publishedAt: Date | string;
  } | null;
  insurancePages: Array<{ id: string; name: string }>;
}

export function ArticleEditor({ article, insurancePages }: ArticleEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [dimensions, setDimensions] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inputs
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [coverAlt, setCoverAlt] = useState(article?.coverAlt || "");

  // Measure dimensions of current cover image URL
  useEffect(() => {
    if (coverImage) {
      const img = new Image();
      img.onload = () => {
        setDimensions(`${img.width} x ${img.height} px`);
      };
      img.onerror = () => {
        setDimensions(null);
      };
      img.src = coverImage;
    } else {
      Promise.resolve().then(() => {
        setDimensions(null);
      });
    }
  }, [coverImage]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Display client-side file size
    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeString = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${sizeInKb} KB`;
    setFileSize(sizeString);

    // Display client-side image dimensions
    const img = new Image();
    img.onload = () => {
      setDimensions(`${img.width} x ${img.height} px`);
    };
    img.src = URL.createObjectURL(file);

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setCoverImage(res.url);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingImage(false);
    }
  };
  const [category, setCategory] = useState<ArticleCategory>(article?.category || "GENERAL");
  const [insurancePageId, setInsurancePageId] = useState(article?.insurancePageId || "");
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt
      ? new Date(article.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );

  // SEO Inputs
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription || "");
  const [keywords, setKeywords] = useState(article?.keywords || "");

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto generate slug if creating and slug is empty or matches previous slug
    if (!article && (!slug || slug === convertToSlug(title))) {
      setSlug(convertToSlug(val));
    }
  };

  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      // replace spaces and special characters with hyphens
      .replace(/[^a-zA-Z0-9\u0e00-\u0e7f\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSave = () => {
    setErrorMessage(null);
    const slugTrimmed = slug.trim().toLowerCase();
    
    if (!title.trim()) {
      setErrorMessage("กรุณากรอกหัวข้อบทความ");
      return;
    }
    if (!slugTrimmed) {
      setErrorMessage("กรุณากรอก Slug สำหรับ URL");
      return;
    }
    if (!excerpt.trim()) {
      setErrorMessage("กรุณากรอกเนื้อหาย่อ");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("กรุณากรอกเนื้อหาบทความ");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        slug: slugTrimmed,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        coverAlt: coverAlt.trim() || null,
        category,
        insurancePageId: insurancePageId || null,
        seoTitle: seoTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        keywords: keywords.trim() || null,
        publishedAt: new Date(publishedAt),
      };

      const res = article
        ? await updateArticleAction(article.id, payload)
        : await createArticleAction(payload);

      if (res.success) {
        alert(article ? "แก้ไขบทความสำเร็จแล้ว" : "สร้างบทความใหม่สำเร็จแล้ว");
        router.push("/admin/articles");
        router.refresh();
      } else {
        setErrorMessage(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  return (
    <Card className="p-6 bg-white border border-gray-200 space-y-6">
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 font-semibold">
          ⚠️ ข้อผิดพลาด: {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-navy-800 mb-1">
            หัวข้อบทความ (Title) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="เช่น เคล็ดลับการเตรียมความพร้อมก่อนต่อ พ.ร.บ. รถยนต์ออนไลน์"
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm font-bold text-navy-800 focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-navy-800 mb-1">
            URL Slug (ภาษาอังกฤษ หรือภาษาไทย คั่นด้วยขีดกลาง) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="เช่น tips-before-buying-car-insurance"
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400"
          />
          <p className="text-[10px] text-navy-400 mt-1 font-semibold">
            * URL ของหน้าบทความนี้จะเป็น: https://pragunpai.com/articles/{slug || "slug"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-navy-800 mb-1">
              หมวดหมู่บทความ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ArticleCategory)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white font-medium"
            >
              <option value="GENERAL">ทั่วไป / ความรู้หลัก</option>
              <option value="CAR_ACT">พ.ร.บ. รถยนต์</option>
              <option value="ACCIDENT">ประกันอุบัติเหตุ</option>
              <option value="PROPERTY">ประกันบ้านและทรัพย์สิน</option>
              <option value="FAQ">คำถามที่พบบ่อย (FAQ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-navy-800 mb-1">
              เชื่อมโยงแผนประกัน
            </label>
            <select
              value={insurancePageId}
              onChange={(e) => setInsurancePageId(e.target.value)}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white font-medium"
            >
              <option value="">(ความรู้ทั่วไป - ไม่เจาะจงแผน)</option>
              {insurancePages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5 space-y-4">
        <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wide">
          รูปภาพหน้าปกบทความ (Cover Image)
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left/Middle: Image upload and preview */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-navy-600 uppercase">
              อัปโหลดไฟล์รูปภาพปก
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden bg-navy-50/50 hover:bg-navy-50 ${
                coverImage ? 'border-navy-300 bg-white' : 'border-navy-200 hover:border-orange-400'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                disabled={uploadingImage}
                className="hidden"
              />

              {uploadingImage ? (
                <div className="flex flex-col items-center space-y-2 py-4">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-navy-600 font-bold">กำลังอัปโหลดรูปภาพ...</span>
                </div>
              ) : coverImage ? (
                <div className="w-full flex flex-col sm:flex-row gap-4 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="h-24 w-40 object-cover rounded-lg border border-navy-100 shadow-sm bg-white"
                  />
                  <div className="flex-1 text-left space-y-1">
                    <p className="text-xs font-semibold text-navy-500 truncate max-w-70">
                      ลิงก์: <span className="font-mono text-navy-700">{coverImage}</span>
                    </p>
                    {dimensions && (
                      <p className="text-xs text-navy-600">
                        📐 มิติรูปภาพ: <span className="font-bold text-navy-850">{dimensions}</span>
                      </p>
                    )}
                    {fileSize && (
                      <p className="text-xs text-navy-600">
                        💾 ขนาดไฟล์: <span className="font-bold text-navy-850">{fileSize}</span>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImage("");
                        setFileSize(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      🗑️ ลบรูปภาพปก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-center py-4">
                  <svg className="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-navy-700">คลิกเพื่อเลือกไฟล์รูปภาพปก</span>
                    <p className="text-xs text-navy-400 mt-1">รองรับ JPG, PNG, WEBP (ไม่เกิน 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side: direct URL and Alt text */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                หรือใส่ลิงก์รูปภาพโดยตรง (Cover Image URL)
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="เช่น /images/blog/car-insurance.jpg"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-mono text-navy-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
                ข้อความอธิบายรูปปก (Cover Image Alt) <span className="text-orange-500 font-bold">(ดีต่อ SEO)</span>
              </label>
              <input
                type="text"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="เช่น รูปภาพรถยนต์สีขาวบนถนนยางมะตอย"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-orange-50/50 border border-orange-100 p-3 text-xs text-navy-600 flex gap-2">
          <span>💡</span>
          <span>
            <strong>คำแนะนำสำหรับรูปปกบทความ:</strong> แนะนำขนาด <strong>1200 x 630 พิกเซล</strong> (อัตราส่วน 1.91:1 หรือ 16:9) เพื่อความคมชัดสูงสุดเมื่อแชร์ผ่าน Social Media เช่น Facebook หรือ LINE
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 border-t border-gray-100 pt-5">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-navy-800 mb-1">
            คำอธิบายย่อ (Excerpt) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="เรื่องย่อบทความสั้นๆ สำหรับแสดงบนการ์ดลิสต์หน้าแรกหรือหน้ารวมบทความ..."
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-navy-800 mb-1">
            วันและเวลาที่เผยแพร่
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold text-navy-700"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-navy-800 mb-1">
          เนื้อหาบทความแบบละเอียด (Content - รองรับ Markdown และภาษาไทย) <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={15}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="เขียนเนื้อหาของคุณลงที่นี่..."
          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400 leading-relaxed"
        />
      </div>

      {/* SEO */}
      <div className="border-t border-gray-100 pt-5 space-y-4">
        <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide">
          ตั้งค่า SEO สำหรับบทความนี้
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-navy-850 mb-1">
              SEO Title (แสดงหัวข้อใน Google Search)
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="หากเว้นว่าง จะดึงเอาชื่อหัวข้อบทความแทน"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-850 mb-1">
              Keywords (คีย์เวิร์ดคั่นด้วยจุลภาค)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="เช่น พรบออนไลน์, วิธีทำพรบ, ต่อประกันภัย"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-navy-850 mb-1">
              Meta Description (คำอธิบายใต้ลิงก์ในหน้า Google Search)
            </label>
            <input
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="กรอกสรุปเนื้อหาบทความให้น่าอ่าน ยอดคนคลิกเยอะๆ ประมาณ 120-160 ตัวอักษร"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
        <Link
          href="/admin/articles"
          className="rounded-lg border border-navy-100 px-6 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50"
        >
          ยกเลิก
        </Link>
        <Button
          onClick={handleSave}
          disabled={isPending}
          variant="primary"
          className="px-8 cursor-pointer"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกบทความ"}
        </Button>
      </div>
    </Card>
  );
}
