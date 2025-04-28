import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HelpButton from "@/components/Help";
import Hero from "@/components/Hero";
import PricingCards from "@/components/PricingCards";

export default function Page() {
  return (
    <>
      <Header />
      <Hero />
      <PricingCards />
      <HelpButton />
      <Footer />
    </>
  );
}

