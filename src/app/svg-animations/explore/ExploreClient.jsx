'use client';

import { useState } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import ClientSidebarWrapper from "@/components/core/ClientSidebarWrapper";
import { navItems } from "../navigation-config";
import { componentConfigs } from "./componentConfigs";

// Component imports
import CometHero from "../comethero/CometHero";
import CoinFlip from "../coinflip/CoinFlip";
import Unlock from "../unlock/Unlock";

// Component registry
const components = {
  'comethero': CometHero,
  'coinflip': CoinFlip,
  'unlock': Unlock,
};

export default function ExploreClient() {
  const [activeComponent, setActiveComponent] = useState('comethero');

  // Transform nav items for explore mode
  const exploreNavItems = navItems.map((item) => {
    const componentKey = item.href.split('/').pop();
    return {
      ...item,
      href: `#${componentKey}`,
      key: componentKey,
      onClick: (e) => {
        e.preventDefault();
        setActiveComponent(componentKey);
      }
    };
  });

  // Render active component with its configuration
  const renderComponent = () => {
    const Component = components[activeComponent];
    const config = componentConfigs[activeComponent];

    if (!Component || !config) return null;

    // Custom render function
    if (config.render) {
      return config.render(Component);
    }

    // Wrapper with props
    if (config.wrapper) {
      return config.wrapper(Component, config.props || {});
    }

    // Default render
    return <Component {...(config.props || {})} />;
  };

  return (
    <ClientSidebarWrapper
      navItems={exploreNavItems}
      activeItem={`/svg-animations/${activeComponent}`}
    >
      <SidebarInset className="flex items-center justify-center border-l border-slate-200 dark:border-slate-900 pl-6 pr-8 py-6">
        {renderComponent()}
      </SidebarInset>
    </ClientSidebarWrapper>
  );
}
