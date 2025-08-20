import React, { useEffect, useState, useRef } from 'react'
import { ChatState } from '../context/chatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast,  } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {getSender, getSenderFull} from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import "./styles.css"
import ScrollableChat from './ScrollableChat.js';
import io from "socket.io-client"
import Lottie from "react-lottie";
import animationData from "../animations/typing.json"

const ENDPOINT= "http://localhost:5000"
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchChatAgain}) => {
    const {user, selectedChat, setSelectedChat, notification, setNotification} = ChatState();

    const toast = useToast();
    const typingTimeoutRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [socketConnected, setSocketConnected]= useState(false);
    const [typing, setTyping]= useState(false);
    const [isTyping, setIsTyping]= useState(false);

    // FIXED: Corrected typo in autoPlay
    const defaultOptions= {
      loop: true,
      autoPlay: true, // Fixed: was "autuPlay"
      animationData: animationData, // More explicit
      rendererSettings: { // Fixed: was "renderSettings"
        preserveAspectRatio: "xMidYMid slice"
      }
    };

    // Track messages state changes
    useEffect(() => {
      console.log("🔥 MESSAGES STATE CHANGED IN COMPONENT:", messages.length);
      setRenderTrigger(prev => prev + 1);
    }, [messages]);


    const fetchMessages = async () => {
      console.log("🚀 fetchMessages STARTED - current messages:", messages.length);
      
      if (!selectedChat) return;
      
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

        socket.emit("join chat", selectedChat._id)
        
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

    // Initialize socket
    useEffect(() => {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      
      socket.on("connected", () => {
        console.log("Socket connected");
        setSocketConnected(true);
      });
      
      socket.on("typing", () => {
        console.log("Received typing event");
        setIsTyping(true);
      });
      
      socket.on("stop typing", () => {
        console.log("Received stop typing event");
        setIsTyping(false);
      });

      return () => {
        socket.off("connected");
        socket.off("typing");
        socket.off("stop typing");
      };
    }, []);

    // Handle selected chat changes
    useEffect(() => {
      console.log("🔥 useEffect triggered, selectedChat ID:", selectedChat?._id);
      console.log("🔥 Current messages length before fetch:", messages.length);
      console.log("🔥 Currently loading:", loading);
      
      // Stop typing when switching chats
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typing && socketConnected) {
        socket.emit("stop typing", selectedChat?._id);
        setTyping(false);
      }
      
      if (selectedChat?._id && !loading) {
        fetchMessages();
      }

      selectedChatCompare = selectedChat;
    }, [selectedChat?._id]);

    
    // console.log("NOTIFICATION: ", notification)

    // Handle incoming messages
    useEffect(() => {
      const handleNewMessage = (newMessageReceived) => {
        if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
          if(!notification.includes(newMessageReceived)){
            setNotification(prevNotifications => [newMessageReceived, ...prevNotifications]);
            setFetchChatAgain(!fetchAgain)
          }
        } else {
          setMessages(prevMessages => [...prevMessages, newMessageReceived]);
        }
      };

      socket.on("message recieved", handleNewMessage);

      return () => {
        socket.off("message recieved", handleNewMessage);
      };
    }, []);

    const sendMessage = async (e) => {
      if (e.key === "Enter" && newMessage) {
        
        // Clear typing immediately when sending
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
        
        try {
          const messageContent = newMessage;
          setNewMessage("");
          
          const { data } = await axios.post(`/api/message`, {
            content: messageContent,
            chatId: selectedChat._id
          }, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });

          socket.emit("new message", data.data);
          setMessages(prev => [...prev, data.data]);

          console.log("MESSAGE SENT:", data);
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

    const typingHandler = (e) => {
      setNewMessage(e.target.value);

      if (!socketConnected) return;

      if (!typing) {
        setTyping(true);
        socket.emit("typing", selectedChat._id);
        console.log("Started typing, emitted typing event");
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout - back to 3 seconds for better UX
      typingTimeoutRef.current = setTimeout(() => {
        console.log("Typing timeout fired, stopping typing");
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }, 3000);
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (typing && socketConnected) {
          socket.emit("stop typing", selectedChat?._id);
        }
      };
    }, []);

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
                {/* IMPROVED: Better styled typing indicator with consistent height */}
                <Box minHeight="10px" display="flex" alignItems="center" mb={1}>
                  {isTyping && (
                    <>
                      <Lottie
                      options={defaultOptions}
                      height={70}
                      width={100}
                      style={{marginBottom: 15, marginLeft: 0}}
                    />
                    </>
                  )}
                </Box>

                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  _focus={{
                    bg: "#D0D0D0",
                    borderColor: "blue.500"
                  }}
                  _hover={{
                    bg: "#D8D8D8"
                  }}
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