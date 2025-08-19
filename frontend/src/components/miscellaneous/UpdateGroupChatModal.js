import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import UserBadgeItem from "../authentication/UserAvatar/UserBadgeItem";
import UserListItem from "../authentication/UserAvatar/UserListItem";
import { ChatState } from "../../context/chatProvider";
import axios from "axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = ChatState();

  const [groupChatName, setGroupChatName] = useState("");
  const [renameloading, setRenameLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [search, setSearch] = useState("");

  const toast= useToast()

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");  // clear input after rename
      onClose();             // close modal (optional UX improvement)
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to update the chat name",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setRenameLoading(false); // always stop loading
      setGroupChatName("")
    }
  };


  const handleSearch = async (query) => {
        setSearch(query);
        if(!query) return;
        try {
            setLoading(true);
            const {data}= await axios.get(`/api/user?search=${query}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            console.log("Search Result:", data);
            setLoading(false);
            setSearchResult(data.data);
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-center",
            });
        }
    }

  const handleAddUser = async (userToAdd) => {
    if(selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({
          title: "Error Occurred!",
          description: "User Already in Group",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
      });
      return;
    }

    if(selectedChat.groupAdmin._id !== user._id) {
      toast({
          title: "Error Occurred!",
          description: "Only adims can add someone",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
      });
      return;
    }
    try {
      setLoading(true);
      // console.log("CHAT ID: ",selectedChat._id)
      // console.log("USER ID: ",userToAdd._id)

      const { data } = await axios.put(
        "/api/chat/groupAdd",
        {
          chatId: selectedChat._id,
          usersId: userToAdd._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      
      setSelectedChat(data.data);
      
    } catch (error) {
      toast({
          title: "Error Occurred!",
          description: "Failed to addd in group",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-center",
      });
    }
    // setFetchAgain(!fetchAgain);
    setLoading(false);
  };

  const handleRemove = async (userToRemove) => {
    // call API to remove user
    if(selectedChat.groupAdmin._id !== user._id) {
      toast({
          title: "Error Occurred!",
          description: "Only adims can remove someone",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
      });
      return;
    }
    try {
      const { data } = await axios.put(
        "/api/chat/groupRemove",
        {
          chatId: selectedChat._id,
          usersId: userToRemove._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      userToRemove === user._id ? selectedChat() : setSelectedChat(data.data)
      fetchMessages();
    } catch (error) {
      toast({
          title: "Error Occurred!",
          description: "Failed to addd from group",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
      });
    }
    setLoading(false);
    // setFetchAgain(!fetchAgain); // refresh chats
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" fontFamily="Work sans" d="flex" justifyContent="center">
            {selectedChat.chatName}
            {console.log("Rename response:", selectedChat.chatName)}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl d="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
