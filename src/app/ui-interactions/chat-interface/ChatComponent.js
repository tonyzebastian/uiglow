'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2 } from 'lucide-react';

// Individual message component that manages its own state
const MessageWrapper = ({ message, config, uiConfig, previousMessageComplete, onMessageComplete, previousMessage, nextMessage, onVisibilityChange, isNextVisible }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messageCompleted, setMessageCompleted] = useState(false);

  useEffect(() => {
    const { loader } = message;

    if (!previousMessageComplete) {
      return;
    }

    if (loader?.enabled) {
      // Show loader after a short delay (not using the absolute delay from config)
      const loaderTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 500); // Small delay before showing loader

      // Show message after loader duration
      const messageTimeout = setTimeout(() => {
        setIsLoading(false);
        setIsVisible(true);
        if (onVisibilityChange) onVisibilityChange(message.id);
      }, 500 + (loader.duration || 1000));

      return () => {
        clearTimeout(loaderTimeout);
        clearTimeout(messageTimeout);
      };
    } else {
      // Show message immediately
      const messageTimeout = setTimeout(() => {
        setIsVisible(true);
        if (onVisibilityChange) onVisibilityChange(message.id);
      }, 0);

      return () => clearTimeout(messageTimeout);
    }
  }, [message, previousMessageComplete, onVisibilityChange]);

  const handleContentReady = () => {
    if (!messageCompleted) {
      setMessageCompleted(true);
      // Notify that this message is complete after animation finishes
      setTimeout(() => {
        if (onMessageComplete) onMessageComplete();
      }, 350); // Match the message animation duration
    }
  };

  const isLeft = message.sender === 'left';
  const person = isLeft ? config.leftPerson : config.rightPerson;

  // Check if previous message is from the same sender
  const isContinuation = previousMessage && previousMessage.sender === message.sender;
  // Check if next message is from the same sender
  const nextMessageSameSender = nextMessage && nextMessage.sender === message.sender;

  // Show avatar only if next message from same sender is not visible yet
  const shouldShowAvatar = !nextMessageSameSender || !isNextVisible;

  const messageClass = isLeft
    ? "flex items-end gap-3"
    : "flex items-end gap-3 flex-row-reverse";

  // Don't render anything if neither loading nor visible
  if (!isLoading && !isVisible) {
    return null;
  }

  return (
    <div className={messageClass}>
      <AnimatePresence mode="wait">
        {shouldShowAvatar ? (
          <motion.img
            key="avatar"
            src={person.avatar}
            alt={person.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-[0.5px] border-white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          />
        ) : (
          <div className="w-8 h-8 flex-shrink-0" key="spacer" />
        )}
      </AnimatePresence>
      {(isLoading || isVisible) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col"
          style={{ alignItems: isLeft ? 'flex-start' : 'flex-end' }}
        >
          {!isContinuation && (
            <motion.div
              className="text-xs text-orange-950 mb-1 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.25 }}
            >
              {person.name}
            </motion.div>
          )}
          <MessageBubble
            message={message}
            isLeft={isLeft}
            uiConfig={uiConfig}
            onContentReady={handleContentReady}
            isLoading={isLoading}
            isVisible={isVisible}
          />
        </motion.div>
      )}
    </div>
  );
};

// Helper components
const MessageLoader = ({ dotColor = '#9ca3af' }) => (
  <motion.div
    className="flex items-center gap-1 px-3 py-2"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
  >
    <motion.div
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: dotColor }}
      animate={{
        y: [0, -6, 0]
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: dotColor }}
      animate={{
        y: [0, -6, 0]
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.15
      }}
    />
    <motion.div
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: dotColor }}
      animate={{
        y: [0, -6, 0]
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3
      }}
    />
  </motion.div>
);

const LinkBadge = ({ link, linkStyle }) => (
  <div
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border"
    style={{
      backgroundColor: linkStyle.backgroundColor,
      color: linkStyle.textColor,
      borderColor: linkStyle.borderColor
    }}
  >
    <Link2 size={12} color={linkStyle.iconColor} />
    <span>{link.text}</span>
  </div>
);

