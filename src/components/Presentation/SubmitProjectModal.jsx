import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  X,
  CheckCircle,
  ArrowRight,
  Code2,
  FolderOpen,
  Layers,
  Cpu,
  Sprout,
  Camera,
  Stethoscope,
} from 'lucide-react';
import {
  POPULAR_PROJECT_TEMPLATES,
  generateSlidesFromProjectDetails,
  processPresentationFile,
} from '../../utils/presentationSlideDeck';

export default function SubmitProjectModal({
  isOpen,
  onClose,
  onProjectLoaded,
}) {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'manual' | 'upload'
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Manual project form state
  const [customProject, setCustomProject] = useState({
    title: '',
    domain: 'Computer Science & AI',
    problem: '',
    techStack: '',
    features: '',
    results: '',
    futureScope: '',
  });

  if (!isOpen) return null;

  // Handle template selection
  const handleSelectTemplate = (template) => {
    const slides = generateSlidesFromProjectDetails(template);
    onProjectLoaded({
      projectData: template,
      slides,
      source: 'template',
      projectName: template.title,
    });
    onClose();
  };

  // Handle manual form submission
  const handleManualSubmit = (e) => {
    e?.preventDefault?.();
    if (!customProject.title.trim()) {
      alert('Please enter your Project Title.');
      return;
    }
    const slides = generateSlidesFromProjectDetails(customProject);
    onProjectLoaded({
      projectData: customProject,
      slides,
      source: 'manual',
      projectName: customProject.title,
    });
    onClose();
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await processPresentationFile(file);
      if (res && res.slides) {
        onProjectLoaded({
          projectData: {
            title: res.originalname.replace(/\.[^/.]+$/, ''),
            domain: 'Uploaded Presentation Deck',
            techStack: 'PowerPoint / PDF Slides',
            problem: 'Presented from uploaded presentation slides.',
          },
          slides: res.slides,
          source: 'file',
          projectName: res.originalname,
        });
        onClose();
      }
    } catch (e) {
      console.warn('File processing error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTemplateIcon = (iconName) => {
    switch (iconName) {
      case 'Camera':
        return <Camera className="w-5 h-5 text-emerald-400" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-teal-400" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-blue-400" />;
      default:
        return <Cpu className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#0e172e] via-[#0b1328] to-[#070b18] border border-blue-500/30 rounded-3xl shadow-2xl p-5 sm:p-7 text-white space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Smart Presentation Setup</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Submit Your Project or PPT
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Choose how you want to present your project. AI will load your slides on the digital screen board and ask relevant technical questions!
          </p>
        </div>

        {/* 3 Tabs Selection */}
        <div className="flex items-center justify-center gap-2 border-b border-blue-900/40 pb-3">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Popular Projects (1-Click)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Enter My Project Details</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload PPT / PDF</span>
          </button>
        </div>

        {/* ── TAB 1: POPULAR COLLEGE PROJECT TEMPLATES ── */}
        {activeTab === 'templates' && (
          <div className="space-y-3 animate-fade-in">
            <div className="text-xs text-slate-400 text-left font-medium">
              Select one of these pre-built engineering project decks to start practicing immediately:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {POPULAR_PROJECT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-4 rounded-2xl bg-[#0c1428] hover:bg-[#121e3d] border border-blue-900/40 hover:border-blue-400/60 transition-all duration-200 cursor-pointer text-left space-y-2 group shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-950/90 border border-blue-800/40">
                        {getTemplateIcon(tmpl.icon)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40">
                        {tmpl.badge}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {tmpl.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {tmpl.problem}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate max-w-[200px] text-slate-400">
                      🛠️ {tmpl.techStack.split(',').slice(0, 3).join(', ')}
                    </span>
                    <span className="text-blue-400 font-semibold group-hover:underline">
                      Load Deck →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: ENTER CUSTOM PROJECT DETAILS ── */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-3.5 text-left animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Smart Traffic Flow Optimizer"
                  value={customProject.title}
                  onChange={(e) => setCustomProject({ ...customProject, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1122] border border-blue-900/60 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Domain / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI / Machine Learning, IoT, Web Dev"
                  value={customProject.domain}
                  onChange={(e) => setCustomProject({ ...customProject, domain: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1122] border border-blue-900/60 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Problem Statement Solved
              </label>
              <textarea
                rows={2}
                placeholder="What real-world problem or pain point does your project solve?"
                value={customProject.problem}
                onChange={(e) => setCustomProject({ ...customProject, problem: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0a1122] border border-blue-900/60 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tech Stack (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, OpenCV, React, Node.js, AWS"
                  value={customProject.techStack}
                  onChange={(e) => setCustomProject({ ...customProject, techStack: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1122] border border-blue-900/60 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Key Results / Efficiency Achieved
                </label>
                <input
                  type="text"
                  placeholder="e.g. 96% accuracy, reduced latency by 40%"
                  value={customProject.results}
                  onChange={(e) => setCustomProject({ ...customProject, results: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1122] border border-blue-900/60 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Generate Presentation Slides</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ── TAB 3: UPLOAD PPT / PDF FILE ── */}
        {activeTab === 'upload' && (
          <div className="space-y-4 animate-fade-in text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pptx,.ppt,.pdf"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileUpload(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                dragOver
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-xl shadow-cyan-500/20'
                  : 'border-blue-800/60 bg-[#091124] hover:bg-[#0c1630] hover:border-blue-400/80'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-cyan-400 shadow-inner">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Drop your PowerPoint (.pptx) or PDF (.pdf) here
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  or click to browse from your computer (Max: 25 MB)
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/40">
                  📊 Auto Slide Extraction
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/40">
                  🎙️ Voice Controlled Navigation
                </span>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Processing presentation slides...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
