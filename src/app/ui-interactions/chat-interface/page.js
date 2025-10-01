'use client';

import React from 'react';
import ChatComponent from './ChatComponent';

// ============================================================================
// CHAT INTERFACE PAGE
// ============================================================================

const ChatInterface = () => {
  // ==========================================
  // UI CONFIGURATION
  // ==========================================
  const uiConfig = {
    // Container dimensions
    containerWidth: 550,                    // Width of the chat container in pixels
    containerHeight: 450,                   // Height of the chat container in pixels
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
      avatar: "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/10_qujlpy.jpg"
    },
    rightPerson: {
      name: "Brendon",
      avatar: "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg"
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
        maxWidth: 'max-w-xs', 
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
        content: 'https://res.cloudinary.com/dctgknnt7/image/upload/v1758636253/cld-sample.jpg',
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

  return <ChatComponent config={chatConfig} uiConfig={uiConfig} />;
};

export default ChatInterface;