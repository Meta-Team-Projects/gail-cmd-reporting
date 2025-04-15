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
    SvgIcon,
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
    PersonAdd,
} from '@mui/icons-material'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MainContent = ({ rightSidebarOpen, leftSidebarOpen }) => {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const BASE_URL = import.meta.env.VITE_CHAT_API_URL;
    const handleSend = async () => {
        const query = message.trim()
        setMessage('')
        if (query) {
            const userMessage = {
                type: 'user',
                content: query,
                timestamp: new Date().toISOString(),
            }
            setMessages([...messages, userMessage])
            setLoading(true)

            try {
                const response = await axios.post(BASE_URL + '/query', {
                    query: query,
                })

                // Check if response data is valid
                if (!response.data || typeof response.data !== 'object') {
                    throw new Error('Invalid response format')
                }

                const aiMessage = {
                    type: 'ai',
                    content: response.data,
                    timestamp: new Date().toISOString(),
                }
                setMessages(prev => [...prev, aiMessage])
            } catch (error) {
                console.error('Error sending message:', error)

                let errorMessage = "I couldn't process that request at the moment. Please try again later."

                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (error.response.status === 404) {
                        errorMessage = "I couldn't find any relevant information for your query. Please try rephrasing your question."
                    } else if (error.response.status === 400) {
                        errorMessage = "I couldn't understand your query. Please try rephrasing your question."
                    } else if (error.response.status === 500) {
                        errorMessage = "There was an error processing your request. Please try again later."
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    errorMessage = "I'm having trouble connecting to the server. Please check your internet connection and try again."
                }

                const errorResponse = {
                    type: 'ai',
                    content: {
                        error: true,
                        message: errorMessage
                    },
                    timestamp: new Date().toISOString(),
                    isError: true
                }
                setMessages(prev => [...prev, errorResponse])
            } finally {
                setLoading(false)
            }
        }
    }

    const formatResponse = (response) => {
        if (!response) return ''

        // Handle error responses
        if (response.error) {
            return `**ERROR:** ${response.message}`
        }

        // Known fields that should be displayed first
        const knownFields = [
            'document_name',
            'question',
            'question_part',
            'date',
            'ministry',
            'subject',
            'has_answer',
            'similarity_score',
            'answer'
        ]

        // Create markdown for known fields
        let markdown = knownFields
            .filter(field => response[field] !== undefined)
            .map(field => {
                if (field === 'has_answer') {
                    return `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field] ? 'Yes' : 'No'}\n\n\n`
                }
                return `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field]}\n\n\n`
            })
            .join('')

        // Add any additional fields that weren't in the known fields list
        const additionalFields = Object.keys(response)
            .filter(field => !knownFields.includes(field) && field !== 'error')
            .map(field => `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field]}\n\n`)
            .join('')

        if (additionalFields) {
            markdown += '\n**Additional Information:**\n\n' + additionalFields
        }

        return markdown
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
                bgcolor: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
                height: '100vh',
                position: 'relative',
            }}
        >
            {/* Top Bar */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: 'rgba(164, 191, 255, 0)',
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
                            bgcolor: "rgba(164, 191, 255, 0.08)",
                            width: '100%',
                            maxWidth: '1200px',
                            mx: 'auto',
                            px: { xs: 2, sm: 4, md: 6, lg: 8 },
                            py: "5px",
                            borderRadius: '20px',
                        }}
                    >
                        <TextField
                            placeholder="Search here..."
                            variant="outlined"
                            size="small"
                            sx={{
                                flex: 1,
                                maxWidth: '600px',
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton sx={{ color: 'rgb(255, 255, 255)' }}>
                                <PersonAdd sx={{ width: 32, height: 32 }} />
                            </IconButton>
                            <IconButton sx={{ color: 'rgb(255, 255, 255)' }}>
                                <img src='./incognito.svg' style={{ width: 40, height: 40 }}></img>
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
                                    : msg.isError ? '#a4bfff0a' : '#a4bfff0a',
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                mt: 0.5,
                                flexShrink: 0,
                            }}
                        >
                            {msg.type === 'user' ? 'U' : 'AI'}
                        </Avatar>
                        <Box sx={{
                            flex: 1,
                            minWidth: 0,
                        }}>
                            {msg.type === 'ai' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: 1,
                                        mb: 1,
                                        p: 1,
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
                                    p: 4,
                                    bgcolor: msg.type === 'user'
                                        ? 'rgba(73, 124, 242, 0.3)'
                                        : msg.isError
                                            ? 'rgba(252, 72, 72, 0.30)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                    color: msg.type === 'user' || msg.isError ? 'white' : 'text.primary',
                                    borderRadius: '12px',
                                    borderTopLeftRadius: '2px',
                                    width: 'fit-content',
                                    maxWidth: '100%',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                    },
                                }}
                            >
                                {msg.type === 'ai' ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => (
                                                <Typography
                                                    {...props}
                                                    sx={{
                                                        fontSize: '1rem',
                                                        lineHeight: 1.6,
                                                        letterSpacing: '0.01em',
                                                        mb: 2,
                                                        color: 'inherit',
                                                    }}
                                                />
                                            ),
                                            h1: ({ node, ...props }) => (
                                                <Typography
                                                    {...props}
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        color: 'inherit',
                                                    }}
                                                />
                                            ),
                                            h2: ({ node, ...props }) => (
                                                <Typography
                                                    {...props}
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        color: 'inherit',
                                                    }}
                                                />
                                            ),
                                            h3: ({ node, ...props }) => (
                                                <Typography
                                                    {...props}
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 2,
                                                        color: 'inherit',
                                                    }}
                                                />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <Box
                                                    component="ul"
                                                    sx={{
                                                        pl: 3,
                                                        mb: 2,
                                                        '& li': {
                                                            mb: 1,
                                                        },
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <Box
                                                    component="ol"
                                                    sx={{
                                                        pl: 3,
                                                        mb: 2,
                                                        '& li': {
                                                            mb: 1,
                                                        },
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <Typography
                                                    component="li"
                                                    sx={{
                                                        fontSize: '1rem',
                                                        lineHeight: 1.6,
                                                        color: 'inherit',
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            table: ({ node, ...props }) => (
                                                <Box sx={{ overflowX: 'auto', mb: 2 }}>
                                                    <table
                                                        {...props}
                                                        style={{
                                                            borderCollapse: 'collapse',
                                                            width: '100%',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        }}
                                                    />
                                                </Box>
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th
                                                    {...props}
                                                    style={{
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    }}
                                                />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td
                                                    {...props}
                                                    style={{
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        padding: '12px',
                                                    }}
                                                />
                                            ),
                                            code: ({ node, ...props }) => (
                                                <Box
                                                    component="code"
                                                    sx={{
                                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                        p: '2px 4px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9em',
                                                        fontFamily: 'monospace',
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            pre: ({ node, ...props }) => (
                                                <Box
                                                    component="pre"
                                                    sx={{
                                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                        p: 2,
                                                        borderRadius: '8px',
                                                        overflowX: 'auto',
                                                        mb: 2,
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            blockquote: ({ node, ...props }) => (
                                                <Box
                                                    component="blockquote"
                                                    sx={{
                                                        borderLeft: '4px solid rgba(255, 255, 255, 0.2)',
                                                        pl: 2,
                                                        py: 1,
                                                        my: 2,
                                                        color: 'inherit',
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                        }}
                                    >
                                        {formatResponse(msg.content)}
                                    </ReactMarkdown>
                                ) : (
                                    <Typography
                                        sx={{
                                            fontSize: '1rem',
                                            lineHeight: 1.6,
                                            letterSpacing: '0.01em',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            color: 'inherit',
                                        }}
                                    >
                                        {msg.content}
                                    </Typography>
                                )}
                            </Paper>
                            {msg.type === 'ai' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
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
                    bgcolor: 'rgba(255, 255, 255, 0)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'left 0.3s ease, right 0.3s ease',
                    backdropFilter: 'blur(20px)',
                    zIndex: 3,
                }}
            >
                <Box
                    sx={{
                        maxWidth: '1200px',
                        mx: 'auto',
                        my: 1,
                        width: '100%',
                        px: { xs: 2, sm: 4, md: 6, lg: 8 },
                        py: 1.5,
                        bgcolor: 'rgba(164, 191, 255, 0.08)',
                        borderRadius: '20px',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: '10px',
                        }}
                    >
                        {/* Action Buttons */}
                        <ButtonGroup
                            variant="text"
                            sx={{
                                gap: 0.5,
                                '& .MuiButton-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
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