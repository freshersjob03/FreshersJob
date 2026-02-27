import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/api/apiClient';
import { 
  Briefcase, 
  MapPin, 
  GraduationCap,
  Building2,
  Globe,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const CandidateForm = React.memo(function CandidateForm({ formData, onFieldChange }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Professional Headline</Label>
        <Input
          placeholder="e.g., Fresh Computer Science Graduate | Python Enthusiast"
          value={formData.headline}
          onChange={onFieldChange('headline')}
          autoComplete="off"
          className="h-12 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="e.g., Bangalore, India"
            value={formData.location}
            onChange={onFieldChange('location')}
            autoComplete="off"
            className="pl-10 h-12 border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Education</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="e.g., B.Tech in Computer Science from IIT Delhi"
            value={formData.education}
            onChange={onFieldChange('education')}
            autoComplete="off"
            className="pl-10 h-12 border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Skills (comma separated)</Label>
        <Input
          placeholder="e.g., Python, Java, React, SQL"
          value={formData.skills}
          onChange={onFieldChange('skills')}
          autoComplete="off"
          className="h-12 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">About You</Label>
        <Textarea
          placeholder="Tell employers about yourself..."
          value={formData.bio}
          onChange={onFieldChange('bio')}
          className="min-h-[100px] border-gray-200"
        />
      </div>
    </div>
  );
});

