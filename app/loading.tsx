export default function Loading() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="w-full max-w-3xl space-y-4 mb-16">
        <div className="h-12 sm:h-16 w-3/4 bg-[#e6e2d6] rounded-2xl"></div>
        <div className="h-4 sm:h-5 w-1/2 bg-[#e6e2d6] rounded-xl"></div>
        <div className="h-4 sm:h-5 w-5/6 bg-[#e6e2d6] rounded-xl"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 h-[300px] flex flex-col gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e6e2d6]"></div>
          <div className="h-6 w-1/2 bg-[#e6e2d6] rounded-xl mt-4"></div>
          <div className="h-4 w-full bg-[#e6e2d6] rounded-lg"></div>
          <div className="h-4 w-4/5 bg-[#e6e2d6] rounded-lg"></div>
        </div>
        {/* Card 2 */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 h-[300px] flex flex-col gap-4 hidden md:flex">
          <div className="h-12 w-12 rounded-full bg-[#e6e2d6]"></div>
          <div className="h-6 w-1/2 bg-[#e6e2d6] rounded-xl mt-4"></div>
          <div className="h-4 w-full bg-[#e6e2d6] rounded-lg"></div>
          <div className="h-4 w-3/5 bg-[#e6e2d6] rounded-lg"></div>
        </div>
        {/* Card 3 */}
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 h-[300px] flex flex-col gap-4 hidden lg:flex">
          <div className="h-12 w-12 rounded-full bg-[#e6e2d6]"></div>
          <div className="h-6 w-1/2 bg-[#e6e2d6] rounded-xl mt-4"></div>
          <div className="h-4 w-full bg-[#e6e2d6] rounded-lg"></div>
          <div className="h-4 w-5/6 bg-[#e6e2d6] rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
