import React, { useEffect } from 'react'
import { ChatState } from '../../context/chatProvider.js'
import { Box, Button, Stack, useToast, Text  } from '@chakra-ui/react'
import axios from 'axios';
import { useState } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from '../ChatLoading.js';
import {getSender} from '../../config/ChatLogics.js';
import GroupChatModal from './GroupChatModal.js';


const MyChats = ({fetchAgain}) => {
  const [loggedUser, setLoggedUser] = useState();
  const {user, selectedChat, setSelectedChat, chats, setChats} = ChatState()

  const toast= useToast();
  
  const fetchChats= async () => {
    try {
      const {data}= await axios.get('/api/chat', {
        headers: {
          Authorization:`Bearer ${user.token}`
        }
      })
      console.log("Fetched chats:", data); 
      setChats(Array.isArray(data.data) ? data.data : [data.data]);

    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain])

  return (
    <Box
    display={{base: selectedChat? "none" : "flex", md: "flex"}}
    flexDir= "column"
    alignItems= "center"
    p={3}
    bg= "white"
    w={{base: "100%", md: "31%"}}
    borderRadius="lg"
    borderWidth="1px"
    >
      <Box
      pb={3}
      px={3}
      fontSize={{base: "28px", md: "30px"}}
      fontFamily={"Work sans"}
      display="flex"
      w="100%"
      justifyContent="space-between"
      alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{base: "17px", md: "20px"}}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
        
      </Box>

      <Box
      display={"flex"}
      flexDir="column"
      p={3}
      bg="white"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflowY="hidden"
      >
        {chats ?  (
          <Stack overflowY= "scroll">
            {chats.map((chat) => (
              
              <Box
              onClick={() => setSelectedChat(chat)}
              cursor="pointer"
              bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
              color={selectedChat === chat ? "white" : "black"}
              px={3}
              py={2}
              borderRadius="lg"
              key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat ? (
                    getSender(loggedUser, chat.users) // getSender is a function that returns the sender's name
                  ) : (chat.chatName)}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  )
}

export default MyChats;