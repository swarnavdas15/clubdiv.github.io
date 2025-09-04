import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('registrationRequests');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [aboutData, setAboutData] = useState([]);
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogFilter, setBlogFilter] = useState('pending'); // 'pending' or 'all'
  const [projects, setProjects] = useState([]);
  const [memories, setMemories] = useState([]);
  const [passwordChangeRequests, setPasswordChangeRequests] = useState([]);
  const [passwordChangeFilter, setPasswordChangeFilter] = useState('pending'); // 'pending' or 'all'

  // Edit states
  const [editingAbout, setEditingAbout] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingMemory, setEditingMemory] = useState(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingMemory, setCreatingMemory] = useState(false);

  const [editAboutForm, setEditAboutForm] = useState({
    title: '',
    description: '',
    mission: ''
  });

  const [editEventForm, setEditEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    imageFile: null,
    eventType: '',
    targetAudience: '',
    duration: '',
    registrationInfo: '',
    whatToExpect: [],
    registrationRequired: true,
    registrationOpens: '',
    maxAttendees: '',
    organizerEmail: '',
    organizerPhone: '',
    tags: [],
    status: 'upcoming',
    featured: false,
    registrationTitle: '',
    registrationDescription: '',
    registrationLink: ''
  });

  const [editTeamForm, setEditTeamForm] = useState({
    name: '',
    role: '',
    email: '',
    linkedinUrl: '',
    githubUrl: '',
    image: '',
    bio: '',
    imageFile: null
  });

  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageFile: null,
    image: '',
    eventType: '',
    targetAudience: '',
    duration: '',
    registrationInfo: '',
    whatToExpect: [],
    registrationRequired: true,
    registrationOpens: '',
    maxAttendees: '',
    organizerEmail: '',
    organizerPhone: '',
    tags: [],
    status: 'upcoming',
    featured: false,
    registrationTitle: '',
    registrationDescription: '',
    registrationLink: ''
  });

  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    role: '',
    email: '',
    linkedinUrl: '',
    githubUrl: '',
    image: '',
    bio: '',
    imageFile: null
  });

  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    description: '',
    technologies: [],
    githubLink: '',
    liveDemo: '',
    image: '',
    imageFile: null,
    author: '',  // Added author field
    date: '' // Added date field
  });

  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    description: '',
    technologies: [],
    githubLink: '',
    liveDemo: '',
    image: '',
    imageFile: null,
    author: '',  // Added author field
    date: '' // Added date field
  });

  const [editMemoryForm, setEditMemoryForm] = useState({
    title: '',
    imageUrl: '',
    eventDate: '',
    imageFile: null
  });

  const [newMemoryForm, setNewMemoryForm] = useState({
    title: '',
    imageUrl: '',
    eventDate: '',
    imageFile: null
  });

  const loadUsers = useCallback(async () => {
    try {
      console.log('Loading users with token:', token ? 'Token present' : 'No token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Users loaded:', data.length, 'total users');
        console.log('Inactive users:', data.filter(user => !user.isActive).length);
        setUsers(data);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, [token]);

  const loadAbout = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/about');
      if (response.ok) {
        const data = await response.json();
        setAboutData(data);
      }
    } catch (error) {
      console.error('Error loading about:', error);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, [token]);

  const loadTeam = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    }
  }, []);

  const loadBlogs = useCallback(async () => {
    try {
      const endpoint = blogFilter === 'all' ? 'http://localhost:5000/api/admin/blog-posts' : 'http://localhost:5000/api/admin/blog-posts/pending';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }, [token, blogFilter]);

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  const loadMemories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memories');
      if (response.ok) {
        const data = await response.json();
        setMemories(data);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }, []);

  const loadPasswordChangeRequests = useCallback(async () => {
    try {
      const endpoint = passwordChangeFilter === 'pending'
        ? 'http://localhost:5000/api/admin/password-change-requests/pending'
        : 'http://localhost:5000/api/admin/password-change-requests';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPasswordChangeRequests(data);
      }
    } catch (error) {
      console.error('Error loading password change requests:', error);
    }
  }, [token, passwordChangeFilter]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'registrationRequests':
          await loadUsers();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'about':
          await loadAbout();
          break;
        case 'events':
          await loadEvents();
          break;
        case 'contacts':
          await loadContacts();
          break;
        case 'team':
          await loadTeam();
          break;
        case 'blogApproval':
          await loadBlogs();
          break;
        case 'projects':
          await loadProjects();
          break;
        case 'memories':
          await loadMemories();
          break;
        case 'passwordChangeRequests':
          await loadPasswordChangeRequests();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data');
    }
    setLoading(false);
  }, [activeTab, loadUsers, loadAbout, loadEvents, loadContacts, loadTeam, loadBlogs, loadProjects, loadMemories, loadPasswordChangeRequests]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user, activeTab, blogFilter, loadData]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Admin Dashboard</h2>
        <p className="text-center text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const updateAbout = async (aboutId, aboutData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/about/${aboutId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutData),
      });

      if (response.ok) {
        setMessage('About section updated successfully');
        loadAbout();
        setEditingAbout(null);
        setEditAboutForm({ title: '', description: '', mission: '' });
      } else {
        const errorData = await response.json();
        setMessage(`Error updating about: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating about:', error);
      setMessage('Error updating about section');
    }
  };

  const handleEditAbout = (about) => {
    setEditingAbout(about._id);
    setEditAboutForm({
      title: about.title,
      description: about.description,
      mission: about.mission || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingAbout(null);
    setEditAboutForm({ title: '', description: '', mission: '' });
  };

  const handleAboutFormChange = (e) => {
    setEditAboutForm({
      ...editAboutForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAboutSubmit = (e) => {
    e.preventDefault();
    if (editingAbout) {
      updateAbout(editingAbout, editAboutForm);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('date', eventData.date);
      formData.append('location', eventData.location);
      // Only append imageFile if uploaded, else imageUrl
      if (eventData.imageFile) {
        formData.append('image', eventData.imageFile);
      } else if (eventData.imageUrl) {
        formData.append('image', eventData.imageUrl);
      }
      formData.append('eventType', eventData.eventType || '');
      formData.append('targetAudience', eventData.targetAudience || '');
      formData.append('duration', eventData.duration || '');
      formData.append('registrationInfo', eventData.registrationInfo || '');
      formData.append('whatToExpect', JSON.stringify(eventData.whatToExpect || []));
      formData.append('registrationRequired', eventData.registrationRequired);
      formData.append('registrationOpens', eventData.registrationOpens || '');
      formData.append('maxAttendees', eventData.maxAttendees || '');
      formData.append('organizerEmail', eventData.organizerEmail || '');
      formData.append('organizerPhone', eventData.organizerPhone || '');
      formData.append('tags', JSON.stringify(eventData.tags || []));
      formData.append('status', eventData.status || 'upcoming');
      formData.append('featured', eventData.featured);
      formData.append('registrationTitle', eventData.registrationTitle || '');
      formData.append('registrationDescription', eventData.registrationDescription || '');
      formData.append('registrationLink', eventData.registrationLink || '');

      const response = await fetch('http://localhost:5000/api/admin/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do not set Content-Type header for multipart/form-data; browser will set it automatically
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Event created successfully');
        loadEvents();
        setCreatingEvent(false);
        setNewEventForm({
          title: '',
          description: '',
          date: '',
          location: '',
          imageUrl: '',
          imageFile: null,
          image: '',
          eventType: '',
          targetAudience: '',
          duration: '',
          registrationInfo: '',
          whatToExpect: [],
          registrationRequired: true,
          registrationOpens: '',
          maxAttendees: '',
          organizerEmail: '',
          organizerPhone: '',
          tags: [],
          status: 'upcoming',
          featured: false,
          registrationTitle: '',
          registrationDescription: '',
          registrationLink: ''
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error creating event: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage('Error creating event');
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('date', eventData.date);
      formData.append('location', eventData.location);
      // Only append imageUrl if no file is uploaded
      if (eventData.imageFile) {
        formData.append('image', eventData.imageFile);
      } else if (eventData.imageUrl) {
        formData.append('image', eventData.imageUrl);
      }
      formData.append('eventType', eventData.eventType || '');
      formData.append('targetAudience', eventData.targetAudience || '');
      formData.append('duration', eventData.duration || '');
      formData.append('registrationInfo', eventData.registrationInfo || '');
      formData.append('whatToExpect', JSON.stringify(eventData.whatToExpect || []));
      formData.append('registrationRequired', eventData.registrationRequired);
      formData.append('registrationOpens', eventData.registrationOpens || '');
      formData.append('maxAttendees', eventData.maxAttendees || '');
      formData.append('organizerEmail', eventData.organizerEmail || '');
      formData.append('organizerPhone', eventData.organizerPhone || '');
      formData.append('tags', JSON.stringify(eventData.tags || []));
      formData.append('status', eventData.status || 'upcoming');
      formData.append('featured', eventData.featured);
      formData.append('registrationTitle', eventData.registrationTitle || '');
      formData.append('registrationDescription', eventData.registrationDescription || '');
      formData.append('registrationLink', eventData.registrationLink || '');

      const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do not set Content-Type header for multipart/form-data; browser will set it automatically
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Event updated successfully');
        loadEvents();
        setEditingEvent(null);
        setEditEventForm({
          title: '',
          description: '',
          date: '',
          location: '',
          imageUrl: '',
          image: '',
          eventType: '',
          targetAudience: '',
          duration: '',
          registrationInfo: '',
          whatToExpect: [],
          registrationRequired: true,
          registrationOpens: '',
          maxAttendees: '',
          organizerEmail: '',
          organizerPhone: '',
          tags: [],
          status: 'upcoming',
          featured: false,
          registrationTitle: '',
          registrationDescription: '',
          registrationLink: ''
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error updating event: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setMessage('Error updating event');
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('Event deleted successfully');
          loadEvents();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        setMessage('Error deleting event');
      }
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event._id);
    setEditEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
      image: event.image || '',
      imageFile: null,
      eventType: event.eventType || '',
      targetAudience: event.targetAudience || '',
      duration: event.duration || '',
      registrationInfo: event.registrationInfo || '',
      whatToExpect: event.whatToExpect || [],
      registrationRequired: event.registrationRequired !== undefined ? event.registrationRequired : true,
      registrationOpens: event.registrationOpens ? new Date(event.registrationOpens).toISOString().split('T')[0] : '',
      maxAttendees: event.maxAttendees || '',
      organizerEmail: event.organizerEmail || '',
      organizerPhone: event.organizerPhone || '',
      tags: event.tags || [],
      status: event.status || 'upcoming',
      featured: event.featured || false,
      registrationTitle: event.registrationTitle || '',
      registrationDescription: event.registrationDescription || '',
      registrationLink: event.registrationLink || ''
    });
  };

  const handleCreateEvent = () => {
    setCreatingEvent(true);
    setNewEventForm({ title: '', description: '', date: '', location: '', imageUrl: '' });
  };

  const handleCancelEventEdit = () => {
    setEditingEvent(null);
    setEditEventForm({
      title: '',
      description: '',
      date: '',
      location: '',
      imageUrl: '',
      image: '',
      imageFile: null,
      eventType: '',
      targetAudience: '',
      duration: '',
      registrationInfo: '',
      whatToExpect: [],
      registrationRequired: true,
      registrationOpens: '',
      maxAttendees: '',
      organizerEmail: '',
      organizerPhone: '',
      tags: [],
      status: 'upcoming',
      featured: false,
      registrationTitle: '',
      registrationDescription: '',
      registrationLink: ''
    });
  };

  const handleCancelEventCreate = () => {
    setCreatingEvent(false);
    setNewEventForm({
      title: '',
      description: '',
      date: '',
      location: '',
      imageUrl: '',
      imageFile: null,
      image: '',
      eventType: '',
      targetAudience: '',
      duration: '',
      registrationInfo: '',
      whatToExpect: [],
      registrationRequired: true,
      registrationOpens: '',
      maxAttendees: '',
      organizerEmail: '',
      organizerPhone: '',
      tags: [],
      status: 'upcoming',
      featured: false,
      registrationTitle: '',
      registrationDescription: '',
      registrationLink: ''
    });
  };

  const handleEventFormChange = (e) => {
    setEditEventForm({
      ...editEventForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNewEventFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === 'imageFile') {
      setNewEventForm({
        ...newEventForm,
        imageFile: files[0]
      });
    } else if (name === 'whatToExpect') {
      // Handle array input for whatToExpect
      const arrayValue = value.split('\n').filter(item => item.trim() !== '');
      setNewEventForm({
        ...newEventForm,
        [name]: arrayValue
      });
    } else if (name === 'tags') {
      // Handle array input for tags
      const arrayValue = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      setNewEventForm({
        ...newEventForm,
        [name]: arrayValue
      });
    } else if (type === 'checkbox') {
      setNewEventForm({
        ...newEventForm,
        [name]: checked
      });
    } else {
      setNewEventForm({
        ...newEventForm,
        [name]: value
      });
    }
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent(editingEvent, editEventForm);
    }
  };

  const handleNewEventSubmit = (e) => {
    e.preventDefault();
    createEvent(newEventForm);
  };

  const createTeamMember = async (teamData) => {
    try {
      const formData = new FormData();
      formData.append('name', teamData.name);
      formData.append('role', teamData.role);
      formData.append('email', teamData.email);
      formData.append('linkedinUrl', teamData.linkedinUrl);
      formData.append('githubUrl', teamData.githubUrl);
      formData.append('bio', teamData.bio);
      if (teamData.imageFile) {
        formData.append('image', teamData.imageFile);
      } else if (teamData.image) {
        formData.append('image', teamData.image);
      }

      const response = await fetch('http://localhost:5000/api/admin/team', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do not set Content-Type header for multipart/form-data; browser will set it automatically
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Team member created successfully');
        loadTeam();
        setCreatingTeam(false);
        setNewTeamForm({ name: '', role: '', email: '', linkedinUrl: '', githubUrl: '', image: '', bio: '', imageFile: null });
      } else {
        const errorData = await response.json();
        setMessage(`Error creating team member: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating team member:', error);
      setMessage('Error creating team member');
    }
  };

  const updateTeamMember = async (teamId, teamData) => {
    try {
      const formData = new FormData();
      formData.append('name', teamData.name);
      formData.append('role', teamData.role);
      formData.append('email', teamData.email);
      formData.append('linkedinUrl', teamData.linkedinUrl);
      formData.append('githubUrl', teamData.githubUrl);
      formData.append('bio', teamData.bio);
      if (teamData.imageFile) {
        formData.append('image', teamData.imageFile);
      } else if (teamData.image) {
        formData.append('image', teamData.image);
      }

      const response = await fetch(`http://localhost:5000/api/admin/team/${teamId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do not set Content-Type header for multipart/form-data; browser will set it automatically
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Team member updated successfully');
        loadTeam();
        setEditingTeam(null);
        setEditTeamForm({ name: '', role: '', email: '', linkedinUrl: '', githubUrl: '', image: '', bio: '', imageFile: null });
      } else {
        const errorData = await response.json();
        setMessage(`Error updating team member: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      setMessage('Error updating team member');
    }
  };

  const deleteTeamMember = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/team/${teamId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('Team member deleted successfully');
          loadTeam();
        }
      } catch (error) {
        console.error('Error deleting team member:', error);
        setMessage('Error deleting team member');
      }
    }
  };

  const handleEditTeam = (member) => {
    setEditingTeam(member._id);
    setEditTeamForm({
      name: member.name,
      role: member.role || '',
      email: member.email || '',
      linkedinUrl: member.linkedinUrl || '',
      githubUrl: member.githubUrl || '',
      image: member.image || '',
      bio: member.bio || ''
    });
  };

  const handleCreateTeam = () => {
    setCreatingTeam(true);
    setNewTeamForm({ name: '', role: '', email: '', linkedinUrl: '', githubUrl: '', image: '', bio: '', imageFile: null });
  };

  const handleCancelTeamEdit = () => {
    setEditingTeam(null);
    setEditTeamForm({ name: '', role: '', email: '', linkedinUrl: '', githubUrl: '', image: '', bio: '' });
  };

  const handleCancelTeamCreate = () => {
    setCreatingTeam(false);
    setNewTeamForm({ name: '', role: '', email: '', linkedinUrl: '', githubUrl: '', image: '', bio: '', imageFile: null });
  };

  const handleTeamFormChange = (e) => {
    setEditTeamForm({
      ...editTeamForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNewTeamFormChange = (e) => {
    if (e.target.name === 'imageFile') {
      setNewTeamForm({
        ...newTeamForm,
        imageFile: e.target.files[0]
      });
    } else {
      setNewTeamForm({
        ...newTeamForm,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    if (editingTeam) {
      updateTeamMember(editingTeam, editTeamForm);
    }
  };

  const handleNewTeamSubmit = (e) => {
    e.preventDefault();
    createTeamMember(newTeamForm);
  };

  const createProject = async (projectData) => {
    try {
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('technologies', JSON.stringify(projectData.technologies || []));
      formData.append('githubLink', projectData.githubLink);
      formData.append('liveDemo', projectData.liveDemo);
      formData.append('author', projectData.author);
      formData.append('date', projectData.date);
      if (projectData.imageFile) {
        formData.append('image', projectData.imageFile);
      } else if (projectData.image) {
        formData.append('image', projectData.image);
      }

      const response = await fetch('http://localhost:5000/api/admin/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Project created successfully');
        loadProjects();
        setCreatingProject(false);
        setNewProjectForm({
          title: '',
          description: '',
          technologies: [],
          githubLink: '',
          liveDemo: '',
          image: '',
          imageFile: null,
          author: '' // <-- add this
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error creating project: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setMessage('Error creating project');
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('technologies', JSON.stringify(projectData.technologies || []));
      formData.append('githubLink', projectData.githubLink);
      formData.append('liveDemo', projectData.liveDemo);
      formData.append('author', projectData.author);
      if (projectData.imageFile) {
        formData.append('image', projectData.imageFile);
      } else if (projectData.image) {
        formData.append('image', projectData.image);
      }

      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Project updated successfully');
        loadProjects();
        setEditingProject(null);
        setEditProjectForm({
          title: '',
          description: '',
          technologies: [],
          githubLink: '',
          liveDemo: '',
          image: '',
          imageFile: null,
          author: ''  // Added author field
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error updating project: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setMessage('Error updating project');
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('Project deleted successfully');
          loadProjects();
        } else {
          const errorData = await response.json();
          setMessage(`Error deleting project: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        setMessage('Error deleting project');
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project._id);
    setEditProjectForm({
      title: project.title,
      description: project.description || '',
      technologies: project.technologies || [],
      githubLink: project.githubLink || '',
      liveDemo: project.liveDemo || '',
      image: project.image || '',
      imageFile: null,
      author: project.author || '',
      date: project.date ? new Date(project.date).toISOString().split('T')[0] : ''
    });
  };

  const handleCreateProject = () => {
    setCreatingProject(true);
    setNewProjectForm({
      title: '',
      description: '',
      technologies: [],
      githubLink: '',
      liveDemo: '',
      image: '',
      imageFile: null,
      author: '', // <-- add this
      date: '' // Added date field
    });
  };

  const handleCancelProjectEdit = () => {
    setEditingProject(null);
    setEditProjectForm({
      title: '',
      description: '',
      technologies: [],
      githubLink: '',
      liveDemo: '',
      image: '',
      imageFile: null,
      author: ''  // Added author field
    });
  };

  const handleCancelProjectCreate = () => {
    setCreatingProject(false);
    setNewProjectForm({
      title: '',
      description: '',
      technologies: [],
      githubLink: '',
      liveDemo: '',
      image: '',
      imageFile: null,
      author: ''  // Added author field
    });
  };

  const handleProjectFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setEditProjectForm({
        ...editProjectForm,
        imageFile: files[0]
      });
    } else if (name === 'technologies') {
      const arrayValue = value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
      setEditProjectForm({
        ...editProjectForm,
        [name]: arrayValue
      });
    } else if (name === 'date') {
      setEditProjectForm({
        ...editProjectForm,
        [name]: value
      });
    } else {
      setEditProjectForm({
        ...editProjectForm,
        [name]: value
      });
    }
  };

  const handleNewProjectFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setNewProjectForm({
        ...newProjectForm,
        imageFile: files[0]
      });
    } else if (name === 'technologies') {
      const arrayValue = value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
      setNewProjectForm({
        ...newProjectForm,
        [name]: arrayValue
      });
    } else if (name === 'date') {
      setNewProjectForm({
        ...newProjectForm,
        [name]: value
      });
    } else {
      setNewProjectForm({
        ...newProjectForm,
        [name]: value
      });
    }
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject, editProjectForm);
    }
  };

  const handleNewProjectSubmit = (e) => {
    e.preventDefault();
    createProject(newProjectForm);
  };


  const createMemory = async (memoryData) => {
    try {
      const formData = new FormData();
      formData.append('title', memoryData.title);
      formData.append('eventDate', memoryData.eventDate);
      if (memoryData.imageFile) {
        formData.append('image', memoryData.imageFile);
      } else if (memoryData.imageUrl) {
        formData.append('image', memoryData.imageUrl);
      }

      const response = await fetch('http://localhost:5000/api/admin/memories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Memory created successfully');
        loadMemories();
        setCreatingMemory(false);
        setNewMemoryForm({
          title: '',
          imageUrl: '',
          eventDate: '',
          imageFile: null
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error creating memory: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating memory:', error);
      setMessage('Error creating memory');
    }
  };

  const handleNewMemoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setNewMemoryForm({
        ...newMemoryForm,
        imageFile: files[0]
      });
    } else {
      setNewMemoryForm({
        ...newMemoryForm,
        [name]: value
      });
    }
  };

  const updateMemory = async (memoryId, memoryData) => {
    try {
      const formData = new FormData();
      formData.append('title', memoryData.title);
      formData.append('eventDate', memoryData.eventDate);
      if (memoryData.imageFile) {
        formData.append('image', memoryData.imageFile);
      } else if (memoryData.imageUrl) {
        formData.append('image', memoryData.imageUrl);
      }

      const response = await fetch(`http://localhost:5000/api/admin/memories/${memoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage('Memory updated successfully');
        loadMemories();
        setEditingMemory(null);
        setEditMemoryForm({
          title: '',
          imageUrl: '',
          eventDate: '',
          imageFile: null
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error updating memory: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      setMessage('Error updating memory');
    }
  };

  const deleteMemory = async (memoryId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/memories/${memoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('Memory deleted successfully');
          loadMemories();
        } else {
          const errorData = await response.json();
          setMessage(`Error deleting memory: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting memory:', error);
        setMessage('Error deleting memory');
      }
    }
  };

  const handleEditMemory = (memory) => {
    setEditingMemory(memory._id);
    setEditMemoryForm({
      title: memory.title,
      imageUrl: memory.imageUrl || '',
      eventDate: memory.eventDate ? new Date(memory.eventDate).toISOString().split('T')[0] : '',
      imageFile: null
    });
  };

  const handleCreateMemory = () => {
    setCreatingMemory(true);
    setNewMemoryForm({
      title: '',
      imageUrl: '',
      eventDate: '', // <-- add this
      imageFile: null
    });
  };

  const handleCancelMemoryEdit = () => {
    setEditingMemory(null);
    setEditMemoryForm({
      title: '',
      imageUrl: '',
      eventDate: '',
      imageFile: null
    });
  };

  const handleCancelMemoryCreate = () => {
    setCreatingMemory(false);
    setNewMemoryForm({
      title: '',
      imageUrl: '',
      eventDate: '', // <-- add this
      imageFile: null
    });
  };

  const handleMemoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setEditMemoryForm({
        ...editMemoryForm,
        imageFile: files[0]
      });
    } else {
      setEditMemoryForm({
        ...editMemoryForm,
        [name]: value
      });
    }
  };

  const handleMemorySubmit = (e) => {
    e.preventDefault();
    if (editingMemory) {
      updateMemory(editingMemory, editMemoryForm);
    }
  };

  const handleNewMemorySubmit = (e) => {
    e.preventDefault();
    createMemory(newMemoryForm);
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setMessage('Error updating user status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('User deleted successfully');
          loadUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessage('Error deleting user');
      }
    }
  };

  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact message?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/contacts/${contactId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('Contact message deleted successfully');
          loadContacts();
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        setMessage('Error deleting contact message');
      }
    }
  };

  const approveBlogPost = async (blogId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/blog-posts/${blogId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('Blog post approved successfully');
        loadBlogs();
      } else {
        const errorData = await response.json();
        setMessage(`Error approving blog post: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error approving blog post:', error);
      setMessage('Error approving blog post');
    }
  };

  const rejectBlogPost = async (blogId) => {
    if (window.confirm('Are you sure you want to reject this blog post?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/blog-posts/${blogId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setMessage('Blog post rejected successfully');
          loadBlogs();
        } else {
          const errorData = await response.json();
          setMessage(`Error rejecting blog post: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error rejecting blog post:', error);
        setMessage('Error rejecting blog post');
      }
    }
  };

  const deleteBlogPost = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/blog-posts/${blogId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('Blog post deleted successfully');
          loadBlogs();
        } else {
          const errorData = await response.json();
          setMessage(`Error deleting blog post: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting blog post:', error);
        setMessage('Error deleting blog post');
      }
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/password-change-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('Password change request approved successfully');
        loadPasswordChangeRequests();
      } else {
        const errorData = await response.json();
        setMessage(`Error approving request: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error approving password change request:', error);
      setMessage('Error approving password change request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this password change request?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/password-change-requests/${requestId}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setMessage('Password change request rejected successfully');
          loadPasswordChangeRequests();
        } else {
          const errorData = await response.json();
          setMessage(`Error rejecting request: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error rejecting password change request:', error);
        setMessage('Error rejecting password change request');
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Admin Dashboard
      </h2>

      {message && (
        <div className="bg-green-400 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          {message}
          <button
            onClick={() => setMessage('')}
            className="text-green-700 hover:text-green-900 text-xl"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-2">
        {[
          { key: 'registrationRequests', label: 'Registration Requests' },
          { key: 'users', label: 'Users' },
          { key: 'about', label: 'About' },
          { key: 'events', label: 'Events' },
          { key: 'projects', label: 'Projects' },
          { key: 'contacts', label: 'Contacts' },
          { key: 'team', label: 'Team' },
          { key: 'blogApproval', label: 'Blog Approval' },
          { key: 'memories', label: 'Memories' },
          { key: 'passwordChangeRequests', label: 'Password Change Requests' }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 min-h-96">
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <>
            {activeTab === 'registrationRequests' && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Pending Registration Requests
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users
                        .filter(user => !user.isActive)
                        .map(user => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateUserStatus(user._id, true)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {users.filter(user => !user.isActive).length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No pending registration requests
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Active Users Management
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user => user.isActive)
                        .map(user => (
                          <tr key={user._id}>
                            <td className="text-black font-bold">{user?.username || 'N/A'}</td>
                            <td className="text-black font-bold">{user?.email || 'N/A'}</td>
                            <td className="text-black font-bold">
                              {(user?.firstName || '') + ' ' + (user?.lastName || '')}
                              {!(user?.firstName || user?.lastName) ? 'N/A' : ''}
                            </td>
                            <td className="text-black font-bold">{user?.role || 'N/A'}</td>
                            <td>
                              <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => updateUserStatus(user._id, !user.isActive)}
                                className={user.isActive ? 'btn-warning' : 'btn-success'}
                                style={{ marginRight: '8px' }}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="btn-danger"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-management">
                <h3>About Section Management</h3>
                {aboutData.map(about => (
                  <div key={about._id} className="about-item">
                    <div className="about-item-header">
                      <h4>{about.title}</h4>
                      <button
                        onClick={() => handleEditAbout(about)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <p>{about.description}</p>
                    {about.mission && <p><strong>Mission:</strong> {about.mission}</p>}
    {about.image && <img src={about.image} alt={about.title} onError={(e) => { e.target.src = '/default-avatar.png'; }} />}
                  </div>
                ))}

                {/* Edit About Modal */}
                {editingAbout && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Edit About Section</h3>
                      <form onSubmit={handleAboutSubmit}>
                        <div className="form-group">
                          <label>Title:</label>
                          <input
                            type="text"
                            name="title"
                            value={editAboutForm.title}
                            onChange={handleAboutFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Description:</label>
                          <textarea
                            name="description"
                            value={editAboutForm.description}
                            onChange={handleAboutFormChange}
                            rows="4"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Mission:</label>
                          <textarea
                            name="mission"
                            value={editAboutForm.mission}
                            onChange={handleAboutFormChange}
                            rows="3"
                          />
                        </div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-success">
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="events-management">
                <h3>Events Management</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors" onClick={handleCreateEvent}>Create New Event</button>
                <div className="events-list">
                  {events.map(event => (
                    <div key={event._id} className="event-item">
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                      <p>Location: {event.location}</p>
    {event.image && <img src={event.image} alt={event.title} onError={(e) => { e.target.src = '/default-avatar.png'; }} />}
                      <div className="event-actions">
                        <button className="btn-primary" onClick={() => handleEditEvent(event)}>Edit</button>
                        <button className="btn-danger" onClick={() => deleteEvent(event._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Event Modal */}
                {editingEvent && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Edit Event</h3>
                      <form onSubmit={handleEventSubmit}>
                        <div className="form-group">
                          <label>Title:</label>
                          <input
                            type="text"
                            name="title"
                            value={editEventForm.title}
                            onChange={handleEventFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Description:</label>
                          <textarea
                            name="description"
                            value={editEventForm.description}
                            onChange={handleEventFormChange}
                            rows="4"
                          />
                        </div>
                        <div className="form-group">
                          <label>Date:</label>
                          <input
                            type="date"
                            name="date"
                            value={editEventForm.date}
                            onChange={handleEventFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Location:</label>
                          <input
                            type="text"
                            name="location"
                            value={editEventForm.location}
                            onChange={handleEventFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Image URL:</label>
                          <input
                            type="text"
                            name="imageUrl"
                            value={editEventForm.imageUrl}
                            onChange={handleEventFormChange}
                          />
                        </div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-success">Update</button>
                          <button type="button" className="btn-secondary" onClick={handleCancelEventEdit}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Create Event Modal */}
                {creatingEvent && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Create New Event</h3>
                      <form onSubmit={handleNewEventSubmit}>
                        <div className="form-group">
                          <label>Title:</label>
                          <input
                            type="text"
                            name="title"
                            value={newEventForm.title}
                            onChange={handleNewEventFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Description:</label>
                          <textarea
                            name="description"
                            value={newEventForm.description}
                            onChange={handleNewEventFormChange}
                            rows="4"
                          />
                        </div>
                        <div className="form-group">
                          <label>Event Information:</label>
                          <textarea
                            name="registrationInfo"
                            value={newEventForm.registrationInfo}
                            onChange={handleNewEventFormChange}
                            rows="4"
                          />
                        </div>
                        <div className="form-group">
                          <label>What to Expect:</label>
                          <textarea
                            name="whatToExpect"
                            value={Array.isArray(newEventForm.whatToExpect) && newEventForm.whatToExpect ? newEventForm.whatToExpect.join('\n') : ''}
                            onChange={handleNewEventFormChange}
                            rows="4"
                            placeholder="Enter each item on a new line"
                          />
                        </div>
                        <div className="form-group">
                          <label>Date:</label>
                          <input
                            type="date"
                            name="date"
                            value={newEventForm.date}
                            onChange={handleNewEventFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Location:</label>
                          <input
                            type="text"
                            name="location"
                            value={newEventForm.location}
                            onChange={handleNewEventFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Upload Image:</label>
                          <input
                            type="file"
                            name="imageFile"
                            accept="image/*"
                            onChange={handleNewEventFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Registration Link:</label>
                          <input
                            type="url"
                            name="registrationLink"
                            value={newEventForm.registrationLink}
                            onChange={handleNewEventFormChange}
                          />
                        </div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-success">Create</button>
                          <button type="button" className="btn-secondary" onClick={handleCancelEventCreate}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="projects-management">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Projects Management
                </h3>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors mb-4"
                  onClick={handleCreateProject}
                >
                  Create New Project
                </button>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technologies</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GitHub Link</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Demo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projects.map(project => (
                        <tr key={project._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{project.description}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {project.technologies && project.technologies.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map((tech, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.githubLink ? (
                              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                GitHub
                              </a>
                            ) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.liveDemo ? (
                              <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                                Live Demo
                              </a>
                            ) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProject(project)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProject(project._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {projects.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No projects found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit Project Modal */}
                {editingProject && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
                        <form onSubmit={handleProjectSubmit}>
                          <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              name="title"
                              value={editProjectForm.title}
                              onChange={handleProjectFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              name="description"
                              value={editProjectForm.description}
                              onChange={handleProjectFormChange}
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                            <input
                              type="text"
                              name="technologies"
                              value={editProjectForm.technologies.join(', ')}
                              onChange={handleProjectFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="React, Node.js, MongoDB"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
                            <input
                              type="url"
                              name="githubLink"
                              value={editProjectForm.githubLink}
                              onChange={handleProjectFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Live Demo Link</label>
                            <input
                              type="url"
                              name="liveDemo"
                              value={editProjectForm.liveDemo}
                              onChange={handleProjectFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                            <input
                              type="text"
                              name="author"
                              value={editProjectForm.author}
                              onChange={handleProjectFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                              type="text"
                              name="image"
                              value={editProjectForm.image}
                              onChange={handleProjectFormChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
                              <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              type="button"
                              onClick={handleCancelProjectEdit}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Update Project
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Project Modal */}
                {creatingProject && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
                        <form onSubmit={handleNewProjectSubmit}>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                name="title"
                                value={newProjectForm.title}
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                name="description"
                                value={newProjectForm.description}
                                onChange={handleNewProjectFormChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                              <input
                                type="text"
                                name="technologies"
                                value={newProjectForm.technologies.join(', ')}
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="React, Node.js, MongoDB"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
                              <input
                                type="url"
                                name="githubLink"
                                value={newProjectForm.githubLink}
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Live Demo Link</label>
                              <input
                                type="url"
                                name="liveDemo"
                                value={newProjectForm.liveDemo}
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                              <input
                                type="text"
                                name="author"
                                value={newProjectForm.author}
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                              <input
                                type="text"
                                name="image"
                                value={newProjectForm.image}
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                              <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleNewProjectFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              type="button"
                              onClick={handleCancelProjectCreate}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Create Project
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="contacts-management">
                <h3>Contact Messages</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(contact => (
                      <tr key={contact._id}>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td>{contact.message}</td>
                        <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => deleteContact(contact._id)}
                            className="btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="team-management">
                <h3>Team Management</h3>
                <button className="btn-primary" onClick={handleCreateTeam}>Add Team Member</button>
                <div className="team-list">
                  {teamMembers.map(member => (
                    <div key={member._id} className="team-item">
                      <h4>{member.name}</h4>
                      <p><strong>Role:</strong> {member.role}</p>
                      {member.email && <p><strong>Email:</strong> {member.email}</p>}
                      <p>{member.bio}</p>
    {member.image && <img src={member.image.startsWith('/uploads') ? `http://localhost:5000${member.image}` : member.image} alt={member.name} onError={(e) => { e.target.src = '/default-avatar.png'; }} />}
                      <div className="team-actions">
                        <button className="btn-primary" onClick={() => handleEditTeam(member)}>Edit</button>
                        <button className="btn-danger" onClick={() => deleteTeamMember(member._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Team Modal */}
                {editingTeam && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Edit Team Member</h3>
                      <form onSubmit={handleTeamSubmit}>
                        <div className="form-group">
                          <label>Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={editTeamForm.name}
                            onChange={handleTeamFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Role:</label>
                          <input
                            type="text"
                            name="role"
                            value={editTeamForm.role}
                            onChange={handleTeamFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Email:</label>
                          <input
                            type="email"
                            name="email"
                            value={editTeamForm.email}
                            onChange={handleTeamFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>LinkedIn URL:</label>
                          <input
                            type="url"
                            name="linkedinUrl"
                            value={editTeamForm.linkedinUrl}
                            onChange={handleTeamFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>GitHub URL:</label>
                          <input
                            type="url"
                            name="githubUrl"
                            value={editTeamForm.githubUrl}
                            onChange={handleTeamFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Image URL:</label>
                          <input
                            type="text"
                            name="image"
                            value={editTeamForm.image}
                            onChange={handleTeamFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>Bio:</label>
                          <textarea
                            name="bio"
                            value={editTeamForm.bio}
                            onChange={handleTeamFormChange}
                            rows="4"
                          />
                        </div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-success">Update</button>
                          <button type="button" className="btn-secondary" onClick={handleCancelTeamEdit}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Create Team Modal */}
                {creatingTeam && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Add New Team Member</h3>
                      <form onSubmit={handleNewTeamSubmit}>
                        <div className="form-group">
                          <label>Name:</label>
                          <input
                            type="text"
                            name="name"
                            value={newTeamForm.name}
                            onChange={handleNewTeamFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Role:</label>
                          <input
                            type="text"
                            name="role"
                            value={newTeamForm.role}
                            onChange={handleNewTeamFormChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Email:</label>
                          <input
                            type="email"
                            name="email"
                            value={newTeamForm.email}
                            onChange={handleNewTeamFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>LinkedIn URL:</label>
                          <input
                            type="url"
                            name="linkedinUrl"
                            value={newTeamForm.linkedinUrl}
                            onChange={handleNewTeamFormChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>GitHub URL:</label>
                          <input
                            type="url"
                            name="githubUrl"
                            value={newTeamForm.githubUrl}
                            onChange={handleNewTeamFormChange}
                          />
                        </div>
                      <div className="form-group">
                        <label>Upload Photo:</label>
                        <input
                          type="file"
                          name="imageFile"
                          accept="image/*"
                          onChange={handleNewTeamFormChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bio:</label>
                        <textarea
                          name="bio"
                          value={newTeamForm.bio}
                          onChange={handleNewTeamFormChange}
                          rows="4"
                        />
                      </div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-success">Create</button>
                          <button type="button" className="btn-secondary" onClick={handleCancelTeamCreate}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'blogApproval' && (
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Blog Post Approval
                </h3>
                <div className="mb-4 flex space-x-2">
                  <button
                    onClick={() => setBlogFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      blogFilter === 'pending'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Pending Posts
                  </button>
                  <button
                    onClick={() => setBlogFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      blogFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Posts
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {blogPosts
                        .filter(post => blogFilter === 'pending' ? post.status === 'pending' : true)
                        .map(post => (
                          <tr key={post._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author?.username || 'Unknown'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                post.status === 'approved' ? 'bg-green-100 text-green-800' :
                                post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {post.status === 'approved' ? 'Approved' :
                                 post.status === 'rejected' ? 'Rejected' :
                                 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => approveBlogPost(post._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectBlogPost(post._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => deleteBlogPost(post._id)}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {blogPosts.filter(post => blogFilter === 'pending' ? post.status === 'pending' : true).length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            {blogFilter === 'pending' ? 'No pending blog posts for approval' : 'No blog posts found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'memories' && (
              <div className="memories-management">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Memories Management
                </h3>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors mb-4"
                  onClick={handleCreateMemory}
                >
                  Create New Memory
                </button>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {memories.map(memory => (
                        <tr key={memory._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{memory.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {memory.eventDate ? new Date(memory.eventDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {memory.imageUrl && (
                              <img
                                src={`http://localhost:5000${memory.imageUrl}`}
                                alt={memory.title}
                                className="w-16 h-16 object-cover rounded-md"
                                onError={(e) => { e.target.src = '/default-avatar.png'; }}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditMemory(memory)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMemory(memory._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {memories.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                            No memories found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit Memory Modal */}
                {editingMemory && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Memory</h3>
                        <form onSubmit={handleMemorySubmit}>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                name="title"
                                value={editMemoryForm.title}
                                onChange={handleMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                              <input
                                type="date"
                                name="eventDate"
                                value={editMemoryForm.eventDate}
                                onChange={handleMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                              <input
                                type="text"
                                name="imageUrl"
                                value={editMemoryForm.imageUrl}
                                onChange={handleMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
                              <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              type="button"
                              onClick={handleCancelMemoryEdit}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Update Memory
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Memory Modal */}
                {creatingMemory && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Memory</h3>
                        <form onSubmit={handleNewMemorySubmit}>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                name="title"
                                value={newMemoryForm.title}
                                onChange={handleNewMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                              <input
                                type="date"
                                name="eventDate"
                                value={newMemoryForm.eventDate}
                                onChange={handleNewMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                              <input
                                type="text"
                                name="imageUrl"
                                value={newMemoryForm.imageUrl}
                                onChange={handleNewMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                              <input
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleNewMemoryFormChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              type="button"
                              onClick={handleCancelMemoryCreate}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Create Memory
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'passwordChangeRequests' && (
              <div className="password-change-requests-management">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Password Change Requests
                </h3>
                <div className="mb-4 flex space-x-2">
                  <button
                    onClick={() => setPasswordChangeFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      passwordChangeFilter === 'pending'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Pending Requests
                  </button>
                  <button
                    onClick={() => setPasswordChangeFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      passwordChangeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Requests
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Note</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {passwordChangeRequests.length > 0 ? (
                        passwordChangeRequests.map(request => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.userId?.username || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.userId?.email || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.reviewedBy ? `${request.reviewedBy.username} (${request.reviewedBy.firstName} ${request.reviewedBy.lastName})` : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{request.reviewNote || ''}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApproveRequest(request._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(request._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                            No password change requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

