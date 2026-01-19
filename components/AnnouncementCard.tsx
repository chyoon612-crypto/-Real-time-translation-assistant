
import React from 'react';
import { Announcement, LanguageCode } from '../types.ts';
import { CATEGORY_COLORS } from '../constants.ts';

interface Props {
  announcement: Announcement;
  displayLang: LanguageCode;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showAdminControls?: boolean;
}

export const AnnouncementCard: React.FC<Props> = ({ 
  announcement, 
  displayLang, 
  onEdit, 
  onDelete,
  showAdminControls 
}) => {
  const translation = displayLang === 'KO' 
    ? { title: announcement.originalTitle, content: announcement.originalContent }
    : announcement.translations.find(t => t.lang === displayLang);

  if (!translation) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${CATEGORY_COLORS[announcement.category]}`}>
            {announcement.category}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(announcement.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
          {translation.title}
        </h3>
        
        <div className="text-slate-600 text-base whitespace-pre-wrap leading-relaxed">
          {translation.content}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
           {displayLang !== 'KO' && (
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                Auto Translated
              </div>
           )}
           
           {showAdminControls && (
             <div className="flex gap-4">
               <button 
                onClick={() => onEdit?.(announcement.id)}
                className="text-slate-400 hover:text-indigo-600 text-xs font-bold transition-colors"
               >
                 EDIT
               </button>
               <button 
                onClick={() => onDelete?.(announcement.id)}
                className="text-slate-400 hover:text-red-600 text-xs font-bold transition-colors"
               >
                 DELETE
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