const MessageBubble = ({ message, isLeft, uiConfig, onContentReady, isLoading, isVisible }) => {
  const chatStyle = isLeft ? uiConfig.leftChat : uiConfig.rightChat;
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // For text messages, call onContentReady when visible
    if (isVisible && (message.type === 'text' || message.type === 'text-with-links')) {
      if (onContentReady) onContentReady();
    }
  }, [isVisible, message.type, onContentReady]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    // For image messages, call onContentReady after image loads
    if (onContentReady) onContentReady();
  };

  const bubbleStyle = {
    backgroundColor: chatStyle.backgroundColor,
    color: chatStyle.textColor,
    borderColor: chatStyle.borderColor,
    borderWidth: chatStyle.showBorder ? '0.5px' : '0'
  };

  const roundedClass = isLeft
    ? "rounded-br-lg rounded-tl-lg rounded-tr-lg"
    : "rounded-bl-lg rounded-tl-lg rounded-tr-lg";

  return (
    <div
      className={`${roundedClass} p-4 max-w-sm border-solid relative`}
      style={bubbleStyle}
    >
      <AnimatePresence mode="wait">
        {isLoading && !isVisible ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <MessageLoader dotColor={uiConfig.loader?.dotColor} />
          </motion.div>
        ) : isVisible ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed" style={{ color: chatStyle.textColor }}>{message.content}</p>
            )}

            {message.type === 'image' && (
              <div className="relative">
                {!imageLoaded && (
                  <div className="w-full h-32 flex items-center justify-center">
                    <MessageLoader dotColor={uiConfig.loader?.dotColor} />
                  </div>
                )}
                <img
                  src={message.content}
                  alt="Chat image"
                  className={`rounded max-w-full max-h-64 h-auto object-cover ${!imageLoaded ? 'hidden' : ''}`}
                  onLoad={handleImageLoad}
                />
              </div>
            )}

            {message.type === 'text-with-links' && (
              <div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: chatStyle.textColor }}>{message.content}</p>
                <div className="flex flex-wrap gap-1">
                  {message.links?.map((link, index) => (
                    <LinkBadge key={index} link={link} linkStyle={uiConfig.linkBubbles} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const ChatComponent = ({ config, uiConfig }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [completedMessages, setCompletedMessages] = useState([]);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [key, setKey] = useState(0);

  // Default UI configuration
  const defaultUiConfig = {
    containerWidth: 400,
    containerHeight: 500,
    backgroundColor: '#ffffff',
    autoRestart: false,
    restartDelay: 3000,
    loader: {
      dotColor: '#9ca3af'
    },
    linkBubbles: {
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
      iconColor: '#374151',
      borderColor: '#e5e7eb'
    },
    leftChat: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#d1d1d1',
      showBorder: true
    },
    rightChat: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#d1d1d1',
      showBorder: true
    }
  };

  const ui = { ...defaultUiConfig, ...uiConfig };

  const handleMessageComplete = (messageId) => {
    setCompletedMessages(prev => {
      const newCompleted = [...prev, messageId];

      // Check if all messages are complete
      if (newCompleted.length === config.messages.length && ui.autoRestart) {
        setTimeout(() => {
          // Reset everything by changing key
          setCompletedMessages([]);
          setVisibleMessages([]);
          setKey(prevKey => prevKey + 1);
        }, ui.restartDelay);
      }

      return newCompleted;
    });
  };

  const handleVisibilityChange = (messageId) => {
    setVisibleMessages(prev => {
      if (!prev.includes(messageId)) {
        return [...prev, messageId];
      }
      return prev;
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    // Create a mutation observer to watch for new messages being added
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [key]);

  useEffect(() => {
    scrollToBottom();
  }, [config.messages, completedMessages]);

  // Convert hex to rgba for gradient
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      key={key}
      className="mx-auto rounded-lg relative"
      style={{
        width: `${ui.containerWidth}px`,
        height: `${ui.containerHeight}px`,
        backgroundColor: ui.backgroundColor
      }}
    >
      {/* Top fade overlay - fixed to container */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10 rounded-t-lg"
           style={{
             background: `linear-gradient(to bottom, ${hexToRgba(ui.backgroundColor, 1)} 0%, ${hexToRgba(ui.backgroundColor, 0.95)} 20%, ${hexToRgba(ui.backgroundColor, 0.8)} 40%, ${hexToRgba(ui.backgroundColor, 0.4)} 70%, ${hexToRgba(ui.backgroundColor, 0)} 100%)`
           }}
      />

      <div
        ref={containerRef}
        className="p-8 overflow-y-scroll h-full"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="min-h-full flex flex-col justify-end">
          {config.messages.map((message, index) => {
            const previousMessageComplete = index === 0 || completedMessages.includes(config.messages[index - 1].id);
            const previousMessage = index > 0 ? config.messages[index - 1] : null;
            const nextMessage = index < config.messages.length - 1 ? config.messages[index + 1] : null;
            const isNextVisible = nextMessage ? visibleMessages.includes(nextMessage.id) : false;
            const isContinuation = previousMessage && previousMessage.sender === message.sender;
            const spacingClass = index === 0 ? "" : (isContinuation ? "mt-1.5" : "mt-8");
            return (
              <div key={message.id} className={spacingClass}>
                <MessageWrapper
                  message={message}
                  config={config}
                  uiConfig={ui}
                  previousMessageComplete={previousMessageComplete}
                  onMessageComplete={() => handleMessageComplete(message.id)}
                  onVisibilityChange={handleVisibilityChange}
                  previousMessage={previousMessage}
                  nextMessage={nextMessage}
                  isNextVisible={isNextVisible}
                />
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;