export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-linen animate-pulse">
      <div className="h-16 bg-white border-b border-linen-border w-full" />
      <div className="p-5 space-y-6">
        <div className="h-40 bg-white rounded-xl shadow-sm" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-24 h-8 bg-white rounded-full shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl h-60 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
