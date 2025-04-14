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
    InputAdornment,
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
    Search,
    Add,
    Flag,
    VolumeUp,
    Source,
    IosShare,
} from '@mui/icons-material'
import axios from 'axios'

const MainContent = ({ rightSidebarOpen, leftSidebarOpen }) => {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (message.trim()) {
            const userMessage = {
                type: 'user',
                content: message,
                timestamp: new Date().toISOString(),
            }
            setMessages([...messages, userMessage])
            setLoading(true)

            try {
                // Using a placeholder API endpoint
                const response = await axios.post('https://api.example.com/chat', {
                    message: message,
                })

                const aiMessage = {
                    type: 'ai',
                    content: response.data.message || 'Sample response from AI',
                    timestamp: new Date().toISOString(),
                }
                setMessages(prev => [...prev, aiMessage])
            } catch (error) {
                console.error('Error sending message:', error)
                const errorMessage = {
                    type: 'ai',
                    content: "I apologize, but I couldn't process that request at the moment. Please try again later.",
                    timestamp: new Date().toISOString(),
                    isError: true
                }
                setMessages(prev => [...prev, errorMessage])
            } finally {
                setLoading(false)
                setMessage('')
            }
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
                bgcolor: '#1a1f2c',
                height: '100vh',
                position: 'relative',
            }}
        >
            {/* Top Bar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: '#1a1f2c',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            maxWidth: '1200px',
                            mx: 'auto',
                            px: { xs: 2, sm: 4, md: 6, lg: 8 },
                        }}
                    >
                        <TextField
                            placeholder="Search here..."
                            variant="outlined"
                            size="small"
                            sx={{
                                flex: 1,
                                maxWidth: '400px',
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    height: '40px',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.08)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.12)',
                                    },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                <Avatar sx={{ width: 32, height: 32 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Chat Messages */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    px: { xs: 2, sm: 4, md: 6, lg: 8 },
                    py: 3,
                    mb: '160px',
                    maxWidth: '1400px',
                    mx: 'auto',
                    width: '100%',
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                    },
                }}
            >
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 3,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            maxWidth: '1200px',
                            mx: 'auto',
                            width: '100%',
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: msg.type === 'user'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : msg.isError ? '#dc2626' : '#3b82f6',
                                width: 28,
                                height: 28,
                                fontSize: '0.875rem',
                                mt: 0.5,
                                flexShrink: 0,
                            }}
                        >
                            {msg.type === 'user' ? 'U' : 'AI'}
                        </Avatar>
                        <Box sx={{
                            flex: 1,
                            minWidth: 0, // This ensures the box can shrink below its content size
                        }}>
                            {msg.type === 'ai' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: 1,
                                        mb: 1,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    >
                                        <Flag sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    >
                                        <VolumeUp sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            )}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: msg.type === 'user'
                                        ? '#3b82f6'
                                        : msg.isError
                                            ? '#dc2626'
                                            : 'rgba(255, 255, 255, 0.03)',
                                    color: msg.type === 'user' || msg.isError ? 'white' : 'text.primary',
                                    borderRadius: '12px',
                                    borderTopLeftRadius: '2px',
                                    width: 'fit-content',
                                    maxWidth: '100%',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.875rem',
                                        lineHeight: 1.5,
                                        letterSpacing: '0.01em',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {msg.content}
                                </Typography>
                            </Paper>
                            {msg.type === 'ai' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        gap: 1,
                                        mt: 1,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    >
                                        <Source sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    >
                                        <ContentCopy sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    >
                                        <IosShare sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography
                            sx={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.813rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <span className="typing-dot">•</span>
                            <span className="typing-dot">•</span>
                            <span className="typing-dot">•</span>
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Bottom Bar */}
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: leftSidebarOpen ? '240px' : 0,
                    right: rightSidebarOpen ? '400px' : 0,
                    bgcolor: 'rgba(26, 31, 44, 0.8)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'left 0.3s ease, right 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    zIndex: 10,
                }}
            >
                <Box
                    sx={{
                        maxWidth: '1200px',
                        mx: 'auto',
                        width: '100%',
                        px: { xs: 2, sm: 4, md: 6, lg: 8 },
                        py: 2.5,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        {/* Action Buttons */}
                        <ButtonGroup
                            variant="text"
                            sx={{
                                gap: 0.5,
                                '& .MuiButton-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    minWidth: 'auto',
                                    fontWeight: 500,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        fontSize: '1.125rem',
                                        marginRight: '6px',
                                    },
                                }
                            }}
                        >
                            {actionButtons.map((button) => (
                                <Button
                                    key={button.label}
                                    startIcon={button.icon}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        }
                                    }}
                                >
                                    {button.label}
                                </Button>
                            ))}
                            <Button
                                startIcon={<Add />}
                                sx={{
                                    ml: 0.5,
                                    borderLeft: '1px solid rgba(255, 255, 255, 0.08) !important',
                                    paddingLeft: '12px !important',
                                }}
                            >
                                More
                            </Button>
                        </ButtonGroup>

                        {/* Input Area */}
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', width: '100%' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Ask or search anything..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '10px',
                                        color: 'white',
                                        height: '44px',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.08)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.12)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#3b82f6',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '10px 14px',
                                        fontSize: '0.875rem',
                                        '&::placeholder': {
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '8px',
                                        width: '36px',
                                        height: '36px',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        },
                                    }}
                                    onClick={() => {/* Handle mic */ }}
                                >
                                    <Mic sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton
                                    sx={{
                                        color: 'white',
                                        bgcolor: '#3b82f6',
                                        borderRadius: '8px',
                                        width: '36px',
                                        height: '36px',
                                        '&:hover': {
                                            bgcolor: '#2563eb',
                                        },
                                    }}
                                    onClick={handleSend}
                                >
                                    <Send sx={{ fontSize: 18 }} />
                                </IconButton>
                                <IconButton
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '8px',
                                        width: '36px',
                                        height: '36px',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        },
                                    }}
                                    onClick={() => {/* Handle enhance */ }}
                                >
                                    <AutoFixHigh sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    )
}

export default MainContent 