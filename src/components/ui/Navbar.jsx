import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Home, 
  Briefcase, 
  Bookmark, 
  User, 
  LogOut, 
  PlusCircle,
  FileText,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar({ user, profile, onLogout, isAuthenticated }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { navigateToLogin, clerk, isAuthenticated: authIsAuthenticated } = useAuth();
  const { toast } = useToast();
  const currentlyAuthenticated = Boolean(authIsAuthenticated || isAuthenticated);

  const isEmployer = profile?.role === 'employer';

  const promptSwitchAccount = async (mode) => {
    toast({
      title: 'Already logged in',
      description: 'You are already logged in to your account. Switch account if you want to continue with another email.',
    });

    const confirmSwitch = window.confirm(
      'You are already logged in. Continue with another account? This will log out your current account.'
    );
    if (!confirmSwitch) return;

    if (clerk?.signOut) {
      await clerk.signOut();
    }

    if (mode === 'register' && clerk?.openSignUp) {
      clerk.openSignUp({ redirectUrl: createPageUrl('Feed') });
      return;
    }
    navigateToLogin(createPageUrl('Feed'));
  };

  const handleLogin = async () => {
    if (currentlyAuthenticated) {
      await promptSwitchAccount('login');
      return;
    }
    navigateToLogin(createPageUrl('Feed'));
  };

  const handleRegister = async () => {
    if (currentlyAuthenticated) {
      await promptSwitchAccount('register');
      return;
    }
    if (clerk?.openSignUp) {
      clerk.openSignUp({ redirectUrl: createPageUrl('Feed') });
      return;
    }
    navigateToLogin(createPageUrl('Feed'));
  };

  const NavLinks = () => (
    <>
      <Link 
        to={createPageUrl('Feed')}
        className="flex items-center gap-2 px-3 py-2 text-[#4a4d55] hover:text-[#4f9497] font-medium transition-colors"
      >
        <Home className="w-5 h-5" />
        <span className="hidden lg:inline">Home</span>
      </Link>
      <Link 
        to={createPageUrl('Jobs')}
        className="flex items-center gap-2 px-3 py-2 text-[#4a4d55] hover:text-[#4f9497] font-medium transition-colors"
      >
        <Briefcase className="w-5 h-5" />
        <span className="hidden lg:inline">Jobs</span>
      </Link>
      {!isEmployer && (
        <>
          <Link 
            to={createPageUrl('SavedJobs')}
            className="flex items-center gap-2 px-3 py-2 text-[#4a4d55] hover:text-[#4f9497] font-medium transition-colors"
          >
            <Bookmark className="w-5 h-5" />
            <span className="hidden lg:inline">Saved</span>
          </Link>
          <Link 
            to={createPageUrl('MyApplications')}
            className="flex items-center gap-2 px-3 py-2 text-[#4a4d55] hover:text-[#4f9497] font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="hidden lg:inline">Applications</span>
          </Link>
        </>
      )}
      {isEmployer && (
        <>
          <Link 
            to={createPageUrl('PostJob')}
            className="flex items-center gap-2 px-3 py-2 text-[#4a4d55] hover:text-[#4f9497] font-medium transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="hidden lg:inline">Post Job</span>
          </Link>
          <Link 
            to={createPageUrl('ManageJobs')}
            className="flex items-center gap-2 px-3 py-2 text-[#4a4d55] hover:text-[#4f9497] font-medium transition-colors"
          >
            <Briefcase className="w-5 h-5" />
            <span className="hidden lg:inline">My Jobs</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#dbe7e7] z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-[74px]">
          {/* Logo */}
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
            <span className="text-3xl leading-none font-extrabold tracking-tight">
              <span className="text-[#4f9497]">Freshers</span>
              <span className="text-[#6b6d74]">Job</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              <NavLinks />
            </div>
          )}

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-[#4f9497]/20">
                        <AvatarImage src={profile?.profile_photo} />
                        <AvatarFallback className="bg-[#4f9497]/10 text-[#4f9497] font-bold">
                          {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-10 px-7 rounded-full border-[#4f9497] text-[#4f9497] text-base font-semibold hover:bg-[#e7f3f3]"
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button
                  className="h-10 px-7 rounded-full bg-[#4f9497] hover:bg-[#447f82] text-white text-base font-semibold"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#dbe7e7]">
            <div className="flex flex-col space-y-1">
              <NavLinks />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
