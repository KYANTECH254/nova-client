"use client";

import { cache, useEffect, useState } from "react";
import Table from "./Table";
import { useAdminAuth } from "@/contexts/AdminSessionProvider";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

type User = {
  id: string;
  phone: string;
  username: string;
  code: string;
  status: "active" | "inactive" | "expired";
  active: string;
  package: string;
  updatedAt: string;
  createdAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const { isAuthenticated, adminUser, token } = useAdminAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>();
  const [phone, setphone] = useState("")
  const [username, setusername] = useState("")
  const [showModal, setShowModal] = useState(false);

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
      [user.phone, user.package, user.username, user.status, new Date(user.createdAt).toLocaleString()].some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchValue.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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


  const handleEdit = (usr: User) => {
    const matchingUser = filteredUsers.find(user => user.id === usr.id);
    setSelectedUser(matchingUser || "");
    setusername(usr.username);
    setphone(usr.phone);
    setShowModal(true);
  };

  const handleDelete = cache(async (user: User) => {
    setIsDeleting(true);
    const data = {
      token,
      id: user.id,
      username: user.username
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deleteUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      if (res.success) {
        setUsers(prev => prev.filter(pkg => pkg.id !== user.id));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log("Auth Error:", error);
      toast.error("Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  })

  const handleDeleteSelectedUsers = async (selected: User[]) => {
    if (!selected.length) return;
    setIsDeleting(true);
    try {
      setUsers((prev) =>
        prev.filter((mod) => !selected.some((sel) => sel.id === mod.id))
      );
      const deleteRequests = selected.map((mod) =>
        fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deleteUser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            id: mod.id,
            username: mod.username
          }),
        })
      );

      const results = await Promise.all(deleteRequests);
      const jsonResults = await Promise.all(results.map((r) => r.json()));

      const failed = jsonResults.filter((res) => !res.success);
      if (failed.length > 0) {
        toast.error(
          `Failed to delete ${failed.length} user(s). Some deletions may have succeeded.`
        );
      } else {
        toast.success(`${selected.length} user(s) deleted.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting users.");
    } finally {
      setIsDeleting(false);
    }
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
      header: "Package",
      accessor: "package",
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
      header: "Active",
      accessor: "active",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${value === "Online"
            ? "bg-green-900/20 text-green-800"
            : value === "Offline" && "bg-red-900/20 text-red-800"
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
    {
      header: "Actions",
      accessor: "id",
      render: (value: string, row: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
            aria-label="Edit user"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete user"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    setIsEditing(true);
    e.preventDefault();
    const userData = {
      id: selectedUser.id,
      username: username,
      phone: phone
    };

    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/mkt/updateUser`;
      const method = "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token, userData }),
      });
      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log("Error submitting user:", error);
      toast.error("Failed to submit user");
    } finally {
      setIsEditing(false);
    }
    setShowModal(false);
  };

  return (
    <div className="p-4">
      <Table
        data={filteredUsers}
        columns={columns}
        onExport={handleExport}
        title="Users"
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onDeleteSelected={handleDeleteSelectedUsers}
      />


      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="flex flex-col bg-gray-900 border border-gray-700 text-gray-100 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-full overflow-y-auto space-y-6">
            <h2 className="text-xl font-bold mb-4">
              Edit User
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <input
                    type="text"
                    name="name"
                    value={username || selectedUser?.username || ""}
                    onChange={(e) => setusername(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    name="address"
                    value={phone || selectedUser?.phone || ""}
                    onChange={(e) => setphone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-black text-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isEditing}
                >
                  {isEditing ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>

      )
      }
    </div>
  );
}