/**
 * ⚠️ PLACEHOLDER DATA — fictional instructor from docs/DUMMY_DATA.md §2–§6.
 * Real organizations (universities, PMI, Autodesk…) are examples only; replace with the client's real credentials.
 */
import type { Certification, Differentiator, Instructor, JourneyMilestone } from "~/domain/types";

export const instructor: Instructor = {
  slug: "karim-mostafa",
  name: { en: "Eng. Karim Mostafa Hassan", ar: "م. كريم مصطفى حسن" },
  shortName: { en: "Eng. Karim Mostafa", ar: "م. كريم مصطفى" },
  title: { en: "Senior Structural Engineer & BIM Instructor", ar: "مهندس إنشائي أول ومدرّب BIM" },
  specialization: {
    en: "Structural design of reinforced concrete buildings",
    ar: "التصميم الإنشائي للمباني الخرسانية المسلحة",
  },
  positioningStatement: {
    en: "Learn structural design from an engineer who does it every day.",
    ar: "تعلّم التصميم الإنشائي من مهندس يمارسه كل يوم.",
  },
  valueProposition: {
    en: "14 years between design offices and construction sites. I teach you the exact workflow I use on real projects, in small groups, with real projects and code-compliant design.",
    ar: "14 عامًا بين مكاتب التصميم ومواقع التنفيذ. أعلّمك خطوات العمل نفسها التي أطبّقها في المشاريع الحقيقية، في مجموعات صغيرة، بمشاريع واقعية وتصميم مطابق للكود.",
  },
  bioShort: {
    en: "Senior structural engineer at a Cairo design consultancy with 14 years of experience and 60+ designed buildings. Since 2016 he has trained more than 3,200 engineering students and junior engineers through practical, project-based courses.",
    ar: "مهندس إنشائي أول في أحد مكاتب الاستشارات الهندسية بالقاهرة، بخبرة 14 عامًا وأكثر من 60 مبنى من تصميمه. منذ عام 2016 درّب أكثر من 3,200 طالب ومهندس حديث التخرج من خلال دورات عملية قائمة على مشاريع حقيقية.",
  },
  bioLong: {
    en: [
      "I'm Karim Mostafa, a senior structural engineer specialized in the design of reinforced concrete buildings. I graduated from Cairo University's Faculty of Engineering in 2012, then earned my M.Sc. in Structural Engineering from Ain Shams University.",
      "I started my career on construction sites, supervising reinforcement and concrete works, then moved to structural design, where I have designed more than 60 residential, commercial, educational and industrial buildings. Today I lead a team of structural engineers at a Cairo-based consultancy.",
      "I began teaching in 2016 because I kept meeting talented graduates who knew the theory but had never been shown how a design office actually works. My courses close that gap: one real project, step by step, with the same checklists and review process my team uses.",
    ],
    ar: [
      "أنا كريم مصطفى، مهندس إنشائي أول متخصص في تصميم المباني الخرسانية المسلحة. تخرجت في كلية الهندسة بجامعة القاهرة عام 2012، ثم حصلت على درجة الماجستير في الهندسة الإنشائية من جامعة عين شمس.",
      "بدأت مسيرتي في مواقع التنفيذ مشرفًا على أعمال التسليح والخرسانة، ثم انتقلت إلى التصميم الإنشائي، وصمّمت أكثر من 60 مبنى سكنيًا وتجاريًا وتعليميًا وصناعيًا. وأقود اليوم فريقًا من المهندسين الإنشائيين في مكتب استشاري بالقاهرة.",
      "بدأت التدريس عام 2016 لأنني كنت ألتقي دائمًا بخريجين موهوبين يعرفون النظريات، لكن لم يُشرح لهم أبدًا كيف يعمل مكتب التصميم فعليًا. دوراتي تسد هذه الفجوة: مشروع حقيقي واحد، خطوة بخطوة، بنفس قوائم المراجعة وخطوات التدقيق التي يستخدمها فريقي.",
    ],
  },
  audience: {
    en: [
      "Final-year civil engineering students",
      "Fresh graduates preparing for design-office jobs",
      "Site engineers moving into structural design",
    ],
    ar: [
      "طلاب السنوات النهائية بالهندسة المدنية",
      "حديثو التخرج المستعدون للعمل في مكاتب التصميم",
      "مهندسو التنفيذ المنتقلون إلى التصميم الإنشائي",
    ],
  },
  photo: {
    src: "https://images.unsplash.com/photo-1587715718640-987708ba38e1",
    alt: { en: "Portrait of Eng. Karim Mostafa", ar: "صورة م. كريم مصطفى" },
    width: 1200,
    height: 1500,
    credit: {
      author: "Pedram Normohamadian",
      source: "Unsplash",
      url: "https://unsplash.com/photos/man-in-white-dress-shirt-wearing-black-framed-eyeglasses-nh-V8YhDIIk",
      license: "Unsplash License",
    },
    isPlaceholder: true,
  },
  stats: [
    { key: "years", value: "14+", label: { en: "Years of experience", ar: "عامًا من الخبرة" } },
    { key: "students", value: "3,200+", label: { en: "Students trained", ar: "متدرب" } },
    { key: "cohorts", value: "120+", label: { en: "Cohorts delivered", ar: "دفعة تدريبية" } },
    { key: "projects", value: "60+", label: { en: "Buildings designed", ar: "مبنى من تصميمه" } },
  ],
};

