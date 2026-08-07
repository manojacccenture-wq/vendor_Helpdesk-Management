import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileThunk } from '../../features/user/store/thunks.js';
import { selectAuthStatus } from '../../features/user/store/selectors.js';

/**
 * AppInitGate guarantees that the application state (authentication profile) 
 * is fully resolved before the Router is allowed to mount.
 * This prevents unauthenticated route flashing and ensures route guards
 * have accurate data immediately on their first render.
 */
export const AppInitGate = ({ children }) => {
  const dispatch = useDispatch();
  const { initialized, loading } = useSelector(selectAuthStatus);

  useEffect(() => {
    // Fire the initial profile fetch to hydrate Redux on bootstrap
    dispatch(fetchProfileThunk());
  }, [dispatch]);

  // Block the entire router from mounting until the profile check finishes
  if (!initialized || loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p className="text-secondary">Initializing Enterprise App...</p>
      </div>
    );
  }

  // Once initialized (whether success or fail), render the Router
  return <>{children}</>;
};
