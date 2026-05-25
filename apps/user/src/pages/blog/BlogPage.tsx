import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { resolveAssetUrl } from "@/utils/assets";
import { getBlogPosts } from "./api/blog.api";
import { fallbackBlogPosts, type BlogPost } from "./data/posts";

const featuredTheme = {
  shell:
    "bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_48%,#f9fcff_100%)] border-[#d8e7f5] shadow-[0_22px_70px_rgba(156,186,218,0.16)]",
  aura:
    "bg-[radial-gradient(circle_at_18%_16%,rgba(163,196,229,0.2),transparent_24%),radial-gradient(circle_at_84%_78%,rgba(255,214,196,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.85),transparent_42%)]",
  panel: "border-white/60 bg-white/72 shadow-[0_12px_40px_rgba(162,189,220,0.18)]",
  cta: "border-[rgba(17,24,39,0.12)] bg-[rgba(255,255,255,0.78)] text-(--text-primary) hover:border-[rgba(17,24,39,0.18)] hover:bg-white",
};

const blogCardThemes = [
  {
    shell:
      "bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] border-[#d8e8f6] shadow-[0_18px_55px_rgba(150,182,214,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#ebf4ff_42%,#dce9f8_100%)]",
    aura: "bg-[radial-gradient(circle_at_top,rgba(157,191,224,0.22),transparent_34%)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fffaf4_0%,#f8efe1_100%)] border-[#eadfcd] shadow-[0_18px_55px_rgba(205,182,142,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#fffefb_0%,#f9efe1_40%,#f1e1cc_100%)]",
    aura: "bg-[radial-gradient(circle_at_top,rgba(232,199,151,0.2),transparent_34%)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#f8fff9_0%,#ebf6ee_100%)] border-[#dce9df] shadow-[0_18px_55px_rgba(152,190,160,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#edf7ef_42%,#dcecdf_100%)]",
    aura: "bg-[radial-gradient(circle_at_top,rgba(152,190,160,0.2),transparent_34%)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fff9f6_0%,#f7ede9_100%)] border-[#eaded8] shadow-[0_18px_55px_rgba(205,170,154,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8efea_42%,#eeddd5_100%)]",
    aura: "bg-[radial-gradient(circle_at_top,rgba(219,177,154,0.2),transparent_34%)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fbfaff_0%,#f1eefb_100%)] border-[#e1ddf0] shadow-[0_18px_55px_rgba(176,168,207,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f2effb_42%,#e4def5_100%)]",
    aura: "bg-[radial-gradient(circle_at_top,rgba(180,170,214,0.2),transparent_34%)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fbfcf7_0%,#f1f3e8_100%)] border-[#e2e6d5] shadow-[0_18px_55px_rgba(183,188,146,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f6ec_42%,#e5ead8_100%)]",
    aura: "bg-[radial-gradient(circle_at_top,rgba(183,188,146,0.18),transparent_34%)]",
  },
] as const;

