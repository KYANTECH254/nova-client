import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Stations from "@/components/Stations";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Stations />
            <DashFooter />
        </>
    )
}