import React, {useState, useEffect, useRef} from 'react';
import { IoSend, IoClose } from 'react-icons/io5';
import { prepareAuthHeader } from 'layouts/authentication/utility/auth-utility';
import axios from 'axios';

import PropTypes from 'prop-types';

import { Container, IconButton, Paper } from '@mui/material';

import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDAvatar from 'components/MDAvatar';
import MDMessageContainer from './MDMessageContainer';
import MDMessageBubble from './MDMessageBubble';
import MDInput from 'components/MDInput';

import profileIcon from "assets/images/default-profile-icon.jpg";

function MDChat ({loggedUserId, secondUserId, chatTitle, closeCallback}) {    
    const [messageList, setMessageList] = useState([]);
    const [newMessage, setNewMessage] = useState("");       
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageList]);

    useEffect(() => {
        const fetchMessages = async () => {
            let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/${loggedUserId}/messages`;
            let params = prepareAuthHeader();
            params.params = {
                secondUserId: secondUserId
            };
            
            try {
                let response = await axios.get(endpoint, params);
                if (response && response.data) {
                    setMessageList(response.data)
                }            
            } catch (error) {
                console.error(error);
            }        
        }   
        
        fetchMessages();
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            return;
        }

        let payload = {
            sender_id: loggedUserId,
            receiver_id: secondUserId,
            sent_at: new Date().toISOString(),
            messageText: newMessage.trim(),            
            isForModerator: false
        };

        try {
            let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Message/create`;
            let response = await axios.post(endpoint, payload, prepareAuthHeader());

            if (response && response.status === 201) {
                setMessageList([...messageList, payload]);
                setNewMessage("");                    
            }                            
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3}
                   sx = {{
                    height: '60vh',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                   }}>
                
                <MDBox display="flex" justifyContent="space-between" variant="gradient" bgColor="info" coloredShadow="info" p={2}>
                    <MDTypography variant="h5" color="white" mt={1}>{chatTitle}</MDTypography>

                    <IconButton color="white" onClick={() => closeCallback()}>
                        <IoClose />
                    </IconButton>
                </MDBox>
                
                <MDMessageContainer role="log" aria-label="Chat messages">
                    {messageList.map((message) => (
                        <MDBox display='flex'
                               alignItems='flex-end'
                               sx={{gap: 1}} 
                               flexDirection={message['sender_id'] === loggedUserId ? 'row-reverse' : 'row'}>

                            <MDAvatar src={profileIcon} alt="profile-image" size="md" shadow="sm" />

                            <MDMessageBubble sent={message['sender_id'] === loggedUserId} elevation={1}>
                                <MDTypography variant="body2" color={message['sender_id'] === loggedUserId ? '#fff' : '#000'}>
                                    {message.messageText}
                                </MDTypography>

                                <MDTypography variant="caption" 
                                              color={message['sender_id'] === loggedUserId ? '#fff' : '#000'}
                                              sx={{ display: "block", mt: 0.5, opacity: 0.7}}>                                                
                                    {new Date(message.sent_at).toLocaleDateString() + "  " + new Date(message.sent_at).toLocaleTimeString()}
                                </MDTypography>
                            </MDMessageBubble>
                        </MDBox>
                    ))}             
                    <div ref={messagesEndRef} />       
                </MDMessageContainer>

                <MDBox p={2} display='flex' gap={1}>
                    <MDInput label="Type your message..."
                             value={newMessage}
                             onChange={(event) => {setNewMessage(event.target.value)}}
                             fullWidth 
                             multiline
                             maxRows={4}
                             sx={{ "& .MuiOutlinedInput-root": { borderRadius: "2rem" } }} />

                    <IconButton color="white"    
                                onClick={handleSendMessage} 
                                sx={{
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    "&:hover": { backgroundColor: "primary.dark" }
                                }}>
                            <IoSend />
                    </IconButton>
                </MDBox>
            </Paper>
        </Container>
    );
}

MDChat.defaultProps = {    
    chatTitle: 'Chat'
};

MDChat.propTypes = {
    loggedUserId: PropTypes.number.isRequired,
    chatTitle: PropTypes.string.isRequired,
    closeCallback: PropTypes.func.isRequired
};


export default MDChat;