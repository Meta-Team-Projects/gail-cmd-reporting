import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Slider,
    Avatar,
    Divider,
    Tooltip,
    ButtonGroup,
    Link,
} from '@mui/material'
import {
    Mic,
    Add,
    Send,
    Summarize,
    FormatColorText,
    CloudUpload,
    ChevronRight,
    ContentCopy,
    Download,
    Flag,
    VolumeUp,
    Source,
    IosShare,
    NavigateBefore,
    NavigateNext,
    Person,
    PersonAdd,
    AutoFixHigh,
} from '@mui/icons-material'

import { v4 as uuidv4 } from 'uuid'


import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { useState, useEffect, useRef  } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import Linkify from 'react-linkify'

import formulateIcon from '../assets/formulate.png'
import collapseIcon from '../assets/collapse.png'
import expandIcon   from '../assets/expand.png'
import fullscreenIcon from '../assets/full.png'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import StopCircleOutlined from '@mui/icons-material/StopCircleOutlined';

import useSpeechToText from 'react-hook-speech-to-text'

const Formulate = ({ leftOpen ,open, onToggle, content, sources = [], layoutMode, sessionId, dimFormulate, setLayoutMode, originalQuery,userId  }) => {

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [lastLocalQuery, setLastLocalQuery] = useState('')
    const [cutoff, setCutoff] = useState(0.8)
    const [loading, setLoading] = useState(false)
    const messageRefs = useRef({})
    const messagesEndRef = useRef(null)
    const [maxWidthPx, setMaxWidthPx] = useState(0)
    const [showLayoutIcons, setShowLayoutIcons] = useState(false)
    const toggleLayoutIcons = () => setShowLayoutIcons(v => !v)

    const actionButtons = [
        { icon: <Summarize />, label: 'Summarize' },
        { icon: <FormatColorText />, label: 'Highlight' },
        //{ icon: <AutoFixHigh />, label: 'Simplify' },
        // { icon: <AutoGraph />, label: 'Graph' },
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [messages])

    useEffect(() => {
        setMessages([])
        setLastInjectedContent('')
    }, [sessionId])

    const handleActionClick = (action) => {
        const actionTexts = {
            "Summarize": "Please summarize this text",
            "Highlight": "Highlight the key points",
            "Simplify": "Explain this in simple terms"
        };
        setMessage(actionTexts[action] || "");
    };

    const handleSend = async () => {
        const query = message.trim()
        if (!query) return
        setLastLocalQuery(query)
        setMessage('')

        const userMessage = {
        type: 'user',
        content: query,
        timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, userMessage])
        setLoading(true)

        try {
            // directly generate a draft response
            const resp = await axios.post(`${BASE_URL}/draft-response`, {
                session_id: sessionId,
                message: query,
            });
            const draftedText = resp.data?.answer || "Couldn't generate a draft.";
            const sources     = resp.data?.sources || [];
            // push the AI draft
            setMessages(prev => [
                ...prev,
                {
                    type: 'ai',
                    content: { error: false, answers:  draftedText, sources },
                    timestamp: new Date().toISOString(),
                }
            ]);
        } catch (err) {
        console.error(err)
        let errorMessage = "I couldn't process that request."
        if (err.response?.status === 404) {
            errorMessage = "No relevant information found."
        } else if (err.request) {
            errorMessage = "Connection issue. Check your internet."
        }
        setMessages(prev => [
            ...prev,
            { type: 'ai', content: { error: true, message: errorMessage }, isError: true, timestamp: new Date().toISOString() },
        ])
        } finally {
        setLoading(false)
        }
    }

    const formatResponse = (response) => {
        if (typeof response === 'string') {
            return response
        }

        if (!response) return ''

        if (response.text !== undefined) {
            return response.text
        }

        // Handle error responses
        if (response.error) {
            return `**ERROR:** ${response.message}`
        }

        if (response.answers !== undefined) {
            return response.answers;
        }

        // Known fields 
        const knownFields = [
            'document_name',
            'question',
            'question_part',
            'date',
            'ministry',
            'subject',
            'has_answer',
            'similarity_score',
            'answer',
            'document_link',
        ]

        // markdown for known fields
        let markdown = knownFields
            .filter(field => response[field] !== undefined)
            .map(field => {
                if (field === 'has_answer') {
                    return `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field] ? 'Yes' : 'No'}\n\n\n`
                }
                if (field === 'document_link') {
                    return `**${field.replace(/_/g,' ').toUpperCase()}:** [View Document](${response[field]})\n\n\n`
                }
                return `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field]}\n\n\n`
            })
            .join('')

        // additional fields 
        const additionalFields = Object.keys(response)
            .filter(field => !knownFields.includes(field) && field !== 'error')
            .map(field => `**${field.replace(/_/g, ' ').toUpperCase()}:** ${response[field]}\n\n`)
            .join('')

        if (additionalFields) {
            markdown += '' + additionalFields
        }

        return markdown
    }

    const goToPage = (idx, delta) => {
        setMessages(prev =>
        prev.map((m, i) =>
            i === idx && m.type === 'ai' && Array.isArray(m.pages)
            ? { ...m, currentPage: Math.min(Math.max(m.currentPage + delta, 0), m.pages.length - 1) }
            : m
        )
        )
    }

    const [lastInjectedContent, setLastInjectedContent] = useState('')

    useEffect(() => {
    if (content === '') {
        setMessages([])
        setLastInjectedContent('')
    }
    }, [content])

        useEffect(() => {
            if (!content || content === lastInjectedContent) return
    setLastInjectedContent(content)
    const userMsg = {
        type: 'user',
        content: originalQuery,
        timestamp: new Date().toISOString(),
    }
    const aiDraft = {
        type: 'ai',
        content: { error: false, answers: content,sources },
        timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg, aiDraft])
    }, [content, lastInjectedContent, sources])

    const handleDraftClick = async (msgIndex) => {
        const aiMsg = messages[msgIndex];
        const originalQuery = aiMsg.originalQuery;
        if (!originalQuery) return;

        const userYesMessage = {
        type: 'user',
        content: 'Yes',
        timestamp: new Date().toISOString(),
        };
        setMessages(prev => {
        const copy = [...prev];
        copy.splice(msgIndex + 1, 0, userYesMessage);
        return copy;
        });
        setLoading(true);
        try {
        const resp = await axios.post(`${BASE_URL}/draft-response`, {
            session_id: sessionId,
            message: originalQuery,
        });
        const draftedText = resp.data?.answer || "Couldn't generate a draft.";
        const aiDraftedMessage = {
            type: 'ai',
            content: { error: false, answers: draftedText },
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiDraftedMessage]);
        if (typeof onDraftGenerated === 'function') {
                onDraftGenerated(draftedText);
        }
        } catch (error) {
        console.error('Error fetching draft response:', error);
        const errMsg = {
            type: 'ai',
            content: {
            error: true,
            message: "Sorry, I couldn't get a draft response right now."
            },
            timestamp: new Date().toISOString(),
            isError: true,
        };
        setMessages(prev => [...prev, errMsg]);
        } finally {
        setLoading(false);
        }
    };

    const handleCopy = (answerText, referencePage) => {
        let textToCopy = `ANSWER: ${answerText}`;

        if (referencePage) {
        const sourceMarkdown = formatResponse(referencePage);
        textToCopy += `\n\nSOURCE:\n${sourceMarkdown.replace(/\*\*/g, '')}`;
        }

        navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
        })
        .catch((err) => {
            console.error('Failed to copy: ', err);
        });
    };

    const handleDownload = async idx => {
        const el = messageRefs.current[idx]
        if (!el) return
        const wrapper = document.createElement('div')
        wrapper.style.backgroundColor = '#fff'
        wrapper.appendChild(el.cloneNode(true))
        document.body.appendChild(wrapper)
        const canvas = await html2canvas(wrapper, { backgroundColor: '#fff', scale: 2, useCORS: true })
        document.body.removeChild(wrapper)
        const img = canvas.toDataURL('image/png')
        const pdf = new jsPDF()
        const props = pdf.getImageProperties(img)
        const width = pdf.internal.pageSize.getWidth()
        const height = (props.height * width) / props.width
        pdf.addImage(img, 'PNG', 0, 0, width, height)
        pdf.save('response.pdf')
    }

   // ─── Speech-to-Text hook──────────────────────────────
    const {
        error: sttError,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
        timeout: 30000,
    });

    useEffect(() => {
        if (results.length > 0) {
        setMessage(results[results.length - 1].transcript);
        }
    }, [results]);

    const toggleMic = async () => {
        try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isRecording) stopSpeechToText();
        else startSpeechToText();
        } catch (err) {
        console.error('Mic permission or STT error', err);
        }
    };

    const BASE_URL = import.meta.env.VITE_CHAT_API_URL;


    return (
    <Paper
        sx={{
        width:
        layoutMode === 'fullscreenFormulate'
            ? (leftOpen ?  `calc(100vw - 16.75vw)`: `calc(100vw - 7.2vw)`)
            : layoutMode === 'fullscreenMain'
                ? '2.2vw'
                : layoutMode === 'collapse' 
                    ? (leftOpen ?  '62.5vw': '68vw' )
                    : layoutMode === 'expand'
                        ? (leftOpen ?  '24vw': '26.5vw' )
                        : layoutMode === 'fiftyfifty'?
                            (leftOpen ?  '41.7vw': '47.7vw' ) : '44.2vw',
        height: '88.5vh',
        position: 'fixed',
        right: '1vw',
        top: '9vh',
        //bgcolor: 'background.sidebar',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        filter: dimFormulate ? 'grayscale(0.5) brightness(0.5)' : 'none',
        overflow: 'hidden',
        border: '1px solid #E0E7F0',
        //borderLeft: '1px solid ',
        //borderColor: 'divider',
        zIndex: 1050,
        borderRadius: layoutMode === 'expand' || layoutMode === 'collapse' 
            || layoutMode === 'fullscreenFormulate' || layoutMode === 'fullscreenMain' || layoutMode === 'fiftyfifty'
            ? '0 15px 15px 0'  
            : '15px',          
        }}
    >

        {layoutMode === 'fullscreenMain' ? (
            <Box sx={{width: '100%', height: '100%', position: 'relative'}}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 600, fontSize: '0.823vw', color: "#081A33", 
                    transform: 'rotate(-90deg) ', whiteSpace: 'nowrap',
                    mt: '14vh'
                    }}>
                    Generate Response
                </Typography>

                <img src={formulateIcon} alt="Formulate" 
                    style={{ width: '1.25vw', height: '1.25vw', color: "#081A33", 
                    position: 'absolute', bottom: 10, left: '50%', 
                    transform: 'translateX(-50%)'}} />
            </Box>
        ) : 
        ( <>
        {/* Top Bar */}
        <Box
        sx={{
            p: 2,
            position: 'relative',
            borderBottom: '1px solid',
            borderColor: 'divider',
        }}
        >
            <Box
                sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 0.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img src={formulateIcon} alt="Collapse" style={{ width: '1.25vw', height: '1.25vw', color: "#081A33"  }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.85vw', color: "#081A33" }}>
                        Generate Response
                    </Typography>
                </Box>
                {/* ─── Layout Controls (mirror MainContent but reversed) ─── */}
                {/* <Box sx={{ display: 'flex', gap: 1, position: 'absolute', right: 16, top: 16 }}>
                    {showLayoutIcons && (
                        <>
                        <IconButton size="small" onClick={() => setLayoutMode('collapse')}>
                            <img src={collapseIcon} alt="Expand Main / Collapse Formulate" style={{ width: 20, height: 20 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setLayoutMode('expand')}>
                            <img src={expandIcon} alt="Collapse Main / Expand Formulate" style={{ width: 20, height: 20 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setLayoutMode('fullscreenFormulate')}>
                            <img src={fullscreenIcon} alt="Hide Formulate" style={{ width: 20, height: 20 }} />
                        </IconButton>
                        </>
                    )}
                    <IconButton 
                        size="small" 
                        onClick={toggleLayoutIcons} 
                        sx={{
                            backgroundColor: '#ffd24e',
                            color: '#081A33',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: '#FFD700',
                            },
                        }}>
                        <AspectRatioIcon fontSize="small" style={{ width: 20, height: 20 }} />
                    </IconButton>
                </Box> */}
                {open && (
                <IconButton
                    onClick={onToggle}
                    sx={{
                    color: 'text.primary',
                    display: 'none',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                    }}
                >
                    <ChevronRight />
                </IconButton>
                )}
            </Box>
            <Divider sx={{ my: 1, mx: -3, borderColor: '#e0e0e0' }} />
        </Box>
        
        
        {/* <Box
        sx={{
            flexGrow: 1,
            px: 2,
            pt: 1,
            overflowY: 'auto',
        }}
        >
            <Typography variant="subtitle1" sx={{ mb: 1, color: '#515151', pl: 1 }}>
                Drafted Response
            </Typography>
        <Paper
            elevation={0}
            sx={{
            p: 2,
            bgcolor: '#0088d7',
            color: '#ffffff',
            borderRadius: 1,
            minHeight: '100px',
            overflowWrap: 'break-word',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            }}
        >
            {content ? (
            // ─── NEW: render the markdown as formatted text ─────────────────────────
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                p: ({ node, ...props }) => (
                    <Typography
                    {...props}
                    sx={{ fontSize: '0.9rem', lineHeight: 1.5, mb: 1 }}
                    />
                ),
                ul: ({ node, ...props }) => (
                    <Box component="ul" sx={{ pl: 2, mb: 1, '& li': { mb: 0.5 } }} {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <Box component="ol" sx={{ pl: 2, mb: 1, '& li': { mb: 0.5 } }} {...props} />
                ),
                li: ({ node, ...props }) => (
                    <Typography component="li" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }} {...props} />
                ),
                strong: ({ node, ...props }) => (
                    <Typography component="strong" sx={{ fontWeight: 600 }} {...props} />
                ),
                em: ({ node, ...props }) => (
                    <Typography component="em" sx={{ fontStyle: 'italic' }} {...props} />
                ),
                a: ({ node, ...props }) => (
                    <Typography
                    component="a"
                    sx={{ color: 'primary.main', textDecoration: 'underline' }}
                    {...props}
                    />
                ),
                }}
            >
                {content}
            </ReactMarkdown>
            ) : (
            <Typography variant="body2" color="#ffffff">
                No draft yet. Click “Yes” in the main chat to generate one.
            </Typography>
            )}
        </Paper>
        </Box> */}

        {/* Chat Messages */}
        {messages.length === 0
        ? (
        <Box
            sx={{    
            color: 'grey',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            justifyItems: 'center',
            height: '100%',
            textAlign: 'center',
            fontSize: '0.9375vw',
            mt:-4,
            ml: 2, 
            mr: 2,
            }}
        >
            Craft a new response from scratch or generate new responses. Everything you draft here can be reviewed, edited, and saved.
        </Box>
        )
        : (
        <Box
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                px: { xs: 1, sm: 1, md: 1, lg: 1 },
                py: 1,
                ml:2,
                width: '95%',
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
            {messages.map((msg, index) => {
                const isPagedAI = msg.type === 'ai' && Array.isArray(msg.pages) && msg.pages.length > 1 
                const content = isPagedAI
                    ? msg.pages[msg.currentPage]       // only show the current page
                    : msg.content
                const referencePage = isPagedAI ? msg.pages[msg.currentPage] : null;
                const answerText =
                    msg.type === 'ai' && msg.content && msg.content.answers
                    ? msg.content.answers
                    : msg.content;
                const isLast = index === messages.length - 1
                return (
                    <Box
                        key={index}
                        ref={el => {
                            if (isLast) {
                                messagesEndRef.current = el
                            }
                            if (msg.type === 'ai') {
                                messageRefs.current[index] = el
                            }
                        }}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            mb: 3,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            maxWidth: '72.92vw',
                            //mx: 'auto',
                            width: '100%',
                        }}
                    >
                        <Avatar
                            sx={{
                                background: msg.type === 'user'
                                ? '#FFD95C'                                                   // user: yellow
                                : 'conic-gradient(from 180deg at 50% 50%, #FFD95C 0deg, #FF715E 360deg)',  
                                width: '2.0833vw',
                                height: '2.0833vw',
                                mt: 0.5,
                                flexShrink: 0,
                            }}
                            >
                            {msg.type === 'user' 
                                ? <Person sx={{ color: '#081A33', fontSize: '1.041vw' }} />       // user icon
                                : <></>      // AI icon
                            }
                        </Avatar>
                        <Box sx={{
                            flex: 1,
                            minWidth: 0,
                        }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    border: msg.type === 'user'
                                            ? 'none'
                                            : msg.isError
                                                ? 'none'
                                                : '1px solid #003699', //later
                                    background: msg.type === 'user'
                                        ? '#FFD95C1A'
                                        : msg.isError
                                            ? 'rgba(252, 72, 72, 0.30)'
                                            : 'linear-gradient(to right, rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))', //later,
                                    color: msg.type === 'user' || msg.isError ? '#303308' : '#003366', //later
                                    borderRadius: '12px',
                                    borderTopLeftRadius: '2px',
                                    ...(isPagedAI
                                        ? { width: maxWidthPx ? `${maxWidthPx}px` : 'fit-content', maxWidth: '100%' }
                                        : { width: 'fit-content', maxWidth: '100%' }
                                    ),
                                    // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    // '&:hover': {
                                    //     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                    // },
                                }}
                            >
                                {msg.type === 'ai' ? (
                                    <>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ node, ...props }) => (
                                            <a
                                                {...props}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                            ),
                                            p: ({ node, ...props }) => (
                                                <Typography
                                                    {...props}
                                                    sx={{
                                                        fontSize: '0.833vw',
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
                                        children={String(formatResponse(content))}
                                    >
                                        {formatResponse(content)}
                                    </ReactMarkdown>
                                    {msg.content.sources?.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 500, color: '#515151' }}>
                                        Sources:
                                        </Typography>
                                        <Box
                                        component="ul"
                                        sx={{
                                            pl: 2,
                                            mt: 0.5,
                                            mb: 1,
                                            '& li': { mb: 0.5, fontSize: '0.9rem' }
                                        }}
                                        >
                                        {msg.content.sources.map((src, i) => {
                                        const url = src.document_link;
                                        const href = src.page != null
                                        ? `${url}#page=${src.page}`
                                        : url;

                                            return (
                                            <li key={i}>
                                                <Link
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                underline="hover"
                                                sx={{ color: '#003366' }}
                                                >
                                                {`View Document ${i + 1}`}
                                                {src.page != null && ` (Page ${src.page})`}
                                                </Link>
                                            </li>
                                            );
                                        })}
                                        </Box>
                                    </Box>
                                    )}
                                    {msg.needsDraft && (
                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleDraftClick(index)}
                                            >
                                            Yes
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                sx={{
                                                    pointerEvents: 'none', // visually active, but no interaction
                                                    '&:hover': {
                                                        backgroundColor: 'grey.500',
                                                    }
                                                    }}
                                            >
                                            No
                                            </Button>
                                        </Box>
                                    )}
                                        {msg.type === 'ai' && ( 
                                            ((Array.isArray(msg.pages) && msg.pages.length > 0) || (msg.content && msg.content.answers)) && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            {/* Left: Flag & Volume */}
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Copy" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopy(answerText, referencePage)}
                                                    sx={{ p: '2px', color: 'rgba(0, 51, 102, 1)' }}
                                                >
                                                    <ContentCopy sx={{ fontSize: '0.833vw' }} />
                                                </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Download" arrow>
                                                <IconButton
                                                    size="small"
                                                    sx={{ p: '2px', color: 'rgba(0, 51, 102, 1)' }}
                                                    onClick={() => {
                                                    // grab the immediately preceding user message as the title
                                                    const title = lastLocalQuery
                                                        || originalQuery
                                                        || messages[index - 1]?.content
                                                        || 'Saved Query'
                                                    const note = {
                                                    title,
                                                    content: formatResponse(content),
                                                    date: new Date().toLocaleDateString('en-GB'),
                                                    };
                                                    const key = `savedQuery_${Date.now()}`;
                                                    localStorage.setItem(key, JSON.stringify(note));
                                                    // let the SavedQueries pane know to reload
                                                    window.dispatchEvent(new Event('saved-query'));
                                                }}
                                                >
                                                    <Download sx={{ fontSize: '0.833vw' }} />
                                                </IconButton>
                                                </Tooltip>
                                            </Box>
                                            {/* Right Icons*/}
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="Bookmark" arrow>
                                                <IconButton size="small" 
                                                sx={{ p: '2px', color: 'rgba(0, 51, 102, 1)' }}
                                                >
                                                    <BookmarkBorderIcon sx={{ fontSize: '0.833vw' }} />
                                                </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Speaker" arrow>
                                                <IconButton size="small" sx={{ p: '2px', color: 'rgba(0, 51, 102, 1)' }}>
                                                    <VolumeUp sx={{ fontSize: '0.833vw' }} />
                                                </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                        ))}
                                        {/* ← pagination controls moved inside the Paper */}
                                        {isPagedAI && (
                                            <Box
                                            sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 1,
                                            px: 1,
                                            position: 'relative',
                                            minHeight: 40,
                                            }}
                                            >
                                            {/* Previous Button or Invisible Placeholder */}
                                            {msg.currentPage > 0 ? (
                                            <Button
                                            size="large"
                                            onClick={() => goToPage(index, -1)}
                                            startIcon={<NavigateBefore />}
                                            sx={{
                                            color: '#000',
                                            backgroundColor: '#FFD95C',
                                            fontSize: '0.667vw',
                                            textTransform: 'none',
                                            px: 2,
                                            py: 1,
                                            '&:hover': {
                                            backgroundColor: '#FFCB42',
                                            },
                                            }}
                                            >
                                            Prev Response
                                            </Button>
                                            ) : (
                                            <Box sx={{ width: '160px', visibility: 'hidden' }} />
                                            )}

                                            {/* Response Counter - Always centered */}
                                            <Typography
                                            variant="caption"
                                            sx={{
                                            position: 'absolute',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            color: '#fff',
                                            fontWeight: 500,
                                            fontSize: '0.667vw'
                                            }}
                                            >
                                                {msg.currentPage + 1}/{msg.pages.length}
                                            </Typography>

                                            {/* Next Button or Invisible Placeholder */}
                                            {msg.currentPage < msg.pages.length - 1 ? (
                                            <Button
                                            size="large"
                                            onClick={() => goToPage(index, 1)}
                                            endIcon={<NavigateNext />}
                                            sx={{
                                            color: '#000',
                                            backgroundColor: '#FFD95C',
                                            fontSize: '0.667vw',
                                            textTransform: 'none',
                                            px: 2,
                                            py: 1,
                                            '&:hover': {
                                            backgroundColor: '#FFCB42',
                                            },
                                            }}
                                            >
                                            Next Response
                                            </Button>
                                            ) : (
                                            <Box sx={{ width: '130px', visibility: 'hidden' }} />
                                            )}
                                            </Box>


                                        )}
                                    </>
                                ) : (
                                    <Linkify
                                        componentDecorator={(decoratedHref, decoratedText, key) => (
                                            <a
                                            href={decoratedHref}
                                            key={key}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            >
                                            {decoratedText}
                                            </a>
                                        )}
                                        >
                                        <Typography
                                            sx={{
                                            fontSize: '0.833vw',
                                            lineHeight: 1.6,
                                            letterSpacing: '0.01em',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            color: 'inherit',
                                            }}
                                        >
                                            {msg.content}
                                        </Typography>
                                    </Linkify>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                )
            })}
            <div ref={messagesEndRef} />
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
        )}

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
                zIndex: 3
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
                        fontSize: '0.7292vw',
                        padding: '0.3125vw 0.625vw',
                        borderRadius: '12px',
                        border: 'none',
                        minWidth: 'auto',
                        fontWeight: 500,
                        mt: 1,
                        mb: 1,
                        '&:hover': {
                            bgcolor: '#ffd95c',
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: '0.9375vw',
                            marginRight: '6px',
                        },
                    }
                }}
            >
                {actionButtons.map((button) => (
                    <Button
                        key={button.label}
                        startIcon={button.icon}
                        onClick={() => handleActionClick(button.label)}
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
                        paddingLeft: '12px !important', display: 'none'   //later
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
                        <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"} placement="top" arrow>
                            <IconButton
                                sx={{
                                    bgcolor: '#FFD95C',
                                    width: '1.875vw',
                                    height: '1.875vw',
                                    borderRadius: '8px',
                                    boxShadow: '2px 2px 8px #9A9A9A40',
                                    color: '#515151',
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                onClick={toggleMic} 
                                >
                                {isRecording
                                ? <StopCircleOutlined  sx={{ fontSize: '0.9375vw' }} />
                                : <Mic   sx={{ fontSize: '0.9375vw' }}/>}
                            </IconButton>
                        </Tooltip>

                        <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={3}
                                inputProps={{
                                    style: {
                                        height: '24px',
                                        overflowY: 'auto',
                                    }
                                }}
                                variant="outlined"
                                placeholder="Ask anything..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            
                                            color:'#878787',
                                            backgroundColor: '#FFD95C1A',
                                            padding: 0,
                                        
                                        '& fieldset': {
                                            borderColor: '#51515133',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#51515133',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#515151',
                                        },
                                        '& textarea': {
                                            overflowY: 'auto',

                                            '&::-webkit-scrollbar': {
                                                width: '4px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'transparent',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                backgroundColor: '#0088d7',
                                                borderRadius: '3px',
                                            },
                                            scrollbarWidth: '0.3125vw',
                                            scrollbarColor: '#0088d7 transparent',
                                        }
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '0.4167vw 0.7292vw',
                                        fontSize: '0.7292vw',
                                    },
                                }}
                            />

                                {/* <Box sx={{ width: 280, ml: 1, mr: 1, display: "flex", gap: 1 }}>
                                <TextField
                                type="number"
                                value={cutoff.toFixed(2)}
                                onChange={(e) => {
                                    let value = parseFloat(e.target.value)
                                    if (!isNaN(value)) {
                                    value = Math.min(Math.max(value, 0), 1)
                                    setCutoff(value)
                                    }
                                }}
                                inputProps={{
                                    step: 0.01,
                                    min: 0,
                                    max: 1,
                                }}
                                size="small"
                                sx={{ width: 350 }}
                                InputProps={{
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography variant="body2" color='text.primary'>Similarity:</Typography>
                                    </InputAdornment>
                                    ),
                                }}
                                />
                                <Slider
                                    value={cutoff}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    valueLabelDisplay="auto"
                                    onChange={(_, v) => setCutoff(v)}
                                    sx={{mt:0.5}}
                                />
                            </Box>  */}
                        <Tooltip title="Send" placement="top" arrow>
                            <IconButton
                                sx={{
                                    bgcolor: '#FFD95C',
                                    width: '1.875vw',
                                    height: '1.875vw',
                                    borderRadius: '8px',
                                    color: '#515151',
                                    boxShadow: '2px 2px 8px #9A9A9A40',
                                    '&:hover': {
                                        bgcolor: '#FFCB42',
                                    },
                                }}
                                onClick={handleSend}
                                >
                                <Send sx={{ fontSize: '0.9375vw' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    </Box>

                    {/* Bottom Row: 2 Left buttons + 1 Right button */}
                    {/* */}
                    <Box
                        sx={{
                            display: 'none',// switch to flex
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
        </Paper>
       </> )}
    </Paper>
    )
}

export default Formulate