function mergeBlogPosts(primary: BlogPost[], fallback: BlogPost[]) {
  const merged = new Map<string, BlogPost>();

  primary.forEach((post) => {
    merged.set(post.slug, post);
  });

  fallback.forEach((post) => {
    if (!merged.has(post.slug)) {
      merged.set(post.slug, post);
    }
  });

  return Array.from(merged.values());
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const apiPosts = await getBlogPosts();

        if (!active) {
          return;
        }

        setPosts(apiPosts.length ? mergeBlogPosts(apiPosts, fallbackBlogPosts) : fallbackBlogPosts);
      } catch {
        if (!active) {
          return;
        }

        // Keep editorial fallback data when the API has not been populated yet.
        setPosts(fallbackBlogPosts);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const featured = posts[0];
  const rest = useMemo(() => posts.slice(1), [posts]);

  if (loading) {
    return (
      <div className="pb-24">
        <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Blog" }]} />

        <div className="cy-shell space-y-12 pt-10">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="cy-panel animate-pulse px-8 py-9">
              <div className="h-10 w-32 rounded-full bg-black/5" />
              <div className="mt-6 h-16 max-w-xl rounded-[28px] bg-black/6 sm:h-24" />
              <div className="mt-5 h-20 max-w-2xl rounded-[28px] bg-black/4" />
            </article>

            <article className={`relative overflow-hidden rounded-[34px] border p-6 ${featuredTheme.shell}`}>
              <div className={`absolute inset-0 ${featuredTheme.aura}`} />
              <div className="relative z-10 mx-auto h-[220px] rounded-[28px] bg-white/65 sm:h-[260px] lg:h-[300px]" />
              <div className={`relative z-10 mt-6 rounded-[28px] border p-5 backdrop-blur ${featuredTheme.panel}`}>
                <div className="h-4 w-28 rounded-full bg-black/5" />
                <div className="mt-4 h-14 rounded-[24px] bg-black/6" />
                <div className="mt-4 h-20 rounded-[24px] bg-black/4" />
              </div>
            </article>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => {
              const theme = blogCardThemes[index % blogCardThemes.length];
              return (
                <article
                  key={`blog-skeleton-${index}`}
                  className={`overflow-hidden rounded-[30px] border animate-pulse ${theme.shell}`}
                >
                  <div className={`relative overflow-hidden p-8 ${theme.media}`}>
                    <div className={`absolute inset-0 ${theme.aura}`} />
                    <div className="relative z-10 mx-auto h-[180px] rounded-[24px] bg-white/70 sm:h-[200px]" />
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="h-4 w-20 rounded-full bg-black/5" />
                    <div className="h-10 rounded-[18px] bg-black/6" />
                    <div className="h-16 rounded-[18px] bg-black/4" />
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="pb-24">
        <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Blog" }]} />
        <div className="cy-shell pt-10 text-sm text-(--text-secondary)">
          No journal posts are available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Breadcrumb items={[{ label: "Home", to: "/home" }, { label: "Blog" }]} />

      <div className="cy-shell space-y-12 pt-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="cy-panel px-8 py-9">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-(--line-soft) bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-(--text-secondary)">
              <Sparkles className="h-3.5 w-3.5 text-(--accent)" />
              Editorial
            </div>
            <h1 className="mt-5 text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.08em] text-(--text-primary) sm:text-[3.5rem] lg:text-[4.8rem]">
              Notes on devices,
              <span className="block text-(--text-secondary)">
                design, and shopping behavior.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-(--text-secondary)">
              These posts are written to feel consistent with the store: clear, compact, and
              product-aware. Recent themes are influenced by broader industry movement around
              embedded AI, AI PCs, connected living, and more usable support experiences.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 text-sm text-(--text-secondary)">
              <CalendarDays className="h-4 w-4 text-(--accent)" />
              Updated on {featured.date}
            </div>
          </article>

          <article
            className={`relative overflow-hidden rounded-[34px] border p-6 ${featuredTheme.shell}`}
          >
            <div className={`absolute inset-0 ${featuredTheme.aura}`} />
            <img
              src={resolveAssetUrl(featured.image)}
              alt={featured.title}
              className="relative z-10 mx-auto h-[220px] object-contain drop-shadow-[0_18px_28px_rgba(122,146,176,0.12)] sm:h-[260px] lg:h-[300px]"
            />
            <div
              className={`relative z-10 mt-6 rounded-[28px] border p-5 backdrop-blur ${featuredTheme.panel}`}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-(--text-tertiary)">
                {featured.category}
              </p>
              <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-(--text-primary)">
                {featured.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
                {featured.excerpt}
              </p>
              <Link
                to={`/blog/${featured.slug}`}
                className={`mt-6 inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold transition ${featuredTheme.cta}`}
              >
                Read feature
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((post, index) => {
            const theme = blogCardThemes[index % blogCardThemes.length];

            return (
              <article
                key={post.slug}
                className={`group overflow-hidden rounded-[30px] border transition duration-300 hover:-translate-y-1 ${theme.shell}`}
              >
                <div className={`relative overflow-hidden p-8 ${theme.media}`}>
                  <div className={`absolute inset-0 ${theme.aura}`} />
                  <img
                    src={resolveAssetUrl(post.image)}
                    alt={post.title}
                    className="relative z-10 mx-auto h-[180px] object-contain drop-shadow-[0_18px_28px_rgba(122,146,176,0.1)] transition duration-500 group-hover:scale-105 sm:h-[200px]"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-(--text-tertiary)">
                      {post.category}
                    </p>
                    <p className="text-xs text-(--text-tertiary)">{post.date}</p>
                  </div>
                  <h2 className="text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-(--text-primary)">
                    {post.title}
                  </h2>
                  <p className="text-sm leading-7 text-(--text-secondary)">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-3 rounded-full border border-[rgba(17,24,39,0.12)] bg-white/55 px-5 py-3 text-sm font-semibold text-(--text-primary) transition hover:border-[rgba(17,24,39,0.18)] hover:bg-white/78"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
