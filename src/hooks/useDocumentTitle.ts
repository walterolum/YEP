import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · YouthRise`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);
}
