"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { toast } from "sonner";

type User = {
  id: string;
  phone: string;
  username:string;
  code: string;
  status: "active" | "inactive" | "expired";
  updatedAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const { isAuthenticated, adminUser, token } = useAdminAuth();

  useEffect(() => {
    const fetchUsers = cache(async () => {
      const data = {
        token
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchCodes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const res = await response.json();
        if (res.success) {
          setUsers(res.codes)
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.log("Auth Error:", error);
        toast.error("Failed to fetch.");
      }
    })
    fetchUsers();
  }, [])

  const filteredUsers = users
    .filter((user) =>
      [user.phone, user.username, user.status].some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchValue.toLowerCase())
      )
    )
    .reverse();

  const handleExport = () => {
    const csvContent = [
      ["Phone", "Code", "Status", "Last Login"],
      ...users.map((user) => [
        user.phone,
        user.username,
        user.status,
        new Date(user.updatedAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "users_export.csv");
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
      header: "Code",
      accessor: "username",
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${value === "active"
            ? "bg-green-900/20 text-green-800"
            : value === "expired"
              ? "bg-yellow-900/20 text-yellow-800"
              : "bg-red-900/20 text-red-800"
            }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: "Last Login",
      accessor: "updatedAt",
      render: (value: string) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <Table
      data={filteredUsers}
      columns={columns}
      onExport={handleExport}
      title="Users"
      showSearch={true}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    />
  );
}