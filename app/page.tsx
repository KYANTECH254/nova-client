import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HelpButton from "@/components/Help";
import Hero from "@/components/Hero";
import PricingCards from "@/components/PricingCards";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <>
      <Toaster richColors toastOptions={{ duration: 5000, style: { fontSize: "16px" } }} />
      <Header />
      <Hero />
      <PricingCards />
      <HelpButton phoneNumber="+1234567890" />
      <Footer />
    </>
  );
}

