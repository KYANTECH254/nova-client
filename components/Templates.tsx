"use client"

import { cache, useEffect, useState } from 'react'
import { X, Expand } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminAuth } from '@/contexts/AdminSessionProvider'

export type Template = {
  id: string;
  name: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Templates() {
  const { token } = useAdminAuth();
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [expanded, setExpanded] = useState<string>("")
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const fetchtemplates = cache(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/req/templates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token })
        });
        const res = await response.json();
        if (res.success) {
          const temps = res.templates.map((temp: Template) => ({
            ...temp,
            url: `${window.location.origin}${temp.url.startsWith("/") ? "" : "/"}${temp.url}`
          }));

          const defaulttemplate = temps.find((temp: Template) => temp.name === res.default);
          setSelectedId(defaulttemplate?.id);
          setTemplates(temps.reverse());
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.log("Error fetching templates:", error);
        toast.error("Failed to fetch templates");
      }
    });
    fetchtemplates();
  }, [token]);

  const handleSave = async () => {
    if (!selectedId) {
      toast.error(`Template not selected!`)
    }
    const selected = templates.find((temp) => temp.id === selectedId);
    const name = selected?.name;
    setIsChanging(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/req/updateTemplate`;
      const method = "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, name })
      });
      const res = await response.json();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log('Error updating template:', error);
      toast.error("An error occurred!");
    } finally {
      setIsChanging(false);
    }
  }

  return (
  <div className="p-6 max-w-6xl mx-auto mt-14 min-h-screen text-gray-900 dark:text-gray-100">
  <div className="flex justify-between flex-wrap">
    <h1 className="text-3xl font-bold mb-6">Templates</h1>
    <button
      onClick={handleSave}
      disabled={!selectedId}
      className="mb-5 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-500 transition"
    >
      {!isChanging ? "Save" : "Saving"} Template
    </button>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {templates.map((t) => {
      const isSelected = selectedId === t.id;
      return (
        <div
          key={t.id}
          className={`relative rounded-xl overflow-hidden aspect-square transition-shadow cursor-pointer
            bg-white dark:bg-gray-800
            ${isSelected ? 'border-2 border-blue-600' : 'border border-gray-300 dark:border-gray-700'}
            hover:shadow-lg`}
          onClick={() => setSelectedId(t.id)}
        >
          <iframe
            src={t.url}
            title={t.name}
            loading="eager"
            className="w-full h-full opacity-10"
          />

          {isSelected && (
            <div className="z-10 absolute top-2 left-2 bg-blue-600 text-xs px-2 py-0.5 rounded text-white font-semibold">
              Default
            </div>
          )}

          <div className="absolute inset-0 bg-black/10 dark:bg-black/20 bg-opacity-0 hover:bg-opacity-30 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(t.id);
              }}
              className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-opacity text-gray-800 dark:text-gray-200"
              title="Expand"
            >
              <Expand size={16} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-900 bg-opacity-80 text-center py-1">
            <span className="text-gray-800 dark:text-gray-200 text-sm">
              {t.name}
            </span>
          </div>
        </div>
      );
    })}
  </div>

  {/* Fullscreen Modal */}
  {expanded && (
    <div className="fixed inset-0 bg-gray-200 dark:bg-black dark:bg-opacity-90 bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative w-full h-full bg-white dark:bg-gray-900">
        <button
          onClick={() => setExpanded("")}
          className="absolute top-4 right-4 bg-gray-300 dark:bg-gray-800 rounded-full p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-700 transition"
        >
          <X size={24} />
        </button>
        <iframe
          src={templates.find((t) => t.id === expanded)?.url}
          title="Expanded Template"
          className="w-full h-full"
        />
      </div>
    </div>
  )}
</div>

  )
}
