import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { BlogPost } from "../modules/blog/blog.model.js";

dotenv.config();

const posts = [
  {
    slug: "device-ai-everyday-utility",
    category: "AI Devices",
    title: "Why device AI is shifting from headline feature to everyday utility",
    excerpt:
      "The most interesting change is not louder marketing. It is the move toward practical, embedded intelligence inside familiar hardware and software flows.",
    publishedAt: "2026-03-11",
    image: "/assets/images/iphone-14-front.png",
    readTime: "5 min read",
    sections: [
      {
        heading: "The useful layer is winning",
        body: [
          "For years, AI in hardware was often positioned as a future promise. The current shift is more grounded. People now notice AI when it saves time inside tasks they already do: search, writing, editing, organization, photo clean-up, or smarter device settings.",
          "That changes how products should be presented. The selling point is no longer abstract intelligence. It is reduced friction inside familiar routines.",
        ],
      },
      {
        heading: "The store experience should explain outcomes",
        body: [
          "When AI becomes a layer instead of a standalone feature, product pages need to talk more about outcomes than terminology. Better battery strategy, faster search, cleaner camera workflows, and more responsive assistance matter more than listing buzzwords without context.",
          "Retail UX has to help users understand where intelligence actually appears in day-to-day use.",
        ],
      },
    ],
  },
  {
    slug: "premium-laptop-story-2026",
    category: "Computing",
    title: "The premium laptop story now includes battery, silence, and on-device AI",
    excerpt:
      "Thin machines are no longer judged on weight alone. People now expect strong battery life, polished cameras, and local AI experiences without friction.",
    publishedAt: "2026-03-08",
    image: "/assets/images/macbook-air-main.png",
    readTime: "4 min read",
    sections: [
      {
        heading: "Performance is now multi-dimensional",
        body: [
          "A premium laptop is no longer only about benchmark speed. Quiet thermals, strong battery, stable video calls, and fast wake behavior now shape the perception of quality just as strongly.",
          "This is one reason AI PCs are entering the conversation naturally. They bundle performance with local responsiveness and new workflows that feel immediate rather than remote.",
        ],
      },
      {
        heading: "Design systems need calmer product storytelling",
        body: [
          "When products are more capable across many dimensions, storefronts should avoid overloading the page. Strong hierarchy, fewer distractions, and clearer groupings help users decide faster.",
        ],
      },
    ],
  },
  {
    slug: "wearable-audio-more-ambient",
    category: "Audio",
    title: "Wearable audio is becoming less visible and more ambient",
    excerpt:
      "People increasingly want devices that disappear into the routine: lighter, calmer, and smart enough to stay out of the way until needed.",
    publishedAt: "2026-03-04",
    image: "/assets/images/airpods-max-silver.png",
    readTime: "4 min read",
    sections: [
      {
        heading: "Comfort is part of perceived intelligence",
        body: [
          "The best wearable audio feels present when it helps and invisible when it does not. That means comfort, reliable handoff, predictable controls, and fewer interruptions.",
          "This is why audio is increasingly judged as an ecosystem product, not only an isolated hardware object.",
        ],
      },
      {
        heading: "Merchandising should show context",
        body: [
          "Audio products benefit from simpler presentation when the page explains usage context clearly: commute, work calls, focus, movement, or travel.",
        ],
      },
    ],
  },
  {
    slug: "cleaner-catalog-premium-hardware",
    category: "Retail UX",
    title: "What a cleaner catalog does for premium hardware",
    excerpt:
      "When the layout is calmer, shoppers understand product differences faster. That is a design problem first, not only a conversion problem.",
    publishedAt: "2026-02-27",
    image: "/assets/images/ipad-10-9-wifi.png",
    readTime: "3 min read",
    sections: [
      {
        heading: "Noise creates decision fatigue",
        body: [
          "Premium hardware often suffers when the interface around it feels crowded. Too many badges, competing banners, or inconsistent card design slow down trust and make products blend together.",
          "A cleaner catalog creates contrast. It lets shape, image, price, and category meaning do more of the work.",
        ],
      },
    ],
  },
  {
    slug: "ambient-ai-invisible-interface",
    category: "Connected Living",
    title: "Ambient AI and the return of the invisible interface",
    excerpt:
      "The next step in connected products is less about showing screens everywhere and more about systems that adapt quietly in the background.",
    publishedAt: "2026-02-18",
    image: "/assets/images/apple-watch.png",
    readTime: "4 min read",
    sections: [
      {
        heading: "Less surface, more adaptation",
        body: [
          "Some of the most interesting connected experiences are becoming less visually loud. Watches, audio, home devices, and assistants increasingly aim to reduce the number of explicit interactions needed.",
          "That makes interface restraint more valuable, not less. The design challenge moves toward signaling confidence without demanding attention all the time.",
        ],
      },
    ],
  },
  {
    slug: "spatial-products-need-restraint",
    category: "Vision",
    title: "Spatial products still need restraint in how they are presented",
    excerpt:
      "Future-facing hardware already feels unfamiliar to many buyers. The storefront around it should reduce confusion instead of adding more noise.",
    publishedAt: "2026-02-10",
    image: "/assets/images/apple-vision-pro.png",
    readTime: "3 min read",
    sections: [
      {
        heading: "Novel hardware needs more guidance, not more spectacle",
        body: [
          "When a product category is new, the interface around it should become more legible. Buyers need clear explanation of purpose, comfort, fit, and practical use cases.",
          "Strong restraint in copy and hierarchy does not make a spatial product feel less futuristic. It makes it easier to trust.",
        ],
      },
    ],
  },
  {
    slug: "flagship-phone-refresh-cycles-2026",
    category: "Mobile",
    title: "Why flagship phone refresh cycles now depend on camera feel and material finish",
    excerpt:
      "People still compare chip speed, but the final buying decision is increasingly shaped by how a phone feels in the hand, in the camera, and in daily carry.",
    publishedAt: "2026-02-04",
    image: "/assets/images/apple-iphone-17-pro-max-main.jpg",
    readTime: "4 min read",
    sections: [
      {
        heading: "The emotional layer is back in hardware buying",
        body: [
          "Spec sheets remain useful, but they no longer explain the entire premium phone decision. Buyers pay close attention to finish, camera confidence, hand feel, and whether the device looks calm or loud in everyday use.",
          "That is why flagship pages should balance technical clarity with stronger visual framing. The product image now carries more persuasive weight than a dense checklist.",
        ],
      },
      {
        heading: "Retail design should frame the object, not compete with it",
        body: [
          "When the device itself is the hero, the storefront should remove unnecessary noise. Cleaner surfaces, better spacing, and fewer conflicting accents help shoppers compare phones more intuitively.",
        ],
      },
    ],
  },
];

async function seedBlogPosts() {
  await connectDatabase(process.env.MONGODB_URI);

  const slugs = posts.map((post) => post.slug);
  await BlogPost.deleteMany({ slug: { $nin: slugs } });

  for (const post of posts) {
    await BlogPost.findOneAndUpdate(
      { slug: post.slug },
      {
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        image: post.image,
        readTime: post.readTime,
        status: "published",
        publishedAt: new Date(post.publishedAt),
        authorName: "CyberShop Editorial",
        sections: post.sections,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${posts.length} blog posts`);
}

seedBlogPosts()
  .catch((error) => {
    console.error("Blog seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
