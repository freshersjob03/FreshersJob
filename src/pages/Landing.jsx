import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Cog,
  GraduationCap,
  Landmark,
  LocateFixed,
  Monitor,
  Rocket,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const categoryItems = [
  { label: 'Remote', icon: LocateFixed, search: 'Remote' },
  { label: 'MNC', icon: Building2, search: 'MNC' },
  { label: 'Analytics', icon: UserRound, search: 'Analytics' },
  { label: 'Data Science', icon: Landmark, search: 'Data Science' },
  { label: 'Marketing', icon: Monitor, search: 'Marketing' },
  { label: 'Engineering', icon: Cog, search: 'Engineering' },
  { label: 'Internship', icon: CircleDollarSign, search: 'Internship' },
  { label: 'Fresher', icon: GraduationCap, search: 'Fresher' },
  { label: 'HR', icon: UserRound, search: 'HR' },
  { label: 'Supply Chain', icon: ShieldCheck, search: 'Supply Chain' },
  { label: 'Startup', icon: Rocket, search: 'Startup' },
];

const howItWorksSteps = [
  {
    number: '1',
    title: 'Create Your Profile',
    description:
      'Sign up and build your professional profile with your skills, education, and resume in minutes.',
  },
  {
    number: '2',
    title: 'Discover & Apply',
    description:
      'Browse thousands of fresher-friendly jobs and apply with a single click to the ones that excite you.',
  },
  {
    number: '3',
    title: 'Get Hired',
    description:
      'Connect with recruiters, attend interviews, and start your dream career journey.',
  },
];

const successStories = [
  {
    quote:
      'I was struggling to find a job after college. Within 3 weeks of joining FreshersJob, I got 5 interview calls and landed my first job at TCS!',
    name: 'Rahul Kumar',
    role: 'Software Developer @ TCS',
    initials: 'RK',
  },
  {
    quote:
      'The job recommendations were spot-on for my profile. The application process was super easy and I got a great package at Infosys!',
    name: 'Priya Sharma',
    role: 'UI Designer @ Infosys',
    initials: 'PS',
  },
  {
    quote:
      "As a 2024 graduate with no experience, I thought it'd be impossible to get hired. FreshersJob made it happen in just a month!",
    name: 'Arjun Mehta',
    role: 'Data Analyst @ Wipro',
    initials: 'AM',
  },
];

