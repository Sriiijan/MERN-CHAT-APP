import { Box } from "@chakra-ui/react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../context/chatProvider";
import MyChats from "../components/miscellaneous/MyChats";
import ChatBox from "../components/miscellaneous/ChatBox";
import { useState } from "react";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchChatAgain]= useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats fetchAgain= {fetchAgain}/>}
        {user && <ChatBox fetchAgain= {fetchAgain} setFetchChatAgain= {setFetchChatAgain}/>}
      </Box>
    </div>
  );
};

export default ChatPage;
