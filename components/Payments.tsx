"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner"; // or your preferred toast library
import { useAdminAuth } from "@/contexts/AdminSessionProvider";

type Payment = {
    id: string;
    phone: string;
    code: string;
    status: "pending" | "completed" | "failed" | "cancelled";
    amount: number;
    createdAt: string;
    updatedAt: string;
};

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { token } = useAdminAuth();

    useEffect(() => {
        const fetchPayments = cache(async () => {
            const data = {
                token
            }
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchPayments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                });
                const res = await response.json();
                if (res.success) {
                    setPayments(res.payments)
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching Payments:", error);
                toast.error("Failed to fetch Payments");
            }
        })
        fetchPayments();
    }, [])

    const filteredPayments = payments
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // newest first
        .filter((payment) =>
            [payment.phone, payment.code, payment.status, payment.amount.toString(), new Date(payment.createdAt).toLocaleString()].some(
                (value) =>
                    value &&
                    value.toString().toLowerCase().includes(searchValue.toLowerCase())
            )
        );

    const handleDelete = async (paymentId: string) => {
        setIsDeleting(true);
        try {
            setPayments(prev => prev.filter(payment => payment.id !== paymentId));
            const data = {
                token,
                id: paymentId
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletePayment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
            } else if (!res.success) {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error deleting payment:", error);
            toast.error("Failed to delete payment");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteSelectedPayments = async (selected: Payment[]) => {
        if (!selected.length) return;
        setIsDeleting(true);
        try {
            setPayments((prev) =>
                prev.filter((mod) => !selected.some((sel) => sel.id === mod.id))
            );
            const deleteRequests = selected.map((mod) =>
                fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deletePayment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        id: mod.id,
                    }),
                })
            );

            const results = await Promise.all(deleteRequests);
            const jsonResults = await Promise.all(results.map((r) => r.json()));

            const failed = jsonResults.filter((res) => !res.success);
            if (failed.length > 0) {
                toast.error(
                    `Failed to delete ${failed.length} payment(s). Some deletions may have succeeded.`
                );
            } else {
                toast.success(`${selected.length} payment(s) deleted.`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting payments.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ["Phone", "Code", "Amount", "Status", "Created At", "Last Updated"],
            ...payments.map((payment) => [
                payment.phone,
                payment.code,
                `KES ${payment.amount}`,
                payment.status,
                new Date(payment.createdAt).toLocaleString(),
                new Date(payment.updatedAt).toLocaleString(),
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "payments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            header: "Phone",
            accessor: "phone",
        },
        {
            header: "Transaction Code",
            accessor: "code",
        },
        {
            header: "Amount (KES)",
            accessor: "amount",
            render: (value: number) => `KES ${value.toLocaleString()}`,
        },
        {
            header: "Status",
            accessor: "status",
            render: (value: string) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${value === "COMPLETE"
                        ? "bg-green-900/20 text-green-800"
                        : value === "PENDING" || value === "PROCESSING"
                            ? "bg-blue-900/20 text-blue-800"
                            : value === "FAILED"
                                ? "bg-red-900/20 text-red-800"
                                : "bg-gray-900/30 text-gray-800"
                        }`}
                >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            ),
        },
        {
            header: "Created At",
            accessor: "createdAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string) => (
                <button
                    onClick={() => handleDelete(value)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete payment"
                >
                    <Trash2 size={18} />
                </button>
            ),
        },
    ];

    return (
        <Table
            data={filteredPayments}
            columns={columns}
            onExport={handleExport}
            title="MPESA Payments"
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onDeleteSelected={handleDeleteSelectedPayments}
        />
    );
}