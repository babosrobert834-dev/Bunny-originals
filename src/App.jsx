import React, { useState, useEffect } from 'react';

export default function App() {
  const [examStatus, setExamStatus] = useState('CLOSED');
  const [activePage, setActivePage] = useState('Role opening');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Training states
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [activeTrainingChannel, setActiveTrainingChannel] = useState('overview');
  const [trainingStep, setTrainingStep] = useState(0);
  const [completedTrainings, setCompletedTrainings] = useState(() => {
    const saved = localStorage.getItem('completed_trainings');
    return saved ? JSON.parse(saved) : {};
  });

  const [isExamActive, setIsExamActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [cheated, setCheated] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [inputName, setInputName] = useState('');

  const [discordUser, setDiscordUser] = useState(() => {
    return localStorage.getItem('discord_user') || '';
  });

  const [userActivityLog, setUserActivityLog] = useState(() => {
    const saved = localStorage.getItem('user_activity_log');
    return saved ? JSON.parse(saved) : {
      'ufiuiuffudfuiuduf.322': { lastActive: new Date().toLocaleString(), online: true },
      'bunnyoriginals': { lastActive: new Date(Date.now() - 3600000).toLocaleString(), online: false }
    };
  });

  const [userRoles, setUserRoles] = useState(() => {
    const saved = localStorage.getItem('user_assigned_roles');
    return saved ? JSON.parse(saved) : {
      'ufiuiuffudfuiuduf.322': 'Admin',
      'bunnyoriginals': 'Admin',
      'snowfox_alex': 'Admin'
    };
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('site_announcements');
    return saved ? JSON.parse(saved) : ['Welcome to Bunny Originals Exam & Role Center!'];
  });

  const [roleOpenings, setRoleOpenings] = useState(() => {
    const saved = localStorage.getItem('site_role_openings');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '@Content Associate', videoReq: 'Support the content team with asset gathering and initial reviews.', time: 'Closes in 3 Days', status: 'Open' },
      { id: 2, title: '@Content Producer', videoReq: 'Produce and oversee media segments and collaborate with editing crews.', time: 'Closes in 5 Days', status: 'Open' },
      { id: 3, title: '@Content Lead', videoReq: 'Lead content strategies, manage workflows, and oversee team output.', time: 'Closes in 7 Days', status: 'Open' }
    ];
  });

  const [roleApplications, setRoleApplications] = useState(() => {
    const saved = localStorage.getItem('role_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [examSubmissionsLog, setExamSubmissionsLog] = useState(() => {
    const saved = localStorage.getItem('exam_submissions_log');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);
  const [chosenRoleDropdownValue, setChosenRoleDropdownValue] = useState('');
  const [selectedAdminRoleFilter, setSelectedAdminRoleFilter] = useState('ALL');

  // Multi-role creator list for admin panel (+ button state)
  const [draftRoles, setDraftRoles] = useState([
    { title: '', videoReq: '', time: '' }
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState('');

  useEffect(() => {
    if (discordUser) {
      const updated = {
        ...userActivityLog,
        [discordUser]: { lastActive: new Date().toLocaleString(), online: true }
      };
      setUserActivityLog(updated);
      localStorage.setItem('user_activity_log', JSON.stringify(updated));
    }
  }, [discordUser]);

  const trainingChannels = [
    {
      id: 'overview',
      name: '# 📢 content-announcements',
      title: 'Become a Part of the Filming Crew',
      slides: [
        "Want to be featured in our upcoming videos and help create awesome content for the channel? We are always looking for reliable, active actors and participants to join the official filming crew! Here is everything you need to know.",
        "Activity Requirement: Anyone is welcome to join, but staying on the crew requires dedication. You must remain active and participate in at least one video shoot per month to keep your filming role. Make sure your notifications are ON for filming announcements!"
      ]
    },
    {
      id: 'rules',
      name: '# 📜 content-review & rules',
      title: 'Crew Rules & Expectations',
      slides: [
        "Follow Directions: During a shoot, you must listen to instructions, follow the script/roleplay guidelines, and avoid trolling or disrupting the recording. Failure to cooperate will result in immediate removal from the crew.",
        "Claiming Roles: Please do not say generic phrases like \"i drive express\". You must properly claim an official role.",
        "No Unnecessary Pings: DO NOT ping me or Bunny about role openings. Anyone who pings regarding open roles will receive a warning."
      ]
    },
    {
      id: 'perks',
      name: '# ✨ content-team-chat',
      title: 'Perks & Channel Layout',
      slides: [
        "Perks of Being in the Crew:\n• Exclusive Discord role.\n• Chance to be featured on YouTube.\n• Early sneak peeks at upcoming projects."
      ]
    }
  ];

  const questions = [
    { id: 1, text: "What is the primary role of the Filming Crew?", options: ["Editing videos", "Recording high-quality gameplay and scenes", "Managing chat", "Designing logos"], correct: 1 },
    { id: 2, text: "Are you allowed to leak unreleased Bunny Originals content?", options: ["Yes, anytime", "Only to friends", "Never under any circumstances", "Only on weekends"], correct: 2 },
    { id: 3, text: "Who should you notify if you encounter technical recording issues?", options: ["Lead Editor", "Director / Admin", "No one", "Random viewers"], correct: 1 },
    { id: 4, text: "What video resolution is minimum requirement for final submissions?", options: ["480p", "720p", "1080p", "144p"], correct: 2 },
    { id: 5, text: "Should game audio and voice chat be on separate tracks if possible?", options: ["Yes, for clean editing", "No, it doesn't matter", "Never", "Only if requested"], correct: 0 }
  ];

  useEffect(() => {
    if (!isExamActive || examSubmitted) return;

    const triggerCheatingPenalty = () => {
      setCheated(true);
      setExamSubmitted(true);
      const penaltyRecord = {
        user: discordUser || 'Anonymous',
        score: '0% (Disqualified - Switched Tabs / Left Window)',
        date: new Date().toLocaleString(),
        status: 'Disqualified'
      };
      const updatedLogs = [penaltyRecord, ...examSubmissionsLog];
      setExamSubmissionsLog(updatedLogs);
      localStorage.setItem('exam_submissions_log', JSON.stringify(updatedLogs));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) triggerCheatingPenalty();
    };

    const handleBlur = () => {
      triggerCheatingPenalty();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isExamActive, examSubmitted, discordUser, examSubmissionsLog]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (discordUser) {
      alert("Someone is already logged in! Please logout first before switching accounts.");
      return;
    }
    if (inputName.trim() !== '') {
      const cleanName = inputName.trim();
      localStorage.setItem('discord_user', cleanName);
      setDiscordUser(cleanName);
      setIsLoggingIn(false);
      setInputName('');
    }
  };

  const handleLogout = () => {
    if (discordUser) {
      const updated = {
        ...userActivityLog,
        [discordUser]: { lastActive: new Date().toLocaleString(), online: false }
      };
      setUserActivityLog(updated);
      localStorage.setItem('user_activity_log', JSON.stringify(updated));
    }
    localStorage.removeItem('discord_user');
    setDiscordUser('');
  };

  const currentUserRole = userRoles[discordUser] || '';
  const isAdminOrLead = discordUser === 'Admin' || discordUser === 'ufiuiuffudfuiuduf.322' || discordUser === 'bunnyoriginals' || discordUser === 'snowfox_alex' || currentUserRole === 'Admin' || currentUserRole === '@Content Lead';

  const isTrainingCompleted = discordUser && completedTrainings[discordUser] === true;

  const handleFinishAllTraining = () => {
    if (!discordUser) {
      alert("Please log in with Discord first!");
      return;
    }
    const updated = { ...completedTrainings, [discordUser]: true };
    setCompletedTrainings(updated);
    localStorage.setItem('completed_trainings', JSON.stringify(updated));
    alert("Training completed successfully! You can now access the Exams Center.");
    setTrainingStarted(false);
  };

  const handleApplyRole = (roleTitleToApply) => {
    if (!discordUser) {
      alert("Please log in with Discord first!");
      return;
    }
    const targetRole = roleOpenings.find(r => r.title === roleTitleToApply) || roleOpenings[0];
    const existing = roleApplications.find(app => app.user === discordUser && app.roleId === targetRole.id);
    if (existing) {
      alert("You have already applied for this role!");
      return;
    }
    const newApp = { id: Date.now(), user: discordUser, roleId: targetRole.id, roleTitle: targetRole.title, status: 'Pending' };
    const updated = [newApp, ...roleApplications];
    setRoleApplications(updated);
    localStorage.setItem('role_applications', JSON.stringify(updated));
    alert(`Successfully applied for ${targetRole.title}!`);
    setSelectedRoleDetail(null);
  };

  const handleAcceptApplication = (app) => {
    const updatedApps = roleApplications.map(a => a.id === app.id ? { ...a, status: 'Accepted' } : a);
    setRoleApplications(updatedApps);
    localStorage.setItem('role_applications', JSON.stringify(updatedApps));

    const updatedRoles = { ...userRoles, [app.user]: app.roleTitle };
    setUserRoles(updatedRoles);
    localStorage.setItem('user_assigned_roles', JSON.stringify(updatedRoles));
  };

  const handleDeclineApplication = (app) => {
    const updatedApps = roleApplications.map(a => a.id === app.id ? { ...a, status: 'Declined' } : a);
    setRoleApplications(updatedApps);
    localStorage.setItem('role_applications', JSON.stringify(updatedApps));
  };

  const handleAssignRoleDirect = (username, roleName) => {
    if (!username.trim()) return;
    const updatedRoles = { ...userRoles, [username.trim()]: roleName };
    setUserRoles(updatedRoles);
    localStorage.setItem('user_assigned_roles', JSON.stringify(updatedRoles));
    alert(`Assigned ${roleName} to ${username}!`);
  };

  const handleAddDraftRoleRow = () => {
    setDraftRoles([...draftRoles, { title: '', videoReq: '', time: '' }]);
  };

  const handleUpdateDraftRole = (index, field, value) => {
    const updated = [...draftRoles];
    updated[index][field] = value;
    setDraftRoles(updated);
  };

  const handleRemoveDraftRoleRow = (index) => {
    if (draftRoles.length === 1) return;
    const updated = draftRoles.filter((_, i) => i !== index);
    setDraftRoles(updated);
  };

  const handlePostAllDraftRoles = (e) => {
    e.preventDefault();
    const validRoles = draftRoles.filter(r => r.title.trim() && r.videoReq.trim() && r.time.trim());
    if (validRoles.length === 0) {
      alert("Please fill out at least one complete role (Title, Requirements, Deadline) before posting!");
      return;
    }

    const newCreatedRoles = validRoles.map((r, i) => ({
      id: Date.now() + i,
      title: r.title.trim(),
      videoReq: r.videoReq.trim(),
      time: r.time.trim(),
      status: 'Open'
    }));

    const updatedRolesList = [...roleOpenings, ...newCreatedRoles];
    setRoleOpenings(updatedRolesList);
    localStorage.setItem('site_role_openings', JSON.stringify(updatedRolesList));

    let updatedAnnouncements = [...announcements];
    newCreatedRoles.forEach(role => {
      const announcementText = `📢 New Role Opening Posted: ${role.title} — ${role.videoReq} (${role.time})`;
      updatedAnnouncements.push(announcementText);
    });
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('site_announcements', JSON.stringify(updatedAnnouncements));

    setDraftRoles([{ title: '', videoReq: '', time: '' }]);
    alert(`${newCreatedRoles.length} new role(s) posted and announced successfully!`);
  };

  const handleDeleteRoleOpening = (roleId) => {
    const updated = roleOpenings.filter(r => r.id !== roleId);
    setRoleOpenings(updated);
    localStorage.setItem('site_role_openings', JSON.stringify(updated));
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (newAnnouncement.trim()) {
      const updated = [...announcements, newAnnouncement.trim()];
      setAnnouncements(updated);
      localStorage.setItem('site_announcements', JSON.stringify(updated));
      setNewAnnouncement('');
    }
  };

  const handleFinalExamSubmit = () => {
    setExamSubmitted(true);
    const validCount = questions.filter(q => selectedAnswers[q.id] === q.correct).length;
    const percentage = Math.round((validCount / questions.length) * 100);
    const record = {
      user: discordUser || 'Anonymous',
      score: `${percentage}% (${validCount}/${questions.length} Correct)`,
      date: new Date().toLocaleString(),
      status: percentage >= 70 ? 'Passed' : 'Failed'
    };
    const updatedLogs = [record, ...examSubmissionsLog];
    setExamSubmissionsLog(updatedLogs);
    localStorage.setItem('exam_submissions_log', JSON.stringify(updatedLogs));
  };

  const filteredApplications = selectedAdminRoleFilter === 'ALL' 
    ? roleApplications 
    : roleApplications.filter(app => app.roleTitle === selectedAdminRoleFilter);

  const currentChannelObj = trainingChannels.find(c => c.id === activeTrainingChannel) || trainingChannels[0];

  const navItemStyle = (pageName) => {
    const isActive = activePage === pageName;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
      color: isActive ? '#ffffff' : '#94a3b8',
      border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '400',
      transition: 'all 0.2s ease',
      boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.2)' : 'none'
    };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#07090e', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Discord-Style Left Sidebar */}
      <aside style={{ width: '270px', backgroundColor: '#0b0f17', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 0, borderRadius: 0, flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <div style={{ width: '38px', height: '38px', backgroundColor: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px', color: '#fff', boxShadow: '0 0 14px rgba(99,102,241,0.5)', flexShrink: 0 }}>
              {discordUser ? discordUser.charAt(0).toUpperCase() : 'B'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                Bunny Originals Content Web
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {discordUser ? discordUser : 'Not logged in'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '220px' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '12px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 8px 6px 28px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
              />
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => { setActivePage('Profile'); setIsExamActive(false); setTrainingStarted(false); }} style={navItemStyle('Profile')}>
              <span style={{ fontSize: '15px' }}>👤</span> Profile
            </button>
            <button onClick={() => { setActivePage('Training'); setIsExamActive(false); setTrainingStarted(false); }} style={navItemStyle('Training')}>
              <span style={{ fontSize: '15px' }}>🎯</span> Training Center {isTrainingCompleted && '✅'}
            </button>
            <button onClick={() => { setActivePage('Exams'); setIsExamActive(false); setTrainingStarted(false); }} style={navItemStyle('Exams')}>
              <span style={{ fontSize: '15px' }}>📄</span> Exams {isTrainingCompleted ? '' : '🔒'}
            </button>
            <button onClick={() => { setActivePage('Announcements'); setIsExamActive(false); setTrainingStarted(false); }} style={navItemStyle('Announcements')}>
              <span style={{ fontSize: '15px' }}>📢</span> Announcements
            </button>
            <button onClick={() => { setActivePage('Role opening'); setIsExamActive(false); setTrainingStarted(false); }} style={navItemStyle('Role opening')}>
              <span style={{ fontSize: '15px' }}>💼</span> Role opening
            </button>

            {isAdminOrLead && (
              <button onClick={() => { setActivePage('Admin panel'); setIsExamActive(false); setTrainingStarted(false); }} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                backgroundColor: activePage === 'Admin panel' ? 'rgba(244,63,94,0.12)' : 'transparent',
                color: '#f43f5e', border: activePage === 'Admin panel' ? '1px solid rgba(244,63,94,0.3)' : '1px solid transparent',
                borderRadius: '12px', cursor: 'pointer', fontWeight: '600', marginTop: '10px', fontSize: '14px',
                boxShadow: activePage === 'Admin panel' ? '0 4px 12px rgba(244,63,94,0.2)' : 'none'
              }}>
                <span style={{ fontSize: '15px' }}>🔒</span> Admin Panel
              </button>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          {!discordUser ? (
            <div>
              {!isLoggingIn ? (
                <button onClick={() => setIsLoggingIn(true)} style={{ width: '100%', padding: '10px', backgroundColor: '#5865F2', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(88,101,242,0.3)' }}>
                  Login with Discord
                </button>
              ) : (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Discord username..." 
                    value={inputName} 
                    onChange={(e) => setInputName(e.target.value)}
                    autoFocus
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #6366f1', backgroundColor: '#131b2e', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="submit" style={{ flex: 1, padding: '6px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Join</button>
                    <button type="button" onClick={() => setIsLoggingIn(false)} style={{ padding: '6px 10px', backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#4ade80', textAlign: 'center', backgroundColor: 'rgba(74,222,128,0.1)', padding: '5px', borderRadius: '6px' }}>🟢 Logged in as {discordUser}</div>
              <button onClick={handleLogout} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.04)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                Logout Session
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#f8fafc', letterSpacing: '-0.3px' }}>
          {activePage === 'Admin panel' ? '⚙️ Admin Control Panel' : (activePage === 'Training' ? '🎯 Filming Crew Training Center' : `📄 ${activePage}`)}
        </h1>

        {/* TRAINING PAGE */}
        {activePage === 'Training' && !trainingStarted && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', maxWidth: '750px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: '#38bdf8', fontSize: '20px' }}>Welcome to the Bunny Originals Training Course</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
              Before you can unlock and take the official crew exam, you must go through our interactive training simulator.
            </p>
            <div style={{ margin: '24px 0', padding: '16px 20px', backgroundColor: '#131b2e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <strong style={{ color: '#cbd5e1' }}>Training Status:</strong> {isTrainingCompleted ? <span style={{ color: '#4ade80' }}>Completed ✅</span> : <span style={{ color: '#facc15' }}>Not Completed ⏳</span>}
              </div>
              <button 
                onClick={() => {
                  if(!discordUser) {
                    alert("Please log in with Discord first!");
                    return;
                  }
                  setTrainingStarted(true);
                  setActiveTrainingChannel('overview');
                  setTrainingStep(0);
                }} 
                style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.4)', fontSize: '13px' }}
              >
                {isTrainingCompleted ? 'Review Training Again' : 'Start Training'}
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE TRAINING SIMULATOR */}
        {activePage === 'Training' && trainingStarted && (
          <div style={{ display: 'flex', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', height: '520px', maxWidth: '920px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '250px', backgroundColor: '#070a10', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.5px' }}>📁 Training Channels</div>
              {trainingChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => { setActiveTrainingChannel(channel.id); setTrainingStep(0); }}
                  style={{
                    padding: '9px 12px',
                    textAlign: 'left',
                    backgroundColor: activeTrainingChannel === channel.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: activeTrainingChannel === channel.id ? '#38bdf8' : '#94a3b8',
                    border: activeTrainingChannel === channel.id ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeTrainingChannel === channel.id ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {channel.name}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#facc15', marginBottom: '6px', fontWeight: '500' }}>Reading Channel: {currentChannelObj.name}</div>
                <h3 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '16px', fontWeight: '600' }}>{currentChannelObj.title}</h3>
                <div style={{ backgroundColor: '#131b2e', padding: '20px', borderRadius: '12px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-line', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {currentChannelObj.slides[trainingStep]}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                  Page {trainingStep + 1} of {currentChannelObj.slides.length}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <button 
                  disabled={trainingStep === 0}
                  onClick={() => setTrainingStep(trainingStep - 1)}
                  style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: trainingStep === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: trainingStep === 0 ? 0.5 : 1 }}
                >
                  Previous
                </button>

                {trainingStep < currentChannelObj.slides.length - 1 ? (
                  <button 
                    onClick={() => setTrainingStep(trainingStep + 1)}
                    style={{ padding: '8px 18px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                  >
                    Next ➔
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      const currentIndex = trainingChannels.findIndex(c => c.id === activeTrainingChannel);
                      if (currentIndex < trainingChannels.length - 1) {
                        setActiveTrainingChannel(trainingChannels[currentIndex + 1].id);
                        setTrainingStep(0);
                      } else {
                        handleFinishAllTraining();
                      }
                    }}
                    style={{ padding: '8px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                  >
                    {trainingChannels.findIndex(c => c.id === activeTrainingChannel) < trainingChannels.length - 1 ? 'Next Channel ➔' : 'Finish Training 🎉'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EXAMS PAGE */}
        {activePage === 'Exams' && !isExamActive && (
          <div>
            {!isTrainingCompleted ? (
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '16px', padding: '32px', maxWidth: '750px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <h2 style={{ color: '#f43f5e', marginTop: 0, fontSize: '20px' }}>🔒 Exam Locked</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                  You must complete the <strong>Training Center</strong> course before you can unlock and attempt the Filming Crew Exam!
                </p>
                <button onClick={() => setActivePage('Training')} style={{ padding: '10px 22px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.4)', fontSize: '13px' }}>
                  Go to Training Center
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>Filming Crew Exam — Bunny Originals</h2>
                    <span style={{ backgroundColor: examStatus === 'OPEN' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: examStatus === 'OPEN' ? '#4ade80' : '#f87171', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {examStatus}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', margin: '0 0 16px 0', fontSize: '13px', lineHeight: '1.5' }}>Test your knowledge on filming crew rules.</p>
                  <span style={{ backgroundColor: '#131b2e', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{questions.length} Questions</span>
                </div>

                {examStatus === 'OPEN' ? (
                  <button onClick={() => { if(!discordUser) { alert("Please log in with Discord first!"); return; } setIsExamActive(true); setCheated(false); setExamSubmitted(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); }} style={{ padding: '10px 22px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.4)', fontSize: '13px' }}>
                    Open Exam
                  </button>
                ) : (
                  <button disabled style={{ padding: '10px 22px', backgroundColor: '#131b2e', color: '#64748b', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'not-allowed', fontSize: '13px' }}>
                    Exam Closed
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE EXAM INTERFACE */}
        {activePage === 'Exams' && isExamActive && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', maxWidth: '750px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>
            {!examSubmitted ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f43f5e', marginBottom: '16px', fontSize: '12px', fontWeight: '600' }}>
                  <span>🚨 Anti-Cheat Active: Do not switch tabs or leave page!</span>
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#f8fafc', fontWeight: '600' }}>{questions[currentQuestionIndex].text}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {questions[currentQuestionIndex].options.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedAnswers({ ...selectedAnswers, [questions[currentQuestionIndex].id]: idx })}
                      style={{ 
                        padding: '12px 18px', 
                        textAlign: 'left', 
                        backgroundColor: selectedAnswers[questions[currentQuestionIndex].id] === idx ? '#6366f1' : '#131b2e', 
                        color: '#fff', 
                        border: selectedAnswers[questions[currentQuestionIndex].id] === idx ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: '10px', 
                        cursor: 'pointer', 
                        fontSize: '14px',
                        boxShadow: selectedAnswers[questions[currentQuestionIndex].id] === idx ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button 
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      style={{ padding: '8px 18px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={handleFinalExamSubmit}
                      style={{ padding: '8px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                {cheated ? (
                  <div>
                    <h2 style={{ color: '#f43f5e', marginBottom: '10px', fontSize: '22px' }}>❌ Exam Failed: 0%</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>You switched tabs or left the web window during the exam. Your score has been automatically recorded as 0%.</p>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ color: '#4ade80', marginBottom: '10px', fontSize: '22px' }}>🎉 Exam Submitted Successfully!</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>Your results have been recorded.</p>
                  </div>
                )}
                <button onClick={() => { setIsExamActive(false); setExamSubmitted(false); setCurrentQuestionIndex(0); }} style={{ padding: '10px 22px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* ROLE OPENINGS PAGE */}
        {activePage === 'Role opening' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '4px' }}>Available Role Openings</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Click on any role to see video requirements and apply instantly.</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {roleOpenings.map((role) => (
                <div key={role.id} style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#38bdf8', fontWeight: '600' }}>{role.title}</h3>
                    <div style={{ fontSize: '12px', color: '#facc15', marginBottom: '10px', fontWeight: '500' }}>⏳ {role.time}</div>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '18px' }}>Status: <span style={{ color: '#4ade80', fontWeight: '600' }}>{role.status}</span></p>
                  </div>
                  {/* Button changed to "View all roles" */}
                  <button onClick={() => { setSelectedRoleDetail(role); setChosenRoleDropdownValue(role.title); }} style={{ padding: '8px 14px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    View all roles
                  </button>
                </div>
              ))}
            </div>

            {selectedRoleDetail && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
                <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', width: '460px', maxWidth: '90%', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                  <h3 style={{ marginTop: 0, color: '#38bdf8', fontSize: '18px' }}>{selectedRoleDetail.title}</h3>
                  <div style={{ fontSize: '12px', color: '#facc15', marginBottom: '12px' }}>⏳ {selectedRoleDetail.time}</div>
                  
                  <p style={{ color: '#f8fafc', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Pick a role from free list:</p>
                  <select 
                    value={chosenRoleDropdownValue} 
                    onChange={(e) => setChosenRoleDropdownValue(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#131b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', outline: 'none', marginBottom: '16px' }}
                  >
                    {roleOpenings.map(r => (
                      <option key={r.id} value={r.title}>{r.title} (Open)</option>
                    ))}
                  </select>

                  <p style={{ color: '#f8fafc', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Required Material Instructions:</p>
                  <div style={{ backgroundColor: '#131b2e', padding: '14px', borderRadius: '10px', color: '#cbd5e1', fontSize: '13px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)', lineHeight: '1.5' }}>
                    {selectedRoleDetail.videoReq}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setSelectedRoleDetail(null)} style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Close</button>
                    <button onClick={() => handleApplyRole(chosenRoleDropdownValue)} style={{ padding: '8px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>Apply Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS PAGE */}
        {activePage === 'Announcements' && (
          <div style={{ backgroundColor: '#0f172a', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', margin: 0 }}>Announcements</h2>
            {announcements.map((ann, i) => (
              <div key={i} style={{ backgroundColor: '#131b2e', padding: '16px 20px', borderRadius: '10px', borderLeft: '4px solid #38bdf8', color: '#cbd5e1', fontSize: '14px', border: '1px solid rgba(255,255,255,0.05)', borderLeftWidth: '4px' }}>
                {ann}
              </div>
            ))}
          </div>
        )}

        {/* PROFILE PAGE */}
        {activePage === 'Profile' && (
          <div style={{ backgroundColor: '#0f172a', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '600px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', color: '#f8fafc', marginTop: 0 }}>User Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#cbd5e1', fontSize: '14px' }}>
              <p style={{ margin: 0 }}><strong>Discord Username:</strong> {discordUser || 'Not logged in'}</p>
              <p style={{ margin: 0 }}><strong>Assigned Role / Permission:</strong> <span style={{ color: '#4ade80', fontWeight: '600' }}>{isAdminOrLead && (discordUser === 'ufiuiuffudfuiuduf.322' || discordUser === 'bunnyoriginals' || discordUser === 'snowfox_alex') ? 'Admin' : (currentUserRole || 'Member')}</span></p>
              <p style={{ margin: 0 }}><strong>Training Status:</strong> <span style={{ color: isTrainingCompleted ? '#4ade80' : '#facc15', fontWeight: '600' }}>{isTrainingCompleted ? 'Completed ✅' : 'Pending ⏳'}</span></p>
              <p style={{ margin: 0, marginTop: '10px' }}><strong>Accepted Roles History:</strong></p>
              <ul style={{ color: '#94a3b8', margin: '0', paddingLeft: '20px' }}>
                {roleApplications.filter(app => app.user === discordUser && app.status === 'Accepted').length > 0 ? (
                  roleApplications.filter(app => app.user === discordUser && app.status === 'Accepted').map((app, idx) => (
                    <li key={idx} style={{ color: '#4ade80' }}>
                      {app.user} assigned to role: {app.roleTitle}
                    </li>
                  ))
                ) : (
                  <li>No official accepted roles yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* ADMIN PANEL */}
        {activePage === 'Admin panel' && isAdminOrLead && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
            
            {/* User Presence Monitor */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 26px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', color: '#38bdf8' }}>🟢 Online / Offline User Presence Monitor</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {Object.entries(userActivityLog).map(([username, data], idx) => (
                  <div key={idx} style={{ backgroundColor: '#131b2e', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <strong style={{ color: '#f8fafc' }}>👤 {username}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Last Active: {data.lastActive}</div>
                    </div>
                    <span style={{ fontSize: '12px', backgroundColor: data.online ? 'rgba(74,222,128,0.1)' : 'rgba(244,63,94,0.1)', color: data.online ? '#4ade80' : '#f43f5e', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                      {data.online ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Status Control */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#f8fafc' }}>Exam Status Control</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Toggle whether users can take the Filming Crew exam.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: '600', color: examStatus === 'OPEN' ? '#4ade80' : '#f43f5e', fontSize: '13px' }}>{examStatus}</span>
                <button 
                  onClick={() => setExamStatus(examStatus === 'OPEN' ? 'CLOSED' : 'OPEN')}
                  style={{ padding: '8px 16px', backgroundColor: examStatus === 'OPEN' ? '#f43f5e' : '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                >
                  Switch to {examStatus === 'OPEN' ? 'CLOSED' : 'OPEN'}
                </button>
              </div>
            </div>

            {/* Direct Role Assignment */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 26px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#facc15' }}>👑 Assign Roles Directly</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input id="directUser" type="text" placeholder="Discord Username..." style={{ flex: 1, padding: '9px 12px', backgroundColor: '#131b2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '13px' }} />
                <select id="directRole" style={{ padding: '9px 12px', backgroundColor: '#131b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', outline: 'none', fontSize: '13px' }}>
                  <option value="Admin">Admin</option>
                  <option value="@Content Lead">@Content Lead</option>
                  <option value="@Content Producer">@Content Producer</option>
                  <option value="@Content Associate">@Content Associate</option>
                </select>
                <button onClick={() => {
                  const u = document.getElementById('directUser').value;
                  const r = document.getElementById('directRole').value;
                  handleAssignRoleDirect(u, r);
                }} style={{ padding: '9px 18px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                  Assign Role
                </button>
              </div>
            </div>

            {/* Role Applications (Accept or Decline) */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 26px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8' }}>📥 Role Applications (Accept or Decline)</h3>
                <select 
                  value={selectedAdminRoleFilter} 
                  onChange={(e) => setSelectedAdminRoleFilter(e.target.value)}
                  style={{ padding: '6px 10px', backgroundColor: '#131b2e', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="ALL">All Roles</option>
                  {roleOpenings.map(r => (
                    <option key={r.id} value={r.title}>{r.title}</option>
                  ))}
                </select>
              </div>

              {filteredApplications.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>No applications received for this filter.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredApplications.map((app) => (
                    <div key={app.id} style={{ backgroundColor: '#131b2e', padding: '14px 18px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        {app.status === 'Accepted' ? (
                          <div style={{ color: '#4ade80', fontWeight: '600', fontSize: '13px' }}>
                            ✅ {app.user} accepted for role: {app.roleTitle}
                          </div>
                        ) : app.status === 'Declined' ? (
                          <div style={{ color: '#f43f5e', fontWeight: '600', fontSize: '13px' }}>
                            ❌ {app.user}'s application for {app.roleTitle} was declined.
                          </div>
                        ) : (
                          <div>
                            <strong style={{ color: '#f8fafc' }}>👤 {app.user}</strong> applied for <span style={{ color: '#38bdf8' }}>{app.roleTitle}</span>
                            <div style={{ fontSize: '12px', color: '#facc15', marginTop: '2px' }}>Status: Pending Review</div>
                          </div>
                        )}
                      </div>
                      {app.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAcceptApplication(app)} style={{ padding: '6px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                            Accept
                          </button>
                          <button onClick={() => handleDeclineApplication(app)} style={{ padding: '6px 14px', backgroundColor: '#f43f5e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post & Manage Role Openings with '+' Dynamic Role Creation Feature */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 26px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#a855f7' }}>💼 Post & Manage Role Openings</h3>
                  <button 
                    onClick={handleAddDraftRoleRow}
                    title="Add another role"
                    style={{ width: '32px', height: '32px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '50%', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99,102,241,0.4)' }}
                  >
                    +
                  </button>
                </div>

                <form onSubmit={handlePostAllDraftRoles} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {draftRoles.map((draft, index) => (
                    <div key={index} style={{ backgroundColor: '#131b2e', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        <span>Role #{index + 1}</span>
                        {draftRoles.length > 1 && (
                          <button type="button" onClick={() => handleRemoveDraftRoleRow(index)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                        )}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Role Title..." 
                        value={draft.title} 
                        onChange={(e) => handleUpdateDraftRole(index, 'title', e.target.value)} 
                        style={{ padding: '8px 10px', backgroundColor: '#0b0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '12px' }} 
                      />
                      <input 
                        type="text" 
                        placeholder="Requirements/instructions..." 
                        value={draft.videoReq} 
                        onChange={(e) => handleUpdateDraftRole(index, 'videoReq', e.target.value)} 
                        style={{ padding: '8px 10px', backgroundColor: '#0b0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '12px' }} 
                      />
                      <input 
                        type="text" 
                        placeholder="Time/Deadline (e.g., Closes in 3 Days)..." 
                        value={draft.time} 
                        onChange={(e) => handleUpdateDraftRole(index, 'time', e.target.value)} 
                        style={{ padding: '8px 10px', backgroundColor: '#0b0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '12px' }} 
                      />
                    </div>
                  ))}
                  <button type="submit" style={{ padding: '10px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>Post & Announce All Roles</button>
                </form>

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '13px', margin: '0 0 10px 0', color: '#94a3b8' }}>Existing Active Roles:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {roleOpenings.map(role => (
                      <div key={role.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#131b2e', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#f8fafc' }}>{role.title}</span>
                        <button onClick={() => handleDeleteRoleOpening(role.id)} style={{ padding: '4px 8px', backgroundColor: '#f43f5e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px 26px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', color: '#38bdf8' }}>📢 Post Announcement</h3>
                <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  <input type="text" placeholder="Announcement message..." value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} style={{ padding: '9px 12px', backgroundColor: '#131b2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '13px' }} />
                  <button type="submit" style={{ padding: '9px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Post</button>
                </form>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}