"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HistoryCard } from "./history-card";
import { Trash2, Loader2, CheckSquare, Square } from "lucide-react";
import { useAppToast } from "@/hooks/use-app-toast";

type Job = {
  id: string;
  input_content: string | null;
  input_type: string;
  created_at: string;
  repurpose_outputs: { id: string; platform: string; generated_content: string }[];
};

export function HistoryList({ initialJobs }: { initialJobs: Job[] }) {
  const toastT = useAppToast();
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  function handleDeleted(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  }

  function handleSelect(jobId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedIds.size === jobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map((j) => j.id)));
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toastT.error("toast.selectOneDelete");
      return;
    }
    if (!confirm(`Delete ${ids.length} item(s)? This cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/history/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: ids }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        deleted?: number;
        requested?: number;
      };
      if (!res.ok) {
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.failedDelete"
        );
        return;
      }
      const deleted = data.deleted ?? 0;
      const requested = data.requested ?? ids.length;
      setJobs((prev) => prev.filter((j) => !selectedIds.has(j.id)));
      setSelectedIds(new Set());
      if (deleted < requested) {
        toastT.error("toast.partialDelete", { deleted, requested });
      } else {
        toastT.success("toast.deletedItems", { count: deleted });
      }
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setBulkDeleting(false);
    }
  }

  const allSelected = jobs.length > 0 && selectedIds.size === jobs.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-4">
      {jobs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="gap-1.5"
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4" />
                Deselect all
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Select all
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={!someSelected || bulkDeleting}
            className="gap-1.5"
          >
            {bulkDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete selected ({selectedIds.size})
              </>
            )}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {jobs.map((job) => (
          <HistoryCard
            key={job.id}
            job={job}
            onDeleted={handleDeleted}
            selected={selectedIds.has(job.id)}
            onSelect={handleSelect}
            selectionMode
          />
        ))}
      </div>
    </div>
  );
}
