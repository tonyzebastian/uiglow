import { redirect } from "next/navigation";
import { navItems } from "./navigation-config";  // We'll create this file

export default function SvgAnimationsPage() {
  // Redirect to the first available navigation item
  redirect(navItems[0].href);
}