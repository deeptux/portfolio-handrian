import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PROJECTS } from '@/data/data2';

// Finite state machine identifiers for the WebGL scene experience.
export const SCENE_STATES = {
  HOME: 'HOME',
  PROJECTS_LIST: 'PROJECTS_LIST',
  PROJECT_DETAIL: 'PROJECT_DETAIL',
  ABOUT_STAGE: 'ABOUT_STAGE',
};

// Camera rigs for each FSM state.
// Position = camera 3D position, Target = lookAt.
export const CAMERA_RIGS = {
  HOME: {
    position: [0, 2.2, 6.8],
    target: [0, 0.55, 0],
    fov: 42,
  },
  PROJECTS_LIST: {
    position: [-2.6, 1.4, 3.6],
    target: [-1.9, 0.9, -0.2],
    fov: 38,
  },
  PROJECT_DETAIL: {
    position: [-3.6, 1.1, 2.0],
    target: [-2.8, 0.9, -0.8],
    fov: 34,
  },
  ABOUT_STAGE: {
    position: [3.1, 1.7, 4.0],
    target: [2.2, 1.1, 0],
    fov: 40,
  },
};

// ---- URL sync (hash-based, doesn't fight the SPA router) --------------------
// Route table:  ''         → HOME
//               '#projects' → PROJECTS_LIST
//               '#projects/<slug>' → PROJECT_DETAIL(slug)
//               '#about'    → ABOUT_STAGE

function parseHash(hash) {
  const h = (hash || '').replace(/^#/, '').trim().toLowerCase();
  if (!h) return { state: SCENE_STATES.HOME, activeProjectId: null };
  if (h === 'about') return { state: SCENE_STATES.ABOUT_STAGE, activeProjectId: null };
  if (h === 'projects') return { state: SCENE_STATES.PROJECTS_LIST, activeProjectId: null };
  const m = h.match(/^projects\/(.+)$/);
  if (m) {
    const slug = m[1];
    const known = PROJECTS.find((p) => p.id === slug);
    if (known) return { state: SCENE_STATES.PROJECT_DETAIL, activeProjectId: slug };
    return { state: SCENE_STATES.PROJECTS_LIST, activeProjectId: null };
  }
  return { state: SCENE_STATES.HOME, activeProjectId: null };
}

function serializeHash(state, activeProjectId) {
  switch (state) {
    case SCENE_STATES.PROJECTS_LIST:
      return '#projects';
    case SCENE_STATES.PROJECT_DETAIL:
      return activeProjectId ? `#projects/${activeProjectId}` : '#projects';
    case SCENE_STATES.ABOUT_STAGE:
      return '#about';
    default:
      return '';
  }
}

const SceneStateContext = createContext(null);

export function SceneStateProvider({ children }) {
  // Hydrate initial state from the URL hash on first mount
  const [initial] = useState(() =>
    typeof window === 'undefined'
      ? { state: SCENE_STATES.HOME, activeProjectId: null }
      : parseHash(window.location.hash)
  );
  const [state, setState] = useState(initial.state);
  const [activeProjectId, setActiveProjectId] = useState(initial.activeProjectId);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const syncingFromHash = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  // Listen for browser back/forward → sync state from hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const parsed = parseHash(window.location.hash);
      syncingFromHash.current = true;
      setActiveProjectId(parsed.activeProjectId);
      setState(parsed.state);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Write state back to the hash whenever it changes (unless the change came
  // from a hashchange event to avoid an update loop).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (syncingFromHash.current) {
      syncingFromHash.current = false;
      return;
    }
    const nextHash = serializeHash(state, activeProjectId);
    const currentHash = window.location.hash || '';
    if (currentHash !== nextHash) {
      // Use replaceState for home to keep the URL clean; pushState otherwise so
      // back/forward navigates through states.
      const url = window.location.pathname + window.location.search + nextHash;
      if (nextHash === '') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        window.history.pushState(null, '', url);
      }
    }
  }, [state, activeProjectId]);

  const goHome = useCallback(() => {
    setActiveProjectId(null);
    setState(SCENE_STATES.HOME);
  }, []);

  const goProjects = useCallback(() => {
    setActiveProjectId(null);
    setState(SCENE_STATES.PROJECTS_LIST);
  }, []);

  const goAbout = useCallback(() => {
    setActiveProjectId(null);
    setState(SCENE_STATES.ABOUT_STAGE);
  }, []);

  const openProject = useCallback((id) => {
    setActiveProjectId(id);
    setState(SCENE_STATES.PROJECT_DETAIL);
  }, []);

  const backFromDetail = useCallback(() => {
    setActiveProjectId(null);
    setState(SCENE_STATES.PROJECTS_LIST);
  }, []);

  const value = useMemo(
    () => ({
      state,
      setState,
      activeProjectId,
      setActiveProjectId,
      hoveredProjectId,
      setHoveredProjectId,
      mouse,
      setMouse,
      prefersReducedMotion,
      goHome,
      goProjects,
      goAbout,
      openProject,
      backFromDetail,
    }),
    [state, activeProjectId, hoveredProjectId, mouse, prefersReducedMotion, goHome, goProjects, goAbout, openProject, backFromDetail]
  );

  return <SceneStateContext.Provider value={value}>{children}</SceneStateContext.Provider>;
}

export function useSceneState() {
  const ctx = useContext(SceneStateContext);
  if (!ctx) throw new Error('useSceneState must be used within SceneStateProvider');
  return ctx;
}
