import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';

export default function KidsPageLayout({
  title,
  subtitle,
  emoji,
  children,
  tone = 'from-pink-50 to-sky-50'
}: {
  title: string;
  subtitle: string;
  emoji: string;
  children: ReactNode;
  tone?: string;
}) {
  return (
    <div className={`min-h-screen bg-gradient-to-b ${tone} p-4 md:p-8`} dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Link to="/kids" className="inline-flex mb-6 items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">
          <ArrowRight className="w-4 h-4" />
          العودة لعالم الأطفال
        </Link>
        <div className="bg-white rounded-3xl border-2 border-white shadow-lg p-6 md:p-8 mb-6">
          <SectionHeader title={title} subtitle={subtitle} emoji={emoji} />
        </div>
        {children}
      </div>
    </div>
  );
}
