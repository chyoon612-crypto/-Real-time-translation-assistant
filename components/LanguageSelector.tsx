
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants.ts';
import { LanguageCode } from '../types.ts';

interface Props {
  selected: LanguageCode;
  onChange: (code: LanguageCode) => void;
  label?: string;
}

export const LanguageSelector: React.FC<Props> = ({ selected, onChange, label }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} ({lang.nativeName})
          </option>
        ))}
      </select>
    </div>
  );
};
