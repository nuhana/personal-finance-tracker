export default function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold font-mono">{value}</div>
    </div>
  );
}
