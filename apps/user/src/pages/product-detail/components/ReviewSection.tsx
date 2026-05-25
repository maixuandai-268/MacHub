import { Star } from "lucide-react";
import { resolveAssetUrl } from "@/utils/assets";
import type { ProductReview } from "../data/product-content";

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-[#ffbf69]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4" fill={index < value ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function ReviewSection({ reviews }: { reviews: ProductReview[] }) {
  return (
    <section className="space-y-8">
      <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-(--text-primary)">
        Reviews
      </h2>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="cy-panel p-6 text-center">
          <p className="font-mono text-[3rem] font-semibold tracking-[-0.06em] text-(--text-primary)">
            4.8
          </p>
          <p className="mt-2 text-sm text-(--text-tertiary)">of 125 reviews</p>
          <div className="mt-4 flex justify-center">
            <RatingStars value={5} />
          </div>
        </div>

        <div className="cy-panel space-y-3 p-6 pt-7">
          {[
            ["Excellent", 100],
            ["Good", 76],
            ["Average", 44],
            ["Below Average", 18],
            ["Poor", 8],
          ].map(([label, width]) => (
            <div
              key={label as string}
              className="grid grid-cols-[140px_minmax(0,1fr)_40px] items-center gap-4 text-sm text-(--text-secondary)"
            >
              <span>{label}</span>
              <div className="h-1 rounded-full bg-black/8">
                <div className="h-full rounded-full bg-[#ffbf69]" style={{ width: `${width}%` }} />
              </div>
              <span>{Math.max(1, Math.round(Number(width) / 9))}</span>
            </div>
          ))}
        </div>
      </div>

      <input type="text" placeholder="Leave comment" className="cy-input" />

      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="cy-panel p-6">
            <div className="flex gap-4">
              <img src={resolveAssetUrl(review.avatar)} alt={review.author} className="h-14 w-14 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-[1.05rem] font-semibold text-(--text-primary)">
                      {review.author}
                    </h3>
                    <div className="mt-2">
                      <RatingStars value={review.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-(--text-tertiary)">{review.date}</p>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-(--text-secondary)">
                  {review.content}
                </p>
                {review.photos?.length ? (
                  <div className="mt-4 flex gap-3">
                    {review.photos.map((photo) => (
                      <img key={photo} src={resolveAssetUrl(photo)} alt="Review" className="h-20 w-20 rounded-xl object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
