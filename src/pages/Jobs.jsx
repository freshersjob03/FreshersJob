import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobCard from '@/components/ui/JobCard';
import {
  Search,
  MapPin,
  Filter,
  X,
  SlidersHorizontal,
  Briefcase,
  IndianRupee,
  Clock,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Jobs() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filters, setFilters] = useState({
    jobType: [],
    experienceLevel: [],
    salaryMin: '',
    salaryMax: ''
  });

  const jobTypes = ['full-time', 'part-time', 'internship', 'contract', 'remote'];
  const experienceLevels = ['fresher', '0-1 years', '1-2 years', '2-3 years'];
  const popularLocations = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Remote'];

  useEffect(() => {
    loadData();
    
    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, locationQuery, filters]);

  const loadData = async () => {
    try {
      const isAuthenticated = await api.auth.isAuthenticated();
      if (isAuthenticated) {
        const userData = await api.auth.me();
        setUser(userData);

        const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }

        const saved = await api.entities.SavedJob.filter({ user_email: userData.email });
        setSavedJobs(saved.map(s => s.job_id));

        const apps = await api.entities.Application.filter({ candidate_email: userData.email });
        setApplications(apps.map(a => a.job_id));
      }

      const jobsData = await api.entities.Job.filter({ status: 'active' }, '-created_date', 100);
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...jobs];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company_name.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Location
    if (locationQuery) {
      const location = locationQuery.toLowerCase();
      result = result.filter(job => 
        job.location.toLowerCase().includes(location)
      );
    }

    // Job type
    if (filters.jobType.length > 0) {
      result = result.filter(job => filters.jobType.includes(job.job_type));
    }

    // Experience level
    if (filters.experienceLevel.length > 0) {
      result = result.filter(job => filters.experienceLevel.includes(job.experience_level));
    }

    // Salary
    if (filters.salaryMin) {
      result = result.filter(job => job.salary_max >= parseFloat(filters.salaryMin));
    }
    if (filters.salaryMax) {
      result = result.filter(job => job.salary_min <= parseFloat(filters.salaryMax));
    }

    setFilteredJobs(result);
  };

  const handleSaveJob = async (job) => {
    if (!user) {
      api.auth.redirectToLogin(createPageUrl('Jobs'));
      return;
    }

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

  const handleApply = (job) => {
    if (!user) {
      api.auth.redirectToLogin(createPageUrl('Jobs'));
      return;
    }
    window.location.href = createPageUrl('JobDetails') + `?id=${job.id}`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setFilters({
      jobType: [],
      experienceLevel: [],
      salaryMin: '',
      salaryMax: ''
    });
  };

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const isEmployer = profile?.role === 'employer';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f7]">
        <Loader2 className="w-8 h-8 text-[#4f9497] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-[#4a4d55]">
      {/* Search Header */}
      <div className="bg-white border-b border-[#dbe7e7] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7d8f93]" />
              <Input
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-[#dbe7e7] focus-visible:ring-[#4f9497]"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7d8f93]" />
              <Input
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="pl-10 h-12 border-[#dbe7e7] focus-visible:ring-[#4f9497]"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-4 md:hidden border-[#dbe7e7] text-[#4a4d55]"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Location Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {popularLocations.map((loc) => (
              <Badge
                key={loc}
                variant={locationQuery === loc ? 'default' : 'outline'}
                className={`cursor-pointer whitespace-nowrap ${
                  locationQuery === loc 
                    ? 'bg-[#4f9497] hover:bg-[#447f82]' 
                    : 'border-[#dbe7e7] text-[#4a4d55] hover:bg-[#edf5f5]'
                }`}
                onClick={() => setLocationQuery(locationQuery === loc ? '' : loc)}
              >
                {loc}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} md:block md:relative md:w-64 flex-shrink-0`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h2 className="font-bold text-lg">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            <Card className="p-5 border border-[#dde8e8] rounded-2xl shadow-sm sticky top-24 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#3f424a] flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                <Button variant="ghost" size="sm" className="text-[#4f9497]" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-[#4a4d55] mb-3 block">Job Type</Label>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.jobType.includes(type)}
                        onCheckedChange={() => toggleFilter('jobType', type)}
                      />
                      <label htmlFor={type} className="text-sm text-[#5c616d] capitalize cursor-pointer">
                        {type.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-[#4a4d55] mb-3 block">Experience</Label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={filters.experienceLevel.includes(level)}
                        onCheckedChange={() => toggleFilter('experienceLevel', level)}
                      />
                      <label htmlFor={level} className="text-sm text-[#5c616d] capitalize cursor-pointer">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <Label className="text-sm font-semibold text-[#4a4d55] mb-3 block">Salary (LPA)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({...filters, salaryMin: e.target.value})}
                    className="h-9 border-[#dbe7e7] focus-visible:ring-[#4f9497]"
                  />
                  <span className="text-[#7d8f93]">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters({...filters, salaryMax: e.target.value})}
                    className="h-9 border-[#dbe7e7] focus-visible:ring-[#4f9497]"
                  />
                </div>
              </div>

              {showFilters && (
                <Button className="w-full mt-6 md:hidden bg-[#4f9497] hover:bg-[#447f82]" onClick={() => setShowFilters(false)}>
                  Show {filteredJobs.length} Jobs
                </Button>
              )}
            </Card>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#5c616d]">
                <span className="font-semibold text-[#3f424a]">{filteredJobs.length}</span> jobs found
              </p>
              <Select defaultValue="recent">
                <SelectTrigger className="w-40 border-[#dbe7e7] text-[#4a4d55]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(filters.jobType.length > 0 || filters.experienceLevel.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.jobType.map((type) => (
                  <Badge key={type} variant="secondary" className="gap-1 bg-[#edf5f5] text-[#4a4d55]">
                    {type}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('jobType', type)} />
                  </Badge>
                ))}
                {filters.experienceLevel.map((level) => (
                  <Badge key={level} variant="secondary" className="gap-1 bg-[#edf5f5] text-[#4a4d55]">
                    {level}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter('experienceLevel', level)} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Job Cards */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredJobs.length === 0 ? (
                  <Card className="p-12 text-center border border-[#dde8e8] rounded-2xl shadow-sm bg-white">
                    <Briefcase className="w-16 h-16 text-[#d1dcdd] mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-[#3f424a] mb-2">No jobs found</h3>
                    <p className="text-[#5c616d]">Try adjusting your search or filters</p>
                    <Button variant="outline" className="mt-4 border-[#dbe7e7] text-[#4a4d55]" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </Card>
                ) : (
                  filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <JobCard
                        job={job}
                        isSaved={savedJobs.includes(job.id)}
                        hasApplied={applications.includes(job.id)}
                        onSave={!isEmployer ? handleSaveJob : undefined}
                        onApply={!isEmployer ? handleApply : undefined}
                        onClick={() => window.location.href = createPageUrl('JobDetails') + `?id=${job.id}`}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