export default function Landing() {
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [locationText, setLocationText] = useState('');
  const [experience, setExperience] = useState('');
  const [accountType, setAccountType] = useState('employer');
  const { navigateToLogin, clerk, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.auth.isAuthenticated();
    } catch (e) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8fb]">
        <div className="w-8 h-8 border-4 border-[#2f66f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const notifyAlreadyLoggedIn = () => {
    toast({
      title: 'Already logged in',
      description: 'You are already logged in to your account. Switch account if you want to continue with another email.',
    });
  };

  const getRedirectUrl = () =>
    accountType === 'employer' ? createPageUrl('Onboarding') : createPageUrl('Feed');

  const openLoginFlow = () => {
    localStorage.setItem('freshersjob_pending_role', accountType);
    navigateToLogin(getRedirectUrl());
  };

  const openRegisterFlow = () => {
    localStorage.setItem('freshersjob_pending_role', accountType);
    const redirectUrl = getRedirectUrl();
    if (clerk?.openSignUp) {
      clerk.openSignUp({ redirectUrl });
      return;
    }
    navigateToLogin(redirectUrl);
  };

  const promptSwitchAccount = async (mode) => {
    notifyAlreadyLoggedIn();
    const confirmSwitch = window.confirm(
      'You are already logged in. Do you want to continue with another account? This will log out your current account.'
    );
    if (!confirmSwitch) return;
    if (clerk?.signOut) {
      await clerk.signOut();
    }
    if (mode === 'register') {
      openRegisterFlow();
      return;
    }
    openLoginFlow();
  };

  const isUserAuthenticated = async () => {
    try {
      return await api.auth.isAuthenticated();
    } catch (e) {
      return !!isAuthenticated;
    }
  };

  const handleLogin = async () => {
    if (await isUserAuthenticated()) {
      await promptSwitchAccount('login');
      return;
    }
    openLoginFlow();
  };

  const handleRegister = async () => {
    if (await isUserAuthenticated()) {
      await promptSwitchAccount('register');
      return;
    }
    openRegisterFlow();
  };

  const createJobsUrl = (baseSearch = '') => {
    const params = new URLSearchParams();
    const resolvedSearch = baseSearch || searchText.trim();
    const resolvedLocation = locationText.trim();
    if (resolvedSearch) params.set('search', resolvedSearch);
    if (resolvedLocation) params.set('location', resolvedLocation);
    if (experience) params.set('experience', experience);
    const query = params.toString();
    return `${createPageUrl('Jobs')}${query ? `?${query}` : ''}`;
  };

  const handleSearch = () => {
    window.location.href = createJobsUrl();
  };

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-[#4a4d55] font-['Inter',sans-serif]">
      <header className="bg-white border-b border-[#dbe7e7]">
        <div className="max-w-7xl mx-auto h-[74px] px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
              <span className="text-3xl leading-none font-extrabold tracking-tight">
                <span className="text-[#4f9497]">Freshers</span>
                <span className="text-[#6b6d74]">Job</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-10 text-base text-[#4a4d55]">
              <Link to={createPageUrl('Jobs')} className="hover:text-[#4f9497] transition-colors">Jobs</Link>
              <Link to={createPageUrl('Jobs') + '?search=Top Companies'} className="hover:text-[#4f9497] transition-colors">Companies</Link>
              <Link to={createPageUrl('Jobs') + '?search=Services'} className="hover:text-[#4f9497] transition-colors">Services</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="h-10 px-7 rounded-full border-[#4f9497] text-[#4f9497] text-base font-semibold hover:bg-[#e7f3f3]"
              onClick={handleLogin}
            >
              {accountType === 'employer' ? 'Login as Employer' : 'Login as Candidate'}
            </Button>
            <Button className="h-10 px-7 rounded-full bg-[#4f9497] hover:bg-[#447f82] text-white text-base font-semibold" onClick={handleRegister}>
              {accountType === 'employer' ? 'Register as Employer' : 'Register as Candidate'}
            </Button>
            <div className="hidden lg:block pl-4 border-l border-[#dbe7e7]">
              <select
                className="h-10 rounded-md border border-[#8ea4a6] px-4 text-base text-[#4a4d55] bg-white outline-none focus:border-[#4f9497]"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="employer">For employers</option>
                <option value="candidate">For candidates</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-20">
        <section className="text-center">
          <h1 className="text-[40px] md:text-[52px] leading-tight font-extrabold text-[#3f424a]">
            Find your dream job now
          </h1>
          <p className="mt-3 text-[20px] md:text-[32px] text-[#5c616d]">5 lakh+ jobs for you to explore</p>

          <div className="mt-10 mx-auto max-w-5xl bg-white rounded-full shadow-[0_10px_26px_rgba(79,148,151,0.10)] border border-[#e1ebeb] p-2.5">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center gap-3 px-5 py-3 md:flex-[1.45]">
                <Search className="w-6 h-6 text-[#7d8f93]" />
                <input
                  type="text"
                  placeholder="Enter skills / designations / companies"
                  className="w-full text-base text-[#4a4d55] placeholder:text-[#7d8f93] bg-transparent outline-none"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="hidden md:block w-px h-9 bg-[#e2ebeb]" />

              <button
                className="flex items-center justify-center gap-2 px-5 py-3 md:flex-1 text-base text-[#66777a]"
                onClick={() => setExperience((prev) => (prev ? '' : '0-2 Years'))}
              >
                <span>{experience || 'Select experience'}</span>
                <ChevronDown className="w-5 h-5" />
              </button>

              <div className="hidden md:block w-px h-9 bg-[#e2ebeb]" />

              <input
                type="text"
                placeholder="Enter location"
                className="px-5 py-3 md:flex-1 text-base text-[#4a4d55] placeholder:text-[#7d8f93] bg-transparent outline-none"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />

              <Button className="h-[48px] px-10 rounded-full bg-[#4f9497] hover:bg-[#447f82] text-base font-semibold" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="text-[40px] font-extrabold text-[#3f424a]">Top companies hiring now</h2>
        </section>

        <section className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {categoryItems.map(({ label, icon: Icon, search }) => (
              <a
                key={label}
                href={createJobsUrl(search)}
                className="h-[68px] px-4 bg-white border border-[#dde8e8] rounded-2xl flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <span className="w-10 h-10 rounded-full bg-[#edf5f5] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#4f9497]" />
                </span>
                <span className="mx-3 flex-1 text-left text-[15px] font-semibold text-[#3f424a] truncate">{label}</span>
                <ChevronRight className="w-5 h-5 text-[#7d8f93]" />
              </a>
            ))}
          </div>
        </section>

        <section className="mt-24 text-center">
          <h2 className="text-3xl md:text-[34px] font-extrabold text-[#3f424a]">How FreshersJob Works</h2>
          <p className="mt-3 text-lg md:text-xl text-[#5c616d]">Get hired in 3 simple steps</p>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10">
            {howItWorksSteps.map((step) => (
              <div key={step.number} className="px-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#2f9bb2] text-white text-3xl font-extrabold flex items-center justify-center shadow-[0_10px_24px_rgba(47,155,178,0.25)]">
                  {step.number}
                </div>
                <h3 className="mt-6 text-xl md:text-2xl font-extrabold text-[#3f424a]">{step.title}</h3>
                <p className="mt-3 text-base text-[#5c616d] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 text-center">
          <h2 className="text-[40px] font-extrabold text-[#3f424a]">Success Stories</h2>
          <p className="mt-3 text-lg md:text-xl text-[#5c616d]">Freshers who found their dream jobs through us</p>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {successStories.map((story) => (
              <article
                key={story.name}
                className="bg-white rounded-3xl border border-[#dde8e8] p-7 text-left shadow-sm"
              >
                <p className="text-[#f59e0b] text-xl">★★★★★</p>
                <p className="mt-4 text-base text-[#4a4d55] leading-relaxed italic">"{story.quote}"</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#2f9bb2] text-white text-sm font-bold flex items-center justify-center">
                    {story.initials}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#3f424a]">{story.name}</p>
                    <p className="text-sm text-[#5c616d]">{story.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className="mt-20 bg-[#2f9bb2] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
          <h2 className="text-[40px] font-extrabold">Ready to Launch Your Career?</h2>
          <p className="mt-4 text-lg md:text-xl text-[#e1f5f8] max-w-3xl mx-auto">
            Join over 2.5 million freshers who found their dream jobs on FreshersJob. It is completely free to get started.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="h-12 px-10 rounded-full bg-white text-[#117d98] hover:bg-[#eaf8fb] text-base font-semibold"
              onClick={handleRegister}
            >
              Create Free Account
            </Button>
            <Button
              variant="outline"
              className="h-12 px-10 rounded-full bg-transparent border-white/60 text-white hover:bg-white/15 hover:text-white"
              onClick={handleLogin}
            >
              Post a Job
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#13293a] text-[#8aa6bc]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p className="text-3xl font-extrabold tracking-tight">
              <span className="text-[#2f9bb2]">Freshers</span>
              <span className="text-[#8aa6bc]">Job</span>
            </p>
            <p className="mt-4 text-base leading-relaxed">
              India&apos;s most trusted job platform for freshers and early-career professionals. Find your dream job today.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li><a href={createPageUrl('Jobs')} className="hover:text-white">Browse Jobs</a></li>
              <li><a href={createPageUrl('Profile')} className="hover:text-white">Upload Resume</a></li>
              <li><a href={createPageUrl('Jobs')} className="hover:text-white">Career Advice</a></li>
              <li><a href={createPageUrl('SavedJobs')} className="hover:text-white">Saved Jobs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li><a href={createPageUrl('PostJob')} className="hover:text-white">Post a Job</a></li>
              <li><a href={createPageUrl('ManageJobs')} className="hover:text-white">Manage Jobs</a></li>
              <li><a href={createPageUrl('Applications')} className="hover:text-white">Applications</a></li>
              <li><a href={createPageUrl('Landing')} className="hover:text-white">Recruiter Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href={createPageUrl('Landing')} className="hover:text-white">About Us</a></li>
              <li><a href={createPageUrl('Landing')} className="hover:text-white">Contact</a></li>
              <li><a href={createPageUrl('Landing')} className="hover:text-white">Privacy Policy</a></li>
              <li><a href={createPageUrl('Landing')} className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2a4356]">
          <p className="max-w-7xl mx-auto px-4 md:px-8 py-5 text-center text-sm">
                FreshersJob - Find Your Dream Job - Made in India <br/>
                -------- 😎😎 Made by Priyanshu Rathore 😎😎 --------
          </p>
        </div>
      </footer>
    </div>
  );
}
