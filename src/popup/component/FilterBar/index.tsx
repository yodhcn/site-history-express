import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { MatchMode } from '@/common/mode';
import { Domain } from '@/common/url';
import { debounce } from '@/common/stream';
import { i18n } from '@/common/i18n';

export interface Props {
  isSite: boolean;
  domain: Domain;
  matchMode: MatchMode;
  onTextChange: (text: string) => void;
  onToggleMatchMode: () => void;
}

export default function FilterBar({ isSite, domain, matchMode, onTextChange, onToggleMatchMode }: Props) {
  const placeholder = useMemo(() => {
    if (matchMode === MatchMode.All || !isSite) {
      return i18n.filterGlobalPlaceholder;
    }
    if (matchMode === MatchMode.Strict) {
      return i18n.filterPlaceholder(domain.sub ? `${domain.sub}.${domain.main}` : domain.main);
    }
    return i18n.filterPlaceholder(`*.${domain.main}`);
  }, [domain, matchMode]);

  const [text, setText] = useState('');
  const debouncedUpdate = useCallback(debounce(onTextChange, 300), []);
  const [shouldHideCaret, setShouldHideCaret] = useState(true);

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newText = event.target.value;
    setText(newText);
    setShouldHideCaret(false);
    debouncedUpdate(newText);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleBtnClick() {
    inputRef.current?.focus();
    onToggleMatchMode();
  }

  return (
    <div className='flex items-center h-[40px] border-t border-[--color-border] shadow-lg shadow-[--color-text]'>
      <input
        ref={inputRef}
        className='flex-auto bg-transparent outline-none border-none h-full px-3 placeholder:text-current placeholder:opacity-50'
        style={{ caretColor: shouldHideCaret ? 'transparent' : undefined }}
        type='text'
        placeholder={placeholder}
        spellCheck={false}
        autoComplete='off'
        value={text}
        onChange={handleTextChange}
        onClick={() => setShouldHideCaret(false)}
      />
      {isSite && (
        <button className='h-full p-3 outline-none opacity-50 hover:opacity-70' onClick={handleBtnClick}>
          <GlobeSvg />
        </button>
      )}
    </div>
  );
}

function GlobeSvg() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='feather feather-globe'
    >
      <circle cx='12' cy='12' r='10'></circle>
      <line x1='2' y1='12' x2='22' y2='12'></line>
      <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path>
    </svg>
  );
}
