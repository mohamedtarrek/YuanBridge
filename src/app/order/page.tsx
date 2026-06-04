import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";

export const metadata: Metadata = {
  title: "Place Your Order",
  description:
    "Submit your Chinese marketplace product link and let YuanBridge handle the rest. Professional purchasing service with worldwide shipping.",
};

export default function OrderPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="relative pt-20 pb-8 px-4 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_50%)]" />
          <div className="relative">
            <span className="text-base font-semibold text-accent-400 uppercase tracking-widest">
              New Order
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">
              Place Your{" "}
              <span className="gradient-text">Purchase Order</span>
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto text-xl">
              Fill in the details below and we&apos;ll take care of the rest.
              Our team will review your order and contact you within 24 hours.
            </p>
          </div>
        </div>
        <OrderForm />
      </main>
      <Footer />
    </>
  );
}
