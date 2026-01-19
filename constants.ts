
import { Language, Category } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'KO', name: '한국어', nativeName: '한국어' },
  { code: 'EN', name: 'English', nativeName: 'English' },
  { code: 'ZH', name: 'Chinese', nativeName: '中文' },
  { code: 'RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'VI', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'JA', name: 'Japanese', nativeName: '日本語' },
  { code: 'FR', name: 'French', nativeName: 'Français' },
];

export const CATEGORIES: Category[] = ['공지', '과제', '평가', '안내', '프로젝트'];

export const CATEGORY_COLORS: Record<Category, string> = {
  '공지': 'bg-blue-100 text-blue-700 border-blue-200',
  '과제': 'bg-orange-100 text-orange-700 border-orange-200',
  '평가': 'bg-red-100 text-red-700 border-red-200',
  '안내': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '프로젝트': 'bg-purple-100 text-purple-700 border-purple-200',
};
