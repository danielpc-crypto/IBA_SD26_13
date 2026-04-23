import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./start.css"
import ReactMarkdown from 'react-markdown';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Container,
    Paper
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import Header from './Header';

const getUserDocuments = async (username, s3_file_key) => {
    try {
        const userFile = await fetch(`http://localhost:5000/retrieve/bucket/${username}/${s3_file_key}`,{
            method: "GET",
        }).then(res => res.json());
        return userFile;
    } catch (error) {
        console.error("Error fetching user file:", error);
        throw error;
    }
};

function ViewDocument(){
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user);
    const [fileData, setFileData] = useState(null);

    const onDownload = async (file) => {
        const response = await fetch(
                `http://localhost:5000/download/${parsedUser.username}/${file.key}`
            );

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = file.key.split("/").pop();

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    };

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const userFile = await getUserDocuments(
                    parsedUser.username,
                    parsedUser.s3_file_key
                );

                setFileData(userFile);
                console.log("Fetched user document:", userFile);

            } catch (error) {
                console.error(error);
            }
        };

        fetchDocument();
    }, [parsedUser.username, parsedUser.s3_file_key]);


    return(
        <div>
            <Header open={open} setOpen={setOpen}/>

            <Box 
                sx={{
                    minHeight: "100vh",
                    bgcolor: "#f7f8fa",
                    pt: 10,
                    pl: open ? "260px" : 0,
                    transition: "all 0.3s ease",
                }}
            >
                <Container>
                    <Box sx={{ mb: 6 }}>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ letterSpacing: "-0.03em" }}
                        >
                            Your Document Library
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            View and manage your uploaded documents here.
                        </Typography>
                    </Box>

                   <Paper
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            p: 1,
                            bgcolor: "white"
                        }}
                    >
                        <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                            Your Files
                        </Typography>

                        {fileData && (
                            <List>
                                <ListItem
                                    secondaryAction={
                                        <IconButton onClick={() => onDownload(fileData)}>
                                            <DownloadIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <InsertDriveFileIcon />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={fileData.key}
                                            secondary={fileData.contentType}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        )}
                    </Paper>
                </Container>

            </Box>
        </div>
    );
}

export default ViewDocument;