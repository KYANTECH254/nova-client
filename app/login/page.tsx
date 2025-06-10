import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HelpButton from "@/components/Help";
import Hero from "@/components/Hero";
import PricingCards from "@/components/PricingCards";
import { capitalize } from "@/utils/FUnstions";
import type { Metadata } from "next";
import { headers } from "next/headers";

function getSubdomainFromHost(host: string) {
  const parts = host.split(".");
  if (parts.length > 2) return parts[0];
  return "Nova WiFi";
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = (await headersList).get("host") || "demo.novawifi.online";
  const subdomain = getSubdomainFromHost(host);
  const capitalized = capitalize(subdomain);

  return {
    title: `${capitalized}`,
  };
}

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
