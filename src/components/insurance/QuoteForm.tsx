"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleReCaptcha } from "@google-recaptcha/react";
import { submitLeadAction } from "@/actions/leads";
import { carActSchema, accidentSchema, propertySchema, otherSchema } from "@/lib/lead-intake";
import { validateUpload } from "@/lib/upload-constraints";
import { provinces } from "@/lib/provinces";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { z } from "zod";

// Define the 4 form types
type FormType = "CAR_ACT" | "ACCIDENT" | "PROPERTY" | "OTHER";

const FORM_METADATA: Record<FormType, { label: string; icon: string; path: string }> = {
  CAR_ACT: { label: "พ.ร.บ. & ประกันรถยนต์", icon: "🚗", path: "/quote/car-act" },
  ACCIDENT: { label: "ประกันอุบัติเหตุ", icon: "🩹", path: "/quote/accident" },
  PROPERTY: { label: "ประกันบ้าน & คอนโด", icon: "🏠", path: "/quote/property" },
  OTHER: { label: "ประกันอื่นๆ / สอบถาม", icon: "✉️", path: "/quote/other" },
};

// ---------------------------------------------------------------------------
// Validation schemas — shared with the server action via lib/lead-intake.
// Client-side the province select is required; the shared schema leaves it
// optional, so that one rule is overridden here.
// ---------------------------------------------------------------------------

const clientProvince = {
  province: z.string().min(1, "กรุณาเลือกจังหวัดของท่าน"),
};

const carActClientSchema = carActSchema.extend(clientProvince);
const accidentClientSchema = accidentSchema.extend(clientProvince);
const propertyClientSchema = propertySchema.extend(clientProvince);
const otherClientSchema = otherSchema.extend(clientProvince);

interface QuoteFormProps {
  initialType?: FormType;
  selectedPlan?: string;
}

