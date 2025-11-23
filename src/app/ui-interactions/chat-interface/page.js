import React from 'react';
import ChatComponent from './ChatComponent';
import CenteredPageLayout from "@/components/core/CenteredPageLayout";

export const metadata = {
  title: "Chat Interface - UiGlow",
  description: "Modern chat interface component with message bubbles, typing indicators, and smooth animations.",
};

// ============================================================================
// CHAT INTERFACE PAGE
// ============================================================================

const ChatInterface = () => {
  // ==========================================
  // UI CONFIGURATION
  // ==========================================
  const uiConfig = {
    // Container dimensions
    containerWidth: 750,                    // Width of the chat container in pixels
    containerHeight: 500,                   // Height of the chat container in pixels
    backgroundColor: '#F5EBE0',             // Main container background color

    // Auto-restart settings
    autoRestart: true,                      // Enable/disable auto restart after all messages
    restartDelay: 3000,                     // Delay in ms before restarting (default: 3000ms / 3 seconds)

    // Loading indicator
    loader: {
      dotColor: '#936639'                   // Color of the loading dots
    },

    // Link badges styling
    linkBubbles: {
      backgroundColor: '#F5EBE0',           // Link bubble background color
      textColor: '#936639',                 // Link bubble text color
      iconColor: '#936639',                 // Link bubble icon color
      borderColor: '#F5EBE0'                // Link bubble border color
    },

    // Left side chat bubbles
    leftChat: {
      backgroundColor: '#FDF6EE',           // Background color
      textColor: '#582F0E',                 // Text color
      borderColor: '#E3D5CA',               // Border color
      showBorder: true,                     // Show/hide border
      nameColor: '#936639'                  // Name/username color
    },

    // Right side chat bubbles
    rightChat: {
      backgroundColor: '#EDE0D4',           // Background color
      textColor: '#582F0E',                 // Text color
      borderColor: '#d1d1d1',               // Border color
      showBorder: false,                    // Show/hide border
      nameColor: '#936639'                  // Name/username color
    }
  };

  // ==========================================
  // CHAT CONFIGURATION
  // ==========================================
  const chatConfig = {
    // Chat participants
    leftPerson: {
      name: "Tony",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    rightPerson: {
      name: "Brendon",
      avatar: "https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?q=80&w=2681&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },

    // Message sequence
    messages: [
      {
        id: 1,
        sender: 'left',
        type: 'text',
        content: 'Hey! Did you see the latest project updates?',
        maxWidth: 'max-w-sm',  // Optional: max-w-xs, max-w-sm, max-w-md, max-w-lg, max-w-xl, or custom like 'max-w-[300px]'
        loader: {
          enabled: true,
          delay: 1000,
          duration: 2000
        }
      },
      {
        id: 2,
        sender: 'right',
        type: 'text',
        content: 'Not yet! What\'s new?',
        loader: {
          enabled: true,
          delay: 4000,
          duration: 1500
        }
      },
      {
        id: 3,
        sender: 'left',
        type: 'text-with-links',
        content: 'We\'re on track to complete it by the end of the quarter.',
        maxWidth: 'max-w-md', 
        links: [
          {
            text: 'Substack'
          },
          {
            text: 'Youtube'
          }
        ],
        loader: {
          enabled: true,
          delay: 6000,
          duration: 1800
        }
      },
      {
        id: 4,
        sender: 'left',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1762515303947-cef3ea72386d?q=80&w=2753&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        loader: {
          enabled: false,
          delay: 10500,
          duration: 2000
        }
      },
      {
        id: 5,
        sender: 'right',
        type: 'text',
        content: 'These look great! Thanks for sharing.',
        loader: {
          enabled: true,
          delay: 8500,
          duration: 1200
        }
      },
    ]
  };

  return (
    <CenteredPageLayout>
      <ChatComponent config={chatConfig} uiConfig={uiConfig} />
    </CenteredPageLayout>
  );
};

export default ChatInterface;