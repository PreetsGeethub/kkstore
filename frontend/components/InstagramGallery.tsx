import Image from "next/image";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { Heart } from "lucide-react";

type InstaPost = {
  id: string;
  image: string;
  likes?: number;
};

// Placeholder — swap for real Instagram Graph API response later,
// or manually update these as you post new content
const posts: InstaPost[] = [
  { id: "p1", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop", likes: 342 },
  { id: "p2", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop", likes: 218 },
  { id: "p3", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop", likes: 501 },
  { id: "p4", image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop", likes: 176 },
  { id: "p5", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=600&auto=format&fit=crop", likes: 389 },
  { id: "p6", image: "https://images.unsplash.com/photo-1602752250015-52934bc45613?q=80&w=600&auto=format&fit=crop", likes: 264 },
];

export default function InstagramGallery() {
  return (
    <section className="bg-[#FFFFFF] px-6 py-20 md:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#B08D57]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#B08D57]">
              Follow Along
            </span>
            <span className="h-[1px] w-8 bg-[#B08D57]" />
          </div>
          <h2 className="font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl md:text-5xl">
            @kkstore on Instagram
          </h2>
          <Link
            href="https://instagram.com/kkstore"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:text-[#B08D57]"
          >
            <FaInstagram size={15} strokeWidth={1.5} />
            Follow Us
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href="https://instagram.com/kkstore"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden bg-[#E8D8C5]"
            >
              <Image
                src={post.image}
                alt="KK Store on Instagram"
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#2A1E17]/0 text-white opacity-0 transition-all duration-300 group-hover:bg-[#2A1E17]/50 group-hover:opacity-100">
                <div className="flex items-center gap-1.5">
                  <Heart size={16} strokeWidth={1.5} className="fill-white" />
                  {post.likes && (
                    <span className="font-sans text-xs font-medium">
                      {post.likes}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}