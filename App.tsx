
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Announcement, 
  LanguageCode, 
  Category 
} from './types';
import { 
  CATEGORIES 
} from './constants';
import { translateAnnouncement } from './services/geminiService';
import { LanguageSelector } from './components/LanguageSelector';
import { AnnouncementCard } from './components/AnnouncementCard';

const Icons = {
  Plus: () => <span>+</span>,
  ArrowRight: () => <span className="ml-1">→</span>,
  Loading: () => <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>,
  Teacher: () => <span className="mr-2">👨‍🏫</span>,
  Student: () => <span className="mr-2">🧑‍🎓</span>,
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              GlobalBridge Live
            </span>
          </Link>
          <div className="flex items-center gap-4">
             <span className="hidden sm:inline-block text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">
               ● LIVE CONNECTED
             </span>
             <Link to="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">홈으로</Link>
          </div>
        </div>
      </div>
    </header>
    <main className="flex-1 overflow-hidden">
      {children}
    </main>
  </div>
);

const Landing: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-20 text-center">
    <div className="mb-8 p-6 bg-white inline-block rounded-3xl shadow-xl ring-1 ring-slate-200">
      <span className="text-7xl">🏫</span>
    </div>
    <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
      실시간 다국어 <br/>
      <span className="text-indigo-600">스마트 교실 안내</span>
    </h1>
    <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-12 leading-relaxed">
      선생님이 한국어로 입력하면 학생들은 즉시 자신의 언어로 확인합니다. <br/>
      언어의 장벽이 없는 통합 교육 환경을 지금 경험하세요.
    </p>
    <Link to="/classroom" className="inline-flex items-center px-10 py-5 bg-indigo-600 text-white font-bold text-lg rounded-2xl shadow-indigo-200 shadow-2xl hover:bg-indigo-700 hover:-translate-y-1 transition-all">
      실시간 교실 입장하기 <Icons.ArrowRight />
    </Link>
  </div>
);

const LiveClassroom: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('KO');
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('공지');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gb_announcements');
    if (saved) setAnnouncements(JSON.parse(saved));
    
    const pref = localStorage.getItem('gb_student_lang');
    if (pref) setSelectedLang(pref as LanguageCode);
  }, []);

  const saveAnnouncements = (data: Announcement[]) => {
    localStorage.setItem('gb_announcements', JSON.stringify(data));
    setAnnouncements(data);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      const translations = await translateAnnouncement(title, content);
      
      const newAnn: Announcement = {
        id: editingId || Date.now().toString(),
        category,
        originalTitle: title,
        originalContent: content,
        translations,
        createdAt: editingId ? (announcements.find(a => a.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updated;
      if (editingId) {
        updated = announcements.map(a => a.id === editingId ? newAnn : a);
      } else {
        updated = [newAnn, ...announcements];
      }

      saveAnnouncements(updated);
      setTitle('');
      setContent('');
      setEditingId(null);
      setCategory('공지');
    } catch (error) {
      console.error(error);
      alert("번역 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const target = announcements.find(a => a.id === id);
    if (target) {
      setTitle(target.originalTitle);
      setContent(target.originalContent);
      setCategory(target.category);
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      saveAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-100">
      {/* Teacher Section (Left) */}
      <div className="w-full md:w-1/2 lg:w-5/12 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Teacher />
            <h2 className="text-xl font-bold text-slate-900">선생님 안내 작성</h2>
          </div>
          <p className="text-sm text-slate-500">한국어로 내용을 입력하면 실시간으로 번역됩니다.</p>
        </div>

        <div className="p-6">
          <form onSubmit={handlePost} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">분류</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">제목 (한국어)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">내용 (한국어)</label>
              <textarea 
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="학생들에게 전달할 상세 안내를 작성하세요..."
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Icons.Loading /> : (editingId ? '안내 수정 완료' : '실시간 안내 발행')}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  취소
                </button>
              )}
            </div>
          </form>

          {/* Teacher's View of Sent Items */}
          <div className="mt-12 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">작성된 안내 내역</h3>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-indigo-500">{ann.category}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(ann.id)} className="text-xs text-slate-400 hover:text-indigo-600">수정</button>
                      <button onClick={() => handleDelete(ann.id)} className="text-xs text-slate-400 hover:text-red-600">삭제</button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{ann.originalTitle}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Section (Right) */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col bg-slate-100">
        <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icons.Student />
            <h2 className="text-xl font-bold text-slate-900">학생 실시간 피드</h2>
          </div>
          <div className="w-full sm:w-64">
            <LanguageSelector 
              selected={selectedLang} 
              onChange={(code) => {
                setSelectedLang(code);
                localStorage.setItem('gb_student_lang', code);
              }}
              label="표시 언어 선택 (Select Language)"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {announcements.length === 0 ? (
              <div className="py-32 text-center">
                <div className="text-6xl mb-4 grayscale opacity-30">📡</div>
                <h3 className="text-xl font-medium text-slate-400">선생님의 안내를 기다리는 중입니다...</h3>
              </div>
            ) : (
              announcements.map(ann => (
                <AnnouncementCard 
                  key={ann.id} 
                  announcement={ann} 
                  displayLang={selectedLang} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/classroom" element={<LiveClassroom />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
