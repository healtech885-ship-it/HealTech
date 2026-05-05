export function ProductPreview() {
  return (
    <div className="relative h-[430px] overflow-hidden rounded-xl border border-[#bdc8ce] bg-[radial-gradient(circle_at_50%_36%,#2e91a2_0%,#1d6f7e_42%,#173f48_100%)] shadow-[0_2px_4px_rgba(15,23,42,0.18)]">
      <div className="absolute left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-[52%] rotate-[-7deg]">
        <div className="rounded-[10px] bg-[#dfe7e9] p-[10px] shadow-[0_18px_30px_rgba(0,0,0,0.28)]">
          <div className="overflow-hidden rounded-[5px] border border-[#2f626d] bg-[#0d5160]">
            <div className="flex h-[214px] gap-3 bg-[linear-gradient(135deg,#155b67,#5db7c5)] p-4 text-[#d8f8ff]">
              <div className="w-[34%] space-y-3">
                <div className="h-3 w-24 rounded bg-white/80" />
                <div className="grid grid-cols-2 gap-2">
                  <DashboardTile />
                  <DashboardTile />
                  <DashboardTile tall />
                  <DashboardTile tall />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-3 flex justify-between">
                  <div className="h-3 w-20 rounded bg-white/70" />
                  <div className="flex gap-2">
                    <span className="h-2 w-8 rounded bg-white/70" />
                    <span className="h-2 w-8 rounded bg-white/70" />
                    <span className="h-2 w-8 rounded bg-white/70" />
                  </div>
                </div>
                <div className="relative h-[166px] rounded bg-white/12 p-3">
                  <div className="absolute inset-x-3 bottom-8 h-px bg-white/20" />
                  <div className="absolute inset-x-3 bottom-16 h-px bg-white/20" />
                  <div className="absolute inset-x-3 bottom-24 h-px bg-white/20" />
                  <div className="absolute inset-x-3 bottom-32 h-px bg-white/20" />
                  <div className="absolute bottom-5 left-3 right-3 flex items-end gap-2">
                    {[48, 62, 44, 86, 74, 112, 96, 122, 82].map((height, index) => (
                      <span key={index} className="flex-1 rounded-t bg-[#78d7e7]/80" style={{ height }} />
                    ))}
                  </div>
                  <div className="absolute bottom-5 left-3 right-3 h-24 rounded-[50%] bg-[#a5f0ff]/20 blur-sm" />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[52px] rounded-b-[8px] bg-[linear-gradient(180deg,#f4f8f9,#d9e0e3)]" />
        </div>
        <div className="mx-auto h-9 w-[28%] bg-[linear-gradient(180deg,#d6dee1,#abb8bd)]" />
        <div className="mx-auto h-5 w-[48%] rounded-[50%] bg-[linear-gradient(180deg,#d7dee1,#b9c4c8)] shadow-[0_8px_20px_rgba(0,0,0,0.24)]" />
      </div>
    </div>
  );
}

function DashboardTile({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`rounded bg-white/12 p-2 ${tall ? "h-20" : "h-16"}`}>
      <div className="h-2 w-12 rounded bg-white/60" />
      <div className="mt-3 flex items-end gap-1">
        {[18, 30, 24, 42].map((height, index) => (
          <span key={index} className="w-full rounded-t bg-[#96e8f7]/70" style={{ height }} />
        ))}
      </div>
    </div>
  );
}