export const journey: JourneyMilestone[] = [
  {
    id: "bsc",
    type: "EDUCATION",
    startYear: 2007,
    endYear: 2012,
    title: { en: "B.Sc. in Civil Engineering", ar: "بكالوريوس الهندسة المدنية" },
    organization: {
      en: "Cairo University, Faculty of Engineering",
      ar: "كلية الهندسة — جامعة القاهرة",
    },
    description: {
      en: "Graduated with “Very Good with Honors”. Graduation project: full structural design of a 12-storey RC residential building.",
      ar: "تخرّج بتقدير “جيد جدًا مع مرتبة الشرف”. مشروع التخرج: التصميم الإنشائي الكامل لمبنى سكني خرساني من 12 طابقًا.",
    },
  },
  {
    id: "site",
    type: "ENGINEERING",
    startYear: 2012,
    endYear: 2015,
    title: { en: "Site Engineer", ar: "مهندس تنفيذ" },
    organization: { en: "Delta Build Contracting", ar: "دلتا بيلد للمقاولات" },
    description: {
      en: "Supervised the execution of residential and commercial RC buildings: formwork, reinforcement inspection and concrete pouring.",
      ar: "الإشراف على تنفيذ مبانٍ سكنية وتجارية خرسانية: الشدّات، ومراجعة التسليح، وصبّ الخرسانة.",
    },
  },
  {
    id: "msc",
    type: "EDUCATION",
    startYear: 2014,
    endYear: 2017,
    title: { en: "M.Sc. in Structural Engineering", ar: "ماجستير الهندسة الإنشائية" },
    organization: { en: "Ain Shams University", ar: "جامعة عين شمس" },
    description: {
      en: "Thesis: seismic performance of reinforced concrete flat-slab buildings.",
      ar: "رسالة عن الأداء الزلزالي للمباني ذات البلاطات اللاكمرية (Flat Slab).",
    },
  },
  {
    id: "design",
    type: "ENGINEERING",
    startYear: 2015,
    endYear: 2020,
    title: { en: "Structural Design Engineer", ar: "مهندس تصميم إنشائي" },
    organization: { en: "Nile Axis Consultants", ar: "نايل أكسيس للاستشارات الهندسية" },
    description: {
      en: "Designed 30+ buildings using ETABS, SAFE and Revit, and prepared structural and shop drawings.",
      ar: "تصميم أكثر من 30 مبنى باستخدام ETABS وSAFE وRevit، وإعداد اللوحات الإنشائية والتنفيذية.",
    },
  },
  {
    id: "first-workshop",
    type: "TEACHING",
    startYear: 2016,
    title: { en: "First ETABS workshop", ar: "أول ورشة ETABS" },
    organization: { en: "University student chapter", ar: "فرع طلابي جامعي" },
    description: {
      en: "Delivered his first hands-on ETABS workshop to 18 students. Teaching has been part of his week ever since.",
      ar: "قدّم أول ورشة عملية على ETABS لـ 18 طالبًا، وأصبح التدريس جزءًا ثابتًا من أسبوعه منذ ذلك الحين.",
    },
  },
  {
    id: "training-track",
    type: "TEACHING",
    startYear: 2019,
    title: {
      en: "Launched his structural design training track",
      ar: "إطلاق مساره التدريبي في التصميم الإنشائي",
    },
    organization: { en: "Independent", ar: "مستقل" },
    description: {
      en: "Built a practical course path, from RC design to software and drawings, around one real project.",
      ar: "بناء مسار دورات عملي، من تصميم الخرسانة إلى البرامج واللوحات، حول مشروع حقيقي واحد.",
    },
  },
  {
    id: "senior",
    type: "ENGINEERING",
    startYear: 2020,
    endYear: null,
    title: { en: "Senior Structural Engineer", ar: "مهندس إنشائي أول" },
    organization: { en: "Meridian Engineering Group", ar: "ميريديان للاستشارات الهندسية" },
    description: {
      en: "Leads a team of 6 engineers designing residential towers, schools and industrial buildings.",
      ar: "يقود فريقًا من 6 مهندسين في تصميم أبراج سكنية ومدارس ومبانٍ صناعية.",
    },
  },
  {
    id: "consultant",
    type: "MILESTONE",
    startYear: 2023,
    title: { en: "Consultant Engineer grade", ar: "درجة مهندس استشاري" },
    organization: { en: "Egyptian Engineers Syndicate", ar: "نقابة المهندسين المصرية" },
    description: {
      en: "Granted the consultant grade in structural engineering.",
      ar: "الحصول على درجة استشاري في الهندسة الإنشائية.",
    },
  },
  {
    id: "partnership",
    type: "MILESTONE",
    startYear: 2024,
    title: { en: "3,000 students & training partnership", ar: "3,000 متدرب وشراكة تدريبية" },
    organization: { en: "Engineering Hub Training Center", ar: "مركز إنجينيرنج هَب للتدريب" },
    description: {
      en: "Passed 3,000 trained students and became a resident instructor at Engineering Hub.",
      ar: "تجاوز 3,000 متدرب، وأصبح مدرّبًا معتمدًا دائمًا في مركز إنجينيرنج هَب.",
    },
  },
];

