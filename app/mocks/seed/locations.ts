/** ⚠️ PLACEHOLDER DATA — fictional training-center branches (docs/DUMMY_DATA.md §7–§8). */
import type { Department, Location } from "~/domain/types";

export const locations: Location[] = [
  {
    id: "LOC-NC",
    name: {
      en: "Engineering Hub Training Center — Nasr City",
      ar: "مركز إنجينيرنج هَب للتدريب — مدينة نصر",
    },
    shortName: { en: "Nasr City", ar: "مدينة نصر" },
    address: { en: "14 Abbas El-Akkad St., 3rd floor", ar: "14 شارع عباس العقاد، الدور الثالث" },
    city: { en: "Nasr City, Cairo", ar: "مدينة نصر، القاهرة" },
    mapUrl: "https://maps.google.com/?q=Abbas+El-Akkad+St+Nasr+City+Cairo",
    arrivalInstructions: {
      en: "Please arrive 15 minutes early and show your QR ticket at the 3rd-floor reception. Street parking is available on the side streets.",
      ar: "يُرجى الحضور قبل الموعد بـ 15 دقيقة وإظهار تذكرة QR في استقبال الدور الثالث. تتوفر أماكن انتظار في الشوارع الجانبية.",
    },
  },
  {
    id: "LOC-DK",
    name: {
      en: "Engineering Hub Training Center — Dokki",
      ar: "مركز إنجينيرنج هَب للتدريب — الدقي",
    },
    shortName: { en: "Dokki", ar: "الدقي" },
    address: { en: "22 Mossadak St., 2nd floor", ar: "22 شارع مصدق، الدور الثاني" },
    city: { en: "Dokki, Giza", ar: "الدقي، الجيزة" },
    mapUrl: "https://maps.google.com/?q=Mossadak+St+Dokki+Giza",
    arrivalInstructions: {
      en: "Please arrive 15 minutes early and show your QR ticket at the 2nd-floor reception. About a 7-minute walk from Dokki metro station.",
      ar: "يُرجى الحضور قبل الموعد بـ 15 دقيقة وإظهار تذكرة QR في استقبال الدور الثاني. على بُعد 7 دقائق سيرًا من محطة مترو الدقي.",
    },
  },
];

export const departments: Department[] = [
  { code: "CIVIL", name: { en: "Civil Engineering", ar: "الهندسة المدنية" }, isOther: false },
  {
    code: "STRUCT",
    name: { en: "Structural Engineering", ar: "الهندسة الإنشائية" },
    isOther: false,
  },
  {
    code: "ARCH",
    name: { en: "Architectural Engineering", ar: "الهندسة المعمارية" },
    isOther: false,
  },
  {
    code: "CM",
    name: { en: "Construction & Project Management", ar: "إدارة التشييد والمشروعات" },
    isOther: false,
  },
  {
    code: "SURV",
    name: { en: "Surveying & Geomatics", ar: "المساحة والجيوماتكس" },
    isOther: false,
  },
  {
    code: "OTHER",
    name: { en: "Other (please specify)", ar: "أخرى (يرجى التحديد)" },
    isOther: true,
  },
];
