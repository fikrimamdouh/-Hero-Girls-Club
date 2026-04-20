import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  FileText,
  Loader2,
  Sparkles,
  FileDown,
  Images,
  Palette,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

type LengthLevel = 'مختصر' | 'متوسط' | 'كامل';
type WritingStyle = 'بسيط للأطفال' | 'ممتع ومرح' | 'قصصي وسهل';
type CoverTheme = 'ملون ومرح' | 'مدرسي أنيق' | 'طبيعة جميلة' | 'فضاء ونجوم' | 'حيوانات لطيفة';
type ReportType = 'بحث مدرسي' | 'تقرير مبسط' | 'موضوع تعبير';

type ResearchSection = {
  heading: string;
  content: string;
  bullets?: string[];
};

type ResearchImage = {
  caption: string;
  url: string;
};

type ResearchStudent = {
  studentName: string;
  teacherName: string;
  schoolName: string;
  grade: string;
};

type ResearchOptions = {
  reportType?: ReportType;
  writingStyle?: WritingStyle;
  imageCount?: number;
  coverTheme?: CoverTheme;
  includeFunFacts?: boolean;
  includeQuestions?: boolean;
  lengthLevel?: LengthLevel;
};

type ResearchCover = {
  title: string;
  subtitle: string;
  theme?: CoverTheme | string;
  info?: ResearchStudent;
};

type ResearchReport = {
  student?: ResearchStudent;
  options?: ResearchOptions;
  cover?: ResearchCover;
  title: string;
  introduction: string;
  sections: ResearchSection[];
  conclusion: string;
  whatWeLearned: string[];
  funFacts?: string[];
  reviewQuestions?: string[];
  images: ResearchImage[];
  exportOptions?: {
    pdf?: boolean;
    word?: boolean;
    paperSize?: string;
    rtl?: boolean;
    printReady?: boolean;
  };
};

const initialForm = {
  studentName: '',
  teacherName: '',
  schoolName: '',
  grade: '',
  title: '',
  lengthLevel: 'متوسط' as LengthLevel,
  reportType: 'بحث مدرسي' as ReportType,
  writingStyle: 'بسيط للأطفال' as WritingStyle,
  imageCount: 3,
  coverTheme: 'ملون ومرح' as CoverTheme,
  includeFunFacts: true,
  includeQuestions: true,
};

const cleanFileName = (value: string) =>
  value.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').slice(0, 100);

