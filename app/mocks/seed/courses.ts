/**
 * ⚠️ PLACEHOLDER DATA — fictional courses from docs/DUMMY_DATA.md §9 and general FAQ §11.
 * Together they cover every course status (FR-CRS-04) for design and QA.
 */
import type { Course, FaqItem } from "~/domain/types";

const EGP = 100; // piasters per pound

const ARABIC_WITH_ENGLISH_TERMS = {
  en: "Arabic (technical terms in English)",
  ar: "العربية (مع المصطلحات الفنية بالإنجليزية)",
};

const LAPTOP_AND_NOTEBOOK = {
  en: ["Laptop & charger", "Notebook"],
  ar: ["اللابتوب والشاحن", "كراسة ملاحظات"],
};

export const courses: Course[] = [
  {
    id: "C1",
    slug: "etabs-rc-buildings",
    code: "ETB",
    title: {
      en: "ETABS for Analysis & Design of RC Buildings",
      ar: "برنامج ETABS لتحليل وتصميم المباني الخرسانية",
    },
    shortDescription: {
      en: "Model, analyze and design a real multi-storey RC building in ETABS, from architectural plans to design results you can defend in any design office.",
      ar: "نمذجة وتحليل وتصميم مبنى خرساني حقيقي متعدد الطوابق على ETABS، من المخطط المعماري حتى نتائج تصميم تستطيع الدفاع عنها في أي مكتب تصميم.",
    },
    about: {
      en: "A hands-on course where we turn a real set of architectural drawings into a complete ETABS model, apply gravity, wind and seismic loads, check the results like a reviewer would, and design every structural element.",
      ar: "دورة عملية نحوّل فيها مجموعة لوحات معمارية حقيقية إلى نموذج ETABS كامل، ونطبّق أحمال الجاذبية والرياح والزلازل، ونراجع النتائج كما يفعل المراجع، ثم نصمم جميع العناصر الإنشائية.",
    },
    audience: {
      en: "Final-year civil engineering students and structural engineers with 0–3 years of experience.",
      ar: "طلاب السنوات النهائية بالهندسة المدنية والمهندسون الإنشائيون بخبرة من 0 إلى 3 سنوات.",
    },
    problemSolved: {
      en: "Most graduates know the theory but can't turn architectural drawings into a reliable model, or tell whether the software's results make sense.",
      ar: "معظم الخريجين يعرفون النظرية، لكنهم لا يستطيعون تحويل اللوحات المعمارية إلى نموذج موثوق، أو الحكم على منطقية نتائج البرنامج.",
    },
    expectations: {
      en: "Laptop-based workshop. We build one complete project together, step by step, with design-office checklists. You leave with the full model and a review checklist.",
      ar: "ورشة عملية على اللابتوب. نبني مشروعًا كاملًا معًا خطوة بخطوة بقوائم مراجعة مكاتب التصميم، وتخرج بالنموذج الكامل وقائمة المراجعة.",
    },
    outcomes: {
      en: [
        "Build a clean ETABS model from architectural drawings",
        "Define materials, sections and load patterns correctly",
        "Apply gravity, wind and seismic loads per ECP 201",
        "Check drift, modal results and base shear like a reviewer",
        "Design slabs, beams, columns and shear walls",
        "Export results and prepare a short design report",
      ],
      ar: [
        "بناء نموذج ETABS منظم من اللوحات المعمارية",
        "تعريف المواد والقطاعات وأنماط الأحمال بشكل صحيح",
        "تطبيق أحمال الجاذبية والرياح والزلازل وفق ECP 201",
        "مراجعة الإزاحات والأنماط الاهتزازية وقص القاعدة كمراجع محترف",
        "تصميم البلاطات والكمرات والأعمدة وحوائط القص",
        "تصدير النتائج وإعداد تقرير تصميم مختصر",
      ],
    },
    modules: [
      {
        order: 1,
        durationHours: 4,
        title: {
          en: "Project setup & modeling fundamentals",
          ar: "إعداد المشروع وأساسيات النمذجة",
        },
        topics: {
          en: [
            "Grids & stories from architecture",
            "Materials & sections",
            "Slabs, beams, columns, walls",
            "Modeling mistakes to avoid",
          ],
          ar: [
            "المحاور والأدوار من المعماري",
            "المواد والقطاعات",
            "البلاطات والكمرات والأعمدة والحوائط",
            "أخطاء نمذجة شائعة",
          ],
        },
      },
      {
        order: 2,
        durationHours: 4,
        title: { en: "Loads & load combinations", ar: "الأحمال وتجميعاتها" },
        topics: {
          en: ["Dead, live & finishes", "Wall loads", "Load patterns & cases", "ECP combinations"],
          ar: [
            "الأحمال الميتة والحية والتشطيبات",
            "أحمال الحوائط",
            "أنماط وحالات التحميل",
            "تجميعات الكود المصري",
          ],
        },
      },
      {
        order: 3,
        durationHours: 4,
        title: { en: "Lateral analysis & result checks", ar: "التحليل الأفقي ومراجعة النتائج" },
        topics: {
          en: [
            "Seismic: equivalent static & response spectrum",
            "Wind loads",
            "Drift & modal checks",
            "Base shear verification",
          ],
          ar: [
            "الزلازل: القوة الاستاتيكية المكافئة وطيف الاستجابة",
            "أحمال الرياح",
            "مراجعة الإزاحات والأنماط",
            "التحقق من قص القاعدة",
          ],
        },
      },
      {
        order: 4,
        durationHours: 4,
        title: { en: "Element design & reporting", ar: "تصميم العناصر وإعداد التقرير" },
        topics: {
          en: [
            "Beam & column design",
            "Shear wall design",
            "Slab design workflow",
            "Design report & export",
          ],
          ar: [
            "تصميم الكمرات والأعمدة",
            "تصميم حوائط القص",
            "خطوات تصميم البلاطات",
            "تقرير التصميم والتصدير",
          ],
        },
      },
    ],
    requirements: {
      en: [
        "Basic knowledge of RC design",
        "Laptop (Windows, 8 GB RAM or more) with ETABS installed; an installation guide is emailed after booking",
      ],
      ar: [
        "معرفة أساسية بتصميم الخرسانة المسلحة",
        "لابتوب (ويندوز، ذاكرة 8 جيجابايت أو أكثر) مثبت عليه ETABS، ويُرسل دليل التثبيت بالبريد بعد الحجز",
      ],
    },
    whatToBring: {
      en: ["Laptop & charger", "Notebook", "Project files (sent by email)"],
      ar: ["اللابتوب والشاحن", "كراسة ملاحظات", "ملفات المشروع (تُرسل بالبريد)"],
    },
    faq: [
      {
        question: {
          en: "Do I need previous ETABS experience?",
          ar: "هل أحتاج خبرة سابقة على ETABS؟",
        },
        answer: {
          en: "No. We start from an empty model. You only need basic RC design knowledge.",
          ar: "لا، نبدأ من نموذج فارغ، ويكفي أن تكون لديك معرفة أساسية بتصميم الخرسانة.",
        },
      },
      {
        question: { en: "Will I get the project files?", ar: "هل سأحصل على ملفات المشروع؟" },
        answer: {
          en: "Yes. You get the architectural drawings, the final ETABS model and the review checklist.",
          ar: "نعم، تحصل على اللوحات المعمارية ونموذج ETABS النهائي وقائمة المراجعة.",
        },
      },
    ],
    certificationIds: ["CERT-05", "CERT-06"],
    level: "INTERMEDIATE",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 16,
    meetingsCount: 4,
    basePrice: 3200 * EGP,
    coverDiscipline: { en: "Analysis & design", ar: "التحليل والتصميم" },
    isPublished: true,
    isFeatured: true,
    isComingSoon: false,
    registrationClosed: false,
    sortOrder: 1,
  },
  {
    id: "C2",
    slug: "safe-foundations-design",
    code: "SAF",
    title: { en: "Foundation Design with SAFE", ar: "تصميم الأساسات باستخدام برنامج SAFE" },
    shortDescription: {
      en: "Design isolated footings, strip footings and raft foundations in SAFE, with the settlement and punching checks reviewers look for.",
      ar: "صمّم القواعد المنفصلة والشريطية واللبشة على برنامج SAFE، مع مراجعات الهبوط والاختراق التي يطلبها المراجعون.",
    },
    about: {
      en: "We import column loads from ETABS, model soil support correctly, and design three foundation types used in real buildings in Egypt, ending with reinforcement ready for drawings.",
      ar: "نستورد أحمال الأعمدة من ETABS، وننمذج تربة الارتكاز بشكل صحيح، ونصمم ثلاثة أنواع من الأساسات المستخدمة فعليًا في المباني بمصر، وصولًا إلى تسليح جاهز للوحات.",
    },
    audience: {
      en: "Engineers and final-year students who already know basic ETABS or RC design.",
      ar: "المهندسون وطلاب السنة النهائية الذين يعرفون أساسيات ETABS أو تصميم الخرسانة.",
    },
    problemSolved: {
      en: "Foundations are where small modeling mistakes become expensive. Most courses skip the soil assumptions and the checks.",
      ar: "الأساسات هي المكان الذي تتحول فيه أخطاء النمذجة الصغيرة إلى تكلفة كبيرة، ومعظم الدورات تتجاهل فرضيات التربة والمراجعات.",
    },
    expectations: {
      en: "Three practical meetings, one foundation type each, all on the same building.",
      ar: "ثلاث محاضرات عملية، كل محاضرة لنوع أساسات، وكلها على نفس المبنى.",
    },
    outcomes: {
      en: [
        "Read a soil report for design inputs",
        "Model subgrade modulus in SAFE",
        "Design isolated, strip and raft foundations",
        "Check punching shear and settlement",
        "Prepare reinforcement for drawings",
      ],
      ar: [
        "قراءة تقرير التربة واستخراج مدخلات التصميم",
        "نمذجة معامل رد فعل التربة في SAFE",
        "تصميم القواعد المنفصلة والشريطية واللبشة",
        "مراجعة قص الاختراق والهبوط",
        "تجهيز التسليح للوحات",
      ],
    },
    modules: [
      {
        order: 1,
        durationHours: 4,
        title: { en: "Footings from ETABS to SAFE", ar: "من ETABS إلى SAFE: القواعد" },
        topics: {
          en: ["Load import", "Isolated & combined footings", "Soil bearing checks"],
          ar: ["استيراد الأحمال", "القواعد المنفصلة والمشتركة", "مراجعة جهد التربة"],
        },
      },
      {
        order: 2,
        durationHours: 4,
        title: { en: "Strip footings & raft foundations", ar: "القواعد الشريطية واللبشة" },
        topics: {
          en: ["Strip footing modeling", "Raft modeling", "Subgrade modulus"],
          ar: ["نمذجة القواعد الشريطية", "نمذجة اللبشة", "معامل رد فعل التربة"],
        },
      },
      {
        order: 3,
        durationHours: 4,
        title: { en: "Checks, reinforcement & drawings", ar: "المراجعات والتسليح واللوحات" },
        topics: {
          en: ["Punching shear", "Settlement", "Strip-based reinforcement", "Export"],
          ar: ["قص الاختراق", "الهبوط", "التسليح بالشرائح", "التصدير"],
        },
      },
    ],
    requirements: {
      en: ["Basic ETABS or RC design knowledge", "Laptop with SAFE installed"],
      ar: ["معرفة أساسية بـ ETABS أو تصميم الخرسانة", "لابتوب مثبت عليه SAFE"],
    },
    whatToBring: LAPTOP_AND_NOTEBOOK,
    faq: [
      {
        question: {
          en: "Can I join without attending the ETABS course?",
          ar: "هل يمكنني الالتحاق دون حضور دورة ETABS؟",
        },
        answer: {
          en: "Yes, if you can read structural drawings and know basic RC design.",
          ar: "نعم، إذا كنت تستطيع قراءة اللوحات الإنشائية وتعرف أساسيات تصميم الخرسانة.",
        },
      },
    ],
    certificationIds: ["CERT-05"],
    level: "INTERMEDIATE",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 12,
    meetingsCount: 3,
    basePrice: 2400 * EGP,
    coverDiscipline: { en: "Foundations", ar: "الأساسات" },
    isPublished: true,
    isFeatured: false,
    isComingSoon: false,
    registrationClosed: false,
    sortOrder: 2,
  },
  {
    id: "C3",
    slug: "rc-design-egyptian-code",
    code: "RCD",
    title: {
      en: "Reinforced Concrete Design to the Egyptian Code (ECP 203)",
      ar: "تصميم المنشآت الخرسانية وفقًا للكود المصري (ECP 203)",
    },
    shortDescription: {
      en: "The foundation every structural engineer needs: design slabs, beams and columns by hand to ECP 203, and understand what the software is doing.",
      ar: "الأساس الذي يحتاجه كل مهندس إنشائي: صمّم البلاطات والكمرات والأعمدة يدويًا وفق ECP 203، وافهم ما يفعله البرنامج.",
    },
    about: {
      en: "A clear, practical walk through the Egyptian Code: limit states, slabs, beams, columns and detailing, using one real building as a running example.",
      ar: "شرح عملي وواضح للكود المصري: حالات الحدود، والبلاطات، والكمرات، والأعمدة، والتفاصيل الإنشائية، مع مبنى حقيقي كمثال مستمر.",
    },
    audience: {
      en: "Third- and fourth-year civil engineering students, and graduates who want a solid design base.",
      ar: "طلاب الفرقتين الثالثة والرابعة بالهندسة المدنية، والخريجون الراغبون في أساس تصميمي قوي.",
    },
    problemSolved: {
      en: "Students memorize equations for exams but can't apply the code to a real building or read a structural drawing with confidence.",
      ar: "يحفظ الطلاب المعادلات للامتحانات، لكنهم لا يستطيعون تطبيق الكود على مبنى حقيقي أو قراءة لوحة إنشائية بثقة.",
    },
    expectations: {
      en: "Five evening meetings with hand calculations, worked examples and a detailing exercise. No software needed.",
      ar: "خمس محاضرات مسائية بحسابات يدوية وأمثلة محلولة وتمرين تفاصيل إنشائية، دون الحاجة إلى برامج.",
    },
    outcomes: {
      en: [
        "Apply limit-state design per ECP 203",
        "Design solid and flat slabs",
        "Design beams for flexure and shear",
        "Design columns using interaction diagrams",
        "Read and detail structural drawings",
      ],
      ar: [
        "تطبيق التصميم بطريقة حالات الحدود وفق ECP 203",
        "تصميم البلاطات المصمتة واللاكمرية",
        "تصميم الكمرات للانحناء والقص",
        "تصميم الأعمدة باستخدام منحنيات التفاعل",
        "قراءة اللوحات الإنشائية وإعداد تفاصيلها",
      ],
    },
    modules: [
      {
        order: 1,
        durationHours: 3,
        title: { en: "Limit-state design & materials", ar: "التصميم بحالات الحدود والمواد" },
      },
      {
        order: 2,
        durationHours: 3,
        title: { en: "Slabs: solid & flat slabs", ar: "البلاطات: المصمتة واللاكمرية" },
      },
      {
        order: 3,
        durationHours: 3,
        title: { en: "Beams: flexure & shear", ar: "الكمرات: الانحناء والقص" },
      },
      {
        order: 4,
        durationHours: 3,
        title: { en: "Columns & interaction diagrams", ar: "الأعمدة ومنحنيات التفاعل" },
      },
      {
        order: 5,
        durationHours: 3,
        title: {
          en: "Detailing & reading structural drawings",
          ar: "التفاصيل الإنشائية وقراءة اللوحات",
        },
      },
    ],
    requirements: {
      en: ["Strength of materials and structural analysis basics"],
      ar: ["أساسيات مقاومة المواد والتحليل الإنشائي"],
    },
    whatToBring: {
      en: ["Scientific calculator", "Notebook", "Printed code tables (PDF sent after booking)"],
      ar: ["آلة حاسبة علمية", "كراسة ملاحظات", "جداول الكود مطبوعة (تُرسل PDF بعد الحجز)"],
    },
    faq: [
      {
        question: {
          en: "Is this course suitable for third-year students?",
          ar: "هل الدورة مناسبة لطلاب الفرقة الثالثة؟",
        },
        answer: { en: "Yes, it's designed for them.", ar: "نعم، فهي مصممة لهم." },
      },
    ],
    certificationIds: ["CERT-05", "CERT-06"],
    level: "BEGINNER",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 15,
    meetingsCount: 5,
    basePrice: 2800 * EGP,
    coverDiscipline: { en: "Concrete design", ar: "تصميم الخرسانة" },
    isPublished: true,
    isFeatured: true,
    isComingSoon: false,
    registrationClosed: false,
    sortOrder: 3,
  },
  {
    id: "C4",
    slug: "revit-structure-bim",
    code: "RVT",
    title: {
      en: "Revit Structure: BIM Modeling & Structural Drawings",
      ar: "ريفيت إنشائي: نمذجة BIM وإخراج اللوحات الإنشائية",
    },
    shortDescription: {
      en: "Model a full structural building in Revit and produce clean, coordinated structural drawings, the way BIM teams deliver projects today.",
      ar: "نمذج مبنى إنشائيًا كاملًا على Revit وأخرج لوحات إنشائية منظمة ومنسقة، بالطريقة التي تسلّم بها فرق BIM مشاريعها اليوم.",
    },
    about: {
      en: "From an empty template to a printed drawing set: grids, levels, structural elements, reinforcement, schedules and sheets.",
      ar: "من قالب فارغ إلى مجموعة لوحات جاهزة للطباعة: المحاور والمناسيب والعناصر الإنشائية والتسليح والجداول واللوحات.",
    },
    audience: {
      en: "Students and engineers who want to work in BIM or drafting/design roles.",
      ar: "الطلاب والمهندسون الراغبون في العمل بمجال BIM أو الرسم والتصميم.",
    },
    problemSolved: {
      en: "Employers increasingly ask for Revit, but most engineers only know AutoCAD drafting.",
      ar: "أصبح أصحاب العمل يطلبون Revit بشكل متزايد، بينما يعرف معظم المهندسين الرسم على AutoCAD فقط.",
    },
    expectations: {
      en: "Four practical meetings that end with your own complete drawing set.",
      ar: "أربع محاضرات عملية تنتهي بمجموعة لوحات كاملة من إعدادك.",
    },
    outcomes: {
      en: [
        "Set up a structural Revit template",
        "Model foundations, columns, beams, slabs and walls",
        "Add reinforcement and schedules",
        "Produce and print a coordinated drawing set",
      ],
      ar: [
        "إعداد قالب Revit إنشائي",
        "نمذجة الأساسات والأعمدة والكمرات والبلاطات والحوائط",
        "إضافة التسليح والجداول",
        "إخراج وطباعة مجموعة لوحات منسقة",
      ],
    },
    modules: [
      {
        order: 1,
        durationHours: 4,
        title: { en: "Templates, grids & levels", ar: "القوالب والمحاور والمناسيب" },
      },
      { order: 2, durationHours: 4, title: { en: "Structural modeling", ar: "النمذجة الإنشائية" } },
      {
        order: 3,
        durationHours: 4,
        title: { en: "Reinforcement & schedules", ar: "التسليح والجداول" },
      },
      {
        order: 4,
        durationHours: 4,
        title: { en: "Sheets, annotation & printing", ar: "اللوحات والتعليقات والطباعة" },
      },
    ],
    requirements: { en: ["Laptop with Revit installed"], ar: ["لابتوب مثبت عليه Revit"] },
    whatToBring: { en: ["Laptop & charger", "Mouse"], ar: ["اللابتوب والشاحن", "ماوس"] },
    faq: [],
    certificationIds: ["CERT-02"],
    level: "BEGINNER",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 16,
    meetingsCount: 4,
    basePrice: 3500 * EGP,
    coverDiscipline: { en: "BIM & drawings", ar: "BIM واللوحات" },
    isPublished: true,
    isFeatured: false,
    isComingSoon: false,
    registrationClosed: false,
    sortOrder: 4,
  },
  {
    id: "C5",
    slug: "steel-connections-workshop",
    code: "STL",
    title: { en: "Steel Connections Design Workshop", ar: "ورشة تصميم وصلات المنشآت المعدنية" },
    shortDescription: {
      en: "A one-day intensive on designing bolted and welded connections and base plates, with worked examples from real steel structures.",
      ar: "يوم تدريبي مكثف لتصميم الوصلات بالمسامير واللحام وقواعد الأعمدة، مع أمثلة محلولة من منشآت معدنية حقيقية.",
    },
    about: {
      en: "Six focused hours on the connections that decide whether a steel structure works: shear and moment connections, welds, base plates and anchor bolts.",
      ar: "ست ساعات مركزة على الوصلات التي تحدد نجاح المنشأ المعدني: وصلات القص والعزوم، واللحامات، وقواعد الأعمدة ومسامير التثبيت.",
    },
    audience: {
      en: "Fourth-year students and junior engineers working on steel or industrial projects.",
      ar: "طلاب الفرقة الرابعة والمهندسون حديثو التخرج العاملون في مشاريع معدنية أو صناعية.",
    },
    problemSolved: {
      en: "Connections are often left to the fabricator because engineers aren't confident designing them.",
      ar: "كثيرًا ما تُترك الوصلات للمصنّع لأن المهندسين لا يثقون في تصميمها.",
    },
    expectations: {
      en: "One full day with three blocks, a lunch break and a final case study.",
      ar: "يوم كامل من ثلاثة أجزاء، مع استراحة غداء، ودراسة حالة ختامية.",
    },
    outcomes: {
      en: [
        "Design bolted shear and moment connections",
        "Design fillet and groove welds",
        "Design base plates and anchor bolts",
      ],
      ar: [
        "تصميم وصلات القص والعزوم بالمسامير",
        "تصميم اللحامات الزاوية والتناكبية",
        "تصميم قواعد الأعمدة ومسامير التثبيت",
      ],
    },
    modules: [
      { order: 1, durationHours: 2, title: { en: "Bolted connections", ar: "الوصلات بالمسامير" } },
      { order: 2, durationHours: 2, title: { en: "Welded connections", ar: "الوصلات الملحومة" } },
      {
        order: 3,
        durationHours: 2,
        title: {
          en: "Base plates, anchor bolts & case study",
          ar: "قواعد الأعمدة ومسامير التثبيت ودراسة حالة",
        },
      },
    ],
    requirements: { en: ["Basic steel design"], ar: ["أساسيات تصميم المنشآت المعدنية"] },
    whatToBring: { en: ["Calculator", "Notebook"], ar: ["آلة حاسبة", "كراسة ملاحظات"] },
    faq: [],
    certificationIds: ["CERT-05"],
    level: "INTERMEDIATE",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 6,
    meetingsCount: 1,
    basePrice: 950 * EGP,
    coverDiscipline: { en: "Steel structures", ar: "المنشآت المعدنية" },
    isPublished: true,
    isFeatured: true,
    isComingSoon: false,
    registrationClosed: false,
    sortOrder: 5,
  },
  {
    id: "C6",
    slug: "shop-drawings-boq",
    code: "SHD",
    title: {
      en: "Structural Shop Drawings & Quantity Surveying (BOQ)",
      ar: "اللوحات التنفيذية الإنشائية وحصر الكميات",
    },
    shortDescription: {
      en: "Read design drawings, produce shop drawings, and prepare accurate quantity take-offs and a BOQ for RC buildings.",
      ar: "اقرأ لوحات التصميم، وأعدّ اللوحات التنفيذية، وجهّز حصرًا دقيقًا للكميات وجدول كميات (BOQ) للمباني الخرسانية.",
    },
    about: {
      en: "Everything a site or technical-office engineer needs: shop drawings for foundations, columns and slabs, bar bending schedules and quantity surveying.",
      ar: "كل ما يحتاجه مهندس الموقع أو المكتب الفني: اللوحات التنفيذية للأساسات والأعمدة والبلاطات، وجداول تفريد الحديد، وحصر الكميات.",
    },
    audience: {
      en: "Fresh graduates targeting technical-office jobs.",
      ar: "حديثو التخرج الراغبون في العمل بالمكتب الفني.",
    },
    problemSolved: {
      en: "Technical-office roles are the most common first job, and graduates are rarely trained for them.",
      ar: "وظائف المكتب الفني هي أكثر وظائف البداية شيوعًا، ونادرًا ما يتدرب الخريجون عليها.",
    },
    expectations: {
      en: "Four practical meetings using a real project's drawings.",
      ar: "أربع محاضرات عملية على لوحات مشروع حقيقي.",
    },
    outcomes: {
      en: [
        "Read structural design drawings confidently",
        "Produce shop drawings for foundations, columns and slabs",
        "Prepare bar bending schedules",
        "Prepare quantity take-offs and a BOQ",
      ],
      ar: [
        "قراءة لوحات التصميم الإنشائي بثقة",
        "إعداد اللوحات التنفيذية للأساسات والأعمدة والبلاطات",
        "إعداد جداول تفريد الحديد",
        "إعداد حصر الكميات وجدول الكميات",
      ],
    },
    modules: [
      {
        order: 1,
        durationHours: 4,
        title: { en: "Reading design drawings", ar: "قراءة لوحات التصميم" },
      },
      { order: 2, durationHours: 4, title: { en: "Shop drawings", ar: "اللوحات التنفيذية" } },
      {
        order: 3,
        durationHours: 4,
        title: { en: "Bar bending schedules", ar: "جداول تفريد الحديد" },
      },
      {
        order: 4,
        durationHours: 4,
        title: { en: "Quantity take-off & BOQ", ar: "حصر الكميات وجدول الكميات" },
      },
    ],
    requirements: { en: ["Basic AutoCAD"], ar: ["أساسيات AutoCAD"] },
    whatToBring: LAPTOP_AND_NOTEBOOK,
    faq: [
      {
        question: { en: "When is the next session?", ar: "متى الدورة القادمة؟" },
        answer: {
          en: "New dates will be announced on this page. Contact us to be notified.",
          ar: "سيتم الإعلان عن المواعيد الجديدة في هذه الصفحة. تواصل معنا ليصلك إشعار.",
        },
      },
    ],
    certificationIds: ["CERT-01", "CERT-02"],
    level: "BEGINNER",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 16,
    meetingsCount: 4,
    basePrice: 2600 * EGP,
    coverDiscipline: { en: "Technical office", ar: "المكتب الفني" },
    isPublished: true,
    isFeatured: false,
    isComingSoon: false,
    registrationClosed: false,
    sortOrder: 6,
  },
  {
    id: "C7",
    slug: "post-tensioned-slabs",
    code: "PTS",
    title: {
      en: "Post-Tensioned Slabs Design",
      ar: "تصميم البلاطات سابقة الإجهاد (Post-Tensioned)",
    },
    shortDescription: {
      en: "Understand and design post-tensioned flat slabs: tendon layout, load balancing, losses and code checks.",
      ar: "افهم وصمّم البلاطات اللاكمرية سابقة الإجهاد: توزيع الكابلات، وموازنة الأحمال، والفواقد، ومراجعات الكود.",
    },
    about: {
      en: "An advanced course for engineers who already design RC buildings and want to work on post-tensioned projects.",
      ar: "دورة متقدمة للمهندسين الذين يصممون المباني الخرسانية بالفعل ويرغبون في العمل على مشاريع سابقة الإجهاد.",
    },
    audience: {
      en: "Structural engineers with 2+ years of design experience.",
      ar: "مهندسون إنشائيون بخبرة تصميم سنتين أو أكثر.",
    },
    problemSolved: {
      en: "Post-tensioning is growing in Egyptian projects, but practical training is rare.",
      ar: "تنتشر الخرسانة سابقة الإجهاد في المشاريع المصرية، بينما التدريب العملي عليها نادر.",
    },
    expectations: {
      en: "Three advanced meetings with a full PT slab design example.",
      ar: "ثلاث محاضرات متقدمة بمثال تصميم كامل لبلاطة سابقة الإجهاد.",
    },
    outcomes: {
      en: [
        "Explain post-tensioning concepts and load balancing",
        "Lay out tendons and estimate losses",
        "Run the code checks for a PT flat slab",
      ],
      ar: [
        "شرح مفاهيم سبق الإجهاد وموازنة الأحمال",
        "توزيع الكابلات وتقدير الفواقد",
        "إجراء مراجعات الكود لبلاطة لاكمرية سابقة الإجهاد",
      ],
    },
    modules: [
      {
        order: 1,
        durationHours: 4,
        title: { en: "PT concepts & load balancing", ar: "مفاهيم سبق الإجهاد وموازنة الأحمال" },
      },
      {
        order: 2,
        durationHours: 4,
        title: { en: "Tendon layout & losses", ar: "توزيع الكابلات والفواقد" },
      },
      {
        order: 3,
        durationHours: 4,
        title: { en: "Design checks & detailing", ar: "مراجعات التصميم والتفاصيل" },
      },
    ],
    requirements: {
      en: ["Strong RC design background"],
      ar: ["خلفية قوية في تصميم الخرسانة المسلحة"],
    },
    whatToBring: LAPTOP_AND_NOTEBOOK,
    faq: [],
    certificationIds: ["CERT-05"],
    level: "ADVANCED",
    language: ARABIC_WITH_ENGLISH_TERMS,
    totalHours: 12,
    meetingsCount: 3,
    basePrice: 3900 * EGP,
    coverDiscipline: { en: "Prestressed concrete", ar: "الخرسانة سابقة الإجهاد" },
    isPublished: true,
    isFeatured: false,
    isComingSoon: true,
    registrationClosed: false,
    comingSoonNote: {
      en: "First session expected in January 2027.",
      ar: "من المتوقع بدء أول دورة في يناير 2027.",
    },
    sortOrder: 7,
  },
];

