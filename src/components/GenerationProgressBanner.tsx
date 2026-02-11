'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STEP_ICONS: Record<number, string> = {
  1: '👨‍👩‍👧‍👦',
  2: '📋',
  3: '⭐',
  4: '📅',
  5: '✍️',
  6: '🤖',
  7: '📝',
  8: '💾',
  9: '📅',
};

interface JobStatus {
  id: string;
  status: string;
  step: number;
  stepMessage: string | null;
  totalSteps: number;
  error: string | null;
  mealPlanId: string | null;
}

export default function GenerationProgressBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [job, setJob] = useState<JobStatus | null>(null);
  const [dismissedFailed, setDismissedFailed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);

  const fetchJob = useCallback(async () => {
    const jobId = searchParams.get('jobId');
    const url = jobId
      ? `/api/generation/job?id=${encodeURIComponent(jobId)}`
      : '/api/generation/job?current=true';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setJob(data);
      return data;
    }
    if (res.status === 404) {
      setJob(null);
      return null;
    }
    setJob(null);
    return null;
  }, [searchParams]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (!job || (job.status !== 'pending' && job.status !== 'running')) return;

    const interval = setInterval(fetchJob, 2500);
    return () => clearInterval(interval);
  }, [job?.status, fetchJob]);

  useEffect(() => {
    if (job?.status === 'completed' && job.mealPlanId) {
      const t = setTimeout(() => {
        setShowSuccess(false);
        router.refresh();
        const url = new URL(window.location.href);
        url.searchParams.delete('jobId');
        window.history.replaceState({}, '', url.pathname);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [job?.status, job?.mealPlanId, router]);

  if (!job) return null;
  if (job.status === 'completed' && !showSuccess) return null;
  if (job.status === 'failed' && dismissedFailed) return null;

  if (job.status === 'failed') {
    return (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-red-800">Generation Failed</h3>
            <p className="mt-1 text-sm text-red-700">{job.error || 'An error occurred'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/plan/generate')}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
            <button
              onClick={() => setDismissedFailed(true)}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (job.status === 'completed') {
    return (
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <h3 className="font-semibold text-green-800">Meal plan created!</h3>
            <p className="text-sm text-green-700">Your weekly plan is ready.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{STEP_ICONS[job.step] || '🔄'}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Generating Your Meal Plan</h3>
          <p className="text-sm text-blue-700">
            {job.stepMessage || `Step ${job.step} of ${job.totalSteps}`}
          </p>
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(job.step / job.totalSteps) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-blue-600">
              Step {job.step} of {job.totalSteps}
            </p>
          </div>
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    </div>
  );
}
