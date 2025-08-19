import React from 'react'
import { ChatState } from '../../context/chatProvider';
import { Box } from '@chakra-ui/react';
import SingleChat from '../SingleChat.js';

const ChatBox = ({fetchAgain, setFetchChatAgain}) => {
  const{selectedChat, setSelectedChat} = ChatState();
  return <Box
   display={{base: selectedChat? "flex" : "none" , md: "flex"}}
   flexDir= "column"
   alignItems= "center"
   p={3}
   bg= "white"
   w={{base: "100%", md: "68%"}}
   borderRadius="lg"
   borderWidth="1px"
   >
    <SingleChat fetchAgain= {fetchAgain} setFetchChatAgain= {setFetchChatAgain}/>
  </Box>
}

export default ChatBox
