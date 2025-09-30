# Chat Component Technical Documentation

## Overview
A Next.js chat component for displaying conversations between two people with support for text messages, images, link badges, and configurable loading states.

## Project Structure
```
/components
  /Chat
    - ChatComponent.js
    - index.js (optional barrel export)
/app
  - page.js
```

## Dependencies
```json
{
  "react": "^18.0.0",
  "framer-motion": "^10.0.0",
  "tailwindcss": "^3.0.0"
}
```

## Component Architecture

### ChatComponent.js
**Location**: `/components/Chat/ChatComponent.js`

#### Props Interface
```javascript
interface ChatComponentProps {
  config: {
    leftPerson: PersonConfig,
    rightPerson: PersonConfig,
    messages: MessageConfig[]
  }
}

interface PersonConfig {
  name: string;
  avatar: string; // Image URL
}

interface MessageConfig {
  id: string | number;
  sender: 'left' | 'right';
  type: 'text' | 'image' | 'text-with-links';
  content: string; // Text content or image URL
  links?: LinkConfig[]; // Only for text-with-links type
  loader?: LoaderConfig;
}

interface LinkConfig {
  text: string;
  url: string;
  icon?: string; // Optional icon class or component
}

interface LoaderConfig {
  enabled: boolean;
  delay: number; // in milliseconds
  duration: number; // loader display duration in ms
}
```

#### Key Features
- **Responsive Design**: Mobile-first layout optimized for chat interfaces
- **Animation Support**: Uses Framer Motion for smooth message entrance animations
- **Flexible Message Types**: Supports text, images, and text with link badges
- **Configurable Loaders**: Per-message loader configuration with custom delays
- **Avatar Integration**: Profile images for both conversation participants

#### Component Structure
```javascript
// Main component structure
ChatComponent
├── PersonAvatar (left)
├── MessagesContainer
│   ├── MessageItem (multiple)
│   │   ├── MessageLoader (conditional)
│   │   ├── MessageBubble
│   │   │   ├── TextContent
│   │   │   ├── ImageContent
│   │   │   └── LinkBadges (conditional)
│   │   └── PersonAvatar (right, conditional)
```

## Configuration Guide

### page.js Setup
**Location**: `/app/page.js`

#### Basic Configuration Structure
```javascript
const chatConfig = {
  leftPerson: {
    name: "Alice Johnson",
    avatar: "https://example.com/alice-avatar.jpg"
  },
  rightPerson: {
    name: "Bob Smith", 
    avatar: "https://example.com/bob-avatar.jpg"
  },
  messages: [
    // Message configurations here
  ]
};
```

#### Message Configuration Examples

**1. Simple Text Message**
```javascript
{
  id: 1,
  sender: 'left',
  type: 'text',
  content: 'Hello! How are you doing today?',
  loader: {
    enabled: true,
    delay: 1000,
    duration: 2000
  }
}
```

**2. Image Message**
```javascript
{
  id: 2,
  sender: 'right',
  type: 'image',
  content: 'https://example.com/shared-image.jpg',
  loader: {
    enabled: true,
    delay: 500,
    duration: 1500
  }
}
```

**3. Text with Link Badges**
```javascript
{
  id: 3,
  sender: 'left',
  type: 'text-with-links',
  content: 'Check out these resources I found:',
  links: [
    {
      text: 'Documentation',
      url: 'https://docs.example.com',
      icon: 'document-icon' // optional
    },
    {
      text: 'GitHub Repository',
      url: 'https://github.com/example/repo',
      icon: 'github-icon' // optional
    }
  ],
  loader: {
    enabled: false // No loader for this message
  }
}
```

**4. Message without Loader**
```javascript
{
  id: 4,
  sender: 'right',
  type: 'text',
  content: 'Thanks for sharing!',
  // No loader config = no loader shown
}
```

## Implementation Guidelines

### Styling Classes (Tailwind CSS)
```css
/* Chat Container */
.chat-container {
  @apply max-w-md mx-auto bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto;
}

/* Message Alignment */
.message-left {
  @apply flex items-start space-x-2 mb-4;
}

.message-right {
  @apply flex items-start space-x-2 mb-4 flex-row-reverse space-x-reverse;
}

/* Chat Bubbles */
.bubble-left {
  @apply bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-xs;
}

.bubble-right {
  @apply bg-blue-500 text-white rounded-lg rounded-tr-none p-3 shadow-sm max-w-xs;
}

/* Avatar Styles */
.avatar {
  @apply w-8 h-8 rounded-full object-cover flex-shrink-0;
}

/* Link Badge */
.link-badge {
  @apply inline-flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 
         rounded-full px-3 py-1 text-sm text-gray-700 transition-colors
         cursor-pointer border border-gray-200;
}
```

### Animation Configuration (Framer Motion)
```javascript
// Message entrance animation
const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Loader animation
const loaderVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

## Usage Example

### Complete page.js Implementation
```javascript
'use client';

import React from 'react';
import ChatComponent from '../components/Chat/ChatComponent';

const ChatPage = () => {
  const chatConfig = {
    leftPerson: {
      name: "Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e55d8e?w=150"
    },
    rightPerson: {
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    messages: [
      {
        id: 1,
        sender: 'left',
        type: 'text',
        content: 'Hey! Did you see the latest project updates?',
        loader: {
          enabled: true,
          delay: 1000,
          duration: 2000
        }
      },
      {
        id: 2,
        sender: 'right',
        type: 'text-with-links',
        content: 'Yes! Here are some useful links:',
        links: [
          {
            text: 'Project Dashboard',
            url: 'https://dashboard.example.com'
          },
          {
            text: 'API Docs',
            url: 'https://api.example.com/docs'
          }
        ],
        loader: {
          enabled: true,
          delay: 2500,
          duration: 1500
        }
      },
      {
        id: 3,
        sender: 'left',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300',
        loader: {
          enabled: true,
          delay: 4000,
          duration: 1000
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Chat Demo</h1>
        <ChatComponent config={chatConfig} />
      </div>
    </div>
  );
};

export default ChatPage;
```

## Development Notes

### State Management
- Use `useState` for message visibility and loader states
- Use `useEffect` with timers for loader delays and message sequencing
- Consider `useCallback` for performance optimization with large message lists

## File Templates

### ChatComponent.js Boilerplate
```javascript
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatComponent = ({ config }) => {
  // Component implementation here
  return (
    <div className="chat-container">
      {/* Chat implementation */}
    </div>
  );
};

export default ChatComponent;
```

This documentation provides a complete technical specification for implementing your chat component with Next.js, Tailwind CSS, and Framer Motion.