export default function QuoteForm({ initialType = "CAR_ACT", selectedPlan = "" }: QuoteFormProps) {
  const [activeTab, setActiveTab] = useState<FormType>(initialType);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { executeV3 } = useGoogleReCaptcha() || {};

  // Form setups for each form type
  const carActForm = useForm<z.infer<typeof carActClientSchema>>({
    resolver: zodResolver(carActClientSchema),
    defaultValues: { name: "", phone: "", lineId: "", province: "", email: "", note: "", carType: "", carBrand: "", carModel: "", carYear: "", carPlate: "" },
  });

  const accidentForm = useForm<z.infer<typeof accidentClientSchema>>({
    resolver: zodResolver(accidentClientSchema),
    defaultValues: { name: "", phone: "", lineId: "", province: "", email: "", note: "", age: "", occupation: "", hasExistingIllness: "ไม่มีประวัติการเจ็บป่วยร้ายแรงหรือโรคประจำตัว", illnessDetails: "", selectedPlan: selectedPlan || "" },
  });

  const hasExistingIllness = useWatch({
    control: accidentForm.control,
    name: "hasExistingIllness",
  });

  const propertyForm = useForm<z.infer<typeof propertyClientSchema>>({
    resolver: zodResolver(propertyClientSchema),
    defaultValues: { name: "", phone: "", lineId: "", province: "", email: "", note: "", propertyType: "", constructionType: "", floorsCount: "", propertyValue: "", securitySystems: [] },
  });

  const otherForm = useForm<z.infer<typeof otherClientSchema>>({
    resolver: zodResolver(otherClientSchema),
    defaultValues: { name: "", phone: "", lineId: "", province: "", email: "", note: "", requestType: "", description: "" },
  });

  const activeForm =
    activeTab === "CAR_ACT"
      ? carActForm
      : activeTab === "ACCIDENT"
      ? accidentForm
      : activeTab === "PROPERTY"
      ? propertyForm
      : otherForm;

  // Helpers to register contact fields without union type signature mismatches
  const registerContactField = (fieldName: "name" | "phone" | "lineId" | "province" | "email" | "note") => {
    if (activeTab === "CAR_ACT") return carActForm.register(fieldName);
    if (activeTab === "ACCIDENT") return accidentForm.register(fieldName);
    if (activeTab === "PROPERTY") return propertyForm.register(fieldName);
    return otherForm.register(fieldName);
  };

  const getContactFieldError = (fieldName: "name" | "phone" | "lineId" | "province" | "email" | "note") => {
    const errors = activeForm.formState.errors as Record<string, { message?: string }>;
    return errors[fieldName];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const validation = validateUpload(file);
      if (!validation.ok) {
        setFileError(validation.error);
        return;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: Record<string, unknown>) => {
    setSubmitError(null);

    startTransition(async () => {
      try {
        let recaptchaToken = "";
        if (executeV3) {
          try {
            recaptchaToken = await executeV3("submit_lead");
          } catch (err) {
            console.error("reCAPTCHA execution error:", err);
          }
        }

        const formData = new FormData();
        formData.append("formType", activeTab);

        // Append values to formData
        Object.entries(values).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            val.forEach((item) => formData.append(key, item));
          } else if (val !== undefined && val !== null) {
            formData.append(key, String(val));
          }
        });

        if (recaptchaToken) {
          formData.append("gRecaptchaToken", recaptchaToken);
        }

        // Append files
        files.forEach((file) => {
          formData.append("attachments", file);
        });

        const result = await submitLeadAction(formData);

        if (result.success) {
          setSubmitSuccess(true);
          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setSubmitError(result.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        }
      } catch (err) {
        const error = err as Error;
        setSubmitError(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    });
  };

  const handleTabChange = (tab: FormType) => {
    setActiveTab(tab);
    setSubmitError(null);
    setFileError(null);
    // Push state history or update tab selection without full refresh
    const newPath = FORM_METADATA[tab].path;
    window.history.pushState(null, "", newPath);
  };

  const handleCloseSuccessModal = () => {
    setSubmitSuccess(false);
    activeForm.reset();
    setFiles([]);
  };

  return (
    <Container size="prose" className="py-12">
      {/* Category selector */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(FORM_METADATA) as FormType[]).map((tab) => {
          const meta = FORM_METADATA[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              type="button"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-orange-400 bg-orange-50 text-orange-600 font-semibold shadow-sm"
                  : "border-navy-100 bg-white text-navy-600 hover:border-navy-200 hover:bg-navy-50/50"
              }`}
            >
              <span className="text-2xl">{meta.icon}</span>
              <span className="text-xs sm:text-sm">{meta.label}</span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden border border-navy-100 bg-white shadow-lg p-6 sm:p-8">
        <h2 className="text-xl font-bold text-navy-800 sm:text-2xl mb-2 flex items-center gap-2">
          <span>{FORM_METADATA[activeTab].icon}</span>
          ขอใบเสนอราคา {FORM_METADATA[activeTab].label}
        </h2>
        <p className="text-sm text-navy-500 mb-8 border-b border-navy-50 pb-4">
          กรอกข้อมูลให้ครบถ้วน เพื่อให้เจ้าหน้าที่นำเสนอแผนคุ้มครองและเบี้ยประกันที่ดีที่สุด
        </p>

        {submitError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex gap-2">
            <span className="font-bold">⚠️ ข้อผิดพลาด:</span>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={activeForm.handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Contact Details */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-navy-800 border-l-4 border-orange-400 pl-3">
              1. ข้อมูลผู้ขอเอาประกัน (ข้อมูลติดต่อกลับ)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น สมชาย ใจดี"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    getContactFieldError("name")
                      ? "border-red-400 focus:border-red-400"
                      : "border-navy-200 focus:border-orange-400"
                  }`}
                  {...registerContactField("name")}
                />
                {getContactFieldError("name") && (
                  <p className="mt-1 text-xs text-red-500">{getContactFieldError("name").message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 0812345678"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    getContactFieldError("phone")
                      ? "border-red-400 focus:border-red-400"
                      : "border-navy-200 focus:border-orange-400"
                  }`}
                  {...registerContactField("phone")}
                />
                {getContactFieldError("phone") && (
                  <p className="mt-1 text-xs text-red-500">{getContactFieldError("phone").message as string}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  LINE ID <span className="text-navy-400 text-xs">(แนะนำสำหรับการส่งใบเสนอราคา)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น line_id หรือเบอร์โทร"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  {...registerContactField("lineId")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    getContactFieldError("province")
                      ? "border-red-400 focus:border-red-400"
                      : "border-navy-200 focus:border-orange-400"
                  }`}
                  {...registerContactField("province")}
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {getContactFieldError("province") && (
                  <p className="mt-1 text-xs text-red-500">{getContactFieldError("province").message as string}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                อีเมล <span className="text-navy-400 text-xs">(ไม่บังคับ)</span>
              </label>
              <input
                type="email"
                placeholder="เช่น somchai@email.com"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  getContactFieldError("email")
                    ? "border-red-400 focus:border-red-400"
                    : "border-navy-200 focus:border-orange-400"
                }`}
                {...registerContactField("email")}
              />
              {getContactFieldError("email") && (
                <p className="mt-1 text-xs text-red-500">{getContactFieldError("email").message as string}</p>
              )}
            </div>
          </div>

          {/* Section 2: Specific Fields */}
          <div className="space-y-4 pt-4 border-t border-navy-50">
            <h3 className="text-base font-semibold text-navy-800 border-l-4 border-orange-400 pl-3">
              2. ข้อมูลรายละเอียดประกันภัย
            </h3>

            {/* Type 1: CAR_ACT */}
            {activeTab === "CAR_ACT" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    ประเภทรถยนต์ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    {...carActForm.register("carType")}
                  >
                    <option value="">-- เลือกประเภทรถยนต์ --</option>
                    <option value="รถเก๋ง/รถกระบะ 4 ประตู (รย.1)">รถเก๋ง/รถกระบะ 4 ประตู (รย.1)</option>
                    <option value="รถกระบะแค็ป/ตอนเดียว (รย.3)">รถกระบะบรรทุกแค็ป/ตอนเดียว (รย.3)</option>
                    <option value="รถตู้ส่วนบุคคล (รย.2)">รถตู้ส่วนบุคคล (รย.2)</option>
                    <option value="อื่นๆ (พ.ร.บ. บิ๊กไบค์ / รถบรรทุก)">อื่นๆ (พ.ร.บ. บิ๊กไบค์ / รถบรรทุก)</option>
                  </select>
                  {carActForm.formState.errors.carType && (
                    <p className="mt-1 text-xs text-red-500">{carActForm.formState.errors.carType.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      ยี่ห้อรถยนต์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Toyota, Honda"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...carActForm.register("carBrand")}
                    />
                    {carActForm.formState.errors.carBrand && (
                      <p className="mt-1 text-xs text-red-500">{carActForm.formState.errors.carBrand.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      รุ่นรถยนต์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Yaris, Civic"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...carActForm.register("carModel")}
                    />
                    {carActForm.formState.errors.carModel && (
                      <p className="mt-1 text-xs text-red-500">{carActForm.formState.errors.carModel.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      ปีจดทะเบียน <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...carActForm.register("carYear")}
                    >
                      <option value="">-- เลือกปี --</option>
                      {Array.from({ length: 16 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} / {yr + 543}
                        </option>
                      ))}
                    </select>
                    {carActForm.formState.errors.carYear && (
                      <p className="mt-1 text-xs text-red-500">{carActForm.formState.errors.carYear.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      เลขทะเบียนรถยนต์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 1กข 1234 กทม"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...carActForm.register("carPlate")}
                    />
                    {carActForm.formState.errors.carPlate && (
                      <p className="mt-1 text-xs text-red-500">{carActForm.formState.errors.carPlate.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Type 2: ACCIDENT */}
            {activeTab === "ACCIDENT" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      อายุ (ปี) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="ระบุอายุผู้เอาประกัน เช่น 35"
                      min="0"
                      max="120"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...accidentForm.register("age")}
                    />
                    {accidentForm.formState.errors.age && (
                      <p className="mt-1 text-xs text-red-500">{accidentForm.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      อาชีพ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ระบุอาชีพหลัก เช่น พนักงานบริษัท"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...accidentForm.register("occupation")}
                    />
                    {accidentForm.formState.errors.occupation && (
                      <p className="mt-1 text-xs text-red-500">{accidentForm.formState.errors.occupation.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    ประวัติสุขภาพ / โรคประจำตัว <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
                      <input
                        type="radio"
                        value="ไม่มีประวัติการเจ็บป่วยร้ายแรงหรือโรคประจำตัว"
                        className="accent-orange-500"
                        {...accidentForm.register("hasExistingIllness")}
                      />
                      <span>ไม่มีประวัติเจ็บป่วยร้ายแรง หรือโรคประจำตัว</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
                      <input
                        type="radio"
                        value="มีโรคประจำตัวหรือประวัติสุขภาพ"
                        className="accent-orange-500"
                        {...accidentForm.register("hasExistingIllness")}
                      />
                      <span>มีโรคประจำตัว หรือข้อจำกัดด้านสุขภาพ (โปรดระบุด้านล่าง)</span>
                    </label>
                  </div>
                </div>

                {hasExistingIllness === "มีโรคประจำตัวหรือประวัติสุขภาพ" && (
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      รายละเอียดโรคประจำตัว / ยาที่ต้องทานประจำ
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น โรคความดันโลหิตสูง, โรคเบาหวาน..."
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...accidentForm.register("illnessDetails")}
                    />
                  </div>
                )}

                {/* Plan selection if any */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    แผนประกันที่สนใจ <span className="text-navy-400 text-xs">(หากเลือกไว้)</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    {...accidentForm.register("selectedPlan")}
                  >
                    <option value="">-- แนะนำแผนที่เหมาะสมตามความต้องการ --</option>
                    <option value="Basic Plan">Basic Plan (ความคุ้มครองเริ่มต้น)</option>
                    <option value="Comprehensive Plan">Comprehensive Plan (ความคุ้มครองคุ้มค่า)</option>
                    <option value="Premium Plan">Premium Plan (คุ้มครองสูงสุด + ชดเชยรายได้)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Type 3: PROPERTY */}
            {activeTab === "PROPERTY" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      ประเภทสิ่งปลูกสร้าง <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...propertyForm.register("propertyType")}
                    >
                      <option value="">-- เลือกประเภทสิ่งปลูกสร้าง --</option>
                      <option value="บ้านเดี่ยว">บ้านเดี่ยว</option>
                      <option value="ทาวน์เฮ้าส์ / ทาวน์โฮม">ทาวน์เฮ้าส์ / ทาวน์โฮม</option>
                      <option value="คอนโดมิเนียม">คอนโดมิเนียม</option>
                      <option value="อาคารพาณิชย์ / ตึกแถว">อาคารพาณิชย์ / ตึกแถว</option>
                      <option value="หอพัก / อพาร์ทเมนท์">หอพัก / อพาร์ทเมนท์</option>
                    </select>
                    {propertyForm.formState.errors.propertyType && (
                      <p className="mt-1 text-xs text-red-500">{propertyForm.formState.errors.propertyType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      ลักษณะโครงสร้างอาคาร <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...propertyForm.register("constructionType")}
                    >
                      <option value="">-- เลือกลักษณะโครงสร้าง --</option>
                      <option value="โครงสร้างคอนกรีตล้วน (ตึก)">โครงสร้างคอนกรีตล้วน (ตึก)</option>
                      <option value="โครงสร้างครึ่งตึกครึ่งไม้">โครงสร้างครึ่งตึกครึ่งไม้</option>
                      <option value="โครงสร้างไม้ล้วน">โครงสร้างไม้ล้วน</option>
                    </select>
                    {propertyForm.formState.errors.constructionType && (
                      <p className="mt-1 text-xs text-red-500">{propertyForm.formState.errors.constructionType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      จำนวนชั้น <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="เช่น 1, 2, 3"
                      min="1"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...propertyForm.register("floorsCount")}
                    />
                    {propertyForm.formState.errors.floorsCount && (
                      <p className="mt-1 text-xs text-red-500">{propertyForm.formState.errors.floorsCount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      มูลค่าทรัพย์สินที่คุ้มครอง (บาท) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 3,000,000"
                      className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      {...propertyForm.register("propertyValue")}
                    />
                    {propertyForm.formState.errors.propertyValue && (
                      <p className="mt-1 text-xs text-red-500">{propertyForm.formState.errors.propertyValue.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    ระบบความปลอดภัยที่มีในสถานที่ (เลือกได้หลายข้อ)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { key: "smoke_detector", label: "เครื่องตรวจจับควัน" },
                      { key: "fire_extinguisher", label: "ถังดับเพลิง" },
                      { key: "cctv", label: "กล้องวงจรปิด" },
                      { key: "security_guard", label: "รปภ. 24 ชั่วโมง" },
                    ].map((sys) => (
                      <label key={sys.key} className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
                        <input
                          type="checkbox"
                          value={sys.label}
                          className="accent-orange-500 rounded border-navy-200 focus:ring-0 focus:ring-offset-0"
                          {...propertyForm.register("securitySystems")}
                        />
                        <span>{sys.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Type 4: OTHER */}
            {activeTab === "OTHER" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    ประเภทประกันที่ท่านสนใจ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    {...otherForm.register("requestType")}
                  >
                    <option value="">-- เลือกเรื่องที่สนใจ --</option>
                    <option value="ประกันสุขภาพ (Health)">ประกันสุขภาพ (Health)</option>
                    <option value="ประกันการเดินทางต่างประเทศ (Travel)">ประกันการเดินทางต่างประเทศ (Travel)</option>
                    <option value="ประกันชีวิต / โรคร้ายแรง">ประกันชีวิต / โรคร้ายแรง</option>
                    <option value="ประกันร้านค้า / ธุรกิจ">ประกันร้านค้า / ธุรกิจ</option>
                    <option value="อื่นๆ (สอบถามคำแนะนำทั่วไป)">อื่นๆ (สอบถามคำแนะนำทั่วไป)</option>
                  </select>
                  {otherForm.formState.errors.requestType && (
                    <p className="mt-1 text-xs text-red-500">{otherForm.formState.errors.requestType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    รายละเอียดคำถาม / ข้อมูลความต้องการเพิ่ม <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="กรุณาระบุรายละเอียดคำถาม แผนความคุ้มครอง หรือข้อมูลที่ท่านต้องการเพื่อให้เจ้าหน้าที่ให้คำปรึกษาได้อย่างถูกต้องแม่นยำ"
                    className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    {...otherForm.register("description")}
                  />
                  {otherForm.formState.errors.description && (
                    <p className="mt-1 text-xs text-red-500">{otherForm.formState.errors.description.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Common field: Note */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                หมายเหตุเพิ่มเติมถึงเจ้าหน้าที่ <span className="text-navy-400 text-xs">(ไม่บังคับ)</span>
              </label>
              <textarea
                rows={2}
                placeholder="เช่น ช่วงเวลาที่สะดวกให้โทรกลับ หรือข้อมูลอื่นๆ"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                {...registerContactField("note")}
              />
            </div>
          </div>

          {/* Section 3: File Upload */}
          <div className="space-y-4 pt-4 border-t border-navy-50">
            <h3 className="text-base font-semibold text-navy-800 border-l-4 border-orange-400 pl-3">
              3. อัปโหลดเอกสารประกอบ (ไม่บังคับ แต่ช่วยให้ได้รับข้อเสนอที่รวดเร็วขึ้น)
            </h3>
            <p className="text-xs text-navy-500">
              * เอกสารที่แนะนำ เช่น สำเนาเล่มทะเบียนรถ, กรมธรรม์เดิม, รูปภาพทรัพย์สิน หรือสำเนาบัตรประชาชน
            </p>

            <div className="rounded-lg border-2 border-dashed border-navy-200 hover:border-orange-400 bg-navy-50/50 p-6 text-center transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <span className="text-3xl block mb-2">📁</span>
                <span className="text-sm font-medium text-navy-700 block">
                  คลิกที่นี่เพื่ออัปโหลดไฟล์ หรือวางไฟล์ของคุณที่นี่
                </span>
                <span className="text-xs text-navy-400 mt-1 block">
                  รองรับไฟล์ JPG, PNG, WEBP, PDF, DOC, DOCX ขนาดไม่เกิน 5MB ต่อไฟล์
                </span>
              </label>
            </div>

            {fileError && (
              <p className="text-xs text-red-500 mt-1 font-semibold">⚠️ {fileError}</p>
            )}

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-navy-700">ไฟล์ที่จะส่ง ({files.length} ไฟล์):</p>
                <ul className="divide-y divide-navy-50 border border-navy-100 rounded-lg bg-white">
                  {files.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-2 overflow-hidden mr-4">
                        <span className="text-base">📄</span>
                        <span className="truncate text-navy-800 font-medium">{file.name}</span>
                        <span className="text-xs text-navy-400 whitespace-nowrap">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 hover:border-red-500 rounded px-2 py-1 transition-colors cursor-pointer"
                      >
                        ลบออก
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Verification and PDPA Consent */}
          <div className="pt-4 border-t border-navy-50 space-y-4">
            <p className="text-xs text-navy-500 leading-relaxed">
              การคลิก &ldquo;ส่งข้อมูลขอใบเสนอราคา&rdquo; แสดงว่าท่านยินยอมให้ Pragunpai.com จัดเก็บและประมวลผลข้อมูลส่วนบุคคล
              เพื่อใช้นำเสนอแผนประกันภัยและติดต่อกลับ ตามเงื่อนไขของ{" "}
              <a href="/privacy-policy" target="_blank" className="underline hover:text-orange-500">
                นโยบายความเป็นส่วนตัว (PDPA)
              </a>{" "}
              โดยข้อมูลจะถูกจัดเก็บอย่างปลอดภัยและลบโดยอัตโนมัติภายใน 30 วัน
            </p>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full flex justify-center items-center gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                "ส่งข้อมูลขอใบเสนอราคา →"
              )}
            </Button>
          </div>
        </form>
      </Card>

      {submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-navy-100/50 text-center animate-scaleUp">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 text-4xl animate-bounce">
              ✓
            </div>
            <h2 className="mt-6 text-2xl font-bold text-navy-800">ส่งข้อมูลขอใบเสนอราคาสำเร็จ!</h2>
            <p className="mt-4 text-navy-600 leading-relaxed text-sm">
              ขอบคุณที่ไว้วางใจให้ <strong>Pragunpai (ประกันภัย)</strong> ดูแลท่าน เจ้าหน้าที่กำลังตรวจสอบข้อมูล
              และจะติดต่อกลับเพื่อนำเสนอแผนประกันภัยที่ดีที่สุดผ่านทางโทรศัพท์ หรือ LINE ที่ท่านระบุ ภายใน 24 ชั่วโมง
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleCloseSuccessModal}
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
              >
                ตกลง (ปิดหน้าต่าง)
              </button>
              <Button href="/" variant="secondary" size="md" className="w-full sm:w-auto">
                กลับสู่หน้าแรก
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
