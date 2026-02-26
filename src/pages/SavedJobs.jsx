import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Card } from '@/components/ui/card';
import JobCard from '@/components/ui/JobCard';
import { Bookmark, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedJobs() {
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const saved = await api.entities.SavedJob.filter({ user_email: userData.email });
      setSavedJobs(saved);

      if (saved.length > 0) {
        const allJobs = await api.entities.Job.list('-created_date', 1000);
        const savedJobIds = saved.map(s => s.job_id);
        const savedJobDetails = allJobs.filter(j => savedJobIds.includes(j.id));
        setJobs(savedJobDetails);
      }

      const apps = await api.entities.Application.filter({ candidate_email: userData.email });
      setApplications(apps.map(a => a.job_id));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (job) => {
    try {
      const saved = savedJobs.find(s => s.job_id === job.id);
      if (saved) {
        await api.entities.SavedJob.delete(saved.id);
        setSavedJobs(savedJobs.filter(s => s.job_id !== job.id));
        setJobs(jobs.filter(j => j.id !== job.id));
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const handleApply = (job) => {
    window.location.href = createPageUrl('JobDetails') + `?id=${job.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#3aafc4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Saved Jobs</h1>

        {jobs.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-sm">
            <Bookmark className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-500">Save jobs you're interested in to apply later</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard
                    job={job}
                    isSaved={true}
                    hasApplied={applications.includes(job.id)}
                    onSave={handleRemoveSaved}
                    onApply={handleApply}
                    onClick={() => window.location.href = createPageUrl('JobDetails') + `?id=${job.id}`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}