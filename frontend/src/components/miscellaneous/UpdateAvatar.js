import { 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  useToast, 
  Text,
  Image,
  Progress,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  VStack,
  HStack,
  Box,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import React, { useState, useRef } from 'react'
import axios from 'axios';
import { ViewIcon } from '@chakra-ui/icons';

const UpdateAvatar = ({ user, children, onAvatarUpdate }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const toast = useToast();

    // File validation
    const validateFile = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please select a JPEG, PNG, or WebP image",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return false;
        }
        
        if (file.size > maxSize) {
            toast({
                title: "File too large",
                description: "Please select an image smaller than 5MB",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return false;
        }
        
        return true;
    };

    const handleFileSelect = (file) => {
        if (!file) {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (!validateFile(file)) {
            return;
        }

        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const submitHandler = async () => {
        if (!selectedFile) {
            toast({
                title: "No file selected",
                description: "Please select an image to upload",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (!user?.token) {
            toast({
                title: "Authentication Error",
                description: "Please log in again to update your avatar",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        
        setLoading(true);
        setUploadProgress(0);
        
        try {
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            
            const { data } = await axios.patch(
                "/api/user/avatar",
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        // Note: Don't set Content-Type for FormData, let browser set it with boundary
                    },
                    timeout: 30000,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            );
            
            toast({
                title: "Avatar Updated Successfully",
                description: "Your profile picture has been updated",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            
            console.log("API Response:", data); // Debug log
            
            // Create updated user object with new avatar
            // The avatar URL is in data.data.avatar based on your API response
            const newAvatarUrl = data.data?.avatar || data.avatar;
            
            const updatedUser = { 
                ...user, // Preserve all existing user data
                avatar: newAvatarUrl
            };
            
            console.log("Updated User:", updatedUser); // Debug log
            
            // Update localStorage
            localStorage.setItem("userInfo", JSON.stringify(updatedUser));
            
            // Call callback if provided to update parent component
            if (onAvatarUpdate) {
                onAvatarUpdate(updatedUser);
            }
            
            // Close modal and reset form immediately
            onClose();
            resetForm();
            
        } catch (error) {
            console.error('Avatar update error:', error);
            
            let errorMessage = "Something went wrong!";
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Please try again.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast({
                title: "Update Failed",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleModalClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    const removeSelectedImage = () => {
        resetForm();
    };

    return (
        <>
            {children ? (
                <span onClick={onOpen} style={{ cursor: 'pointer' }}>
                    {children}
                </span>
            ) : (
                <IconButton 
                    display={{ base: "flex" }} 
                    icon={<ViewIcon />} 
                    onClick={onOpen}
                    aria-label="View profile"
                />
            )}

            <Modal isOpen={isOpen} onClose={handleModalClose} closeOnOverlayClick={!loading}>
                <ModalOverlay />
                <ModalContent maxWidth="400px" minHeight="500px">
                    <ModalHeader 
                        fontSize="2xl" 
                        fontFamily="Work Sans" 
                        textAlign="center"
                        pb={2}
                    >
                        Update Avatar
                    </ModalHeader>
                    <ModalCloseButton isDisabled={loading} />
                    
                    <ModalBody>
                        <VStack spacing={6} align="center">
                            {/* Current Avatar */}
                            <VStack spacing={2}>
                                <Text fontSize="sm" color="gray.600">Current Avatar</Text>
                                <Image
                                    borderRadius="full"
                                    boxSize="120px"
                                    src={user.avatar}
                                    alt={user.name}
                                    border="2px solid"
                                    borderColor="gray.200"
                                />
                                <Text fontSize="lg" fontWeight="semibold">{user.name}</Text>
                            </VStack>

                            {/* File Upload */}
                            <FormControl>
                                <FormLabel fontSize="sm">Choose New Avatar</FormLabel>
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    p={1.5}
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                    isDisabled={loading}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Max size: 5MB. Formats: JPEG, PNG, WebP
                                </Text>
                            </FormControl>

                            {/* Image Preview */}
                            {imagePreview && (
                                <VStack spacing={3}>
                                    <Text fontSize="sm" color="gray.600">Preview</Text>
                                    <Box position="relative">
                                        <Image
                                            borderRadius="full"
                                            boxSize="100px"
                                            src={imagePreview}
                                            alt="Preview"
                                            border="2px solid"
                                            borderColor="blue.200"
                                        />
                                        {!loading && (
                                            <Button
                                                size="xs"
                                                colorScheme="red"
                                                variant="solid"
                                                position="absolute"
                                                top="-10px"
                                                right="-10px"
                                                borderRadius="full"
                                                onClick={removeSelectedImage}
                                                fontSize="xs"
                                                minWidth="auto"
                                                height="20px"
                                                px={2}
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </Box>
                                </VStack>
                            )}

                            {/* Upload Progress */}
                            {loading && (
                                <VStack spacing={2} width="100%">
                                    <Text fontSize="sm">Uploading... {uploadProgress}%</Text>
                                    <Progress value={uploadProgress} width="100%" colorScheme="blue" />
                                </VStack>
                            )}

                            {/* File Info */}
                            {selectedFile && !loading && (
                                <Alert status="info" borderRadius="md">
                                    <AlertIcon />
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="sm" fontWeight="medium">
                                            Selected: {selectedFile.name}
                                        </Text>
                                        <Text fontSize="xs">
                                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </Text>
                                    </VStack>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <HStack spacing={3}>
                            <Button 
                                variant="ghost" 
                                onClick={handleModalClose}
                                isDisabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                onClick={submitHandler}
                                isLoading={loading}
                                loadingText="Updating..."
                                isDisabled={!selectedFile}
                            >
                                Update Avatar
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateAvatar;