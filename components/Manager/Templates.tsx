"use client";

import { cache, useEffect, useState } from "react";
import { Trash2, Edit, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useManagerAuth } from "@/contexts/AdminSessionProvider";
import Table from "../Table";

export type Template = {
    id: string;
    name: string;
    url: string;
    createdAt?: string;
    updatedAt?: string;
};

export default function Templates() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token } = useManagerAuth();

    useEffect(() => {
        const fetchTemplates = cache(async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/fetchAllTemplates`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token })
                });
                const res = await response.json();
                if (res.success) {
                    setTemplates(res.templates)
                } else if (!res.success) {
                    toast.error(res.message);
                }
            } catch (error) {
                console.log("Error fetching templates:", error);
                toast.error("Failed to fetch templates");
            }
        })
        fetchTemplates();
    }, [])

    const filteredTemplates = templates.filter((template) =>
        [template.name, template.url].some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
    );

    const handleDelete = async (templateId: string) => {
        setIsDeleting(true);
        try {
            setTemplates(prev => prev.filter(template => template.id !== templateId));
            const data = {
                id: templateId,
                token
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/deleteTemplate`, {
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
            console.log("Error deleting template:", error);
            toast.error("Failed to delete template");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (template: Template) => {
        setCurrentTemplate(template);
        setShowTemplateModal(true);
    };

    const handleAddTemplate = () => {
        setCurrentTemplate(null);
        setName("");
        setUrl("")
        setShowTemplateModal(true);
    };

    const handleSubmitTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const templateData = {
                id: currentTemplate && currentTemplate.id || "",
                name: name,
                url: url,
                token
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/${currentTemplate ? "editTemplate" : "addTemplate"}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(templateData),
            });

            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
                setTemplates((prev: Template[]) => [...prev, res.template]);
                setShowTemplateModal(false);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.log("Error adding template:", error);
            toast.error("Failed to add template.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            header: "Name",
            accessor: "name",
        },
        {
            header: "Url",
            accessor: "url",
        },
        {
            header: "Created At",
            accessor: "createdAt",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            header: "Actions",
            accessor: "id",
            render: (value: string, row: Template) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit template"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(value)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete template"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Table
                data={filteredTemplates}
                columns={columns}
                title="Templates"
                showSearch={true}
                searchValue={searchValue}
                onAddT={handleAddTemplate}
                onSearchChange={setSearchValue}
            />

            {/* Platform Add/Edit Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-md w-full max-w-md max-h-full overflow-y-auto space-y-6">
                        <h2 className="text-xl font-bold mb-4">
                            {currentTemplate ? "Edit Template" : "Add New Template"}
                        </h2>
                        <form onSubmit={handleSubmitTemplate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={(e) => setName(e.target.value)}
                                        defaultValue={currentTemplate?.name || ""}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                        placeholder="Enter template name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">URL</label>
                                    <input
                                        type="text"
                                        name="url"
                                        defaultValue={currentTemplate?.url || ""}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-black text-white"
                                        required
                                        placeholder="Enter template url"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTemplateModal(false)}
                                    className="px-4 py-2 border rounded-md"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span>Processing...</span>
                                    ) : currentTemplate ? (
                                        "Update Template"
                                    ) : (
                                        "Add Template"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}