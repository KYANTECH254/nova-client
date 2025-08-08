import Explore from "@/components/Explore";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nova WiFi",
};

export default function page() {
    return (
        <>
        <Explore />
        </>
    )
}