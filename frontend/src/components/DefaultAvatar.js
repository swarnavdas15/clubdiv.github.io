import React from 'react';

const DefaultAvatar = ({ className = "w-10 h-10" }) => {
  return (
    <svg className={className} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#e5e7eb" />
      <circle cx="20" cy="15" r="6" fill="#9ca3af" />
      <path d="M20 25c-5 0-10 2-10 6v3h20v-3c0-4-5-6-10-6z" fill="#9ca3af" />
    </svg>
  );
};

export default DefaultAvatar;
