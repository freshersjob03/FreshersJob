import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Briefcase,
  MapPin,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageJobs() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        if (profiles[0].role !== 'employer') {
          window.location.href = createPageUrl('Feed');
          return;
        }
      }

      const employerJobs = await api.entities.Job.filter(
        { employer_id: userData.email },
        '-created_date'
      );
      setJobs(employerJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await api.entities.Job.update(jobId, { status: newStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.entities.Job.delete(deleteJobId);
      setJobs(jobs.filter(j => j.id !== deleteJobId));
      setDeleteJobId(null);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      closed: { label: 'Closed', color: 'bg-red-100 text-red-700', icon: XCircle },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock }
    };
    return configs[status] || configs.draft;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredJobs = jobs.filter(j => {
    if (activeTab === 'all') return true;
    return j.status === activeTab;
  });

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Manage Jobs</h1>
            <p className="text-gray-600">View and manage your job postings</p>
          </div>
          <Link to={createPageUrl('PostJob')}>
            <Button className="btn-primary gap-2">
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({jobs.filter(j => j.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({jobs.filter(j => j.status === 'closed').length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({jobs.filter(j => j.status === 'draft').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredJobs.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-sm">
                <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'all' 
                    ? "You haven't posted any jobs yet" 
                    : `No ${activeTab} jobs`
                  }
                </p>
                {activeTab === 'all' && (
                  <Link to={createPageUrl('PostJob')}>
                    <Button className="btn-primary">Post Your First Job</Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job, index) => {
                  const statusConfig = getStatusConfig(job.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3aafc4]/20 to-[#1a7a94]/20 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-6 h-6 text-[#3aafc4]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-gray-900">{job.title}</h3>
                                  <Badge className={`${statusConfig.color} border-0`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm">{job.company_name}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {job.applications_count || 0} applications
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Posted {formatDate(job.created_date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link to={createPageUrl('Applications') + `?jobId=${job.id}`}>
                              <Button variant="outline" size="sm">
                                <Users className="w-4 h-4 mr-1" />
                                View Applications
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={createPageUrl('JobDetails') + `?id=${job.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Job
                                  </Link>
                                </DropdownMenuItem>
                                {job.status === 'active' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'closed')}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Close Job
                                  </DropdownMenuItem>
                                )}
                                {job.status === 'closed' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(job.id, 'active')}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Reopen Job
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => setDeleteJobId(job.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Skills Preview */}
                        {job.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {job.skills.slice(0, 5).map((skill, i) => (
                              <Badge key={i} variant="outline" className="bg-gray-50">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 5 && (
                              <Badge variant="outline" className="bg-gray-50">
                                +{job.skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All applications for this job will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}