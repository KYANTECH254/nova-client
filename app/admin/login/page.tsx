import Footer from "@/components/Footer";
import Login from "@/components/Login";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "WiFi Portal Login",
};

export default function page() {
    return (
        <>
            <Login />
            <Footer />
        </>
    )
}