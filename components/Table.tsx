"use client";
import React, { useState, useMemo } from "react";
import { Check, Download, Plus, Trash2 } from "lucide-react";

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
  onDeleteSelected?: (rowsToDelete: any[]) => void;
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
  onDeleteSelected,
}: TableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

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

  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) updated.delete(index);
      else updated.add(index);
      return updated;
    });
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((_, i) => selectedRows.has((page - 1) * pageSize + i));
  const toggleSelectAll = () => {
    const startIndex = (page - 1) * pageSize;
    const newSelected = new Set(selectedRows);

    if (isAllSelected) {
      paginatedData.forEach((_, i) => newSelected.delete(startIndex + i));
    } else {
      paginatedData.forEach((_, i) => newSelected.add(startIndex + i));
    }

    setSelectedRows(newSelected);
  };

  return (
    <div className="p-6">
      <h1 className="mt-14 ml-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <div className="mt-5 relative flex flex-wrap justify-between items-center gap-2">
        {showSearch && onSearchChange && (
          <div className="relative mb-6">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-4 pr-4 py-2 w-full max-w-md outline-none text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
            />
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
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
        {onDeleteSelected && selectedRows.size > 0 && (
          <button
            onClick={() => {
              const selectedData = Array.from(selectedRows).map(
                (index) => data[index]
              );
              if (onDeleteSelected) {
                onDeleteSelected(selectedData);
              }
              setSelectedRows(new Set());
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedRows.size})
          </button>
        )}
        {handleAdd && (
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Add Package
            </button>
          </div>
        )}
        {handleAddPool && (
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleAddPool}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

      <div className="overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-900">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              {onDeleteSelected && (
                <th className="px-6 py-3 text-left">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="hidden"
                    />
                    <div
                      className={`relative w-4 h-4 rounded-md border transition-colors duration-200 ${
                        isAllSelected
                          ? "bg-green-600 border-green-600"
                          : "bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600"
                      }`}
                    >
                      {isAllSelected && (
                        <Check
                          className="absolute inset-0 m-auto w-3.5 h-3.5 text-white pointer-events-none"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </label>
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-900">
            {paginatedData.map((row, rowIndex) => {
              const globalIndex = (page - 1) * pageSize + rowIndex;
              return (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
                >
                  {onDeleteSelected && (
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(globalIndex)}
                          onChange={() => toggleRow(globalIndex)}
                          className="hidden"
                        />
                        <div
                          className={`relative w-4 h-4 rounded-md border transition-colors duration-200 ${
                            selectedRows.has(globalIndex)
                              ? "bg-blue-600 border-blue-600"
                              : "bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600"
                          }`}
                        >
                          {selectedRows.has(globalIndex) && (
                            <Check
                              className="absolute inset-0 m-auto w-3.5 h-3.5 text-white pointer-events-none"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </label>
                    </td>
                  )}

                  {columns.map((column) => {
                    const cellValue = row[column.accessor];
                    const isLink =
                      typeof cellValue === "string" && cellValue.startsWith("http");

                    return (
                      <td
                        key={column.accessor}
                        className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200"
                      >
                        {column.render ? (
                          column.render(cellValue, row)
                        ) : isLink ? (
                          <a
                            href={cellValue}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline"
                          >
                            {cellValue}
                          </a>
                        ) : (
                          cellValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="min-w-full bg-gray-100 dark:bg-gray-900 p-1 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="pageSize"
              className="text-sm text-gray-700 dark:text-gray-400"
            >
              Rows per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700 outline-none rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
