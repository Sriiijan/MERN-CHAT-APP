import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  FormControl,
  Input,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { ChatState } from "../../context/chatProvider.js";
import axios from "axios";
import UserListItem from "../authentication/UserAvatar/UserListItem.js";
import UserBadgeItem from "../authentication/UserAvatar/UserBadgeItem.js";


const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const toast= useToast();

    const {user, chats, setChats} = ChatState();

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

    const handleSubmit = async () => {
        if(!groupChatName || !selectedUsers) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        try {
            const {data}= await axios.post('/api/chat/group', {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id))
            },
            {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            toast({
                title: "Failed to create the group chat",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    const handleGroup = async (userToAdd) => {
        if(selectedUsers.includes(userToAdd)) {
            toast({
                title: "User already added",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    }

    const handleDelete = async (deluser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== deluser._id));
    }

    return (
        <>
          <span onClick={onOpen}>{children}</span>
          
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">
                Create Group Chat
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
                <FormControl>
                    <Input
                    placeholder='Chat Name'
                    mb={3}
                    onChange={(e) => setGroupChatName(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <Input
                    placeholder='Add Users'
                    mb={3}
                    onChange={(e) => handleSearch(e.target.value)}
                    />
                </FormControl>
                <Box w={"100%"} display="flex" flexWrap="wrap" pb={3}>
                    {selectedUsers.map((u) => (
                    <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                    />
                ))}
                </Box>
                {loading ? (
                    <div>Loading</div>
                ) : (
                    searchResult?.slice(0,4).map((user) => (
                        <UserListItem 
                        key= {user._id}
                        user= {user}
                        handleFunction={() => handleGroup(user)}
                        />
                    ))
                )}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme='blue' onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
    )
}

export default GroupChatModal
