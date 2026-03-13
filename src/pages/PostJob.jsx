import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/working-toast';
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
  CheckCircle2,
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

const INDIAN_LOCATIONS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi NCR',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];
const SORTED_INDIAN_LOCATIONS = [...INDIAN_LOCATIONS].sort((a, b) => a.localeCompare(b));

export default function PostJob() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cityMap, setCityMap] = useState({});
  const { toast } = useToast();
  
  const [jobData, setJobData] = useState({
    title: '',
    company_name: '',
    state: '',
    city: '',
    locality: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    company_logo: '',
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

  const popularSkills = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'AWS', 'Machine Learning', 'Data Analysis', 'Excel'];
  const locationSuggestions = jobData.state
    ? SORTED_INDIAN_LOCATIONS.filter((location) =>
        location.toLowerCase().startsWith(jobData.state.toLowerCase())
      ).slice(0, 8)
    : [];
  const normalizedState = String(jobData.state || '').trim().toLowerCase();
  const matchedStateKey = normalizedState
    ? Object.keys(cityMap).find((state) => state.toLowerCase() === normalizedState) ||
      Object.keys(cityMap).find((state) => state.toLowerCase().startsWith(normalizedState))
    : null;
  const citiesForState = matchedStateKey ? (cityMap[matchedStateKey] || []) : [];
  const citySuggestions = citiesForState.length > 0
    ? (jobData.city
        ? citiesForState.filter((city) =>
            city.toLowerCase().startsWith(jobData.city.toLowerCase())
          )
        : citiesForState
      ).slice(0, 8)
    : [];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCityData();
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
            company_name: userProfile.company_name || '',
            company_logo: userProfile.company_logo || ''
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

  const loadCityData = async () => {
    try {
      const res = await fetch('/city-data.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('City list unavailable');
      const data = await res.json();
      setCityMap(data || {});
    } catch (error) {
      console.warn('Failed to load city list:', error);
      setCityMap({});
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

  const handleLogoUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const result = await api.integrations.Core.UploadFile({ file });
      if (!result?.file_url) throw new Error('Could not upload company logo.');
      setJobData((prev) => ({ ...prev, company_logo: result.file_url }));
      toast({
        title: 'Logo uploaded',
        description: 'Company logo added to this posting.',
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error?.message || 'Could not upload company logo.',
      });
    } finally {
      setUploadingLogo(false);
      if (e?.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);

    try {
      const payload = {
        title: jobData.title,
        company_name: jobData.company_name,
        state: jobData.state,
        city: jobData.city,
        locality: jobData.locality,
        location: [jobData.city, jobData.state].filter(Boolean).join(', '),
        job_type: jobData.job_type,
        experience_level: jobData.experience_level,
        salary_min: jobData.salary_min ? parseFloat(jobData.salary_min) : null,
        salary_max: jobData.salary_max ? parseFloat(jobData.salary_max) : null,
        description: jobData.description,
        requirements: jobData.requirements,
        company_logo: jobData.company_logo || null,
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
                  <Label>Company Name</Label>
                  <Input
                    value={jobData.company_name}
                    onChange={(e) => setJobData({ ...jobData, company_name: e.target.value })}
                    placeholder="Company name from your employer profile"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Company Logo (Optional)</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingLogo}
                      className="relative overflow-hidden"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload Logo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                    </Button>
                    <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
                  </div>
                  {jobData.company_logo ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={jobData.company_logo}
                        alt="Company logo preview"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setJobData((prev) => ({ ...prev, company_logo: '' }))}
                      >
                        Remove logo
                      </Button>
                    </div>
                  ) : null}
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
                  <Label>State *</Label>
                  <div className="relative mt-1">
                    <Input
                      value={jobData.state}
                      onChange={(e) => {
                        setJobData({ ...jobData, state: e.target.value });
                        setShowLocationSuggestions(true);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 120)}
                      placeholder="e.g., Karnataka"
                      required
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-56 overflow-auto">
                        {locationSuggestions.map((location) => (
                          <button
                            key={location}
                            type="button"
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              setJobData({ ...jobData, state: location });
                              setShowLocationSuggestions(false);
                            }}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>City *</Label>
                  <div className="relative mt-1">
                    <Input
                      value={jobData.city}
                      onChange={(e) => {
                        setJobData({ ...jobData, city: e.target.value });
                        setShowCitySuggestions(true);
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 120)}
                      placeholder="e.g., Bengaluru"
                      required
                    />
                    {showCitySuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-56 overflow-auto">
                        {citySuggestions.map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => {
                              setJobData({ ...jobData, city });
                              setShowCitySuggestions(false);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Locality *</Label>
                  <Input
                    value={jobData.locality}
                    onChange={(e) => setJobData({ ...jobData, locality: e.target.value })}
                    placeholder="e.g., Indiranagar"
                    required
                    className="mt-1"
                  />
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
                disabled={posting || !jobData.title || !jobData.company_name || !jobData.state || !jobData.city || !jobData.locality || !jobData.job_type || !jobData.description}
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
