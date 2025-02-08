import React from 'react';
import { CATEGORIES } from '../constants';

export default function CategoryIcon({ category, className = "w-5 h-5" }) {
  const icons = {
    music: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    sports: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    theater: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    festivals: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.5458C20.4771 15.5458 19.9542 15.6972 19.5 16C18.5917 16.6056 17.4083 16.6056 16.5 16C15.5917 15.3944 14.4083 15.3944 13.5 16C12.5917 16.6056 11.4083 16.6056 10.5 16C9.59167 15.3944 8.40833 15.3944 7.5 16C6.59167 16.6056 5.40833 16.6056 4.5 16C4.04584 15.6972 3.52292 15.5458 3 15.5458M21 11.5458C20.4771 11.5458 19.9542 11.6972 19.5 12C18.5917 12.6056 17.4083 12.6056 16.5 12C15.5917 11.3944 14.4083 11.3944 13.5 12C12.5917 12.6056 11.4083 12.6056 10.5 12C9.59167 11.3944 8.40833 11.3944 7.5 12C6.59167 12.6056 5.40833 12.6056 4.5 12C4.04584 11.6972 3.52292 11.5458 3 11.5458M21 7.54578C20.4771 7.54578 19.9542 7.69721 19.5 8C18.5917 8.60557 17.4083 8.60557 16.5 8C15.5917 7.39443 14.4083 7.39443 13.5 8C12.5917 8.60557 11.4083 8.60557 10.5 8C9.59167 7.39443 8.40833 7.39443 7.5 8C6.59167 8.60557 5.40833 8.60557 4.5 8C4.04584 7.69721 3.52292 7.54578 3 7.54578" />
      </svg>
    ),
    other: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25278V4M12 20V17.7472M17.7472 12H20M4 12H6.25278M15.8588 15.8588L17.4874 17.4874M6.51256 6.51256L8.14116 8.14116M15.8588 8.14116L17.4874 6.51256M6.51256 17.4874L8.14116 15.8588" />
      </svg>
    )
  };

  return icons[category] || icons[CATEGORIES.OTHER];
} 