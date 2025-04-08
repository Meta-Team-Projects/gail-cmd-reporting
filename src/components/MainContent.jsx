import { useState } from 'react'
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    ButtonGroup,
    Button,
    Avatar,
    AppBar,
    Toolbar,
} from '@mui/material'
import {
    Send,
    Mic,
    AutoFixHigh,
    ContentCopy,
    Share,
    Summarize,
    FormatColorText,
    AutoGraph,
} from '@mui/icons-material'

const MainContent = ({ rightSidebarOpen, leftSidebarOpen }) => {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (message.trim()) {
            // Handle sending message
            setMessage('')
        }
    }

    const actionButtons = [
        { icon: <Summarize />, label: 'Summarize' },
        { icon: <FormatColorText />, label: 'Highlight' },
        { icon: <AutoFixHigh />, label: 'Simplify' },
        { icon: <AutoGraph />, label: 'Graph' },
    ]

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                ml: 1,
                maxWidth: rightSidebarOpen ? 'calc(100% - 400px)' : '100%',
                transition: 'max-width 0.3s ease',
            }}
        >
            {/* Menu Bar */}
            <AppBar
                position="sticky"
                color="inherit"
                elevation={0}
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Toolbar variant="dense">
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        GAIL Chat
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Chat Messages */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
                {/* User Message */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Avatar>U</Avatar>
                    <Paper
                        elevation={1}
                        sx={{
                            p: 2,
                            maxWidth: '80%',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Typography>
                            "What are GAIL's initiatives for promoting sustainability and reducing carbon emissions?"
                        </Typography>
                    </Paper>
                </Box>

                {/* AI Response */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>
                    <Box sx={{ maxWidth: '80%' }}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                bgcolor: 'background.paper',
                                mb: 1,
                            }}
                        >
                            <Typography>
                                GAIL has undertaken several initiatives to promote sustainability and reduce carbon emissions.
                                These include expanding its natural gas pipeline network, investing in renewable energy
                                projects, and implementing energy efficiency measures across operations.
                            </Typography>
                        </Paper>

                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            It looks like this query has been addressed before. How would you like to proceed?
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <ButtonGroup variant="contained" size="small">
                                {actionButtons.map((button) => (
                                    <Button
                                        key={button.label}
                                        startIcon={button.icon}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                                <ContentCopy />
                            </IconButton>
                            <IconButton size="small">
                                <Share />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Input Area */}
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    mx: 2,
                    mb: 2,
                    bgcolor: 'background.paper',
                }}
            >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Ask or search anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        size="small"
                    />
                    <IconButton color="primary">
                        <Mic />
                    </IconButton>
                    <IconButton color="primary" onClick={handleSend}>
                        <Send />
                    </IconButton>
                    <IconButton color="primary">
                        <AutoFixHigh />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    )
}

export default MainContent 