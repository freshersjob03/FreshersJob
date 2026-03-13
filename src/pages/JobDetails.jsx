import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/working-toast';
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
import { formatJobLocation } from '@/lib/utils';

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
  const [applicationPhone, setApplicationPhone] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const { toast } = useToast();

  const buildApplicantName = () => {
    const clerkUser = window?.Clerk?.user;
    const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ').trim();
    if (clerkName) return clerkName;

    const authName = String(user?.full_name || user?.name || '').trim();
    const headline = String(profile?.headline || '').trim();
    if (authName && (!headline || authName.toLowerCase() !== headline.toLowerCase()) && !authName.includes('@')) {
      return authName;
    }

    const emailName = (user?.email || '')
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .trim();
    if (emailName) {
      return emailName.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return user?.email || 'Candidate';
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (showApplyDialog) {
      setApplicationPhone(profile?.phone || '');
    }
  }, [showApplyDialog, profile?.phone]);

  const loadData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id');
      const normalizedJobId = Number.isNaN(Number(jobId)) ? jobId : Number(jobId);

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
          job_id: normalizedJobId, 
          user_email: userData.email,
          user_id: userData.id
        });
        setIsSaved(saved.length > 0);

        // Check if applied
        const applications = await api.entities.Application.filter({ 
          job_id: normalizedJobId, 
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
          user_email: user.email,
          user_id: user.id
        });
        if (saved.length > 0) {
          await api.entities.SavedJob.delete(saved[0].id);
          setIsSaved(false);
        }
      } else {
        await api.entities.SavedJob.create({
          job_id: job.id,
          user_email: user.email,
          user_id: user.id
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
      setResumeFileName(file.name || 'resume');
      toast({
        title: 'Resume uploaded',
        description: 'Your file is ready to submit with this application.',
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        variant: 'destructive',
        title: 'Resume upload failed',
        description: error?.message || 'Could not upload resume. Check storage bucket and policies.',
      });
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleApply = async () => {
    if (!user) {
      api.auth.redirectToLogin(window.location.href);
      return;
    }

    setApplying(true);
    try {
      const resolvedPhone = (applicationPhone || profile?.phone || '').trim();
      if (!resolvedPhone) {
        toast({
          variant: 'destructive',
          title: 'Phone number required',
          description: 'Please add your contact number before submitting application.',
        });
        setApplying(false);
        return;
      }

      // Keep profile phone in sync so employer view can still show phone
      // even if applications table schema drops candidate_phone.
      if (profile?.id && !profile?.phone) {
        try {
          await api.entities.UserProfile.update(profile.id, { phone: resolvedPhone });
        } catch (_) {
          // Non-blocking: application submit should still continue.
        }
      }

      const applicationPayload = {
        job_id: job.id,
        candidate_email: user.email,
        status: 'pending',
      };

      // Include optional fields only when we actually have values.
      // This reduces schema-mismatch retries on projects with minimal tables.
      if (user?.id) applicationPayload.candidate_id = user.id;
      applicationPayload.candidate_name = buildApplicantName();
      applicationPayload.candidate_phone = resolvedPhone;
      if (resumeFile || profile?.resume_url) {
        applicationPayload.resume_url = resumeFile || profile?.resume_url || '';
      }
      if (coverLetter?.trim()) applicationPayload.cover_letter = coverLetter.trim();
      if (job?.employer_id) applicationPayload.employer_id = job.employer_id;
      if (job?.title) applicationPayload.job_title = job.title;
      if (job?.company_name) applicationPayload.company_name = job.company_name;

      await api.entities.Application.create(applicationPayload);

      // Update applications count
      try {
        await api.entities.Job.update(job.id, {
          applications_count: (job.applications_count || 0) + 1
        });
      } catch (updateError) {
        // Some schemas do not have applications_count; application is already created.
        console.warn('Skipped applications_count update:', updateError?.message || updateError);
      }

      setHasApplied(true);
      setShowApplyDialog(false);
      toast({
        title: 'Application submitted',
        description: 'Your application has been sent successfully.',
      });
    } catch (error) {
      console.error('Error applying:', error);
      toast({
        variant: 'destructive',
        title: 'Application failed',
        description: error?.message || 'Could not submit application.',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = job?.title ? `${job.title} at ${job.company_name || 'FreshersJob'}` : 'Job Opening on FreshersJob';
    const shareText = `Check out this job: ${shareTitle}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
    } catch (error) {
      // User-cancelled share should not show an error.
      if (error?.name === 'AbortError') return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (_) {
      // ignore clipboard failure and continue with whatsapp fallback
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast({
      title: 'Share link ready',
      description: 'Opened WhatsApp share. Job link copied to clipboard too.',
    });
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
  const locationText = formatJobLocation(job);

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
                      onClick={handleShare}
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    {locationText}
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
                <p className="text-gray-500 text-sm">{locationText}</p>
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
                    {resumeFileName ? `Resume uploaded: ${resumeFileName}` : 'Resume uploaded'}
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

            {/* Contact Phone */}
            <div>
              <Label className="text-gray-700 font-medium">Contact Number</Label>
              <Input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={applicationPhone}
                onChange={(e) => setApplicationPhone(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be shared with the employer along with your application.
              </p>
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