export const generalFaq: FaqItem[] = [
  {
    question: { en: "Where are the courses held?", ar: "أين تُقام الدورات؟" },
    answer: {
      en: "At Engineering Hub Training Center, in Nasr City (Cairo) or Dokki (Giza). Each session shows its branch, address and map link.",
      ar: "في مركز إنجينيرنج هَب للتدريب، بفرعي مدينة نصر (القاهرة) أو الدقي (الجيزة). تظهر لكل دورة الفرع والعنوان ورابط الخريطة.",
    },
  },
  {
    question: { en: "How long is each course?", ar: "ما مدة كل دورة؟" },
    answer: {
      en: "It depends on the course. Each course page shows the total hours, the number of meetings and the full schedule.",
      ar: "تختلف حسب الدورة، وتعرض صفحة كل دورة إجمالي الساعات وعدد المحاضرات والجدول الكامل.",
    },
  },
  {
    question: { en: "What should I bring?", ar: "ماذا أحضر معي؟" },
    answer: {
      en: "Each course lists what to bring. Software courses need a laptop with the program installed; we email the setup guide after booking.",
      ar: "تذكر كل دورة ما يجب إحضاره. دورات البرامج تتطلب لابتوب مثبتًا عليه البرنامج، ونرسل دليل التثبيت بالبريد بعد الحجز.",
    },
  },
  {
    question: { en: "How do I receive my ticket?", ar: "كيف أستلم تذكرتي؟" },
    answer: {
      en: "Right after payment, your QR ticket appears on screen and is emailed to you. Show it at reception for each meeting.",
      ar: "فور الدفع تظهر تذكرة QR على الشاشة وتصلك على بريدك الإلكتروني. اعرضها في الاستقبال في كل محاضرة.",
    },
  },
  {
    question: { en: "I lost my ticket. What should I do?", ar: "فقدت تذكرتي، ماذا أفعل؟" },
    answer: {
      en: "Use “Find my ticket” with your email and booking reference, and we'll email it again.",
      ar: "استخدم صفحة “العثور على تذكرتي” ببريدك ورقم الحجز، وسنعيد إرسالها إليك.",
    },
  },
  {
    question: { en: "Can I change my session?", ar: "هل يمكنني تغيير موعد الدورة؟" },
    answer: {
      en: "Yes, once and free of charge, up to 48 hours before the first meeting, if seats are available. Contact us with your booking reference.",
      ar: "نعم، مرة واحدة مجانًا حتى 48 ساعة قبل أول محاضرة، حسب توفر المقاعد. تواصل معنا برقم الحجز.",
    },
  },
  {
    question: { en: "What is the refund policy?", ar: "ما سياسة الاسترداد؟" },
    answer: {
      en: "Full refund up to 7 days before the first meeting, 50% between 7 days and 72 hours, and no refund within 72 hours. See the usage policy for details.",
      ar: "استرداد كامل حتى 7 أيام قبل أول محاضرة، و50% بين 7 أيام و72 ساعة، ولا استرداد خلال آخر 72 ساعة. التفاصيل في سياسة الاستخدام.",
    },
  },
  {
    question: { en: "Which payment methods are accepted?", ar: "ما وسائل الدفع المتاحة؟" },
    answer: {
      en: "Bank cards (Visa, Mastercard, Meeza) and mobile wallets.",
      ar: "البطاقات البنكية (فيزا، ماستركارد، ميزة) والمحافظ الإلكترونية.",
    },
  },
  {
    question: { en: "Will I get a certificate?", ar: "هل أحصل على شهادة؟" },
    answer: {
      en: "Students who attend at least 75% of the meetings receive a printed certificate of attendance at the last meeting.",
      ar: "يحصل المتدربون الذين يحضرون 75% على الأقل من المحاضرات على شهادة حضور مطبوعة في آخر محاضرة.",
    },
  },
  {
    question: { en: "What happens after payment?", ar: "ماذا يحدث بعد الدفع؟" },
    answer: {
      en: "Your seat is confirmed immediately, you receive your ticket by email, and you get the course preparation details before the first meeting.",
      ar: "يُؤكَّد مقعدك فورًا، وتصلك التذكرة بالبريد، ثم تصلك تفاصيل التحضير للدورة قبل أول محاضرة.",
    },
  },
];