const getThemeConfig = (theme?: string) => {
  switch (theme) {
    case 'مدرسي أنيق':
      return {
        pageBg: '#eff6ff',
        panelBg: '#ffffff',
        badgeBg: '#0284c7',
        accentColor: '#0369a1',
        borderColor: '#bae6fd',
        cardBg: '#f8fafc',
        softBg: '#f0f9ff',
        emoji: '📘',
      };
    case 'طبيعة جميلة':
      return {
        pageBg: '#ecfdf5',
        panelBg: '#ffffff',
        badgeBg: '#059669',
        accentColor: '#047857',
        borderColor: '#bbf7d0',
        cardBg: '#f0fdf4',
        softBg: '#ecfdf5',
        emoji: '🌿',
      };
    case 'فضاء ونجوم':
      return {
        pageBg: '#eef2ff',
        panelBg: '#ffffff',
        badgeBg: '#6d28d9',
        accentColor: '#5b21b6',
        borderColor: '#ddd6fe',
        cardBg: '#f5f3ff',
        softBg: '#f5f3ff',
        emoji: '🚀',
      };
    case 'حيوانات لطيفة':
      return {
        pageBg: '#fff7ed',
        panelBg: '#ffffff',
        badgeBg: '#ea580c',
        accentColor: '#c2410c',
        borderColor: '#fed7aa',
        cardBg: '#fff7ed',
        softBg: '#fff7ed',
        emoji: '🦁',
      };
    default:
      return {
        pageBg: '#ecfeff',
        panelBg: '#ffffff',
        badgeBg: '#0891b2',
        accentColor: '#0f766e',
        borderColor: '#bae6fd',
        cardBg: '#f0fdfa',
        softBg: '#ecfeff',
        emoji: '🎨',
      };
  }
};
const makeCoverSvg = (title: string, bg: string, fg: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
      <rect width="100%" height="100%" fill="${bg}" />
      <text x="50%" y="45%" text-anchor="middle" font-size="54" font-family="Arial" fill="${fg}">
        غلاف البحث
      </text>
      <text x="50%" y="56%" text-anchor="middle" font-size="34" font-family="Arial" fill="${fg}">
        ${title}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
const getThemeCoverImage = (theme?: string, report?: ResearchReport) => {
  const firstImage = report?.images?.[0]?.url;
  if (firstImage) return firstImage;

  const title = report?.title || 'بحث مدرسي';

  switch (theme) {
    case 'مدرسي أنيق':
      return makeCoverSvg(title, '#E0F2FE', '#075985');
    case 'طبيعة جميلة':
      return makeCoverSvg(title, '#DCFCE7', '#166534');
    case 'فضاء ونجوم':
      return makeCoverSvg(title, '#EDE9FE', '#5B21B6');
    case 'حيوانات لطيفة':
      return makeCoverSvg(title, '#FFEDD5', '#C2410C');
    default:
      return makeCoverSvg(title, '#ECFEFF', '#0F766E');
  }
};



export default function ResearchCenterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ResearchReport | null>(null);

  const themeConfig = getThemeConfig(form.coverTheme);

  const exportBaseName = useMemo(() => {
    const title = cleanFileName(form.title || 'بحث');
    const student = cleanFileName(form.studentName || 'طالب');
    return `البحث-${title}-${student}`;
  }, [form.title, form.studentName]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.studentName || !form.teacherName || !form.schoolName || !form.grade || !form.title) {
      const msg = 'من فضلك املأ جميع الحقول الأساسية.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const rawText = await response.text();
      let data: any = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!data) {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء البحث');
      }

      setReport(data.report);
      toast.success('تم إعداد البحث بنجاح');
    } catch (err: any) {
      const message =
        err?.message?.includes('Server returned non-JSON response')
          ? 'الخادم أعاد استجابة غير صالحة حالياً.'
          : err?.message || 'تعذر إنشاء البحث الآن.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
  if (!report) return;

  try {
    const student = report.student || {
      studentName: form.studentName,
      teacherName: form.teacherName,
      schoolName: form.schoolName,
      grade: form.grade,
    };

    const coverImage = getThemeCoverImage(report.cover?.theme || form.coverTheme, report);

    const sectionsHtml = (report.sections || [])
      .map(
        (section) => `
          <section style="page-break-after: always; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
            <div style="border:1px solid #e2e8f0;border-radius:24px;padding:24px;background:#ffffff;">
              <h2 style="font-size:30px;font-weight:900;color:#6d28d9;margin:0 0 16px;">${section.heading}</h2>
              <p style="font-size:18px;line-height:2.1;color:#334155;margin:0;">${section.content}</p>
              ${(section.bullets || [])
                .map(
                  (b) => `
                    <div style="margin-top:12px;border:1px solid #ddd6fe;background:#f5f3ff;border-radius:16px;padding:12px 16px;font-size:16px;font-weight:700;color:#334155;">
                      • ${b}
                    </div>
                  `,
                )
                .join('')}
            </div>
          </section>
        `,
      )
      .join('');

    const funFactsHtml = (report.funFacts || []).length
      ? `
        <section style="page-break-after: always; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
          <div style="border:1px solid #fde68a;border-radius:24px;padding:24px;background:#fffbeb;">
            <h2 style="font-size:26px;font-weight:900;color:#b45309;margin:0 0 16px;">معلومات ممتعة</h2>
            ${(report.funFacts || [])
              .map(
                (item) => `
                  <div style="margin-top:12px;border:1px solid #fde68a;background:#ffffff;border-radius:16px;padding:12px 16px;font-size:16px;font-weight:700;color:#334155;">
                    • ${item}
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      `
      : '';

    const questionsHtml = (report.reviewQuestions || []).length
      ? `
        <section style="page-break-after: always; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
          <div style="border:1px solid #bae6fd;border-radius:24px;padding:24px;background:#ecfeff;">
            <h2 style="font-size:26px;font-weight:900;color:#0e7490;margin:0 0 16px;">أسئلة مراجعة</h2>
            ${(report.reviewQuestions || [])
              .map(
                (item) => `
                  <div style="margin-top:12px;border:1px solid #bae6fd;background:#ffffff;border-radius:16px;padding:12px 16px;font-size:16px;font-weight:700;color:#334155;">
                    • ${item}
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      `
      : '';

    const learnedHtml = (report.whatWeLearned || []).length
      ? `
        <section style="page-break-after: auto; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
          <div style="border:1px solid #f5d0fe;border-radius:24px;padding:24px;background:#fdf4ff;">
            <h2 style="font-size:26px;font-weight:900;color:#c026d3;margin:0 0 16px;">ماذا تعلمنا؟</h2>
            ${(report.whatWeLearned || [])
              .map(
                (item) => `
                  <div style="margin-top:12px;border:1px solid #f5d0fe;background:#ffffff;border-radius:16px;padding:12px 16px;font-size:16px;font-weight:700;color:#334155;">
                    • ${item}
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      `
      : '';

    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>${exportBaseName}</title>
          <style>
            @page { size: A4; margin: 8mm; }
            body {
              margin: 0;
              background: #ffffff;
              color: #1e293b;
              font-family: Arial, sans-serif;
              direction: rtl;
            }
            img {
              max-width: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          <div style="width:210mm;background:#ffffff;color:#1e293b;direction:rtl;">
            <section style="page-break-after: always; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
              <div style="border:1px solid #cbd5e1;border-radius:28px;padding:24px;background:#ecfeff;">
                <div style="background:#0891b2;color:#fff;border-radius:999px;padding:8px 16px;font-size:14px;font-weight:800;display:inline-block;">
                  مركز الأبحاث المذهل
                </div>
                <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;background:#fff;">
                  <img src="${coverImage}" style="width:100%;height:260px;object-fit:cover;" />
                </div>
                <h1 style="font-size:36px;font-weight:900;color:#0f766e;line-height:1.4;margin:24px 0 0;text-align:center;">${report.cover?.title || report.title}</h1>
                <p style="margin:12px 0 0;font-size:18px;font-weight:700;color:#475569;text-align:center;">${report.cover?.subtitle || 'بحث مدرسي مميز'}</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px;">
                  <div style="background:#fff;border-radius:16px;padding:16px;border:1px solid #e2e8f0;"><div style="font-size:12px;color:#64748b;font-weight:700;">اسم الطالب/ة</div><div style="font-size:16px;color:#0f172a;font-weight:800;margin-top:4px;">${student.studentName}</div></div>
                  <div style="background:#fff;border-radius:16px;padding:16px;border:1px solid #e2e8f0;"><div style="font-size:12px;color:#64748b;font-weight:700;">إشراف المدرس/ة</div><div style="font-size:16px;color:#0f172a;font-weight:800;margin-top:4px;">${student.teacherName}</div></div>
                  <div style="background:#fff;border-radius:16px;padding:16px;border:1px solid #e2e8f0;"><div style="font-size:12px;color:#64748b;font-weight:700;">اسم المدرسة</div><div style="font-size:16px;color:#0f172a;font-weight:800;margin-top:4px;">${student.schoolName}</div></div>
                  <div style="background:#fff;border-radius:16px;padding:16px;border:1px solid #e2e8f0;"><div style="font-size:12px;color:#64748b;font-weight:700;">الصف / السنة الدراسية</div><div style="font-size:16px;color:#0f172a;font-weight:800;margin-top:4px;">${student.grade}</div></div>
                </div>
              </div>
            </section>

            <section style="page-break-after: always; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
              <div style="border:1px solid #e2e8f0;border-radius:24px;padding:24px;background:#ffffff;">
                <h2 style="font-size:30px;font-weight:900;color:#6d28d9;margin:0 0 16px;">المقدمة</h2>
                <p style="font-size:18px;line-height:2.1;color:#334155;margin:0;">${report.introduction}</p>
              </div>
            </section>

            ${sectionsHtml}

            <section style="page-break-after: always; min-height: 297mm; padding: 12mm; box-sizing: border-box;">
              <div style="border:1px solid #e2e8f0;border-radius:24px;padding:24px;background:#ffffff;">
                <h2 style="font-size:30px;font-weight:900;color:#6d28d9;margin:0 0 16px;">الخاتمة</h2>
                <p style="font-size:18px;line-height:2.1;color:#334155;margin:0;">${report.conclusion}</p>
              </div>
            </section>

            ${funFactsHtml}
            ${questionsHtml}
            ${learnedHtml}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=1400');
    if (!printWindow) {
      toast.error('تعذر فتح نافذة الطباعة');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
  printWindow.focus();
  printWindow.print();
}, 500);
  } catch (pdfError) {
    console.error('PDF export error:', pdfError);
    toast.error('فشل تحميل PDF');
  }
};
  const exportWord = async () => {
    if (!report) return;

    try {
      const children: Paragraph[] = [];

      const student = report.student || {
        studentName: form.studentName,
        teacherName: form.teacherName,
        schoolName: form.schoolName,
        grade: form.grade,
      };

      children.push(
        new Paragraph({
          text: report.cover?.title || report.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          bidirectional: true,
        }),
        new Paragraph({
          text: report.cover?.subtitle || 'بحث مدرسي جاهز للطباعة',
          alignment: AlignmentType.CENTER,
          bidirectional: true,
        }),
        new Paragraph({ text: '', bidirectional: true }),
        new Paragraph({
          children: [new TextRun({ text: `إعداد الطالب/ة: ${student.studentName}`, bold: true })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({
          children: [new TextRun({ text: `إشراف المدرس/ة: ${student.teacherName}`, bold: true })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({
          children: [new TextRun({ text: `اسم المدرسة: ${student.schoolName}`, bold: true })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({
          children: [new TextRun({ text: `الصف / السنة الدراسية: ${student.grade}`, bold: true })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({
          text: '',
          pageBreakBefore: true,
          bidirectional: true,
        }),
        new Paragraph({
          text: 'المقدمة',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({
          text: report.introduction || '',
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
      );

      for (const section of report.sections || []) {
        children.push(
          new Paragraph({
            text: section.heading,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
          new Paragraph({
            text: section.content || '',
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        );

        for (const bullet of section.bullets || []) {
          children.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
        }
      }

      if (report.funFacts?.length) {
        children.push(
          new Paragraph({
            text: 'معلومات ممتعة',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        );

        for (const fact of report.funFacts) {
          children.push(
            new Paragraph({
              text: fact,
              bullet: { level: 0 },
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
        }
      }

      if (report.reviewQuestions?.length) {
        children.push(
          new Paragraph({
            text: 'أسئلة مراجعة',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        );

        for (const item of report.reviewQuestions) {
          children.push(
            new Paragraph({
              text: item,
              bullet: { level: 0 },
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
        }
      }

      children.push(
        new Paragraph({
          text: 'الخاتمة',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
        new Paragraph({
          text: report.conclusion || '',
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        }),
      );

      if (report.whatWeLearned?.length) {
        children.push(
          new Paragraph({
            text: 'ماذا تعلمنا؟',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
          }),
        );

        for (const item of report.whatWeLearned) {
          children.push(
            new Paragraph({
              text: item,
              bullet: { level: 0 },
              alignment: AlignmentType.RIGHT,
              bidirectional: true,
            }),
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${exportBaseName}.docx`);
      toast.success('تم تحميل Word بنجاح');
    } catch (wordError) {
      console.error('Word export error:', wordError);
      toast.error('فشل تحميل Word');
    }
  };

 
    
  
      

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: themeConfig.pageBg,
        fontFamily: '"Cairo","Tajawal",Tahoma,sans-serif',
      }}
    >
      <header
        style={{
          padding: '20px',
          background: 'rgba(255,255,255,0.9)',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/child')}
            className="p-3 rounded-full hover:bg-white text-slate-700 border border-slate-200"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <div className="text-center flex-1">
            <h1
              className="text-2xl md:text-4xl font-black flex justify-center items-center gap-2"
              style={{ color: themeConfig.accentColor }}
            >
              <Sparkles className="w-7 h-7" />
              مركز الأبحاث المذهل
            </h1>
            <p className="text-slate-600 font-bold text-sm md:text-base mt-2">
              بحث عربي أنيق للأطفال، جاهز للطباعة والتصدير إلى PDF و Word
            </p>
          </div>

          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section
          className="xl:col-span-2 rounded-[28px] p-6 shadow-lg"
          style={{
            background: themeConfig.panelBg,
            border: `1px solid ${themeConfig.borderColor}`,
          }}
        >
          <h2 className="text-2xl font-black text-slate-800 mb-5">بيانات البحث</h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <input
              value={form.studentName}
              onChange={(e) => setForm((prev) => ({ ...prev, studentName: e.target.value }))}
              placeholder="اسم الطالب/الطالبة"
              className="w-full border border-slate-200 rounded-2xl p-3.5 font-bold focus:outline-none focus:border-cyan-300"
            />

            <input
              value={form.teacherName}
              onChange={(e) => setForm((prev) => ({ ...prev, teacherName: e.target.value }))}
              placeholder="اسم المدرس/المعلمة"
              className="w-full border border-slate-200 rounded-2xl p-3.5 font-bold focus:outline-none focus:border-cyan-300"
            />

            <input
              value={form.schoolName}
              onChange={(e) => setForm((prev) => ({ ...prev, schoolName: e.target.value }))}
              placeholder="اسم المدرسة"
              className="w-full border border-slate-200 rounded-2xl p-3.5 font-bold focus:outline-none focus:border-cyan-300"
            />

            <input
              value={form.grade}
              onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
              placeholder="الصف / السنة الدراسية"
              className="w-full border border-slate-200 rounded-2xl p-3.5 font-bold focus:outline-none focus:border-cyan-300"
            />

            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="عنوان البحث"
              className="w-full border border-slate-200 rounded-2xl p-3.5 font-bold focus:outline-none focus:border-cyan-300"
            />

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">مستوى الطول</label>
              <div className="grid grid-cols-3 gap-2">
                {(['مختصر', 'متوسط', 'كامل'] as LengthLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, lengthLevel: level }))}
                    className={`rounded-2xl p-3 text-sm font-black border transition ${
                      form.lengthLevel === level
                        ? 'text-white'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                    style={
                      form.lengthLevel === level
                        ? { background: themeConfig.badgeBg, borderColor: themeConfig.badgeBg }
                        : undefined
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 p-3 bg-white">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                  <Palette className="w-4 h-4" />
                  أسلوب الشرح
                </label>
                <select
                  value={form.writingStyle}
                  onChange={(e) => setForm((prev) => ({ ...prev, writingStyle: e.target.value as WritingStyle }))}
                  className="w-full rounded-xl border border-slate-200 p-3 font-bold bg-white"
                >
                  <option value="بسيط للأطفال">بسيط للأطفال</option>
                  <option value="ممتع ومرح">ممتع ومرح</option>
                  <option value="قصصي وسهل">قصصي وسهل</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 bg-white">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                  <FileText className="w-4 h-4" />
                  نوع البحث
                </label>
                <select
                  value={form.reportType}
                  onChange={(e) => setForm((prev) => ({ ...prev, reportType: e.target.value as ReportType }))}
                  className="w-full rounded-xl border border-slate-200 p-3 font-bold bg-white"
                >
                  <option value="بحث مدرسي">بحث مدرسي</option>
                  <option value="تقرير مبسط">تقرير مبسط</option>
                  <option value="موضوع تعبير">موضوع تعبير</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 bg-white">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                  <Images className="w-4 h-4" />
                  عدد الصور
                </label>
                <select
                  value={form.imageCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageCount: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 p-3 font-bold bg-white"
                >
                  <option value={2}>2 صور</option>
                  <option value={3}>3 صور</option>
                  <option value={4}>4 صور</option>
                  <option value={5}>5 صور</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3 bg-white">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                  <Sparkles className="w-4 h-4" />
                  ثيم الغلاف
                </label>
                <select
                  value={form.coverTheme}
                  onChange={(e) => setForm((prev) => ({ ...prev, coverTheme: e.target.value as CoverTheme }))}
                  className="w-full rounded-xl border border-slate-200 p-3 font-bold bg-white"
                >
                  <option value="ملون ومرح">ملون ومرح</option>
                  <option value="مدرسي أنيق">مدرسي أنيق</option>
                  <option value="طبيعة جميلة">طبيعة جميلة</option>
                  <option value="فضاء ونجوم">فضاء ونجوم</option>
                  <option value="حيوانات لطيفة">حيوانات لطيفة</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between cursor-pointer bg-white">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="font-black text-slate-700">إضافة معلومات ممتعة</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.includeFunFacts}
                  onChange={(e) => setForm((prev) => ({ ...prev, includeFunFacts: e.target.checked }))}
                />
              </label>

              <label className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between cursor-pointer bg-white">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-600" />
                  <span className="font-black text-slate-700">إضافة أسئلة مراجعة</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.includeQuestions}
                  onChange={(e) => setForm((prev) => ({ ...prev, includeQuestions: e.target.checked }))}
                />
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-black py-4 rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: themeConfig.badgeBg }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {loading ? 'جاري إعداد البحث...' : 'توليد البحث'}
            </button>
          </form>
        </section>

        <section
          className="xl:col-span-3 rounded-[28px] p-6 shadow-lg"
          style={{
            background: themeConfig.panelBg,
            border: `1px solid ${themeConfig.borderColor}`,
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <h2 className="text-2xl font-black text-slate-800">معاينة البحث</h2>

            {report && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={exportPDF}
                  className="text-white px-4 py-3 rounded-2xl font-black text-sm flex items-center gap-2"
                  style={{ background: '#059669' }}
                >
                  <Download className="w-4 h-4" />
                  تحميل PDF
                </button>

                <button
                  onClick={exportWord}
                  className="text-white px-4 py-3 rounded-2xl font-black text-sm flex items-center gap-2"
                  style={{ background: '#4f46e5' }}
                >
                  <FileDown className="w-4 h-4" />
                  تحميل Word
                </button>
              </div>
            )}
          </div>

          {!report ? (
            <div
              className="min-h-[620px] rounded-[28px] flex flex-col items-center justify-center text-center p-8"
              style={{
                border: '2px dashed #cbd5e1',
                background: '#f8fafc',
              }}
            >
              <div className="text-6xl mb-4">📚</div>
              <p className="font-black text-slate-800 text-xl">بعد تعبئة النموذج سيظهر البحث هنا</p>
              <p className="text-sm text-slate-500 mt-2 max-w-md leading-7">
                المعاينة مصممة لتبدو كبحث مدرسي جاهز للطباعة على A4، مع دعم PDF و Word.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className="rounded-[28px] overflow-hidden"
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                }}
              >
                <div
                  className="p-6"
                  style={{ background: themeConfig.cardBg }}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div
                      className="text-white rounded-full px-4 py-2 text-sm font-black"
                      style={{ background: themeConfig.badgeBg }}
                    >
                      مركز الأبحاث المذهل
                    </div>
                    <div className="text-3xl">{themeConfig.emoji}</div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
                    <div>
                      <h3
                        className="text-3xl font-black mb-3"
                        style={{ color: themeConfig.accentColor }}
                      >
                        {report.cover?.title || report.title}
                      </h3>
                      <p className="text-slate-600 font-bold leading-8">
                        {report.cover?.subtitle || 'بحث مدرسي جميل ومنظم للأطفال'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-sm">
                          <strong>الطالب/ة:</strong> {report.student?.studentName || form.studentName}
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-sm">
                          <strong>المدرس/ة:</strong> {report.student?.teacherName || form.teacherName}
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-sm">
                          <strong>المدرسة:</strong> {report.student?.schoolName || form.schoolName}
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm text-sm">
                          <strong>الصف:</strong> {report.student?.grade || form.grade}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] overflow-hidden border border-slate-200 shadow-sm bg-white">
                      <img
                        src={getThemeCoverImage(report.cover?.theme || form.coverTheme, report)}
                        alt={report.title}
                        className="w-full h-64 object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto">
                  <section className="mb-6 rounded-3xl bg-white border border-slate-200 p-5">
                    <h4 className="font-black text-2xl text-violet-700 mb-3">المقدمة</h4>
                    <p className="leading-9 text-slate-700 text-base">{report.introduction}</p>
                  </section>

                  {report.sections.map((section, index) => (
                    <section key={`${section.heading}-${index}`} className="mb-6 rounded-3xl bg-white border border-slate-200 p-5">
                      <h4 className="font-black text-2xl text-violet-700 mb-3">{section.heading}</h4>
                      <p className="leading-9 text-slate-700 text-base">{section.content}</p>

                      {!!section.bullets?.length && (
                        <div className="grid gap-2 mt-4">
                          {section.bullets.slice(0, 6).map((bullet, bulletIndex) => (
                            <div
                              key={`${bullet}-${bulletIndex}`}
                              className="rounded-2xl border px-4 py-3 font-bold text-slate-700"
                              style={{
                                borderColor: '#ddd6fe',
                                background: '#f5f3ff',
                              }}
                            >
                              • {bullet}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}

                  {!!report.images.length && (
                    <section className="mb-6 rounded-3xl bg-white border border-slate-200 p-5">
                      <h4 className="font-black text-2xl text-violet-700 mb-4">صور توضيحية</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.images.slice(0, 4).map((image, index) => (
                          <figure key={`${image.url}-${index}`} className="rounded-3xl border border-slate-200 overflow-hidden bg-slate-50">
                            <img
                              src={image.url}
                              alt={image.caption}
                              className="w-full h-48 object-cover"
                              loading="lazy"
                            />
                            <figcaption className="text-sm p-3 text-center font-bold text-slate-600">
                              {image.caption}
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </section>
                  )}

                  {!!report.funFacts?.length && (
                    <section
                      className="mb-6 rounded-3xl p-5"
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                      }}
                    >
                      <h4 className="font-black text-2xl mb-4" style={{ color: '#b45309' }}>معلومات ممتعة</h4>
                      <div className="grid gap-2">
                        {report.funFacts.map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-700"
                            style={{ border: '1px solid #fde68a' }}
                          >
                            • {item}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {!!report.reviewQuestions?.length && (
                    <section
                      className="mb-6 rounded-3xl p-5"
                      style={{
                        background: '#ecfeff',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      <h4 className="font-black text-2xl mb-4" style={{ color: '#0e7490' }}>أسئلة مراجعة</h4>
                      <div className="grid gap-2">
                        {report.reviewQuestions.map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-700"
                            style={{ border: '1px solid #bae6fd' }}
                          >
                            • {item}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mb-6 rounded-3xl bg-white border border-slate-200 p-5">
                    <h4 className="font-black text-2xl text-violet-700 mb-3">الخاتمة</h4>
                    <p className="leading-9 text-slate-700 text-base">{report.conclusion}</p>
                  </section>

                  <section
                    className="rounded-3xl p-5"
                    style={{
                      background: '#fdf4ff',
                      border: '1px solid #f5d0fe',
                    }}
                  >
                    <h4 className="font-black text-2xl mb-4" style={{ color: '#c026d3' }}>ماذا تعلمنا؟</h4>
                    <div className="grid gap-2">
                      {report.whatWeLearned.map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-700"
                          style={{ border: '1px solid #f5d0fe' }}
                        >
                          • {item}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

            
            </div>
          )}
        </section>
      </main>


    </div>
  );
}
