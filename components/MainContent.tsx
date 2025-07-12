"use client"

import Footer from "./Footer";
import Header from "./Header";
import HelpButton from "./Help";
import Hero from "./Hero";
import PricingCards from "./PricingCards";

export default function MainContent() {
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