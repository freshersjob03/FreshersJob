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

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId');

      if (jobId) {
        const jobs = await api.entities.Job.filter({ id: jobId });
        if (jobs.length > 0) {
          setJob(jobs[0]);
        }

        const apps = await api.entities.Application.filter(
          { job_id: jobId },
          '-created_date'
        );
        setApplications(apps);

        // Load candidate profiles
        const profiles = {};
        for (const app of apps) {
          const candidateProfile = await api.entities.UserProfile.filter({ 
            created_by: app.candidate_email 
          });
          if (candidateProfile.length > 0) {
            profiles[app.candidate_email] = candidateProfile[0];
          }
        }
        setCandidateProfiles(profiles);
      } else {
        // Load all applications for employer
        const apps = await api.entities.Application.filter(
          { employer_id: userData.email },
          '-created_date'
        );
        setApplications(apps);
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
                <p className="text-gray-600">{job.company_name} • {job.location}</p>
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
                            {app.candidate_name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-900">{app.candidate_name}</h3>
                          <p className="text-gray-600 text-sm">{app.candidate_email}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Applied {formatDate(app.created_date)}
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
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Candidate Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={candidateProfiles[selectedApplication.candidate_email]?.profile_photo} />
                  <AvatarFallback className="bg-[#3aafc4]/10 text-[#3aafc4] font-bold text-xl">
                    {selectedApplication.candidate_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedApplication.candidate_name}</h3>
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
                  <a 
                    href={`mailto:${selectedApplication.candidate_email}`}
                    className="flex items-center gap-2 text-[#3aafc4] hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {selectedApplication.candidate_email}
                  </a>
                  {candidateProfiles[selectedApplication.candidate_email]?.phone && (
                    <a 
                      href={`tel:${candidateProfiles[selectedApplication.candidate_email].phone}`}
                      className="flex items-center gap-2 text-[#3aafc4] hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {candidateProfiles[selectedApplication.candidate_email].phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Resume */}
              {selectedApplication.resume_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Resume</p>
                  <a 
                    href={selectedApplication.resume_url}
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
                  Applied on {formatDate(selectedApplication.created_date)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}