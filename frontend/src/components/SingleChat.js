import React from 'react'
import { ChatState } from '../context/chatProvider'
import { Box, flexbox, IconButton, Text } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {getSender, getSenderFull} from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';

const SingleChat = ({fetchAgain, setFetchChatAgain}) => {
    const {user, selectedChat, setSelectedChat} = ChatState();
  return (
    <>
      {selectedChat ? (
        <>
            <Text
            fontSize={{base: "28px", md: "30px"}}
            pb={3}
            px={3}
            fontFamily={"Work sans"}
            display={"flex"}
            w={"100%"}
            justifyContent={{base:"space-between"}}
            alignItems={"center"}
            >
                <IconButton
                display={{base: "flex", md: "none"}}
                icon= {<ArrowBackIcon/>}
                onClick={() => {setSelectedChat("");}}
                >
                    
                </IconButton>
                    {!selectedChat.isGroupChat ? (
                        <>
                            {getSender(user, selectedChat.users)}
                            <ProfileModal user= {getSenderFull(user, selectedChat.users)}/>
                        </> 
                        ) : ( <>
                            {selectedChat.chatName.toUpperCase()}
                            <UpdateGroupChatModal
                            fetchAgain={fetchAgain}
                            setFetchChatAgain={setFetchChatAgain}    
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
              {/* Messages Here */}
            </Box>
        </>
      ) : (
        <Box display={"flex"} alignItems= "center" justifyContent={"center"} h="100%">
            <Text fontSize={"3xl"} pb={3} px={3} fontFamily={"Work sans"}>
                Click on a chat to start messaging
            </Text>
        </Box>
      )
    
    }
    </>
  )
}

export default SingleChat
