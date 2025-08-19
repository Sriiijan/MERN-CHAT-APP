import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import React from "react";
import {
  isLastMessage,
  isSameSender,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/chatProvider.js";

// Helper function to calculate margin for same sender
const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

const ScrollableChat = ({ messages }) => {
  console.log("📨 ScrollableChat RENDER - messages:", messages?.length);
  
  const { user } = ChatState();
  const scrollRef = useRef(null);

  // Force re-render trigger
  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    console.log("📜 ScrollableChat useEffect - messages changed:", messages?.length);
    setRenderKey(prev => prev + 1); // Force re-render
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box
      ref={scrollRef}
      overflowY="auto"
      height="400px" // Set explicit height
      maxHeight="60vh" // Responsive height
      minHeight="200px"
      width="100%"
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          width: '10px',
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}
      sx={{
        '&': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1',
        }
      }}
    >
      {console.log("🎨 About to render messages:", messages?.length)}
      {messages && messages.length > 0 ? (
        messages.map((m, i) => {
          console.log(`🔹 Rendering message ${i}:`, m);
          return (
            <div style={{ display: "flex" }} key={m._id}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
                {m.content}
              </span>
            </div>
          );
        })
      ) : (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          color="gray.500"
        >
          No messages yet. Start a conversation!
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ScrollableChat, (prevProps, nextProps) => {
  const isSame = prevProps.messages?.length === nextProps.messages?.length;
  console.log("🔄 React.memo comparison:", {
    prevLength: prevProps.messages?.length || 0,
    nextLength: nextProps.messages?.length || 0,
    shouldSkipRender: isSame
  });
  return isSame;
});