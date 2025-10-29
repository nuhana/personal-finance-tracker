export default function TransactionForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input className="border rounded-xl px-3 py-2" placeholder="Amount" />
      <input className="border rounded-xl px-3 py-2" placeholder="Category" />
      <input className="border rounded-xl px-3 py-2" placeholder="Account" />
      <button className="rounded-xl bg-slate-900 text-white px-4 py-2">Add</button>
    </form>
  );
}
