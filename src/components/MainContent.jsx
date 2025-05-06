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
    AttachFile
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
        // { icon: <FormatColorText />, label: 'Highlight' },
        { icon: <AutoFixHigh />, label: 'Simplify' },
        // { icon: <AutoGraph />, label: 'Graph' },
    ]

    return (
        <Box
            sx={{
                marginTop: '2.5vh',
                height: '95vh',
                marginLeft: '1.5vh',
                boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                borderRadius: '15px',
                overflow: 'hidden', 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                ml: 3,
                maxWidth: {
                    xs: '90%',  
                    sm: '94.5%',  
                    md: rightSidebarOpen ? 'calc(100% - 400px)' : '97%', // Desktop
                },
                transition: 'max-width 0.3s ease',
                bgcolor:'#F6F6F6',
                //bgcolor: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
                position: 'relative',
            }}
        >
            {/* Top Bar */}
            <Toolbar sx={{ minHeight: '64px !important' }}>
            <Box
                sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '1200px',
                mx: 'auto',
                px: { xs: 2, sm: 2, md: 2, lg: 2 },
                py: 1,
                }}
            >
                {/* Left: Title */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3C3C3C' }}>
                Session 1
                </Typography>

                {/* Center: Search Box */}
                <TextField
                placeholder="Search here..."
                variant="outlined"
                size="small"
                sx={{
                    flex: 1,
                    maxWidth: '400px',
                    mx: 3,
                    '& .MuiOutlinedInput-root': {
                    bgcolor: '#E9EDF3',
                    borderRadius: '12px',
                    color: '#515151',
                    height: '36px',
                    paddingRight: 1,
                    '& fieldset': {
                        borderColor: 'transparent',
                        color: '#515151',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#515151', // When focused or selecred border change
                    },
                    },
                    '& input::placeholder': {
                    color: '#888',
                    },
                }}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <Search sx={{ fontSize: 18, color: '#888' }} />
                    </InputAdornment>
                    ),
                    endAdornment: (
                    <InputAdornment position="end">
                        <Mic sx={{ fontSize: 18, color: '#888' }} />
                    </InputAdornment>
                    ),
                }}
                />

                {/* Right: Icons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    sx={{
                    border: '1px solid #081A33',
                    borderRadius: '8px',
                    py: 0.5,
                    px: 1,
                    color: '#081A33',
                    }}
                >
                    <PersonAdd sx={{width: '18px', height: 'auto'}}/>
                </IconButton>
                <IconButton
                    sx={{
                    border: '1px solid #081A33',
                    borderRadius: '8px',
                    p: 0.5,
                    }}
                >
                    <img src="./incognito-1.svg" alt="Incognito" style={{ width: 24, height: 24 }} />
                </IconButton>
                </Box>
            </Box>
            </Toolbar>


            {/* Chat Messages */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    px: { xs: 2, sm: 2, md: 2, lg: 2 },
                    py: 1,
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
                                    ? '#ffd95c'
                                    : msg.isError ? '#f8f0d7' : '#a4bfff0a',
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
                                        mt: -2,
                                        mb: 2,
                                        gap: 1,
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'black',
                                            padding: '0px',
                                            '&:hover': {
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        <Flag sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'black',
                                            padding: '0px',
                                            '&:hover': {
                                                color: 'black',
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
                                        ? '#FFD95C1A'
                                        : msg.isError
                                            ? 'rgba(252, 72, 72, 0.30)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                    color: msg.type === 'user' || msg.isError ? '#303308' : 'text.primary',
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
                                            color: 'black',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        <Source sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'black',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        <ContentCopy sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: 'black',
                                            padding: '2px',
                                            '&:hover': {
                                                color: 'black',
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
                    position: 'relative',
                    mt: 'auto',
                    ml: '2.5vh',
                    mr: '2.5vh',
                    mb: '1.5vh',
                    transition: 'left 0.3s ease, right 0.3s ease',
                    bgcolor: 'transparent',
                    zIndex: 3,
                }}
            >
                {/* Action Buttons */}
                <ButtonGroup
                    variant="text"
                    sx={{
                        gap: 0.5,
                        '& .MuiButton-root': {
                            color: '#515151',
                            bgcolor: '#FFD95C33',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            border: 'none',
                            minWidth: 'auto',
                            fontWeight: 500,
                            mb: 1,
                            '&:hover': {
                                bgcolor: '#ffd95c',
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
                <Box
                    sx={{
                        maxWidth: 'auto',
                        mx: 'auto',
                        my: 'auto',
                        width: '100%',
                        px: { xs: 2, sm: 2, md: 2, lg: 2 },
                        py: 1.5,
                        bgcolor: '#1846870D',
                    border: '1px solid #081A33',
                    borderRadius: '15px',
                    }}
                >
                    
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: '1px',
                        }}
                    >
                    {/* Wrapper for Input + Below Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        {/* Top Row: Mic + Input + Send */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                sx={{
                                    bgcolor: '#FFD95C',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    color: '#515151',
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                onClick={() => {/* Handle Mic */}}
                            >
                                <Mic sx={{ fontSize: 18 }} />
                            </IconButton>

                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Ask or search anything..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        height: '36px',
                                        color:'#878787',
                                        backgroundColor: '#FFD95C1A',
                                        '& fieldset': {
                                            borderColor: '#51515133',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#51515133',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#515151',
                                        },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '8px 14px',
                                        fontSize: '0.875rem',
                                    },
                                }}
                            />

                            <IconButton
                                sx={{
                                    bgcolor: '#FFD95C',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    color: '#515151',
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                onClick={handleSend}
                            >
                                <Send sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>

                        {/* Bottom Row: 2 Left buttons + 1 Right button */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                sx={{
                                bgcolor: '#FFD95C',
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                color: '#515151',
                                '&:hover': { bgcolor: '#FFCB42' },
                                }}
                                onClick={() => { /* handle file attach */ }}
                            >
                                <AttachFile sx={{ fontSize: 18 }} />
                            </IconButton>

                                <IconButton
                                    sx={{
                                        bgcolor: '#FFD95C',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        color: '#515151',
                                        '&:hover': {
                                            bgcolor: '#FFCB42',
                                        },
                                    }}
                                >
                                    <img src="./star-icon.svg" alt="Star" style={{ width: 24, height: 24 }} />
                                </IconButton>
                            </Box>

                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#FFD95C',
                                    color: '#515151',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    px: 2,
                                    py: 0.8,
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                startIcon={<AutoFixHigh />}
                            >
                                Enhance
                            </Button>
                        </Box>
                    </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    )
}

export default MainContent 