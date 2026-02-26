import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Clock,
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyApplications() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const apps = await api.entities.Application.filter(
        { candidate_email: userData.email },
        '-created_date'
      );
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        label: 'Under Review', 
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
        label: 'Not Selected', 
        color: 'bg-red-100 text-red-700',
        icon: XCircle
      },
      hired: { 
        label: 'Hired!', 
        color: 'bg-purple-100 text-purple-700',
        icon: CheckCircle2
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">My Applications</h1>
          <Badge variant="secondary" className="text-sm">
            {applications.length} total
          </Badge>
        </div>

        {applications.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-sm">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Start applying to jobs to track your progress</p>
            <a href={createPageUrl('Jobs')}>
              <Button className="btn-primary">
                Browse Jobs
              </Button>
            </a>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3aafc4]/20 to-[#1a7a94]/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-[#3aafc4]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{app.job_title}</h3>
                          <p className="text-gray-600">{app.company_name}</p>
                          <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Applied on {formatDate(app.created_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={`${statusConfig.color} border-0 flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </Badge>
                        <a href={createPageUrl('JobDetails') + `?id=${app.job_id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Job
                          </Button>
                        </a>
                      </div>
                    </div>

                    {app.cover_letter && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-1">Your cover letter:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{app.cover_letter}</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}