"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

export default function AuthBootstrap() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchMe();
    fetchSettings();
  }, [fetchMe, fetchSettings]);

  return null;
}
