import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import type { RouteObject } from "react-router-dom";
import { useLoadingBar } from "react-top-loading-bar";
import { createAppRoutesConfig } from "./app-routing-setup";

export function AppRouting() {
  const { start, complete } = useLoadingBar({
    color: "var(--color-secondary)",
    shadow: false,
    waitingTime: 400,
    transitionTime: 200,
    height: 2,
  });

  const { verify, setLoading } = useAuth();
  const [previousLocation, setPreviousLocation] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const location = useLocation();
  const path = location.pathname.trim();

  useEffect(() => {
    if (firstLoad) {
      setLoading(true);
      verify().finally(() => {
        setLoading(false);
        setFirstLoad(false);
      });
    }
  }, [firstLoad, verify, setLoading]);

  useEffect(() => {
    if (!firstLoad) {
      start("static");
      setPreviousLocation(path);
      complete();
      if (path === previousLocation) {
        setPreviousLocation("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    if (!CSS.escape(window.location.hash)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [previousLocation]);

  return <Outlet />;
}

export function createAppRoutes(): RouteObject[] {
  return createAppRoutesConfig();
}
