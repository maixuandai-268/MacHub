import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { resolveAssetUrl } from "@/utils/assets";
import { getBlogPostDetail, getBlogPosts } from "./api/blog.api";
import { fallbackBlogPosts, getBlogPostBySlug, type BlogPost } from "./data/posts";

const detailThemes = [
  {
    shell:
      "bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_100%)] border-[#d8e8f6] shadow-[0_18px_55px_rgba(150,182,214,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#ebf4ff_42%,#dce9f8_100%)]",
    aura:
      "bg-[radial-gradient(circle_at_top,rgba(157,191,224,0.22),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.76),transparent_40%)]",
    note:
      "bg-[linear-gradient(180deg,#f8fbff_0%,#eff6ff_100%)] border-[#dbe8f4] shadow-[0_12px_36px_rgba(150,182,214,0.12)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fffaf4_0%,#f8efe1_100%)] border-[#eadfcd] shadow-[0_18px_55px_rgba(205,182,142,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#fffefb_0%,#f9efe1_40%,#f1e1cc_100%)]",
    aura:
      "bg-[radial-gradient(circle_at_top,rgba(232,199,151,0.2),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.72),transparent_40%)]",
    note:
      "bg-[linear-gradient(180deg,#fffbf7_0%,#f8f0e4_100%)] border-[#eadfce] shadow-[0_12px_36px_rgba(205,182,142,0.12)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#f8fff9_0%,#ebf6ee_100%)] border-[#dce9df] shadow-[0_18px_55px_rgba(152,190,160,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#edf7ef_42%,#dcecdf_100%)]",
    aura:
      "bg-[radial-gradient(circle_at_top,rgba(152,190,160,0.2),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.72),transparent_40%)]",
    note:
      "bg-[linear-gradient(180deg,#f8fffa_0%,#edf7ef_100%)] border-[#dce9df] shadow-[0_12px_36px_rgba(152,190,160,0.12)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fff9f6_0%,#f7ede9_100%)] border-[#eaded8] shadow-[0_18px_55px_rgba(205,170,154,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8efea_42%,#eeddd5_100%)]",
    aura:
      "bg-[radial-gradient(circle_at_top,rgba(219,177,154,0.2),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.72),transparent_40%)]",
    note:
      "bg-[linear-gradient(180deg,#fffaf8_0%,#f8eeea_100%)] border-[#eaded8] shadow-[0_12px_36px_rgba(205,170,154,0.12)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fbfaff_0%,#f1eefb_100%)] border-[#e1ddf0] shadow-[0_18px_55px_rgba(176,168,207,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f2effb_42%,#e4def5_100%)]",
    aura:
      "bg-[radial-gradient(circle_at_top,rgba(180,170,214,0.2),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.72),transparent_40%)]",
    note:
      "bg-[linear-gradient(180deg,#fcfbff_0%,#f2effb_100%)] border-[#e1ddf0] shadow-[0_12px_36px_rgba(176,168,207,0.12)]",
  },
  {
    shell:
      "bg-[linear-gradient(180deg,#fbfcf7_0%,#f1f3e8_100%)] border-[#e2e6d5] shadow-[0_18px_55px_rgba(183,188,146,0.14)]",
    media:
      "bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f6ec_42%,#e5ead8_100%)]",
    aura:
      "bg-[radial-gradient(circle_at_top,rgba(183,188,146,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.72),transparent_40%)]",
    note:
      "bg-[linear-gradient(180deg,#fcfdf9_0%,#f3f5ec_100%)] border-[#e2e6d5] shadow-[0_12px_36px_rgba(183,188,146,0.12)]",
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

export default function BlogDetailPage() {
  const { slug = "" } = useParams();
  const fallbackPost = getBlogPostBySlug(slug);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      setMissing(false);

      try {
        const [detail, apiPosts] = await Promise.all([getBlogPostDetail(slug), getBlogPosts()]);

        if (!active) {
          return;
        }

        setPost(detail);
        const mergedPosts = mergeBlogPosts(apiPosts, fallbackBlogPosts);
        setRelatedPosts(mergedPosts.filter((item) => item.slug !== detail.slug).slice(0, 3));
      } catch {
        if (!active) {
          return;
        }

        if (!fallbackPost) {
          setMissing(true);
          setPost(null);
        } else {
          setPost(fallbackPost);
          setRelatedPosts(fallbackBlogPosts.filter((item) => item.slug !== slug).slice(0, 3));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="pb-24">
        <Breadcrumb
          items={[
            { label: "Home", to: "/home" },
            { label: "Blog", to: "/blog" },
            { label: "Loading..." },
          ]}
        />

        <div className="cy-shell space-y-12 pt-10">
          <article className="overflow-hidden rounded-[36px] border bg-[linear-gradient(180deg,#f7fbff_0%,#eef6ff_100%)] border-[#d8e8f6] shadow-[0_18px_55px_rgba(150,182,214,0.14)] animate-pulse">
            <div className="grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
              <div className="flex flex-col justify-center">
                <div className="h-5 w-24 rounded-full bg-black/5" />
                <div className="mt-6 h-4 w-32 rounded-full bg-black/5" />
                <div className="mt-4 h-20 rounded-[28px] bg-black/6" />
                <div className="mt-5 h-20 rounded-[28px] bg-black/4" />
              </div>
              <div className="relative overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#ebf4ff_42%,#dce9f8_100%)] p-8">
                <div className="mx-auto h-[240px] rounded-[28px] bg-white/70 sm:h-[280px] lg:h-[320px]" />
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  if (missing || (!post && !fallbackPost)) {
    return <Navigate to="/blog" replace />;
  }

  if (!post) {
    return null;
  }

  const sourcePosts = mergeBlogPosts([post], fallbackBlogPosts);
  const postIndex = sourcePosts.findIndex((item) => item.slug === post.slug);
  const theme = detailThemes[(postIndex >= 0 ? postIndex : 0) % detailThemes.length];

  return (
    <div className="pb-24">
      <Breadcrumb
        items={[
          { label: "Home", to: "/home" },
          { label: "Blog", to: "/blog" },
          { label: post.title },
        ]}
      />

      <div className="cy-shell space-y-12 pt-10">
        <article className={`overflow-hidden rounded-[36px] border ${theme.shell}`}>
          <div className="grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div className="flex flex-col justify-center">
              <Link
                to="/blog"
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-(--text-secondary) transition hover:text-(--text-primary)"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to blog
              </Link>
              <p className="mt-6 text-xs uppercase tracking-[0.22em] text-(--text-tertiary)">
                {post.category}
              </p>
              <h1 className="mt-4 text-[2.3rem] font-semibold leading-[0.96] tracking-[-0.07em] text-(--text-primary) sm:text-[3.2rem] lg:text-[4.2rem]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-(--text-secondary)">
                {post.excerpt}
              </p>
              <div className="mt-7 inline-flex items-center gap-3 text-sm text-(--text-secondary)">
                <CalendarDays className="h-4 w-4 text-(--accent)" />
                {post.date} · {post.readTime}
              </div>
            </div>
            <div className={`relative overflow-hidden rounded-[30px] p-8 ${theme.media}`}>
              <div className={`absolute inset-0 ${theme.aura}`} />
              <img
                src={resolveAssetUrl(post.image)}
                alt={post.title}
                className="relative z-10 mx-auto h-[240px] object-contain drop-shadow-[0_18px_28px_rgba(122,146,176,0.12)] sm:h-[280px] lg:h-[320px]"
              />
            </div>
          </div>
        </article>

        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className={`rounded-[30px] border p-8 text-(--text-primary) ${theme.note}`}>
            <p className="text-xs uppercase tracking-[0.24em] text-(--text-tertiary)">
              Editorial note
            </p>
            <p className="mt-5 text-sm leading-7 text-(--text-secondary)">
              These posts are not news reports. They are short editorial reads about how device
              trends affect product selection, storefront experience, and customer expectations.
            </p>
          </aside>

          <article className="cy-panel p-8">
            <div className="space-y-10">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-(--text-primary)">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-base leading-8 text-(--text-secondary)"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </section>

        <section className="space-y-6">
          <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
            More from the journal
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {relatedPosts.map((item) => {
              const relatedIndex = sourcePosts.findIndex((entry) => entry.slug === item.slug);
              const relatedTheme =
                detailThemes[(relatedIndex >= 0 ? relatedIndex : 0) % detailThemes.length];

              return (
                <article
                  key={item.slug}
                  className={`overflow-hidden rounded-[28px] border ${relatedTheme.shell}`}
                >
                  <div className={`relative overflow-hidden p-6 ${relatedTheme.media}`}>
                    <div className={`absolute inset-0 ${relatedTheme.aura}`} />
                    <img
                      src={resolveAssetUrl(item.image)}
                      alt={item.title}
                      className="relative z-10 mx-auto h-[160px] object-contain drop-shadow-[0_18px_28px_rgba(122,146,176,0.1)] sm:h-[180px]"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-(--text-tertiary)">
                      {item.category}
                    </p>
                    <h3 className="text-xl font-semibold leading-tight tracking-[-0.04em] text-(--text-primary)">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-(--text-secondary)">
                      {item.excerpt}
                    </p>
                    <Link
                      to={`/blog/${item.slug}`}
                      className="inline-flex items-center gap-3 rounded-full border border-[rgba(17,24,39,0.12)] bg-white/55 px-5 py-3 text-sm font-semibold text-(--text-primary) transition hover:border-[rgba(17,24,39,0.18)] hover:bg-white/78"
                    >
                      Read article
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
