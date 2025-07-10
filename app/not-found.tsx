import ErrorComponent from "@/components/Error";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Not Found",
};

export default function page() {
    return (
        <ErrorComponent message="The page you're looking for doesn't exist!" />
    )
}