import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_ASSEMBLYAI_CONFIG, normalizeAssemblyConfig } from '@/lib/assemblyai';

export const ASSEMBLY_OPTIONS_STORAGE_KEY = 'assemblyai:lastOptions';

const loadInitialConfig = () => {
  if (typeof window === 'undefined') {
    return normalizeAssemblyConfig(DEFAULT_ASSEMBLYAI_CONFIG);
  }

  try {
    const stored = localStorage.getItem(ASSEMBLY_OPTIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return normalizeAssemblyConfig(parsed);
    }
  } catch (error) {
    console.warn('AssemblyAI options load error:', error);
  }

  return normalizeAssemblyConfig(DEFAULT_ASSEMBLYAI_CONFIG);
};

export const useAssemblyAIOptions = () => {
  const [config, setConfigState] = useState(loadInitialConfig);

  const setConfig = useCallback((nextConfig) => {
    setConfigState(normalizeAssemblyConfig(nextConfig));
  }, []);

  const resetConfig = useCallback(() => {
    setConfigState(normalizeAssemblyConfig(DEFAULT_ASSEMBLYAI_CONFIG));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ASSEMBLY_OPTIONS_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('AssemblyAI options save error:', error);
    }
  }, [config]);

  return {
    config,
    setConfig,
    resetConfig
  };
};
