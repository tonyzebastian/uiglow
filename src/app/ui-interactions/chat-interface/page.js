'use client';

import React from 'react';
import ChatComponent from './ChatComponent';

const ChatInterface = () => {
  // ==========================================
  // UI CONFIGURATION - Edit these values to customize the chat interface
  // ==========================================
  const uiConfig = {
    containerWidth: 500,                    // Width of the chat container in pixels
    containerHeight: 450,                   // Height of the chat container in pixels
    backgroundColor: '#F7F0E8',             // Main container background color
    autoRestart: true,                      // Enable/disable auto restart after all messages
    restartDelay: 3000,                     // Delay in ms before restarting (default: 3000ms / 3 seconds)

    loader: {
      dotColor: '#9ca3af'                   // Color of the loading dots
    },

    linkBubbles: {
      backgroundColor: '#f3f4f6',           // Link bubble background color
      textColor: '#374151',                 // Link bubble text color
      iconColor: '#374151',                 // Link bubble icon color
      borderColor: '#e5e7eb'                // Link bubble border color
    },

    leftChat: {
      backgroundColor: '#FDF6EE',           // Left chat bubble background color
      textColor: '#000000',                 // Left chat text color
      borderColor: '#d1d1d1',              // Left chat border color
      showBorder: true                      // Show/hide border for left chat bubbles
    },

    rightChat: {
      backgroundColor: '#F1E7DF',           // Right chat bubble background color
      textColor: '#000000',                 // Right chat text color
      borderColor: '#d1d1d1',              // Right chat border color
      showBorder: true                      // Show/hide border for right chat bubbles
    }
  };

  const chatConfig = {
    leftPerson: {
      name: "Tony",
      avatar: "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/10_qujlpy.jpg"
    },
    rightPerson: {
      name: "Brendon",
      avatar: "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg"
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
        content: 'Here are some useful resources I found:',
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
        type: 'text',
        content: 'These look great! Thanks for sharing.',
        loader: {
          enabled: true,
          delay: 8500,
          duration: 1200
        }
      },
      {
        id: 5,
        sender: 'left',
        type: 'image',
        content: 'https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/12_kitql2.jpg',
        loader: {
          enabled: true,
          delay: 10500,
          duration: 2000
        }
      }
    ]
  };

  return <ChatComponent config={chatConfig} uiConfig={uiConfig} />;
};

export default ChatInterface;