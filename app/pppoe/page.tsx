import Footer from "@/components/Footer";
import PaymentLinkPPPoE from "@/components/PaymentLinkPPPoE";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PPPoE Credentials",
};

export default function page() {
    return (
        <>
            <PaymentLinkPPPoE />
            <Footer />
        </>
    )
}