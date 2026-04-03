import React from "react";

const TeamShowcase = () => {
  const youtubeUrl = "https://youtu.be/-B4zAH8dOtQ?si=ScU23Sf3zTuFrDET";

  const features = [
    {
      icon: "auto_awesome",
      title: "AI-Powered Analytics",
      desc: "Google Gemini integration to predict leave patterns and provide institutional insights.",
      chip: "Google Gemini",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: "calendar_month",
      title: "Smart Timetables",
      desc: "Automated parsing of faculty schedules to avoid class overlap during leave periods.",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      icon: "person_search",
      title: "Auto Substitutes",
      desc: "Intelligent substitute assignment based on availability and subject suitability.",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: "dashboard",
      title: "Real-time Insights",
      desc: "Live dashboards for HoDs and admins to monitor leave trends and workload.",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: "notifications_active",
      title: "Smart Alerts",
      desc: "Instant updates for requests, approvals, and substitute allocation.",
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      icon: "hub",
      title: "Scalable Architecture",
      desc: "Built with MERN architecture for reliability and easy institutional scaling.",
      iconBg: "bg-gray-50",
      iconColor: "text-gray-600",
    },
  ];

  const contributors = [
    {
      name: "Shreehari Nair",
      username: "@ShreehariNair",
      contributions: "10 CONTRIBUTIONS",
      role: "Lead Developer & Project Owner. Full-stack development, AI integration, UI/UX design.",
      commits:
        "Intelligent predictions, Predictive Cards, Gemini syllabus parsing, bar chart, analytics implementation.",
      primary: true,
    },
    {
      name: "Neha S Nair",
      username: "@nneha029",
      contributions: "4 CONTRIBUTIONS",
      role: "Frontend Developer. Focused on UI improvements and core user pages.",
      commits:
        "Update leaveBalancePage, update notificationModel, update applyLeavePage, README documentation.",
    },
    {
      name: "Pavithra Shine",
      username: "@PavithraShine24",
      contributions: "1 CONTRIBUTION",
      role: "Backend Developer. Handling scheduling and automation logic.",
      commits: "Added timetable upload and auto substitute assignment engine.",
    },
    {
      name: "Rahul Pananghattil",
      username: "@rahulpananghattil",
      contributions: "2 CONTRIBUTIONS",
      role: "Documentation & API. Managing API docs and project documentation.",
      commits:
        "Updated Postman live docs link and added API documentation section.",
    },
    {
      name: "Rohith",
      username: "@Rohith26845",
      contributions: "1 CONTRIBUTION",
      role: "Cloud Integration Developer. Infrastructure and media storage.",
      commits: "Integrated Cloudinary for scalable media handling.",
    },
    {
      name: "Sauravkrishna Nair",
      username: "@SKN-24",
      contributions: "1 CONTRIBUTION",
      role: "AI/ML Developer. Built predictive intelligence components.",
      commits: "Added leave reason classifier AI model.",
    },
    {
      name: "Chinmay",
      username: "@chinmay24comp-cmd",
      contributions: "1 CONTRIBUTION",
      role: "Frontend Developer. Profile UX and interface refinement.",
      commits: "Profile page enhancements and UI consistency updates.",
      centerOnLarge: true,
    },
  ];

  const technologies = [
    ["terminal", "React 18"],
    ["javascript", "Node.js"],
    ["database", "MongoDB"],
    ["psychology", "Google Gemini"],
    ["bar_chart", "Chart.js"],
    ["cloud_upload", "Cloudinary"],
  ];

  const metrics = [
    ["Prediction Accuracy", "85%", "85%"],
    ["System Uptime", "99.9%", "99.9%"],
    ["Process Efficiency", "90%", "90%"],
  ];

  return (
    <div className="bg-white text-gray-900 font-['Inter']">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-[9.6px] mb-6">
            <div className="w-[34px] h-[34px] bg-gradient-to-br from-[#1565c0] to-[#1976d2] rounded-[10px] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">
                school
              </span>
            </div>
            <span className="font-extrabold text-[1.25rem] text-[#0f172a] tracking-[-0.3px] leading-none">
              LeaveAI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#hero"
              className="text-gray-900 hover:text-gray-500 transition-colors"
            >
              Overview
            </a>
            <a
              href="#features"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#technologies"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Tech Stack
            </a>
            <a
              href="#team"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Team
            </a>
            <a
              href="#project-info"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Project Info
            </a>
          </div>

          {/* spacing placeholder */}
          <div className="w-0 md:w-40" />
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section
          id="hero"
          className="relative pt-16 pb-24 px-6 overflow-hidden"
        >
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500 mb-8 tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Built for Academic Excellence
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-[1.05]">
              Streamline faculty leave <br />
              <span className="text-gray-400">with institutional AI.</span>
            </h1>

            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Empowering Educational Institutions with Intelligent Leave
              Management & Predictive Analytics.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                ["7", "Contributors"],
                ["20+", "Commits"],
                ["5k+", "Lines Code"],
                ["85%", "Accuracy"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100"
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube thumbnail redirect */}
          <div className="max-w-6xl mx-auto mt-20 px-4">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative border-8 border-white group"
            >
              <img
                src="/hero-1.jpg"
                alt="Faculty Leave Management System Demo Video Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                  <span
                    className="material-symbols-outlined text-black text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_arrow
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest mb-4 block">
                Our Team
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Team Contributions
              </h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                The collaborative effort behind the Faculty Leave Management
                System, bringing together engineering expertise and AI
                innovation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributors.map((c) => (
                <div
                  key={c.username}
                  className={`p-6 bg-white border border-gray-100 rounded-xl flex flex-col transition-all duration-200 hover:bg-gray-50 hover:border-l-2 hover:border-l-black ${
                    c.centerOnLarge ? "lg:col-start-2" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {c.username}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded ${
                        c.primary
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.contributions}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Role
                  </p>
                  <p className="text-sm text-gray-700 mb-4">{c.role}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Key Commits
                  </p>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {c.commits}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 bg-gray-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest mb-4 block">
                Capabilities
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Everything your manual process <br />
                was missing.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="border border-gray-100 transition-all duration-300 hover:border-gray-200 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] p-8 rounded-3xl bg-white flex flex-col items-start text-left"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center mb-6`}
                  >
                    <span
                      className={`material-symbols-outlined ${f.iconColor} text-2xl`}
                    >
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {f.desc}
                  </p>
                  {f.chip ? (
                    <div className="mt-auto flex gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                        {f.chip}
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section id="technologies" className="py-24 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">
              Engineered with modern tools
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {technologies.map(([icon, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-6 py-3 bg-white shadow-sm rounded-2xl border border-gray-100"
                >
                  <span className="material-symbols-outlined text-gray-400 text-sm">
                    {icon}
                  </span>
                  <span className="font-semibold text-gray-700 text-sm">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Info */}
        <section id="project-info" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
                  Academic <br />
                  Project Info
                </h2>

                <div className="space-y-10">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">
                        Course & Specialization
                      </h4>
                      <p className="text-gray-500 leading-relaxed">
                        Natural Language Processing (NLP) - Academic AI Track
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <span className="material-symbols-outlined">
                        account_balance
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">
                        Institutional Context
                      </h4>
                      <p className="text-gray-500 leading-relaxed">
                        Semester VI, Third Year Engineering
                        <br />
                        <span className="font-bold text-gray-900">
                          Pillai College of Engineering (PCE)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <span className="material-symbols-outlined">
                        verified
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">
                        Project Impact
                      </h4>
                      <p className="text-gray-500 leading-relaxed">
                        Achieved 85% prediction accuracy for faculty leave
                        impact and streamlined administrative workflows by 40%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">
                    analytics
                  </span>
                  Metrics Snapshot
                </h4>

                <div className="space-y-10">
                  {metrics.map(([label, value, width]) => (
                    <div key={label}>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {label}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-black h-full rounded-full"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-[9.6px]">
                <div className="w-[34px] h-[34px] bg-gradient-to-br from-[#1565c0] to-[#1976d2] rounded-[10px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">
                    school
                  </span>
                </div>
                <span className="font-extrabold text-[1.25rem] text-[#0f172a] tracking-[-0.3px] leading-none">
                  LeaveAI
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
                A dedicated academic AI initiative at Pillai College of
                Engineering (PCE). Committed to engineering excellence and
                innovative research in automated academic systems.
              </p>
              <p className="text-gray-400 text-xs">
                © 2026 Leave AI PCE Academic Project.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">
                Navigation
              </h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <a
                    className="text-gray-500 hover:text-black transition-colors"
                    href="#"
                  >
                    Research Citation
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-500 hover:text-black transition-colors"
                    href="#"
                  >
                    Institutional Access
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-500 hover:text-black transition-colors"
                    href="https://github.com/ShreehariNair/Faculty-Leave-Management"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-500 hover:text-black transition-colors"
                    href="#"
                  >
                    System Privacy
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-widest text-[10px]">
                Resources
              </h4>
              <a
                href="https://www.pce.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white w-full py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all text-center"
              >
                Visit PCE Website
              </a>
              <a
                href="https://github.com/ShreehariNair/Faculty-Leave-Management"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 border border-gray-200 w-full py-3 rounded-xl font-semibold text-sm hover:border-gray-900 transition-all text-center"
              >
                Source Code
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TeamShowcase;
