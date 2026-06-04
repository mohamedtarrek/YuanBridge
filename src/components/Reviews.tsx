"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const reviews = [
  {
    name: "Ahmed Al-Rashid",
    location: "Dubai, UAE",
    rating: 5,
    text: "I needed products from Taobao but had no way to pay in CNY. YuanBridge made it incredibly easy. The item arrived in Dubai in just 8 days. Will definitely use again.",
    initials: "AA",
  },
  {
    name: "Maria Santos",
    location: "Manila, Philippines",
    rating: 5,
    text: "Found beautiful fabrics on 1688 but the seller only accepted Chinese payments. YuanBridge handled everything. The quality check photos they sent gave me peace of mind.",
    initials: "MS",
  },
  {
    name: "James O'Brien",
    location: "London, UK",
    rating: 5,
    text: "Ordered electronic components from Alibaba through YuanBridge. The pricing was transparent, communication was excellent, and shipping was faster than expected.",
    initials: "JO",
  },
  {
    name: "Priya Sharma",
    location: "Mumbai, India",
    rating: 5,
    text: "Been looking for a reliable China purchasing agent for years. YuanBridge is by far the best. Their WhatsApp support team answered all my questions within minutes.",
    initials: "PS",
  },
  {
    name: "Carlos Mendoza",
    location: "Bogotá, Colombia",
    rating: 5,
    text: "First time buying from China and I was nervous. YuanBridge guided me through the entire process. My Tmall order arrived safely in Colombia. Highly recommended!",
    initials: "CM",
  },
  {
    name: "Wei Zhang",
    location: "Kuala Lumpur, Malaysia",
    rating: 5,
    text: "As someone who understands the Chinese market, I was impressed by YuanBridge's professionalism. Their inspection process is thorough and their pricing is fair.",
    initials: "WZ",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-accent-400" : "text-surface-lighter"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="reviews" className="section-padding">
      <div className="container-custom" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent-400 uppercase tracking-widest">
            Customer Reviews
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 md:mt-4 mb-3 md:mb-4">
            What Our{" "}
            <span className="gradient-text">Customers Say</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto text-sm md:text-lg">
            Trusted by buyers from around the world.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-2xl p-5 md:p-8 glow-card"
            >
              <StarRating rating={review.rating} />
              <p className="text-text-muted text-sm leading-relaxed mt-4 mb-6">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold">
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {review.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {review.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
