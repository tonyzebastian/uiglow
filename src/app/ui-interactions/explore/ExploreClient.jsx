'use client';

import { useState } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import ClientSidebarWrapper from "@/components/core/ClientSidebarWrapper";
import { navItems } from "../navigation-config";
import { componentConfigs } from "./componentConfigs";

// Component imports
import ImgStack from "../img-stack/ImgStack";
import ImageReveal from "../img-tiles/ImgTile";
import ImageSpotlight from "../img-light/ImageSpotlight";
import SphereImageGrid from "../img-sphere/SphereImageGrid";
import ImageLoader from "../img-loading/ImageLoader";
import ChatComponent from "../chat-interface/ChatComponent";

// Component registry
const components = {
  'img-stack': ImgStack,
  'img-tiles': ImageReveal,
  'img-light': ImageSpotlight,
  'img-sphere': SphereImageGrid,
  'img-loading': ImageLoader,
  'chat-interface': ChatComponent,
};

export default function ExploreClient() {
  const [activeComponent, setActiveComponent] = useState('img-stack');

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

    // Custom render function (for multiple instances)
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
      activeItem={`/ui-interactions/${activeComponent}`}
    >
      <SidebarInset className="flex items-center justify-center border-l border-slate-200 dark:border-slate-900 pl-6 pr-8 py-6">
        {renderComponent()}
      </SidebarInset>
    </ClientSidebarWrapper>
  );
}
