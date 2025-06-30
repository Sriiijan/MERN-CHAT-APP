import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast} from '@chakra-ui/react'
import React, {useState} from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ChatState } from '../../context/chatProvider.js';

const Login = () => {
    const [show, setShow] = useState(true); // For show & hide the password
    const [email, setEmail]= useState();
    const [password, setPassword]= useState();
    const toast= useToast();

    const history= useHistory();
    const { setUser }= ChatState();

    const handleClick = () => setShow(!show);
    const submitHandler = async() => {
        if(!(email || password)){
            toast({
                title: "Pleasr Fill all the Fields",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
            return;
        }
        try{
            const config= {
                headers: {
                    "Content-type": "application/json"
                }
            };
            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
                );
                console.log("Login Response:", data);


                toast({
                title: "Login successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
                });

                // ✅ Store token + user info
                const userInfo = {
                    ...data.data.user,
                    token: data.data.token
                };
                setUser(userInfo);
                localStorage.setItem("userInfo", JSON.stringify(userInfo));


                history.push("/chats");

        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: error.response?.data?.message || error.message || "Something went wrong!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
}

    }
    
    return <VStack spacing='5px' color='black'>
        <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
                placeholder= 'Enter Your Email'
                onChange= {(e)=> setEmail(e.target.value)}
            />
        </FormControl>

        <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
                    <Input
                        type={show ? 'password' : 'text'}
                        placeholder= 'Enter Your Password'
                        onChange= {(e)=> setPassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                            {show ? 'Show' : 'Hide'}
                        </Button>
                    </InputRightElement>
                
            </InputGroup>
        </FormControl>

        <Button colorScheme='teal'
            width='100%'
            style={{marginTop: 15}}
            onClick={submitHandler}>
            Login
        </Button>

        <Button variant='solid'
            colorScheme='red'
            width='100%'
            style={{marginTop: 15}}
            onClick={()=>{
                setEmail('guest@example.com')
                setPassword('123456')
            }}
        >
            Get Guest User Credentials
        </Button>
    </VStack>
}

export default Login