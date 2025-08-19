import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/chatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast,  } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {getSender, getSenderFull} from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import "./styles.css"
import ScrollableChat from './ScrollableChat.js';

const SingleChat = ({fetchAgain, setFetchChatAgain}) => {
    const {user, selectedChat, setSelectedChat} = ChatState();

    const toast = useToast();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [renderTrigger, setRenderTrigger] = useState(0);

    // Track messages state changes
    useEffect(() => {
      console.log("🔥 MESSAGES STATE CHANGED IN COMPONENT:", messages.length);
      setRenderTrigger(prev => prev + 1);
    }, [messages]);

    const fetchMessages = async () => {
      console.log("🚀 fetchMessages STARTED - current messages:", messages.length);
      
      if (!selectedChat) return;
      
      // Prevent multiple simultaneous fetches
      if (loading) {
        console.log("🚫 Already loading, skipping fetch");
        return;
      }

      setLoading(true);
      console.log("🚀 setLoading(true) - messages before:", messages.length);
      
      try {
        const { data } = await axios.get(`/api/message/${selectedChat._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        
        console.log("API response:", data);
        console.log("Messages from API:", data.data);
        console.log("Setting messages to:", data.data);
        
        if (data.data && Array.isArray(data.data)) {
          setMessages([...data.data]);
          console.log("✅ IMMEDIATELY after setMessages:", data.data.length);
          console.log("Messages set successfully, length:", data.data.length);
        } else {
          console.error("Invalid messages data:", data.data);
          setMessages([]);
        }
        
      } catch (error) {
        console.error("Fetch messages error:", error);
        setMessages([]);
        toast({
          title: "Error Occurred!",
          description: "Failed to load the chat",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      
      setLoading(false);
    }

    useEffect(() => {
      console.log("🔥 useEffect triggered, selectedChat ID:", selectedChat?._id);
      console.log("🔥 Current messages length before fetch:", messages.length);
      console.log("🔥 Currently loading:", loading);
      
      if (selectedChat?._id && !loading) {
        fetchMessages();
      }
    }, [selectedChat?._id]);

    const sendMessage = async (e) => {
      if (e.key === "Enter" && newMessage) {
        try {
          setNewMessage("")
          const { data } = await axios.post(`/api/message`, {
            content: newMessage,
            chatId: selectedChat._id
          }, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          
          setNewMessage("")
          setMessages(prev => [...prev, data.data]);

          console.log("MESSAGE SENT:", data)
        } catch (error) {
          toast({
            title: "Error Occurred!",
            description: "Failed to send Messages",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
    };

    const typinghandler = (e) => {
      setNewMessage(e.target.value);
      // Typing indicator
    };

    console.log("About to render ScrollableChat with messages:", messages);
    console.log("Messages length before render:", messages.length);

    return (
      <>
        {console.log("🔴 SingleChat RENDER - Messages length:", messages.length, "Time:", Date.now())}
        {selectedChat ? (
          <>
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              pb={3}
              px={3}
              fontFamily={"Work sans"}
              display={"flex"}
              w={"100%"}
              justifyContent={{ base: "space-between" }}
              alignItems={"center"}
            >
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => { setSelectedChat(""); }}
              />
              {!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchChatAgain={setFetchChatAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              )}
            </Text>
            <Box
              display={'flex'}
              flexDir={'column'}
              justifyContent={"flex-end"}
              p={3}
              bg={"#E8E8E8"}
              w={"100%"}
              h={"100%"}
              borderRadius={"lg"}
              overflow={"hidden"}
            >
              {loading ? (
                <Spinner
                  size={"xl"}
                  w={"20"}
                  h={"20"}
                  alignSelf={"center"}
                  margin={"auto"}
                />
              ) : (
                <div>
                  <div className='messages' key={messages.length}>
                    {console.log("🎯 Rendering messages container with length:", messages.length)}
                    <ScrollableChat
                      key={`messages-${selectedChat?._id}-${messages.length}`}
                      messages={messages}
                    />
                  </div>
                </div>
              )}
              <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typinghandler}
                />
              </FormControl>
            </Box>
          </>
        ) : (
          <Box display={"flex"} alignItems="center" justifyContent={"center"} h="100%">
            <Text fontSize={"3xl"} pb={3} px={3} fontFamily={"Work sans"}>
              Click on a chat to start messaging
            </Text>
          </Box>
        )}
      </>
    )
}

export default SingleChat