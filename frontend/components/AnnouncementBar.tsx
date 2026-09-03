// AnnouncementBar.tsx
export default function AnnouncementBar() {
  const messages = [
    "Free Shipping on ₹499+",
    "COD Available",
    "Easy Returns",
    "Secure Payments",
  ];

  return (
    <div className="h-10 overflow-hidden bg-[#2A1E17]">
      <div className="flex h-full w-max animate-marquee items-center whitespace-nowrap">
        {[...messages, ...messages].map((message, index) => (
          <div key={`${message}-${index}`} className="flex items-center">
            <span className="px-8 font-sans text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
              {message}
            </span>
            <span className="text-[#B08D57]">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}