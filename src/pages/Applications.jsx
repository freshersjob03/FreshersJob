import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Loader2,
  Search,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatJobLocation } from '@/lib/utils';

export default function Applications() {
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [candidateProfiles, setCandidateProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const resolveCandidateEmail = (app) => {
    if (app?.candidate_email) return app.candidate_email;
    if (typeof app?.candidate_id === 'string' && app.candidate_id.includes('@')) {
      return app.candidate_id;
    }
    return null;
  };

  const normalizeApplication = (app) => ({
    ...app,
    candidate_email: resolveCandidateEmail(app),
    candidate_name: app?.candidate_name || app?.name || '',
    candidate_phone: app?.candidate_phone || app?.phone || null,
    created_at: app?.created_at || app?.applied_at || app?.updated_at || null,
  });

  const getCandidateDisplayName = (app) => {
    const profile = candidateProfiles[app?.candidate_email];
    const emailName = app?.candidate_email
      ? app.candidate_email.split('@')[0].replace(/[._-]+/g, ' ').trim()
      : '';
    const prettyEmailName = emailName
      ? emailName.replace(/\b\w/g, (c) => c.toUpperCase())
      : '';
    const appName = String(app?.candidate_name || '').trim();
    const headline = String(profile?.headline || '').trim();
    const isAppNameProbablyHeadline = appName && headline && appName.toLowerCase() === headline.toLowerCase();

    return (
      (!isAppNameProbablyHeadline ? appName : '') ||
      profile?.full_name ||
      profile?.name ||
      prettyEmailName ||
      'Candidate'
    );
  };

  const getCandidateResumeUrl = (app) => {
    const profile = candidateProfiles[app?.candidate_email];
    return app?.resume_url || profile?.resume_url || null;
  };

  const loadProfilesForApplications = async (apps) => {
    const profiles = {};
    for (const app of apps) {
      const candidateEmail = resolveCandidateEmail(app);
      if (!candidateEmail) continue;
      const candidateProfile = await api.entities.UserProfile.filter({
        created_by: candidateEmail
      });
      if (candidateProfile.length > 0) {
        profiles[candidateEmail] = candidateProfile[0];
      }
    }
    setCandidateProfiles(profiles);
  };

  const loadApplicationsForJob = async (jobId, userEmail, selectedJob) => {
    const normalizedJobId = Number.isNaN(Number(jobId)) ? String(jobId) : String(Number(jobId));

    try {
      const direct = await api.entities.Application.filter({ job_id: normalizedJobId }, '-created_at');
      if (direct.length > 0) return direct;
    } catch (_) {}

    try {
      const byEmployer = await api.entities.Application.filter({ employer_id: userEmail }, '-created_at');
      const filtered = byEmployer.filter((a) => String(a?.job_id ?? '') === normalizedJobId);
      if (filtered.length > 0) return filtered;
    } catch (_) {}

    const all = await api.entities.Application.filter({}, '-created_at');
    return all.filter((a) => {
      const appJobId = String(a?.job_id ?? '');
      if (appJobId && appJobId === normalizedJobId) return true;
      if (!selectedJob) return false;
      const sameTitle = a?.job_title && selectedJob?.title && a.job_title === selectedJob.title;
      const sameCompany =
        a?.company_name &&
        (a.company_name === selectedJob?.company_name || a.company_name === selectedJob?.company);
      return !!(sameTitle && sameCompany);
    });
  };

  const loadApplicationsForEmployer = async (userEmail) => {
    try {
      const byEmployer = await api.entities.Application.filter({ employer_id: userEmail }, '-created_at');
      if (byEmployer.length > 0) return byEmployer;
    } catch (_) {}

    const [jobsByEmployer, jobsByCreatedBy, allApplications] = await Promise.all([
      api.entities.Job.filter({ employer_id: userEmail }, '-created_at').catch(() => []),
      api.entities.Job.filter({ created_by: userEmail }, '-created_at').catch(() => []),
      api.entities.Application.filter({}, '-created_at').catch(() => []),
    ]);

    const ownedIds = new Set([...jobsByEmployer, ...jobsByCreatedBy].map((j) => String(j.id)));
    return allApplications.filter((a) => ownedIds.has(String(a?.job_id ?? '')));
  };

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId');

      if (jobId) {
        const jobs = await api.entities.Job.filter({ id: jobId });
        let selectedJob = null;
        if (jobs.length > 0) {
          selectedJob = jobs[0];
          setJob(selectedJob);
        }

        const apps = await loadApplicationsForJob(jobId, userData.email, selectedJob);
        const normalizedApps = apps.map(normalizeApplication);
        setApplications(normalizedApps);
        await loadProfilesForApplications(normalizedApps);
      } else {
        // Load all applications for employer
        const apps = await loadApplicationsForEmployer(userData.email);
        const normalizedApps = apps.map(normalizeApplication);
        setApplications(normalizedApps);
        await loadProfilesForApplications(normalizedApps);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await api.entities.Application.update(applicationId, { status: newStatus });
      setApplications(applications.map(a => 
        a.id === applicationId ? { ...a, status: newStatus } : a
      ));
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock
      },
      reviewed: { 
        label: 'Reviewed', 
        color: 'bg-blue-100 text-blue-700',
        icon: Search
      },
      shortlisted: { 
        label: 'Shortlisted', 
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle2
      },
      rejected: { 
        label: 'Rejected', 
        color: 'bg-red-100 text-red-700',
        icon: XCircle
      },
      hired: { 
        label: 'Hired', 
        color: 'bg-purple-100 text-purple-700',
        icon: CheckCircle2
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#3aafc4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('ManageJobs')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>

          {job && (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3aafc4]/20 to-[#1a7a94]/20 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-[#3aafc4]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{job.title}</h1>
                <p className="text-gray-600">{job.company_name} • {formatJobLocation(job)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredApplications.length}</span> applications
          </p>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-sm">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500">Applications will appear here when candidates apply</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              const profile = candidateProfiles[app.candidate_email];
              const displayName = getCandidateDisplayName(app);

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile?.profile_photo} />
                          <AvatarFallback className="bg-[#3aafc4]/10 text-[#3aafc4] font-bold">
                            {displayName?.charAt(0)?.toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-900">{displayName}</h3>
                          <p className="text-gray-600 text-sm">{app.candidate_email || 'Email not provided'}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Applied {formatDate(app.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={`${statusConfig.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Select 
                          value={app.status}
                          onValueChange={(value) => handleStatusUpdate(app.id, value)}
                        >
                          <SelectTrigger className="w-36" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Quick Info */}
                    {profile && (
                      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                        {profile.location && (
                          <span>{profile.location}</span>
                        )}
                        {profile.education && (
                          <span>{profile.education}</span>
                        )}
                        {profile.skills?.length > 0 && (
                          <div className="flex gap-1">
                            {profile.skills.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              View candidate contact details and update application status.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              {(() => {
                const displayName = getCandidateDisplayName(selectedApplication);
                const resumeUrl = getCandidateResumeUrl(selectedApplication);
                return (
                  <>
              {/* Candidate Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={candidateProfiles[selectedApplication.candidate_email]?.profile_photo} />
                  <AvatarFallback className="bg-[#3aafc4]/10 text-[#3aafc4] font-bold text-xl">
                    {displayName?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
                  <p className="text-gray-600">{candidateProfiles[selectedApplication.candidate_email]?.headline || 'Fresher'}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Application Status</p>
                <Select 
                  value={selectedApplication.status}
                  onValueChange={(value) => handleStatusUpdate(selectedApplication.id, value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Contact Information</p>
                <div className="space-y-2">
                  {selectedApplication.candidate_email ? (
                    <a 
                      href={`mailto:${selectedApplication.candidate_email}`}
                      className="flex items-center gap-2 text-[#3aafc4] hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedApplication.candidate_email}
                    </a>
                  ) : (
                    <p className="flex items-center gap-2 text-gray-500">
                      <Mail className="w-4 h-4" />
                      Email not available
                    </p>
                  )}
                  {(candidateProfiles[selectedApplication.candidate_email]?.phone || selectedApplication.candidate_phone) ? (
                    <a 
                      href={`tel:${candidateProfiles[selectedApplication.candidate_email]?.phone || selectedApplication.candidate_phone}`}
                      className="flex items-center gap-2 text-[#3aafc4] hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {candidateProfiles[selectedApplication.candidate_email]?.phone || selectedApplication.candidate_phone}
                    </a>
                  ) : (
                    <p className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-4 h-4" />
                      Contact number not available
                    </p>
                  )}
                </div>
              </div>

              {/* Resume */}
              {resumeUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Resume</p>
                  <a 
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cover Letter</p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {candidateProfiles[selectedApplication.candidate_email]?.skills?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidateProfiles[selectedApplication.candidate_email].skills.map((skill, i) => (
                      <Badge key={i} className="bg-[#3aafc4]/10 text-[#1a7a94] border-0">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied Date */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                  Applied on {formatDate(selectedApplication.created_at)}
                </p>
              </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
