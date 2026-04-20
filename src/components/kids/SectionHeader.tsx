export default function SectionHeader({
  title,
  subtitle,
  emoji
}: {
  title: string;
  subtitle: string;
  emoji: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-2">
        <span>{emoji}</span>
        {title}
      </h2>
      <p className="text-slate-600 mt-2 text-lg">{subtitle}</p>
    </div>
  );
}
