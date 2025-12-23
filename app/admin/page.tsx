"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, BarChart3, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

interface KnowledgeEntry {
  id: string;
  category: string;
  question?: string;
  answer: string;
  source: string;
}

interface Analytics {
  topQuestions: Array<{
    question: string;
    count: number;
    lastAsked: string;
  }>;
  totalQuestions: number;
  totalKnowledgeEntries: number;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "knowledge" | "analytics">("upload");

  useEffect(() => {
    loadKnowledge();
    loadAnalytics();
  }, []);

  const loadKnowledge = async () => {
    try {
      const response = await fetch("/api/admin/knowledge");
      const data = await response.json();
      setKnowledge(data.knowledge || []);
    } catch (error) {
      console.error("Failed to load knowledge:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
        setFile(selectedFile);
        setUploadMessage(null);
      } else {
        setUploadMessage({
          type: "error",
          text: "Please select an Excel file (.xlsx or .xls)",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage({
        type: "error",
        text: "Please select a file first",
      });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({
          type: "success",
          text: data.message || "File uploaded successfully!",
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        loadKnowledge();
      } else {
        setUploadMessage({
          type: "error",
          text: data.error || "Upload failed",
        });
      }
    } catch (error) {
      setUploadMessage({
        type: "error",
        text: "Failed to upload file. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/admin/knowledge?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadKnowledge();
      } else {
        alert("Failed to delete entry");
      }
    } catch (error) {
      alert("Failed to delete entry");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage knowledge base and view analytics
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "upload"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Upload size={18} className="inline mr-2" />
            Upload Excel
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "knowledge"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <FileText size={18} className="inline mr-2" />
            Knowledge Base ({knowledge.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("analytics");
              loadAnalytics();
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "analytics"
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 size={18} className="inline mr-2" />
            Analytics
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Upload Knowledge Base Excel File
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="file-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Select Excel File (.xlsx)
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
              </div>
              {file && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Selected: <span className="font-medium">{file.name}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload File
                  </>
                )}
              </button>
              {uploadMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    uploadMessage.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                      : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                  }`}
                >
                  {uploadMessage.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === "knowledge" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Knowledge Base Entries
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-primary-600" />
              </div>
            ) : knowledge.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No knowledge entries found. Upload an Excel file to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {knowledge.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                            {entry.category}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                            {entry.source}
                          </span>
                        </div>
                        {entry.question && (
                          <p className="font-medium text-gray-900 dark:text-white mb-1">
                            Q: {entry.question}
                          </p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300">
                          {entry.answer}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Analytics Dashboard
            </h2>
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total Questions Asked
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {analytics.totalQuestions}
                    </p>
                  </div>
                  <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Knowledge Entries
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {analytics.totalKnowledgeEntries}
                    </p>
                  </div>
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Unique Questions
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {analytics.topQuestions.length}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Most Asked Questions
                  </h3>
                  <div className="space-y-2">
                    {analytics.topQuestions.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {item.question}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last asked:{" "}
                            {new Date(item.lastAsked).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-4 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-semibold">
                          {item.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-primary-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

