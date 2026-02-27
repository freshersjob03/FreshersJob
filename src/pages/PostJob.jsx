import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Plus,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PostJob() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();
  
  const [jobData, setJobData] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    skills: [],
    status: 'active'
  });

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'remote', label: 'Remote' }
  ];

  const experienceLevels = [
    { value: 'fresher', label: 'Fresher (0 experience)' },
    { value: '0-1 years', label: '0-1 Years' },
    { value: '1-2 years', label: '1-2 Years' },
    { value: '2-3 years', label: '2-3 Years' }
  ];

  const popularLocations = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Remote'];
  const popularSkills = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'AWS', 'Machine Learning', 'Data Analysis', 'Excel'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        const userProfile = profiles[0];
        setProfile(userProfile);
        
        // Pre-fill company info for employers
        if (userProfile.role === 'employer') {
          setJobData(prev => ({
            ...prev,
            company_name: userProfile.company_name || ''
          }));
        } else {
          // Redirect non-employers
          window.location.href = createPageUrl('Feed');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill) => {
    if (skill && !jobData.skills.includes(skill)) {
      setJobData({ ...jobData, skills: [...jobData.skills, skill] });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setJobData({ 
      ...jobData, 
      skills: jobData.skills.filter(s => s !== skillToRemove) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);

    try {
      const payload = {
        title: jobData.title,
        company: jobData.company_name,
        location: jobData.location,
        job_type: jobData.job_type,
        salary_min: jobData.salary_min ? parseFloat(jobData.salary_min) : null,
        salary_max: jobData.salary_max ? parseFloat(jobData.salary_max) : null,
        description: jobData.description,
        requirements: jobData.requirements,
        skills: jobData.skills,
        employer_id: user.email,
      };

      await api.entities.Job.create({
        ...payload
      });

      setSuccess(true);
      toast({
        title: 'Job posted',
        description: 'Your job is now live.',
      });
      setTimeout(() => {
        window.location.href = createPageUrl('ManageJobs');
      }, 2000);
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        variant: 'destructive',
        title: 'Post Job failed',
        description: error?.message || 'Could not create job.',
      });
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#3aafc4] animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600">Redirecting to your jobs...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600 mb-6">Find the perfect fresher for your team</p>

          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#3aafc4]" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Job Title *</Label>
                  <Input
                    value={jobData.title}
                    onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                    placeholder="e.g., Software Developer, Data Analyst"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={jobData.company_name}
                    onChange={(e) => setJobData({ ...jobData, company_name: e.target.value })}
                    placeholder="Your company name"
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Type *</Label>
                    <Select
                      value={jobData.job_type}
                      onValueChange={(value) => setJobData({ ...jobData, job_type: value })}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Experience Level *</Label>
                    <Select
                      value={jobData.experience_level}
                      onValueChange={(value) => setJobData({ ...jobData, experience_level: value })}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3aafc4]" />
                  Location & Salary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Location *</Label>
                  <Input
                    value={jobData.location}
                    onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                    placeholder="e.g., Bangalore, India"
                    required
                    className="mt-1"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularLocations.map((loc) => (
                      <Badge
                        key={loc}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#3aafc4]/10"
                        onClick={() => setJobData({ ...jobData, location: loc })}
                      >
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    Salary Range (LPA)
                  </Label>
                  <div className="flex gap-3 mt-1">
                    <Input
                      type="number"
                      value={jobData.salary_min}
                      onChange={(e) => setJobData({ ...jobData, salary_min: e.target.value })}
                      placeholder="Min"
                    />
                    <span className="self-center text-gray-400">to</span>
                    <Input
                      type="number"
                      value={jobData.salary_max}
                      onChange={(e) => setJobData({ ...jobData, salary_max: e.target.value })}
                      placeholder="Max"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty if you don't want to disclose salary</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(newSkill);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddSkill(newSkill)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {jobData.skills.map((skill, i) => (
                    <Badge key={i} className="bg-[#3aafc4]/10 text-[#1a7a94] border-0 gap-1">
                      {skill}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} />
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-3">Popular skills:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {popularSkills.filter(s => !jobData.skills.includes(s)).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-[#3aafc4]/10"
                      onClick={() => handleAddSkill(skill)}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={jobData.description}
                    onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                    required
                    className="mt-1 min-h-[150px]"
                  />
                </div>

                <div>
                  <Label>Requirements</Label>
                  <Textarea
                    value={jobData.requirements}
                    onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                    placeholder="List the qualifications, skills, and experience required..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 btn-primary"
                disabled={posting || !jobData.title || !jobData.company_name || !jobData.location || !jobData.job_type || !jobData.experience_level || !jobData.description}
              >
                {posting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Post Job'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
