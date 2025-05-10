import AdminHeader from "@/components/AdminHeader";
import DashFooter from "@/components/DashFooter";
import Files from "@/components/Files";

export default function page() {
    return (
        <>
            <AdminHeader />
            <Files />
            <DashFooter />
        </>
    )
}