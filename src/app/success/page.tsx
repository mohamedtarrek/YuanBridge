import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Order Submitted",
  description: "Your order has been submitted successfully.",
};

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-screen px-4">
        <div className="glass rounded-3xl p-10 md:p-14 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Order Submitted!
          </h2>
          <p className="text-text-muted mb-8">
            Your order has been received. Our team will review it and contact
            you within 24 hours via WhatsApp or Telegram.
          </p>
          <Link href="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