export const certifications: Certification[] = [
  {
    id: "CERT-01",
    name: { en: "Project Management Professional (PMP)®", ar: "محترف إدارة المشروعات (PMP)®" },
    issuer: { en: "Project Management Institute (PMI)", ar: "معهد إدارة المشروعات (PMI)" },
    year: 2019,
  },
  {
    id: "CERT-02",
    name: {
      en: "Autodesk Certified Professional: Revit for Structural Design",
      ar: "محترف Autodesk معتمد: Revit للتصميم الإنشائي",
    },
    issuer: { en: "Autodesk", ar: "أوتوديسك" },
    year: 2021,
  },
  {
    id: "CERT-03",
    name: {
      en: "Primavera P6 Professional — Planning & Scheduling",
      ar: "بريمافيرا P6 — التخطيط والجدولة",
    },
    issuer: { en: "Oracle University", ar: "جامعة أوراكل" },
    year: 2018,
  },
  {
    id: "CERT-04",
    name: { en: "LEED Green Associate", ar: "LEED Green Associate" },
    issuer: {
      en: "U.S. Green Building Council (USGBC)",
      ar: "المجلس الأمريكي للأبنية الخضراء (USGBC)",
    },
    year: 2020,
  },
  {
    id: "CERT-05",
    name: { en: "Consultant Engineer — Structural", ar: "مهندس استشاري — إنشائي" },
    issuer: { en: "Egyptian Engineers Syndicate", ar: "نقابة المهندسين المصرية" },
    year: 2023,
  },
  {
    id: "CERT-06",
    name: {
      en: "Training of Trainers (TOT) Professional Diploma",
      ar: "دبلومة إعداد المدربين (TOT) المهنية",
    },
    issuer: { en: "Cairo Professional Training Institute", ar: "معهد القاهرة للتدريب المهني" },
    year: 2018,
  },
];

export const differentiators: Differentiator[] = [
  {
    icon: "building",
    title: { en: "Real projects, not textbook examples", ar: "مشاريع حقيقية لا أمثلة كتب" },
    description: {
      en: "Every course is built around a real building from his design office, anonymized.",
      ar: "كل دورة مبنية حول مبنى حقيقي من مكتب التصميم، بعد إخفاء بياناته.",
    },
  },
  {
    icon: "clipboard-check",
    title: { en: "The design-office workflow", ar: "طريقة عمل مكاتب التصميم" },
    description: {
      en: "You learn the checklists and review steps his team uses before any drawing is issued.",
      ar: "تتعلم قوائم المراجعة وخطوات التدقيق التي يطبّقها فريقه قبل إصدار أي لوحة.",
    },
  },
  {
    icon: "book-open",
    title: { en: "Code-compliant design", ar: "تصميم مطابق للكود" },
    description: {
      en: "Designs follow the Egyptian Code (ECP 201 & 203), with ACI references where relevant.",
      ar: "التصميم وفق الكود المصري (ECP 201 و203) مع الإشارة إلى ACI عند الحاجة.",
    },
  },
  {
    icon: "users",
    title: { en: "Small groups", ar: "مجموعات صغيرة" },
    description: {
      en: "20 to 35 seats per session, so every student gets direct feedback.",
      ar: "من 20 إلى 35 مقعدًا لكل دورة، ليحصل كل متدرب على ملاحظات مباشرة.",
    },
  },
  {
    icon: "hard-hat",
    title: { en: "A practicing engineer", ar: "مهندس ممارس" },
    description: {
      en: "He still designs buildings every week, so the content stays current.",
      ar: "ما زال يصمم مباني كل أسبوع، فيبقى المحتوى محدّثًا دائمًا.",
    },
  },
  {
    icon: "message-circle",
    title: { en: "Support after the course", ar: "متابعة بعد الدورة" },
    description: {
      en: "A private WhatsApp group for 30 days after the last meeting.",
      ar: "مجموعة واتساب خاصة لمدة 30 يومًا بعد آخر محاضرة.",
    },
  },
];
