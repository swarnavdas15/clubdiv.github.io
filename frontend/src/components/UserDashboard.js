import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UserCircleIcon,
  PencilSquareIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PencilIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';


// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMMM d, yyyy');
};

const navigation = [
  { name: 'Dashboard', key: 'dashboard', icon: HomeIcon },
  { name: 'Profile', key: 'profile', icon: UserCircleIcon },
  { name: 'Blog Posts', key: 'blog', icon: PencilSquareIcon },
  { name: 'Statistics', key: 'stats', icon: ChartBarSquareIcon },
  { name: 'Settings', key: 'settings', icon: Cog6ToothIcon },
];

export default function UserDashboard() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    profileImage: '',
    college: '',
    branch: '',
    number: '',
  });
  const [updateStatus, setUpdateStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Blog form state
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    content: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');


  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        college: user.college || '',
        branch: user.branch || '',
        number: user.number || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus(null);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setUpdateStatus('success');
        setIsEditing(false);
      } else {
        setUpdateStatus('error');
      }
    } catch (error) {
      setUpdateStatus('error');
    }
  };

  const getStreakMessage = () => {
    if (!user?.loginStreak) return 'Start your login streak today!';

    if (user.loginStreak === 1) return '1 day streak! Keep it going!';
    if (user.loginStreak < 7) return `${user.loginStreak} day streak! Great job!`;
    if (user.loginStreak < 30) return `${user.loginStreak} day streak! Amazing consistency!`;
    return `${user.loginStreak} day streak! You're a champion!`;
  };

  const fetchUserPosts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/blog-posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserPosts(data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  }, [token]);

  useEffect(() => {
    if (activeSection === 'blog') {
      fetchUserPosts();
    }
  }, [activeSection, fetchUserPosts]);

  const handleBlogInputChange = (e) => {
    const { name, value } = e.target;
    setBlogFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const url = editingId ? `http://localhost:5000/api/blog-posts/${editingId}` : 'http://localhost:5000/api/blog-posts';
      const method = editingId ? 'PUT' : 'POST';
      let response;
      if (selectedImage && !editingId) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', blogFormData.title);
        formDataToSend.append('content', blogFormData.content);
        formDataToSend.append('image', selectedImage);
        response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        });
      } else {
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(blogFormData),
        });
      }
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setBlogFormData({ title: '', content: '' });
        setSelectedImage(null);
        setImagePreview(null);
        setEditingId(null);
        fetchUserPosts();
      } else {
        setMessage(data.message || 'Error submitting blog post');
      }
    } catch (error) {
      setMessage('Error submitting blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    if (post.status !== 'pending') {
      setMessage('You can only edit pending blog posts');
      return;
    }
    setBlogFormData({
      title: post.title,
      content: post.content,
    });
    setEditingId(post._id);
  };

  const handleCancel = () => {
    setBlogFormData({ title: '', content: '' });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingId(null);
    setMessage('');
  };

  // Delete account functions
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const response = await fetch('http://localhost:5000/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Account deleted successfully, logout user
        logout();
        navigate('/');
      } else {
        const data = await response.json();
        setDeleteError(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setDeleteError('An error occurred while deleting your account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <InformationCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Access Required</h2>
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-800 font-sans text-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Modern Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-600 bg-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header with User Info */}
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <span className="h-6 w-6 text-gray-100">
                <HomeIcon />
              </span>
              <h1 className="text-lg text-gray-100 font-bold">Dashboard</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`group flex w-full items-center rounded-lg px-4 py-3 text-left transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} />
                  <span className="ml-3 font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-600 p-4">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
                {user.profileImage ? (
                  <img
                    src={user.profileImage.startsWith('/') ? user.profileImage : `/Avatars/${user.profileImage}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-100">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                </p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="group flex w-full items-center justify-center rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:bg-gray-600"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:-translate-x-1" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        {/* Top bar for mobile */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            <button className="rounded-full bg-gray-700 p-2 text-gray-400 hover:bg-gray-600">
              <BellIcon className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
              {user.profileImage ? (
                <img
                  src={user.profileImage.startsWith('/') ? user.profileImage : `/Avatars/${user.profileImage}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user.username?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {activeSection === 'dashboard' && (
            <div>
              {/* Welcome Section with Avatar */}
              <div className="mb-6 sm:mb-8 rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-full bg-blue-500/20 text-base sm:text-lg font-semibold text-blue-400">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage.startsWith('/') ? user.profileImage : `/Avatars/${user.profileImage}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.username?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                      Welcome back, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}!
                    </h2>
                    <p className="text-sm sm:text-base text-gray-400">Here's a quick overview of your activity.</p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-100">Dashboard</h2>
              <p className="mt-1 text-gray-400">Track your progress and achievements.</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Stats Cards */}
                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-900/50 text-blue-400">
                      <ChartBarSquareIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Login Streak</span>
                  </div>
                  <p className="mt-4 text-2xl sm:text-3xl font-bold text-gray-100">{user.loginStreak || 0}</p>
                  <p className="mt-1 text-sm text-gray-400">{getStreakMessage()}</p>
                </div>

                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-green-900/50 text-green-400">
                      <CheckCircleIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Total Logins</span>
                  </div>
                  <p className="mt-4 text-2xl sm:text-3xl font-bold text-gray-100">{user.totalLogins || 0}</p>
                  <p className="mt-1 text-sm text-gray-400">All time</p>
                </div>

                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-900/50 text-purple-400">
                      <CalendarDaysIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Member Since</span>
                  </div>
                  <p className="mt-4 text-base sm:text-lg font-bold text-gray-100">{formatDate(user.createdAt)}</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>

                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-yellow-900/50 text-yellow-400">
                      <PencilSquareIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Blog Posts</span>
                  </div>
                  <p className="mt-4 text-2xl sm:text-3xl font-bold text-gray-100">{userPosts.length || 0}</p>
                  <p className="mt-1 text-sm text-gray-400">Total posts</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-12 rounded-xl bg-gray-800 p-6 shadow-sm ring-1 ring-gray-600">
                <h3 className="mb-4 text-lg font-semibold text-gray-100">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <button
                    onClick={() => setActiveSection('blog')}
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
                  >
                    <PencilSquareIcon className="mr-2 h-5 w-5" />
                    Write Blog Post
                  </button>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className="flex items-center justify-center rounded-lg bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-200 transition-colors duration-200 hover:bg-gray-600"
                  >
                    <UserCircleIcon className="mr-2 h-5 w-5" />
                    Update Profile
                  </button>
                  <button
                    onClick={() => setActiveSection('settings')}
                    className="flex items-center justify-center rounded-lg bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-200 transition-colors duration-200 hover:bg-gray-600"
                  >
                    <Cog6ToothIcon className="mr-2 h-5 w-5" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-100">Profile</h2>
              <p className="mt-1 text-gray-400">Manage your personal details.</p>
              <div className="mt-8 rounded-xl bg-gray-800 p-6 shadow-sm ring-1 ring-gray-600">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-100">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      isEditing ? 'bg-gray-700 text-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {updateStatus && (
                  <div
                    className={`mb-4 rounded-lg border p-4 text-sm ${
                      updateStatus === 'success'
                        ? 'border-green-600 bg-green-900/50 text-green-200'
                        : 'border-red-600 bg-red-900/50 text-red-200'
                    }`}
                  >
                    {updateStatus === 'success' ? (
                      <div className="flex items-center">
                        <CheckCircleIcon className="mr-2 h-5 w-5" />
                        Profile updated successfully!
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircleIcon className="mr-2 h-5 w-5" />
                        Failed to update profile. Please try again.
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full rounded-lg border px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full rounded-lg border px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      className={`w-full rounded-lg border px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-600'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">College</label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full rounded-lg border px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-300">Branch</label>
                      <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full rounded-lg border px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full rounded-lg border px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditing ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-600'
                      }`}
                    />
                  </div>

                  {/* Avatar Selection Section */}
                  <div className="border-t border-gray-600 pt-6">
                    <label className="mb-4 block text-sm font-medium text-gray-300">Choose Your Avatar</label>
                    <div className="flex justify-center space-x-6">
                      <div
                        onClick={() => isEditing && setFormData({ ...formData, profileImage: '/Avatars/icons8-boy-64.png' })}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                          formData.profileImage === '/Avatars/icons8-boy-64.png'
                            ? 'border-indigo-500 bg-indigo-500 bg-opacity-20'
                            : 'border-gray-600 hover:border-gray-500'
                        } ${!isEditing ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <img
                          src="/Avatars/icons8-boy-64.png"
                          alt="Boy Avatar"
                          className="w-16 h-16 rounded-full"
                        />
                      </div>
                      <div
                        onClick={() => isEditing && setFormData({ ...formData, profileImage: '/Avatars/icons8-student-64.png' })}
                        className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                          formData.profileImage === '/Avatars/icons8-student-64.png'
                            ? 'border-indigo-500 bg-indigo-500 bg-opacity-20'
                            : 'border-gray-600 hover:border-gray-500'
                        } ${!isEditing ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <img
                          src="/Avatars/icons8-student-64.png"
                          alt="Student Avatar"
                          className="w-16 h-16 rounded-full"
                        />
                      </div>
                    </div>
                    {!isEditing && (
                      <p className="mt-2 text-xs text-gray-400 text-center">Enable edit mode to change your avatar</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {activeSection === 'blog' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-100">Blog Posts</h2>
              <p className="mt-1 text-gray-400">Create, edit, and manage your blog content.</p>

              <div className="mt-8 rounded-xl bg-gray-800 p-6 shadow-sm ring-1 ring-gray-600">
                <h3 className="mb-4 text-xl font-semibold text-gray-100">
                  {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h3>
                {message && (
                  <div
                    className={`mb-4 rounded-lg border p-4 text-sm ${
                      message.includes('Error') || message.includes('only edit')
                        ? 'border-red-600 bg-red-900/50 text-red-200'
                        : 'border-green-600 bg-green-900/50 text-green-200'
                    }`}
                  >
                    {message.includes('Error') || message.includes('only edit') ? (
                      <div className="flex items-center">
                        <XCircleIcon className="mr-2 h-5 w-5" />
                        {message}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircleIcon className="mr-2 h-5 w-5" />
                        {message}
                      </div>
                    )}
                  </div>
                )}
                <form onSubmit={handleBlogSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={blogFormData.title}
                      onChange={handleBlogInputChange}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter blog title"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Content</label>
                    <textarea
                      name="content"
                      value={blogFormData.content}
                      onChange={handleBlogInputChange}
                      rows="6"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your blog post here..."
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">Featured Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={editingId}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                    />
                    {editingId && <p className="mt-1 text-xs text-gray-400">Image upload not available when editing</p>}
                    {imagePreview && (
                      <div className="relative mt-4 inline-block">
                        <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : editingId ? 'Update Post' : 'Publish Post'}
                    </button>
                  </div>
                </form>
              </div>

              {/* User's Blog Posts List */}
              <div className="mt-8">
                <h3 className="mb-4 text-xl font-semibold text-gray-100">Your Posts</h3>
                {userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <div key={post._id} className="rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                          <h4 className="flex-1 text-lg font-semibold text-gray-100">{post.title}</h4>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              post.status === 'pending'
                                ? 'bg-yellow-900/50 text-yellow-200'
                                : post.status === 'approved'
                                ? 'bg-green-900/50 text-green-200'
                                : 'bg-red-900/50 text-red-200'
                            }`}
                          >
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{post.content}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center">
                            <CalendarDaysIcon className="mr-1 h-4 w-4" />
                            {formatDate(post.createdAt)}
                          </span>
                          {post.status === 'pending' && (
                            <button onClick={() => handleEdit(post)} className="flex items-center text-blue-400 hover:underline">
                              <PencilIcon className="mr-1 h-4 w-4" />
                              Edit
                            </button>
                          )}
                        </div>
                        {post.reviewNote && (
                          <div className="mt-4 rounded-lg border border-blue-600 bg-blue-900/50 p-3 text-sm text-blue-200">
                            <div className="flex items-center">
                              <InformationCircleIcon className="mr-2 h-5 w-5" />
                              <span className="font-semibold">Reviewer's Note:</span>
                            </div>
                            <p className="mt-1">{post.reviewNote}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-600 bg-gray-800 p-12 text-center">
                    <PencilSquareIcon className="h-12 w-12 text-gray-500" />
                    <p className="mt-4 text-lg font-medium text-gray-300">No blog posts found</p>
                    <p className="mt-1 text-sm text-gray-400">Start writing your first post above!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'stats' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-100">Statistics</h2>
              <p className="mt-1 text-gray-400">Track your progress and achievements.</p>
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-900/50 text-blue-400">
                      <ChartBarSquareIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Login Streak</span>
                  </div>
                  <p className="mt-4 text-2xl sm:text-3xl font-bold text-gray-100">{user.loginStreak || 0}</p>
                  <p className="mt-1 text-sm text-gray-400">{getStreakMessage()}</p>
                </div>
                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-green-900/50 text-green-400">
                      <CheckCircleIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Total Logins</span>
                  </div>
                  <p className="mt-4 text-2xl sm:text-3xl font-bold text-gray-100">{user.totalLogins || 0}</p>
                  <p className="mt-1 text-sm text-gray-400">All time</p>
                </div>
                <div className="rounded-xl bg-gray-800 p-4 sm:p-6 shadow-sm ring-1 ring-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-900/50 text-purple-400">
                      <CalendarDaysIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm text-gray-400">Member Since</span>
                  </div>
                  <p className="mt-4 text-base sm:text-lg font-bold text-gray-100">{formatDate(user.createdAt)}</p>
                  <p className="mt-1 text-sm text-gray-400">
                    {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-100">Settings</h2>
              <p className="mt-1 text-gray-400">Manage your account preferences and security settings.</p>

              <div className="mt-8 rounded-xl bg-gray-800 p-6 shadow-sm ring-1 ring-gray-600">
                <h3 className="mb-4 text-xl font-semibold text-gray-100">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-600 p-4">
                    <div>
                      <h4 className="font-medium text-gray-100">Change Password</h4>
                      <p className="text-sm text-gray-400">Update your password for better security.</p>
                    </div>
                  <button
                    onClick={() => navigate('/change-password')}
                    className="rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-600"
                  >
                    Update
                  </button>
                  </div>

                </div>
              </div>

              <div className="mt-8 rounded-xl border border-red-600 bg-red-900/50 p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-semibold text-red-200">Danger Zone</h3>
                <p className="text-sm text-red-300">Permanently delete your account and all its data. This action is irreversible.</p>
                {deleteError && (
                  <div className="mt-4 rounded-lg border border-red-600 bg-red-900/50 p-3 text-sm text-red-200">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="mr-2 h-5 w-5" />
                      {deleteError}
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <button
                    onClick={confirmDeleteAccount}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-xl ring-1 ring-gray-600">
            <div className="mb-4 flex items-center">
              <ExclamationTriangleIcon className="mr-3 h-8 w-8 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-100">Delete Account</h3>
            </div>
            <p className="mb-6 text-sm text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone. All your data, including blog posts, profile information, and activity history will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors duration-200 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
