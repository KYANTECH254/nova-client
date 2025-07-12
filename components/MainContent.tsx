"use client"

import { usePlatform } from "@/contexts/PlatformProvider";
import Footer from "./Footer";
import Header from "./Header";
import HelpButton from "./Help";
import Hero from "./Hero";
import PricingCards from "./PricingCards";
import netfundistyles from './Templates/Modules/NetFundi/netfundi.module.css';

export default function MainContent() {
    const { platformData } = usePlatform();

    return (
        <div className={platformData?.template === "NetFundi" ? netfundistyles.body : ""}>
            <Header />
            <div className={platformData?.template === "NetFundi" ? netfundistyles.maincontent : ""}>
                <Hero />
                <PricingCards />
                <HelpButton />
            </div>
            <Footer />
        </div>
    );
}