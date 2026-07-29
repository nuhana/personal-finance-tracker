export default function ChartCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm min-h-[240px] flex items-center justify-center">
      <span className="text-slate-500">{title} — connect Recharts here</span>
    </div>
  );
}
