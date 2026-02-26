import React from 'react';
import { MapPin, Clock, IndianRupee, Briefcase, Bookmark, BookmarkCheck, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function JobCard({ job, onSave, onApply, isSaved, hasApplied, onClick }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${min} - ${max} LPA`;
    if (min) return `₹${min}+ LPA`;
    return `Up to ₹${max} LPA`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-700',
      'part-time': 'bg-blue-100 text-blue-700',
      'internship': 'bg-purple-100 text-purple-700',
      'contract': 'bg-orange-100 text-orange-700',
      'remote': 'bg-teal-100 text-teal-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card 
      className="p-5 card-hover cursor-pointer border border-gray-100 bg-white hover:border-[#3aafc4]/30"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {job.company_logo ? (
            <img 
              src={job.company_logo} 
              alt={job.company_name}
              className="w-14 h-14 rounded-xl object-cover border border-gray-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3aafc4]/20 to-[#1a7a94]/20 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#3aafc4]" />
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight hover:text-[#3aafc4] transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600 font-medium mt-0.5">{job.company_name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 hover:bg-[#3aafc4]/10"
              onClick={(e) => {
                e.stopPropagation();
                onSave && onSave(job);
              }}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-[#3aafc4]" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              {job.experience_level}
            </span>
            <span className="flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4" />
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={`${getJobTypeColor(job.job_type)} border-0 font-medium`}>
              {job.job_type}
            </Badge>
            {job.skills?.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
                {skill}
              </Badge>
            ))}
            {job.skills?.length > 3 && (
              <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-500">
                +{job.skills.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Posted recently
            </span>
            {onApply && (
              <Button
                size="sm"
                className={`btn-primary ${hasApplied ? 'bg-green-500 hover:bg-green-600' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasApplied) onApply(job);
                }}
                disabled={hasApplied}
              >
                {hasApplied ? 'Applied' : 'Quick Apply'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}