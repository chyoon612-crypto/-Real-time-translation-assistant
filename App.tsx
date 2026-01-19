
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Announcement, 
  LanguageCode, 
  Category 
} from './types.ts';
import { 
  CATEGORIES 
} from './constants.ts';
import { translateAnnouncement } from './services/geminiService.ts';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { AnnouncementCard } from './components/AnnouncementCard.tsx';

const Icons = {
  Plus: () => <span>+</span>,
  ArrowRight: () => <span className="ml-1">→</span>,
  Loading: () => <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>,
  Teacher: () => <span className="mr-2">👨‍🏫</span>,
  Student: () => <span className="mr-2">🧑‍🎓</span>,
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full flex flex-col overflow-hidden">
    <header className="flex-none bg-white border-b border-slate-200 shadow-sm z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              GlobalBridge Live
            </span>
          </Link>
          <div className="flex items-center gap-4">
             <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse tracking-widest">
               ● LIVE CLASSROOM ACTIVE
             </span>
             <Link to="/" className="text-xs text-slate-400 hover:text-indigo-600 font-bold tracking-tighter uppercase transition-colors">Reset</Link>
          </div>
        </div>
      </div>
    </header>
    <main className="flex-1 min-h-0">
      {children}
    </main>
  </div>
);

const LiveClassroom: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('KO');
  
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
    <div className="h-full flex flex-col md:flex-row bg-slate-100 overflow-hidden">
      <div className="w-full md:w-[400px] lg:w-[450px] border-r border-slate-200 bg-white flex flex-col shadow-xl z-20">
        <div className="p-5 border-b border-slate-100 bg-indigo-50/30">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Teacher />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">선생님 교탁</h2>
          </div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">안내 내용을 작성하면 모든 언어로 즉시 번역됩니다.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      category === c 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">제목 (한국어)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지 제목을 입력하세요"
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">내용 (한국어)</label>
              <textarea 
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="학생들에게 전달할 내용을 작성하세요..."
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none py-3"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex justify-center items-center gap-2 disabled:opacity-50 text-sm"
              >
                {loading ? <Icons.Loading /> : (editingId ? '안내 수정 완료' : '전체 언어로 발행하기')}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                  className="px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 text-sm font-bold"
                >
                  취소
                </button>
              )}
            </div>
          </form>

          <div className="mt-10">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 mb-4">발행 이력</h3>
            <div className="space-y-3">
              {announcements.length === 0 && <p className="text-xs text-slate-300 italic">아직 발행된 안내가 없습니다.</p>}
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-indigo-50/50 transition-all group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-extrabold text-indigo-500 uppercase">{ann.category}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(ann.id)} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600">수정</button>
                      <button onClick={() => handleDelete(ann.id)} className="text-[10px] font-bold text-slate-400 hover:text-red-600">삭제</button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{ann.originalTitle}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
        <div className="p-5 border-b border-slate-200 bg-white/90 backdrop-blur-lg flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Icons.Student />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-none">학생 라이브 피드</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Real-time Multilingual Feed</p>
            </div>
          </div>
          <div className="w-full sm:w-72">
            <LanguageSelector 
              selected={selectedLang} 
              onChange={(code) => {
                setSelectedLang(code);
                localStorage.setItem('gb_student_lang', code);
              }}
              label="표시 언어 설정 (Display Language)"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            {announcements.length === 0 ? (
              <div className="py-40 text-center animate-pulse">
                <div className="text-7xl mb-6 grayscale opacity-20">📡</div>
                <h3 className="text-2xl font-black text-slate-300 tracking-tighter uppercase">Waiting for teacher...</h3>
                <p className="text-sm text-slate-400 mt-2">선생님이 안내를 입력하면 즉시 여기에 나타납니다.</p>
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
        
        <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-full shadow-lg">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live Syncing</span>
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
          <Route path="/" element={<LiveClassroom />} />
          <Route path="/classroom" element={<LiveClassroom />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
