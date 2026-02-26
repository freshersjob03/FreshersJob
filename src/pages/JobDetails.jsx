import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Building2,
  Globe,
  Users,
  Bookmark,
  BookmarkCheck,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  FileText,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function JobDetails() {
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id');

      if (!jobId) {
        window.location.href = createPageUrl('Jobs');
        return;
      }

      // Load job
      const jobs = await api.entities.Job.filter({ id: jobId });
      if (jobs.length === 0) {
        window.location.href = createPageUrl('Jobs');
        return;
      }
      setJob(jobs[0]);

      // Check auth
      const isAuthenticated = await api.auth.isAuthenticated();
      if (isAuthenticated) {
        const userData = await api.auth.me();
        setUser(userData);

        const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }

        // Check if saved
        const saved = await api.entities.SavedJob.filter({ 
          job_id: jobId, 
          user_email: userData.email 
        });
        setIsSaved(saved.length > 0);

        // Check if applied
        const applications = await api.entities.Application.filter({ 
          job_id: jobId, 
          candidate_email: userData.email 
        });
        setHasApplied(applications.length > 0);
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      api.auth.redirectToLogin(window.location.href);
      return;
    }

    try {
      if (isSaved) {
        const saved = await api.entities.SavedJob.filter({ 
          job_id: job.id, 
          user_email: user.email 
        });
        if (saved.length > 0) {
          await api.entities.SavedJob.delete(saved[0].id);
          setIsSaved(false);
        }
      } else {
        await api.entities.SavedJob.create({
          job_id: job.id,
          user_email: user.email
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setResumeFile(file_url);
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      api.auth.redirectToLogin(window.location.href);
      return;
    }

    setApplying(true);
    try {
      await api.entities.Application.create({
        job_id: job.id,
        candidate_email: user.email,
        candidate_name: user.full_name || user.email,
        resume_url: resumeFile || profile?.resume_url || '',
        cover_letter: coverLetter,
        status: 'pending',
        employer_id: job.employer_id,
        job_title: job.title,
        company_name: job.company_name
      });

      // Update applications count
      await api.entities.Job.update(job.id, {
        applications_count: (job.applications_count || 0) + 1
      });

      setHasApplied(true);
      setShowApplyDialog(false);
    } catch (error) {
      console.error('Error applying:', error);
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${min} - ${max} LPA`;
    if (min) return `₹${min}+ LPA`;
    return `Up to ₹${max} LPA`;
  };

  const isEmployer = profile?.role === 'employer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#3aafc4] animate-spin" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main Job Card */}
          <Card className="p-6 md:p-8 border-0 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {job.company_logo ? (
                  <img 
                    src={job.company_logo} 
                    alt={job.company_name}
                    className="w-20 h-20 rounded-2xl object-cover border border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3aafc4]/20 to-[#1a7a94]/20 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-[#3aafc4]" />
                  </div>
                )}
              </div>

              {/* Job Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{job.title}</h1>
                    <p className="text-lg text-gray-600 mt-1">{job.company_name}</p>
                  </div>
                  
                  {!isEmployer && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSave}
                        className="h-10 w-10"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-[#3aafc4]" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                        }}
                      >
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    {job.experience_level}
                  </span>
                  <span className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-gray-400" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="capitalize">{job.job_type}</span>
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.skills?.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-[#3aafc4]/5 border-[#3aafc4]/20 text-[#1a7a94]">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Apply Button */}
                {!isEmployer && (
                  <div className="mt-6">
                    {hasApplied ? (
                      <Button className="bg-green-500 hover:bg-green-600 text-white" disabled>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Application Submitted
                      </Button>
                    ) : (
                      <Button 
                        className="btn-primary px-8"
                        onClick={() => setShowApplyDialog(true)}
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Job Description */}
          <Card className="p-6 md:p-8 border-0 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown>{job.description}</ReactMarkdown>
            </div>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card className="p-6 md:p-8 border-0 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown>{job.requirements}</ReactMarkdown>
              </div>
            </Card>
          )}

          {/* Company Info */}
          <Card className="p-6 md:p-8 border-0 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About the Company</h2>
            <div className="flex items-center gap-4">
              {job.company_logo ? (
                <img 
                  src={job.company_logo} 
                  alt={job.company_name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3aafc4]/20 to-[#1a7a94]/20 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-[#3aafc4]" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{job.company_name}</h3>
                <p className="text-gray-500 text-sm">{job.location}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Apply to {job?.company_name}</DialogTitle>
            <DialogDescription>
              Submit your application for {job?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Resume Upload */}
            <div>
              <Label className="text-gray-700 font-medium">Resume</Label>
              {profile?.resume_url && !resumeFile ? (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    Using profile resume
                  </span>
                  <label className="text-[#3aafc4] text-sm cursor-pointer hover:underline">
                    Upload new
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                  </label>
                </div>
              ) : resumeFile ? (
                <div className="mt-2 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Resume uploaded
                  </span>
                  <label className="text-[#3aafc4] text-sm cursor-pointer hover:underline">
                    Change
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                  </label>
                </div>
              ) : (
                <label className="mt-2 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#3aafc4] transition-colors block">
                  {uploadingResume ? (
                    <Loader2 className="w-6 h-6 text-gray-400 mx-auto animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload resume</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX</p>
                    </>
                  )}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                </label>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <Label className="text-gray-700 font-medium">Cover Letter (Optional)</Label>
              <Textarea
                placeholder="Tell the employer why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <Button 
              className="w-full btn-primary"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}