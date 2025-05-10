import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Moderators from "@/components/Moderators";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Moderators />
            <DashFooter />
        </>
    )
}