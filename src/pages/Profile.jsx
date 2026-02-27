import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Building2,
  Users,
  Edit2,
  Camera,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // editData holds the form state; always use an object to avoid crashes
  const [editData, setEditData] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();
  const { clerk } = useAuth();

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
        setEditData(profiles[0]);
      } else {
        // leave profile null; editData remains {} so form can create new
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      if (!file_url) {
        throw new Error('Upload did not return a file URL');
      }
      setEditData((prev) => ({ ...prev, profile_photo: file_url }));
      toast({
        title: 'Photo uploaded',
        description: 'Your profile photo is ready to save.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: 'destructive',
        title: 'Photo upload failed',
        description: error?.message || 'Unable to upload profile photo.',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      if (!file_url) {
        throw new Error('Upload did not return a file URL');
      }
      setEditData((prev) => ({ ...prev, resume_url: file_url }));
      toast({
        title: 'Resume uploaded',
        description: 'Your resume is ready to save.',
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        variant: 'destructive',
        title: 'Resume upload failed',
        description: error?.message || 'Unable to upload resume file.',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const skills = editData.skills || [];
      setEditData({ ...editData, skills: [...skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const skills = editData.skills || [];
    setEditData({ ...editData, skills: skills.filter(s => s !== skillToRemove) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profilePayload = { ...editData };
      // Never send immutable/generated columns in update/create payloads.
      delete profilePayload.id;
      delete profilePayload.created_date;

      if (profile && profile.id) {
        await api.entities.UserProfile.update(profile.id, profilePayload);
      } else {
        if (!user?.email) {
          throw new Error('User email is missing. Please sign in again.');
        }
        const roleFromIntent = localStorage.getItem('freshersjob_pending_role');
        const createPayload = {
          ...profilePayload,
          created_by: user.email,
          role: profilePayload.role || roleFromIntent || 'candidate',
        };
        await api.entities.UserProfile.create(createPayload);
      }
      await loadData();
      setEditMode(false);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error?.message || 'Could not save profile changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const isEmployer = profile?.role === 'employer';
  const profileName = (user?.full_name || user?.email || '').trim();
  const canDeleteAccount = deleteConfirmName.trim() === profileName;

  const handleDeleteAccount = async () => {
    if (!canDeleteAccount || !user?.email || deletingAccount) return;

    const shouldDelete = window.confirm(
      `This will permanently delete your account and all data for ${profileName}. This cannot be undone. Continue?`
    );
    if (!shouldDelete) return;

    setDeletingAccount(true);
    try {
      const [savedJobs, candidateApplications, employerApplications, jobs, profiles] = await Promise.all([
        api.entities.SavedJob.filter({ user_email: user.email }),
        api.entities.Application.filter({ candidate_email: user.email }),
        api.entities.Application.filter({ employer_id: user.email }),
        api.entities.Job.filter({ employer_id: user.email }),
        api.entities.UserProfile.filter({ created_by: user.email }),
      ]);

      const appMap = new Map();
      [...candidateApplications, ...employerApplications].forEach((app) => {
        if (app?.id != null) appMap.set(app.id, app);
      });

      await Promise.all([
        ...savedJobs.map((row) => api.entities.SavedJob.delete(row.id)),
        ...Array.from(appMap.values()).map((row) => api.entities.Application.delete(row.id)),
        ...jobs.map((row) => api.entities.Job.delete(row.id)),
        ...profiles.map((row) => api.entities.UserProfile.delete(row.id)),
      ]);

      if (clerk?.user?.delete) {
        await clerk.user.delete();
      } else if (clerk?.signOut) {
        await clerk.signOut();
      }

      localStorage.removeItem('freshersjob_pending_role');
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted permanently.',
      });
      window.location.href = createPageUrl('Landing');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error?.message || 'Unable to delete account right now.',
      });
      setDeletingAccount(false);
    }
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header Card */}
          <Card className="overflow-hidden border-0 shadow-lg mb-6">
            <div className="h-32 gradient-primary" />
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                    <AvatarImage src={profile?.profile_photo} />
                    <AvatarFallback className="bg-[#3aafc4] text-white text-4xl font-bold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 md:pb-2">
                  <h1 className="text-2xl font-extrabold text-gray-900">{user?.full_name}</h1>
                  <p className="text-gray-600">{profile?.headline || (isEmployer ? 'Employer' : 'Fresher')}</p>
                  {profile?.location && (
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </p>
                  )}
                </div>
                <Button onClick={() => { setEditData(profile || {}); setEditMode(true); }} variant="outline" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  {profile ? 'Edit Profile' : 'Create Profile'}
                </Button>
              </div>
            </div>
          </Card>

          {/* About Section */}
          <Card className="p-6 border-0 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {profile?.bio || 'No bio added yet.'}
            </p>
          </Card>

          {/* Contact Info */}
          <Card className="p-6 border-0 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#3aafc4]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#3aafc4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                </div>
              )}
              {profile?.linkedin_url && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-[#3aafc4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LinkedIn</p>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#3aafc4] hover:underline">
                      View Profile
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Candidate specific sections */}
          {!isEmployer && (
            <>
              {/* Skills */}
              <Card className="p-6 border-0 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
                {profile?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <Badge key={i} className="bg-[#3aafc4]/10 text-[#1a7a94] border-0 px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills added yet.</p>
                )}
              </Card>

              {/* Education */}
              <Card className="p-6 border-0 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Education</h2>
                {profile?.education ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-[#3aafc4]" />
                    </div>
                    <div>
                      <p className="text-gray-900">{profile.education}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No education added yet.</p>
                )}
              </Card>

              {/* Resume */}
              <Card className="p-6 border-0 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Resume</h2>
                {profile?.resume_url ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-[#3aafc4]" />
                      <div>
                        <p className="font-medium text-gray-900">Resume</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No resume uploaded yet.</p>
                )}
              </Card>
            </>
          )}

          {/* Employer specific sections */}
          {isEmployer && (
            <Card className="p-6 border-0 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#3aafc4]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="text-gray-900">{profile?.company_name || 'Not specified'}</p>
                  </div>
                </div>
                {profile?.company_website && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#3aafc4]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-[#3aafc4] hover:underline">
                        {profile.company_website}
                      </a>
                    </div>
                  </div>
                )}
                {profile?.company_size && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3aafc4]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#3aafc4]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company Size</p>
                      <p className="text-gray-900">{profile.company_size} employees</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6 border border-red-200 bg-red-50/40 shadow-sm mb-2">
            {!showDeletePanel ? (
              <Button
                type="button"
                onClick={() => setShowDeletePanel(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete My Account Permanently
              </Button>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-red-700">Delete My Account Permanently</h2>
                  <p className="text-sm text-red-700/90 mt-1">
                    This will permanently delete your profile, jobs, applications, saved jobs, and account access.
                  </p>
                  <div className="mt-4">
                    <Label className="text-red-700">
                      Type your profile name to confirm: <span className="font-semibold">{profileName}</span>
                    </Label>
                    <Input
                      value={deleteConfirmName}
                      onChange={(e) => setDeleteConfirmName(e.target.value)}
                      placeholder="Enter your profile name exactly"
                      className="mt-2 bg-white border-red-200 focus-visible:ring-red-300"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-100"
                      onClick={() => {
                        setShowDeletePanel(false);
                        setDeleteConfirmName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={!canDeleteAccount || deletingAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingAccount ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Delete My Account Permanently
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Photo */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={editData.profile_photo} />
                <AvatarFallback className="bg-[#3aafc4] text-white text-2xl">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                    Change Photo
                  </span>
                </Button>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>

            {/* Headline */}
            <div>
              <Label>Professional Headline</Label>
              <Input
                value={editData.headline || ''}
                onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                placeholder="e.g., Software Developer | Python Enthusiast"
                className="mt-1"
              />
            </div>

            {/* Bio */}
            <div>
              <Label>About</Label>
              <Textarea
                value={editData.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Location */}
            <div>
              <Label>Location</Label>
              <Input
                value={editData.location || ''}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                placeholder="e.g., Bangalore, India"
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <Label>Phone Number</Label>
              <Input
                value={editData.phone || ''}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <Label>LinkedIn URL</Label>
              <Input
                value={editData.linkedin_url || ''}
                onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1"
              />
            </div>

            {/* Candidate specific fields */}
            {!isEmployer && (
              <>
                {/* Education */}
                <div>
                  <Label>Education</Label>
                  <Input
                    value={editData.education || ''}
                    onChange={(e) => setEditData({ ...editData, education: e.target.value })}
                    placeholder="e.g., B.Tech in Computer Science from IIT Delhi"
                    className="mt-1"
                  />
                </div>

                {/* Skills */}
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button type="button" onClick={handleAddSkill} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editData.skills?.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {skill}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Resume */}
                <div>
                  <Label>Resume</Label>
                  <div className="mt-1">
                    {editData.resume_url ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Resume uploaded
                        </span>
                        <label className="text-[#3aafc4] text-sm cursor-pointer hover:underline">
                          Replace
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                        </label>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#3aafc4] transition-colors block">
                        {uploadingResume ? (
                          <Loader2 className="w-6 h-6 text-gray-400 mx-auto animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload resume</p>
                          </>
                        )}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Employer specific fields */}
            {isEmployer && (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={editData.company_name || ''}
                    onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                    placeholder="Company Name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Company Website</Label>
                  <Input
                    value={editData.company_website || ''}
                    onChange={(e) => setEditData({ ...editData, company_website: e.target.value })}
                    placeholder="https://company.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Company Size</Label>
                  <select
                    value={editData.company_size || ''}
                    onChange={(e) => setEditData({ ...editData, company_size: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white mt-1"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button className="flex-1 btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
