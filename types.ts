
export type LanguageCode = 'KO' | 'EN' | 'ZH' | 'RU' | 'VI' | 'JA' | 'FR';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export type Category = '공지' | '과제' | '평가' | '안내' | '프로젝트';

export interface Translation {
  lang: LanguageCode;
  title: string;
  content: string;
}

export interface Announcement {
  id: string;
  category: Category;
  originalTitle: string;
  originalContent: string;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export interface UserState {
  role: 'teacher' | 'student';
  selectedLanguage: LanguageCode;
}
