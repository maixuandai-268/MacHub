import { Facebook, Instagram, Music2, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const storefrontLinks = ["Store", "Mac", "iPhone", "iPad", "Apple Watch", "AirPods"];

const supportLinks = ["Find a store", "Order status", "Trade in", "Financing", "Support"];

const accountLinks = ["Sign in", "Wishlist", "Saved items", "Payment methods", "Shipping"];

export default function Footer() {
  return (
    <footer className="border-t border-black/6 bg-[rgba(248,248,250,0.92)] text-(--text-primary) backdrop-blur-xl">
      <div className="cy-shell grid gap-12 py-16 lg:grid-cols-[1.45fr_0.85fr_0.85fr_0.85fr] lg:py-24">
        <div>
          <Link
            to="/home"
            className="text-[2rem] font-bold tracking-[-0.07em] text-(--text-primary)"
          >
            CyberShop
          </Link>
          <p className="mt-6 max-w-sm text-[15px] leading-8 text-(--text-secondary)">
            A focused Apple-first storefront for hardware, accessories, and
            guided buying. Clean catalog views, faster checkout, and support
            that feels more direct.
          </p>
          <div className="mt-10 flex items-center gap-6 text-(--text-secondary)">
            <Twitter className="h-5 w-5" />
            <Facebook className="h-5 w-5" />
            <Music2 className="h-5 w-5" />
            <Instagram className="h-5 w-5" />
          </div>
          <p className="mt-12 text-sm text-(--text-tertiary)">
            Copyright 2026 CyberShop. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--text-tertiary)">
            Browse
          </h3>
          <ul className="mt-6 space-y-4 text-[15px] text-(--text-secondary)">
            {storefrontLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--text-tertiary)">
            Support
          </h3>
          <ul className="mt-6 space-y-4 text-[15px] text-(--text-secondary)">
            {supportLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--text-tertiary)">
            Account
          </h3>
          <ul className="mt-6 space-y-4 text-[15px] text-(--text-secondary)">
            {accountLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