const EmployerForm = React.memo(function EmployerForm({ formData, onFieldChange, user }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Company Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="e.g., TCS, Infosys"
            value={formData.company_name}
            onChange={onFieldChange('company_name')}
            autoComplete="off"
            className="pl-10 h-12 border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Your Name</Label>
        <Input
          value={user?.full_name || user?.name || ''}
          readOnly
          className="h-12 border-gray-200 bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Phone Number</Label>
        <Input
          placeholder="e.g., +91 98765 43210"
          value={formData.phone}
          onChange={onFieldChange('phone')}
          autoComplete="off"
          className="h-12 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Your Role / Designation</Label>
        <Input
          placeholder="e.g., HR Manager, Talent Acquisition Lead"
          value={formData.headline}
          onChange={onFieldChange('headline')}
          autoComplete="off"
          className="h-12 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Company Website</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="e.g., https://company.com"
            value={formData.company_website}
            onChange={onFieldChange('company_website')}
            autoComplete="off"
            className="pl-10 h-12 border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Company Size</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={formData.company_size}
            onChange={onFieldChange('company_size')}
            className="w-full pl-10 h-12 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3aafc4]"
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="e.g., Mumbai, India"
            value={formData.location}
            onChange={onFieldChange('location')}
            autoComplete="off"
            className="pl-10 h-12 border-gray-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">About Company</Label>
        <Textarea
          placeholder="Tell candidates about your company..."
          value={formData.bio}
          onChange={onFieldChange('bio')}
          className="min-h-[100px] border-gray-200"
        />
      </div>
    </div>
  );
});

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('candidate');
  const [roleLocked, setRoleLocked] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    location: '',
    phone: '',
    skills: '',
    education: '',
    experience_years: 0,
    company_name: '',
    company_website: '',
    company_size: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      
      // Check for pending role from signup
      const pendingRole = localStorage.getItem('freshersjob_pending_role');
      if (pendingRole === 'candidate' || pendingRole === 'employer') {
        setRole(pendingRole);
        setRoleLocked(true);
      }

      // Check if profile already exists
      const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        const existingProfile = profiles[0];
        const existingRole = existingProfile?.role;
        const isEmployerIncomplete =
          existingRole === 'employer' &&
          (!existingProfile?.company_name || !existingProfile?.headline || !existingProfile?.phone);

        if (isEmployerIncomplete) {
          setExistingProfileId(existingProfile.id);
          setRole('employer');
          setRoleLocked(true);
          setStep(2);
          setFormData((prev) => ({
            ...prev,
            headline: existingProfile.headline || '',
            bio: existingProfile.bio || '',
            location: existingProfile.location || '',
            phone: existingProfile.phone || '',
            skills: Array.isArray(existingProfile.skills) ? existingProfile.skills.join(', ') : '',
            education: existingProfile.education || '',
            experience_years: existingProfile.experience_years || 0,
            company_name: existingProfile.company_name || '',
            company_website: existingProfile.company_website || '',
            company_size: existingProfile.company_size || '',
          }));
          return;
        }

        localStorage.removeItem('freshersjob_pending_role');
        window.location.href = existingRole === 'employer'
          ? createPageUrl('PostJob')
          : createPageUrl('Feed');
      }
    } catch (error) {
      // Not logged in
      window.location.href = createPageUrl('Login');
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!user?.email) {
        throw new Error('User email is missing. Please sign in again.');
      }
      const profileData = {
        created_by: user.email,
        role,
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        education: formData.education,
        experience_years: formData.experience_years
      };

      if (role === 'employer') {
        if (!formData.company_name || !formData.headline || !formData.phone) {
          throw new Error('Please fill company name, role/designation, and phone number.');
        }
        profileData.company_name = formData.company_name;
        profileData.company_website = formData.company_website;
        profileData.company_size = formData.company_size;
      }

      if (existingProfileId) {
        await api.entities.UserProfile.update(existingProfileId, profileData);
      } else {
        await api.entities.UserProfile.create(profileData);
      }
      localStorage.removeItem('freshersjob_pending_role');
      window.location.href = role === 'employer'
        ? createPageUrl('PostJob')
        : createPageUrl('Feed');
    } catch (error) {
      console.error('Error creating profile:', error);
      window.alert(error?.message || 'Unable to save profile.');
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => {
    const value = e?.target?.value ?? '';
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3aafc4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-gray-900">
            Freshers<span className="text-[#3aafc4]">Job</span>
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[#3aafc4]' : 'bg-gray-300'}`} />
          <div className={`w-20 h-1 rounded ${step >= 2 ? 'bg-[#3aafc4]' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[#3aafc4]' : 'bg-gray-300'}`} />
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-extrabold text-gray-900">
              {step === 1 ? 'Welcome! Tell us about yourself' : 'Complete Your Profile'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {step === 1 
                ? 'This helps us personalize your experience'
                : role === 'candidate' 
                  ? 'Help employers discover you'
                  : 'Help candidates know about your company'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => !roleLocked && setRole('candidate')}
                    disabled={roleLocked}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      role === 'candidate'
                        ? 'border-[#3aafc4] bg-[#3aafc4]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${roleLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-[#3aafc4]/10 flex items-center justify-center">
                      <GraduationCap className={`w-7 h-7 ${role === 'candidate' ? 'text-[#3aafc4]' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-bold text-gray-900">Candidate</p>
                    <p className="text-sm text-gray-500 mt-1">I'm looking for jobs</p>
                    {role === 'candidate' && (
                      <CheckCircle2 className="w-5 h-5 text-[#3aafc4] mx-auto mt-3" />
                    )}
                  </button>
                  <button
                    onClick={() => !roleLocked && setRole('employer')}
                    disabled={roleLocked}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      role === 'employer'
                        ? 'border-[#3aafc4] bg-[#3aafc4]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${roleLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-[#3aafc4]/10 flex items-center justify-center">
                      <Building2 className={`w-7 h-7 ${role === 'employer' ? 'text-[#3aafc4]' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-bold text-gray-900">Employer</p>
                    <p className="text-sm text-gray-500 mt-1">I'm hiring talent</p>
                    {role === 'employer' && (
                      <CheckCircle2 className="w-5 h-5 text-[#3aafc4] mx-auto mt-3" />
                    )}
                  </button>
                </div>
                {roleLocked && (
                  <p className="text-xs text-gray-500 text-center">
                    Account type is locked from your selected signup path.
                  </p>
                )}
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full h-12 btn-primary font-semibold"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {role === 'candidate' ? (
                  <CandidateForm formData={formData} onFieldChange={updateField} />
                ) : (
                  <EmployerForm formData={formData} onFieldChange={updateField} user={user} />
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 h-12 btn-primary font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
