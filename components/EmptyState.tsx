export default function EmptyState({
  title,
  message,
  hint,
  action,
}: {
  title: string;
  message: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card mx-auto max-w-lg animate-scale-in p-8 text-center sm:p-10">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-3xl" aria-hidden>
        🎬
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-slate-300">{message}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
