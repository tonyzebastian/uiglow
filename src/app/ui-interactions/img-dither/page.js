"use client";

import DotGridImage from "./ImgDither";
import CenteredPageLayout from "@/components/shared/CenteredPageLayout";
import { useTheme } from "@/hooks/useTheme";

export default function DotGrid() {
  const { isDark } = useTheme();

  return (
    <CenteredPageLayout >
      <DotGridImage darkMode={isDark} />
    </CenteredPageLayout>
  );
}
