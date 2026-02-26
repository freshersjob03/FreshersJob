/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob';
import ManageJobs from './pages/ManageJobs';
import Applications from './pages/Applications';
import ForgotPassword from './pages/ForgotPassword';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Onboarding": Onboarding,
    "Feed": Feed,
    "Jobs": Jobs,
    "JobDetails": JobDetails,
    "SavedJobs": SavedJobs,
    "MyApplications": MyApplications,
    "Profile": Profile,
    "PostJob": PostJob,
    "ManageJobs": ManageJobs,
    "Applications": Applications,
    "ForgotPassword": ForgotPassword,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};