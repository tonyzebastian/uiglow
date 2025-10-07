import { redirect } from "next/navigation";
import { navItems } from "./navigation-config";

export default function ToolsPage() {
  // Redirect to the first available navigation item
  redirect(navItems[0].href);
}
