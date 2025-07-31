"use client";
import React, { useState, useMemo } from "react";
import { Download, Plus } from "lucide-react";

type Column = {
    header: string;
    accessor: string;
    render?: (value: any, row?: any) => React.ReactNode;
};

type TableProps = {
    data: any[];
    columns: Column[];
    onExport?: () => void;
    handleAdd?: () => void;
    handleAddPool?: () => void;
    handleAddDDNS?: () => void;
    handleAddPPPoE?: () => void;
    onAdd?: () => void;
    onAddP?: () => void;
    onAddT?: () => void;
    title?: string;
    showSearch?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
};

export default function Table({
    data,
    columns,
    onExport,
    handleAdd,
    handleAddPool,
    handleAddDDNS,
    handleAddPPPoE,
    onAdd,
    onAddP,
    onAddT,
    title = "Table",
    showSearch = true,
    searchValue = "",
    onSearchChange,
}: TableProps) {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalPages = Math.ceil(data.length / pageSize);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, page, pageSize]);

    const handlePrev = () => {
        if (page > 1) setPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage((prev) => prev + 1);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value));
        setPage(1);
    };

    return (
        <div className="p-6 ">
            <h1 className="mt-14 ml-2 text-2xl font-bold text-gray-200">{title}</h1>
            <div className="mt-5 flex flex-wrap justify-between items-center gap-2">
                {showSearch && onSearchChange && (
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Search ${title.toLowerCase()}...`}
                            className="pl-4 pr-4 py-2 w-full max-w-md outline-none text-gray-300 bg-gray-900 border border-gray-500 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}
                <div className="flex justify-between items-center mb-6 ">
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    )}
                </div>
                {handleAdd && (
                    <div className="flex justify-between items-center mb-6 ">
                        <button
                            onClick={handleAdd}
                            className="flex items-center px-4 py-2 ml- bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Package
                        </button>
                    </div>
                )}
                {handleAddPool && (
                    <div className="flex justify-between items-center mb-6 ">

                        <button
                            onClick={handleAddPool}
                            className="flex items-center px-4 py-2 ml- bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Pool
                        </button>
                    </div>
                )}
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Moderator
                    </button>
                )}
                {onAddP && (
                    <button
                        onClick={onAddP}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Platform
                    </button>
                )}
                {onAddT && (
                    <button
                        onClick={onAddT}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Template
                    </button>
                )}
                {handleAddDDNS && (
                    <button
                        onClick={handleAddDDNS}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-2" />
                        Add DDNS
                    </button>
                )}
                {handleAddPPPoE && (
                    <button
                        onClick={handleAddPPPoE}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-2" />
                        Add PPPoE
                    </button>
                )}
            </div>

            <div className="overflow-y-auto rounded-lg border border-gray-900">
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-900">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.accessor}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-900">
                        {paginatedData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-900/20 cursor-pointer">
                                {columns.map((column) => {
                                    const cellValue = row[column.accessor];
                                    const isLink = typeof cellValue === "string" && cellValue.startsWith("http");

                                    return (
                                        <td key={column.accessor} className="px-6 py-4 whitespace-nowrap">
                                            {column.render
                                                ? column.render(cellValue, row)
                                                : isLink
                                                    ? (
                                                        <a href={cellValue} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                                                            {cellValue}
                                                        </a>
                                                    )
                                                    : cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 bg-gray-900 p-2 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-500">Rows per page:</label>
                        <select
                            id="pageSize"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="bg-gray-900 text-gray-300 border border-gray-700 outline-none rounded px-2 py-1"
                        >
                            {[10, 25, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1}
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-400">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={page === totalPages}
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}