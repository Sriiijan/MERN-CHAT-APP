import { 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  InputGroup, 
  InputRightElement, 
  useToast, 
  VStack,
  Text,
  Image,
  Box,
  Progress
} from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios';
// import { useNavigate } from 'react-router-dom'; // Updated import

const Signup = () => {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleClick = () => setShow(!show);
  const handleConfirmClick = () => setShowConfirm(!showConfirm);
  const toast = useToast();
  // const navigate = useNavigate(); // Updated hook

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const submitHandler = async () => {
    // Validation checks remain the same
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Avatar Required",
        description: "Please select a profile picture",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    // Enhanced password validation
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name.trim()); // Trim whitespace
      formData.append('email', email.toLowerCase().trim()); // Normalize email
      formData.append('password', password);
      formData.append('avatar', selectedFile);
      
      const { data } = await axios.post(
        "/api/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout for file uploads
        }
      );
      
      console.log(data);
      toast({
        title: "Registration Successful",
        description: "Welcome! You can now start chatting.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      // Store user info
      localStorage.setItem("userInfo", JSON.stringify(data));
      
      // Clear form
      resetForm();
      
      // Navigate to chats (uncomment and adjust route as needed)
      // navigate("/chats");
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = "Something went wrong!";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmpassword('');
    setSelectedFile(null);
    setImagePreview(null);
  };

  const postDetails = (pics) => {
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    
    console.log('Selected file:', pics);
    
    // Check file size (limit to 5MB)
    if (pics.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large!",
        description: "Please select an image smaller than 5MB",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    
    // Enhanced file type checking
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(pics.type)) {
      setSelectedFile(pics);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(pics);
      
      toast({
        title: "Image Selected!",
        description: `${pics.name} is ready to upload`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } else {
      toast({
        title: "Invalid File Type!",
        description: "Only JPEG, JPG, PNG, and WebP formats are supported",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </FormControl>
      
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </FormControl>
      
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick} disabled={loading}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      
      <FormControl id="confirmPassword" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
            disabled={loading}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleConfirmClick} disabled={loading}>
              {showConfirm ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      
      <FormControl id="pic" isRequired>
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => postDetails(e.target.files[0])}
          disabled={loading}
        />
        
        {/* Image Preview */}
        {imagePreview && (
          <Box mt={3} textAlign="center">
            <Image
              src={imagePreview}
              alt="Preview"
              boxSize="100px"
              objectFit="cover"
              borderRadius="md"
              border="2px solid"
              borderColor="gray.200"
            />
            <Text fontSize="sm" color="green.500" mt={2}>
              Selected: {selectedFile?.name}
            </Text>
            <Button size="sm" colorScheme="red" variant="outline" mt={2} onClick={removeImage}>
              Remove Image
            </Button>
          </Box>
        )}
      </FormControl>
      
      {loading && (
        <Box w="100%" mt={3}>
          <Progress size="sm" isIndeterminate colorScheme="blue" />
          <Text fontSize="sm" color="blue.500" textAlign="center" mt={1}>
            Uploading avatar and creating account...
          </Text>
        </Box>
      )}
      
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
        loadingText="Creating Account..."
        disabled={!name || !email || !password || !confirmpassword || !selectedFile}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;