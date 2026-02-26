import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/ui/JobCard';
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Building2,
  Users,
  Bookmark,
  FileText,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Feed() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
      if (profiles.length === 0) {
        window.location.href = createPageUrl('Onboarding');
        return;
      }
      setProfile(profiles[0]);

      // Load jobs
      const jobsData = await api.entities.Job.filter({ status: 'active' }, '-created_date', 10);
      setJobs(jobsData);

      // Load saved jobs
      const saved = await api.entities.SavedJob.filter({ user_email: userData.email });
      setSavedJobs(saved.map(s => s.job_id));

      // Load applications
      const apps = await api.entities.Application.filter({ candidate_email: userData.email });
      setApplications(apps.map(a => a.job_id));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      if (savedJobs.includes(job.id)) {
        const saved = await api.entities.SavedJob.filter({ 
          job_id: job.id, 
          user_email: user.email 
        });
        if (saved.length > 0) {
          await api.entities.SavedJob.delete(saved[0].id);
          setSavedJobs(savedJobs.filter(id => id !== job.id));
        }
      } else {
        await api.entities.SavedJob.create({
          job_id: job.id,
          user_email: user.email
        });
        setSavedJobs([...savedJobs, job.id]);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApply = async (job) => {
    window.location.href = createPageUrl('JobDetails') + `?id=${job.id}`;
  };

  const isEmployer = profile?.role === 'employer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#3aafc4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="h-20 gradient-primary" />
              <div className="px-4 pb-4">
                <Avatar className="-mt-10 w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.profile_photo} />
                  <AvatarFallback className="bg-[#3aafc4] text-white text-2xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-lg text-gray-900 mt-3">{user?.full_name}</h2>
                <p className="text-gray-600 text-sm">{profile?.headline || (isEmployer ? 'Employer' : 'Fresher')}</p>
                {profile?.location && (
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </p>
                )}
                
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <Link to={createPageUrl('Profile')}>
                    <Button variant="outline" className="w-full" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Quick Stats for Candidates */}
            {!isEmployer && (
              <Card className="mt-4 p-4 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Your Activity</h3>
                <div className="space-y-3">
                  <Link to={createPageUrl('MyApplications')} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <span className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      Applications
                    </span>
                    <Badge variant="secondary">{applications.length}</Badge>
                  </Link>
                  <Link to={createPageUrl('SavedJobs')} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Bookmark className="w-4 h-4" />
                      Saved Jobs
                    </span>
                    <Badge variant="secondary">{savedJobs.length}</Badge>
                  </Link>
                </div>
              </Card>
            )}

            {/* Quick Actions for Employers */}
            {isEmployer && (
              <Card className="mt-4 p-4 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to={createPageUrl('PostJob')}>
                    <Button className="w-full btn-primary justify-start" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Job
                    </Button>
                  </Link>
                  <Link to={createPageUrl('ManageJobs')}>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Manage Jobs
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6">
            {/* Search Bar */}
            <Card className="p-4 mb-6 border-0 shadow-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    placeholder="Search jobs, companies, skills..."
                    className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white"
                  />
                </div>
                <Link to={createPageUrl('Jobs')}>
                  <Button className="btn-primary h-11 px-6">
                    Search
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 mb-6 border-0 shadow-sm bg-gradient-to-r from-[#3aafc4]/10 to-[#1a7a94]/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">
                      {isEmployer 
                        ? `Welcome back, ${user?.full_name?.split(' ')[0]}!`
                        : `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.full_name?.split(' ')[0]}!`
                      }
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {isEmployer 
                        ? 'Ready to find your next star employee?'
                        : 'Your dream job is waiting. Let\'s find it today!'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Job Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">
                  {isEmployer ? 'Recent Candidates' : 'Recommended Jobs'}
                </h2>
                <Link to={createPageUrl('Jobs')} className="text-[#3aafc4] text-sm font-medium hover:underline">
                  View all
                </Link>
              </div>

              {jobs.length === 0 ? (
                <Card className="p-8 text-center border-0 shadow-sm">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900">No jobs yet</h3>
                  <p className="text-gray-500 mt-1">Check back later for new opportunities</p>
                </Card>
              ) : (
                jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <JobCard
                      job={job}
                      isSaved={savedJobs.includes(job.id)}
                      hasApplied={applications.includes(job.id)}
                      onSave={!isEmployer ? handleSaveJob : null}
                      onApply={!isEmployer ? handleApply : null}
                      onClick={() => window.location.href = createPageUrl('JobDetails') + `?id=${job.id}`}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            {/* Trending Skills */}
            <Card className="p-4 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3aafc4]" />
                Trending Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Python', 'React', 'Java', 'SQL', 'Data Science', 'AWS', 'Node.js', 'Machine Learning'].map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-gray-50 cursor-pointer hover:bg-[#3aafc4]/10 hover:border-[#3aafc4]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Top Companies */}
            <Card className="p-4 mt-4 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#3aafc4]" />
                Top Companies Hiring
              </h3>
              <div className="space-y-3">
                {['TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra'].map((company, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{company}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 100) + 20}+ jobs</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={createPageUrl('Jobs')}>
                <Button variant="ghost" className="w-full mt-3 text-[#3aafc4]" size="sm">
                  See all companies
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            {/* Footer Links */}
            <div className="mt-6 text-center text-xs text-gray-400 space-x-2">
              <a href="#" className="hover:text-gray-600">About</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-600">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-600">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-600">Help</a>
              <p className="mt-2">© 2024 FreshersJob</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}