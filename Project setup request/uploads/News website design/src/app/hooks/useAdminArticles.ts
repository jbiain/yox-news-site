import { useState, useEffect } from "react";
import type { Article } from "../components/NewsCard";

const STORAGE_KEY = "yox_admin_articles";

export function useAdminArticles() {
  const [adminArticles, setAdminArticles] = useState<Article[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminArticles));
  }, [adminArticles]);

  const addArticle = (article: Article) => {
    setAdminArticles((prev) => [article, ...prev]);
  };

  const removeArticle = (id: string) => {
    setAdminArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const updateArticle = (id: string, patch: Partial<Article>) => {
    setAdminArticles((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  };

  return { adminArticles, addArticle, removeArticle, updateArticle };
}
