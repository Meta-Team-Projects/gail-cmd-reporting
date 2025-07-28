import { useState, useEffect, useRef } from 'react'
import {
    Box,
    TextField,
    IconButton,
    Slider,
    Typography,
    Popper,
    ClickAwayListener,
    Paper,
    ButtonGroup,
    Button,
    Avatar,
    AppBar,
    Toolbar,
    InputAdornment,
    SvgIcon,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Link,
    Divider
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
    Person,
    PersonAdd,
    AttachFile,
    Download,
    Speed,
} from '@mui/icons-material'

import NavigateBefore from '@mui/icons-material/NavigateBefore'
import NavigateNext from '@mui/icons-material/NavigateNext'
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import StopCircleOutlined from '@mui/icons-material/StopCircleOutlined';

import useSpeechToText from 'react-hook-speech-to-text'

import Linkify from 'react-linkify'

import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { MenuType } from '../constants/menuTypes'

import { v4 as uuidv4 } from 'uuid'

import RetrieveResponseIcon from '../assets/retrieve_response_icon.png'
import fullscreenIcon from '../assets/full.png'
//import collapseIcon from '../assets/collapse.png'
//import expandIcon from '../assets/expand.png'

const MainContent = ({ 
    sessions, 
    rightSidebarOpen, 
    leftSidebarOpen, activeRightMenu, 
    activeSessionID, onDraftGenerated, 
    onMenuClick, 
    messages, setMessages, 
    layoutMode, setLayoutMode,
    showNotepad,  onNotepadToggle,
    dimMainContent,
    userId, 
    }) => {
    const messageRefs = useRef({})
    const [message, setMessage] = useState('')
    const [cutoff,  setCutoff]  = useState(0.80)
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const [maxWidthPx, setMaxWidthPx] = useState(0)
    const [showFilterOptions, setShowFilterOptions] = useState(false)
    const filterButtonRef = useRef(null)
    const [showCalendarPanel, setShowCalendarPanel] = useState(false);
    const [showSimilarityPanel, setShowSimilarityPanel] = useState(false);

    const [fromDay, setFromDay] = useState(1);
    const [fromMonth, setFromMonth] = useState(6);
    const [fromYear, setFromYear] = useState(2024);
    const [toDay, setToDay] = useState(2);
    const [toMonth, setToMonth] = useState(6);
    const [toYear, setToYear] = useState(2025);


    const BASE_URL = import.meta.env.VITE_CHAT_API_URL;

    //const [showLayoutIcons, setShowLayoutIcons] = useState(false)
    
    //const toggleLayoutIcons = () => {
    //    setShowLayoutIcons(prev => !prev)
    //}

    const handleFilterIconClick = () => {
        const next = !showFilterOptions;
        setShowFilterOptions(next);
        if (next) {
            setShowCalendarPanel(false);
            setShowSimilarityPanel(false);
        }
    };

    const handleSend = async () => {
    const query = message.trim()
    setMessage('')
    if (!query) return

    // push user’s message
    const userMessage = {
        type: 'user',
        content: query,
        timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
        // 2) call API
        const resp = await axios.post(`${BASE_URL}/query`, {
        query,
        cutoff,   
        })

        // 3) extract the `results` array
        const results = resp.data?.results || []
        const message = resp.data?.message


        if (results.length === 0) {
        // “no results” error 
        setMessages(prev => [
            ...prev,
            {
            type: 'ai',
            content: { error: false, 
                text: message || 'No similar query was found in the historical parliamentary records. Would you like me to draft a response?',},
            needsDraft: true,               // show “Yes” button
            originalQuery: query,           // store for /draft-response
            timestamp: new Date().toISOString(),
            }
        ])
        } else {
            //count of messages
            const countMessage = {
                type: 'ai',
                content: `${results.length} responses found.`,
                timestamp: new Date().toISOString(),
            }
        // Grouped AI message with pagination
        const pagedMessage = {
            type: 'ai',
            pages: results,               // array of response objects
            currentPage: 0,               // start at page 0
            timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, countMessage, pagedMessage])
        }

    } catch (error) {
        console.error('Error sending message:', error)

        // error-status logic
        let errorMessage = "I couldn't process that request at the moment. Please try again later."
        if (error.response) {
        if (error.response.status === 404) {
            errorMessage = "I couldn't find any relevant information for your query. Please try rephrasing your question."
        } else if (error.response.status === 400) {
            errorMessage = "I couldn't understand your query. Please try rephrasing your question."
        } else if (error.response.status === 500) {
            errorMessage = "There was an error processing your request. Please try again later."
        }
        } else if (error.request) {
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
        const {
            document_name,
            question,
            question_part,
            date,
            subject,
            has_answer,
            similarity_score,
            answer,
            document_link,
            document_formattype
        } = response

        // Build the lines exactly as requested, in markdown-friendly text
        return [
            `**QUESTION: ${question}**`,
            `<span style="font-size: 0.625vw;">Question Part: ${question_part}&emsp; Date: ${date}&emsp;   Has Answer: ${has_answer ? 'Yes' : 'No'}&emsp;   Similarity Score: ${similarity_score}</span>`,
            `<span style="font-size: 0.625vw;">Subject: ${subject}</span>`,
            `<span style="font-size: 0.625vw;">Document Name: ${document_name}</span>`,
            ``,
            `**Answer:** ${answer}`,
            ``,
            `**References:**`,
            document_link ? `<span style="font-size: 0.625vw;">Document Link: [View Document](${document_link})</span>` : '',
            document_formattype ? `<span style="font-size: 0.625vw;">
            Document Format Type: ${document_formattype.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>` : '',
        ].join('  \n')
    }

    const actionButtons = [
        { icon: <Summarize />, label: 'Summarize' },
        { icon: <FormatColorText />, label: 'Highlight' },
        //{ icon: <AutoFixHigh />, label: 'Simplify' },
        // { icon: <AutoGraph />, label: 'Graph' },
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }, [messages])

    const goToPage = (msgIndex, delta) => {
        setMessages(prev =>
        prev.map((m, i) => {
            if (i === msgIndex && m.type === 'ai' && Array.isArray(m.pages)) {
            const next = m.currentPage + delta
            return {
                ...m,
                currentPage: Math.min(Math.max(next, 0), m.pages.length - 1)
            }
            }
            return m
        })
        )
    }

        // ─── Handle “Yes” click to fetch /draft-response ───────────────────────────
    const handleDraftClick = async (msgIndex) => {
        const aiMsg = messages[msgIndex];
        const originalQuery = aiMsg.originalQuery;
        if (!originalQuery) return;

        const loadingAiMessage = {
            type: 'ai',
            content: { error: false, text: 'Yes, Currently formulating a new response...' },
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => {
            const copy = [...prev];
            copy.splice(msgIndex + 1, 0, loadingAiMessage);
            return copy;
        });
        setLoading(true);
        try {
        const resp = await axios.post(`${BASE_URL}/draft-response`, {
            session_id: activeSessionID,
            message: originalQuery,
        });
        const draftedText = resp.data?.answer || "Couldn't generate a draft.";
        const sources     = resp.data?.sources || [];
    
        //const aiDraftedMessage = {
          //  type: 'ai',
            //content: { error: false, answers: draftedText },
            //timestamp: new Date().toISOString(),
        //};
        //setMessages(prev => [...prev, aiDraftedMessage]);
        if (typeof onDraftGenerated === 'function') {
                onDraftGenerated(draftedText, originalQuery, sources);
        }
        if (layoutMode === 'fullscreen') {
            setLayoutMode('expand');                  
            onMenuClick(MenuType.FORMULATE);          
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
  // ────────────────────────────────────────────────────────────────────────────

    const handleDownload = async (msgIndex) => {
        const element = messageRefs.current[msgIndex]
        if (!element) return

    // 1) Convert the DOM node to canvas (white background)
    const clone = element.cloneNode(true)
    const wrapper = document.createElement('div')
    wrapper.style.padding = '20px'
    wrapper.style.backgroundColor = '#ffffff'
    wrapper.appendChild(clone)

    document.body.appendChild(wrapper)
    const canvas = await html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
    })
    document.body.removeChild(wrapper)

    // 2) Generate a PDF blob
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    const pdfBlob = pdf.output('blob')

    // 3) If File System Access API is available, show a native “Save As…” dialog
    if (window.showSaveFilePicker) {
        try {
        // Let user pick a location + filename (MIME is application/pdf)
        const handle = await window.showSaveFilePicker({
            suggestedName: 'response.pdf',
            types: [
                {
                description: 'PDF Document',
                accept: { 'application/pdf': ['.pdf'] },
                },
            ],
        })

        // Create a writable stream, write the blob, and close
        const writable = await handle.createWritable()
        await writable.write(pdfBlob)
        await writable.close()
        } catch (fsError) {
        // If user cancels or an error occurs, silently fall back to the <a> fallback
        console.warn('File System Access API save canceled or failed:', fsError)
        const blobUrl = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'response.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }
    } else {
      // 4) Fallback for browsers that do not support showSaveFilePicker:
        const blobUrl = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'response.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
    }
    }

    const handleCopy = (answerText, referencePage) => {
        let textToCopy = '';
        if (referencePage) {
            const {
            document_name = '',
            question = '',
            question_part = '',
            date = '',
            has_answer,
            similarity_score,
            subject = '',
            answer = '',
            } = referencePage;

            const metadataLines = [
            `DOCUMENT NAME: ${document_name}`,
            ``,
            `QUESTION: ${question}`,
            ``,
            `QUESTION PART: ${question_part}&emsp;   DATE: ${date}&emsp;    HAS ANSWER: ${has_answer ? 'Yes' : 'No'}&emsp;    SIMILARITY SCORE: ${similarity_score}`,
            ``,
            `SUBJECT: ${subject}`,
            ];

            textToCopy = [
            ...metadataLines,
            '',
            `ANSWER: ${answer || answerText || 'No Answer Provided'}`,
            ].join('\n');
        } else {
            textToCopy = `ANSWER: ${answerText || 'No Answer Provided'}`;
        }

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
            console.log('Copied cleanly!');
            })
            .catch((err) => {
            console.error('Failed to copy: ', err);
            });
    };


    useEffect(() => {
        let widest = 0
        Object.values(messageRefs.current).forEach(el => {
            if (!el || !el.offsetWidth) return
            widest = Math.max(widest, el.offsetWidth)
        })
        if (widest > maxWidthPx) setMaxWidthPx(widest)
    }, [messages])

    const handleActionClick = (action) => {
        const actionTexts = {
            "Summarize": "Please summarize this text",
            "Highlight": "Highlight the key points",
            "Simplify": "Explain this in simple terms"
        };
        setMessage(actionTexts[action] || "");
    };

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

    return (
        <Box
            sx={{
                marginTop: '9vh',
                height: '88.5vh',
                marginLeft: '1vw',
                //marginRight: '0.25vw',
                boxShadow: '2px 0px 8px #50505040',
                bgcolor:'#FFFFFF',
                border: '1px solid #E0E7F0',
                borderRadius: layoutMode === 'expand' || layoutMode === 'collapse' 
                    || layoutMode === 'fullscreenFormulate' || layoutMode === 'fullscreenMain' || layoutMode === 'fiftyfifty'
                    ? '15px 0 0 15px'  
                    : '15px',          
                overflow: 'hidden', 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: {
                    xs: '90%',
                    sm: '94.5%',
                    md: layoutMode === 'fullscreenMain'
                    ? 'calc(97% - 1.3vw)'
                    : layoutMode === 'fullscreenFormulate'
                    ? '2.2vw'
                        : layoutMode === 'expand'
                        ? (leftSidebarOpen? 'calc(100% - 26vw)':'calc(100% - 28.5vw)' )
                        : layoutMode === 'collapse'
                            ? (leftSidebarOpen? 'calc(100% - 64.5vw)':'calc(100% - 70vw)' )
                            : layoutMode === 'fiftyfifty'
                            ? (leftSidebarOpen? 'calc(100% - 43.7vw)':'calc(100% - 49.7vw)' ): '97%',
                },
                transition: 'max-width 0.3s ease',
                filter: dimMainContent ? 'grayscale(0.5) brightness(0.5)' : 'none',
                //bgcolor: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
                position: 'relative',
            }}
        >
            {layoutMode === 'fullscreenFormulate' ? (
                <Box sx={{width: '100%', height: '100%', position: 'relative'}}>
                    <Typography variant="h6" 
                    sx={{ fontWeight: 600, fontSize: '0.823vw', color: '#081A33',
                        transform: 'rotate(-90deg) ', whiteSpace: 'nowrap',
                        mt: '14vh'
                    }}>
                        Retrieve Response
                    </Typography>

                    <img src={RetrieveResponseIcon} alt="Retrieve"
                        style={{ width: '1.25vw', height: '1.25vw', color: '#081A33',
                        position: 'absolute', bottom: 10, left: '50%',
                        transform: 'translateX(-50%)'}}/>
                </Box>
            ) : ( <>
                
            
            {/* Top Bar */}
            <Box sx={{ 
                minHeight: '64px !important', 
                p: 2,
                position: 'relative',
                borderBottom: '1px solid',
                borderColor: 'divider'}}>
                <Box
                    sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    mb: 0.5
                    }}
                >
                    {/* Left title */}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <img src={RetrieveResponseIcon} alt='Retrieve' style={{ width: '1.25vw', height: '1.25vw', color: '#081A33' }} />
                        <Typography 
                        //variant="subtitle1" 
                        variant="h6"
                        sx={{ fontWeight: 600, fontSize: '0.85vw', color: '#081A33'}}>
                            Retrieve Response
                        </Typography>
                    </Box>

                    {/* Center: Search Box */}
                    <Box>
                        {(() => {
                        const current = sessions.find(s => s.id === activeSessionID);
                        return (
                        <Typography variant="subtitle1" 
                        sx={{ fontWeight: 600, color: '#081A33',
                            ml: -10 ,textAlign: 'center', flex: 1, display: 'none'
                        }}>
                            {current ? current.name : ''}
                        </Typography>
                        )
                    })()}
                    </Box>
                    {/* <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            fontSize: 16,
                            color: '#081A33',
                            mx: 3,
                            textAlign: 'center',
                            flex: 1,
                        }}
                        >
                        Parliamentary Queries
                    </Typography> */}
                    <TextField
                        placeholder="Search here..."
                        variant="outlined"
                        size="small"
                        sx={{
                            flex: 1,
                            maxWidth: '400px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: '#3C3C3C',
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
                            textAlign: 'center',
                            flex: 1,
                            display: 'none'
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

                    {/* Right icons + category dropdown */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                        sx={{
                            border: '1px solid #081A33',
                            borderRadius: '8px',
                            py: 0.5,
                            px: 1.5,
                            color: '#081A33',
                            display: 'none'
                        }}
                    >
                        <PersonAdd sx={{width: '18px', height: 'auto'}}/>
                    </IconButton>
                    <IconButton
                        sx={{
                        border: '1px solid #081A33',
                        borderRadius: '8px',
                        p: 0.5,
                        display: 'none'
                        }}
                    >
                        <img src="./incognito-1.svg" alt="Incognito" style={{ width: 24, height: 24 }} />
                    </IconButton>
                    {/* ─── Layout Controls ──────────────────────────────────────────── */}
                        {/* {showLayoutIcons && (
                            <>
                            <IconButton size="small" sx={{ color: '#081A33' }} 
                                onClick={() => {
                                    setLayoutMode('collapse')
                                    setShowFilterOptions(false)
                                }}
                                >
                                <img src={collapseIcon} alt="Collapse" style={{ width: 20, height: 20 }} />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#081A33' }} 
                            onClick={() => {
                                setLayoutMode('expand')
                                setShowFilterOptions(false)
                            }}>
                                <img src={expandIcon} alt="Expand" style={{ width: 20, height: 20 }} />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#081A33' }} 
                            onClick={() => {
                                setLayoutMode('fullscreenMain')
                                setShowFilterOptions(false)
                            }}
                            >
                                <img src={fullscreenIcon} alt="Fullscreen" style={{ width: 20, height: 20 }} />
                            </IconButton>
                            </>
                        )} */}
                        {/* Fullscreen toggle only */}
                    {/* <IconButton
                    size="small"
                    onClick={() => {
                        if (layoutMode === 'fullscreenMain') {
                        setLayoutMode('expand')
                        onMenuClick(MenuType.FORMULATE)
                        } else {
                        setLayoutMode('fullscreenMain')
                        }
                    }}
                    sx={{
                        color: '#081A33',
                        borderRadius: 1,
                    }}
                    >
                    {layoutMode === 'fullscreenMain' ? (
                        <CloseFullscreenIcon sx={{ width: 20, height: 20 }} />
                    ) : (
                        <img
                        src={fullscreenIcon}
                        alt="Fullscreen"
                        style={{
                            width: 20,
                            height: 20,
                        }}
                        />
                    )}
                    </IconButton> later*/} 
                        {/* <IconButton
                            size="small"
                            onClick={toggleLayoutIcons}
                            sx={{
                            backgroundColor: '#ffd24e',
                            color: '#081A33',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: '#FFD700',
                            },
                            }}
                        >
                            <AspectRatioIcon fontSize="small" style={{ width: 20, height: 20 }} />
                        </IconButton> */}
                    </Box>
                </Box>
                <Divider sx={{ my: 1, mx: -3, borderColor: '#e0e0e0' }}/>
            </Box>

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
                    ml: '0.104vw', 
                    mr: '0.104vw',
                    }}
                >
                    Welcome! You can query historical records to fetch relevant responses to parliamentary queries.
                </Box>
                )
                : (
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            px: { xs: 1, sm: 1, md: 1, lg: 1 },
                            py: 1,
                            width: '95%',
                            ml: 2,
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
                                            width: '2.083vw',
                                            height: '2.083vw',
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
                                                        : 'linear-gradient(to right, rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))', //later
                                                color: msg.type === 'user' || msg.isError ? '#303308' : '#003366',  //later
                                                borderRadius: '12px',
                                                borderTopLeftRadius: '2px',
                                                ...(isPagedAI
                                                    ? { width: maxWidthPx ? `${maxWidthPx}px` : 'fit-content', maxWidth: '100%' }
                                                    : { width: 'fit-content', maxWidth: '100%' }
                                                ),
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                '&:hover': {
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                                },
                                            }}
                                        >
                                            {msg.type === 'ai' ? (
                                                <>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]}
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
                                                {content.sources?.length > 0 && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 500, color: '#515151' }}>
                                                        Sources:
                                                        </Typography>
                                                        <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 1, '& li': { mb: 0.25 } }}>
                                                            {referencePage?.document && (
                                                            <Box sx={{ mt: 2, pl: 2 }}>
                                                                <Typography component="div" sx={{ fontSize: '0.9rem', mb: 1 }}>
                                                                <a
                                                                    href={referencePage.document}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: '#003366', textDecoration: 'underline' }}
                                                                >
                                                                    {referencePage.document}
                                                                </a>
                                                                {referencePage.page != null && ` (page ${referencePage.page})`}
                                                                </Typography>
                                                            </Box>
                                                            )}
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
                                                            <Tooltip title="Source" arrow>
                                                                <IconButton size="small" sx={{ p: '2px', color: '#003366' }}>
                                                                    <Source sx={{ fontSize: '0.833vw' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Copy" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleCopy(answerText, referencePage)}
                                                                    sx={{ p: '2px', color: '#003366' }}
                                                                >
                                                                    <ContentCopy sx={{ fontSize: '0.833vw' }} />
                                                                </IconButton>
                                                            </Tooltip> 
                                                            <Tooltip title="Share" arrow>
                                                                <IconButton size="small" sx={{ p: '2px', color: '#003366' }}>
                                                                    <IosShare sx={{ fontSize: '0.833vw'}} />
                                                                </IconButton>
                                                            </Tooltip> 
                                                        </Box>
                                                        {/* Right: Source, Copy, Share, Download */}
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Bookmark" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{ p: '2px', color: '#003366' }}
                                                                >
                                                                    <BookmarkBorderIcon sx={{ fontSize: '0.833vw' }} />
                                                                </IconButton>
                                                            </Tooltip> 
                                                            <Tooltip title="Save" arrow>                                                   
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        // Grab the immediately preceding user message as the title
                                                                        const prev = messages[index - 2];
                                                                        const title = `${prev?.content || 'Saved Query'} Response ${msg.currentPage + 1}/${msg.pages.length}`;
                                                                        const note = {
                                                                            title,
                                                                            content: formatResponse(content),
                                                                            date: new Date().toLocaleDateString("en-GB"),
                                                                        };
                                                                        const key = `savedQuery_${Date.now()}`;
                                                                        localStorage.setItem(key, JSON.stringify(note));
                                                                        window.dispatchEvent(new Event('saved-query'));
                                                                    }}
                                                                    sx={{ p: '2px', color: '#003366' }}
                                                                >
                                                                    <Download sx={{ fontSize: '0.833vw' }} />
                                                            </IconButton>
                                                            </Tooltip> 
                                                            <Tooltip title="Speaker" arrow>
                                                                <IconButton size="small" sx={{ p: '2px', color: '#003366' }}>
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
                                                        px: 0.5,
                                                        gap: 2,
                                                        position: 'relative',
                                                        minHeight: 40,
                                                        }}
                                                        >
                                                        {/* Previous Button or Invisible Placeholder */}
                                                        {msg.currentPage > 0 ? (
                                                        <Button
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() => goToPage(index, -1)}
                                                        startIcon={<NavigateBefore  />}
                                                        sx={{
                                                        color: '#000',
                                                        backgroundColor: '#FFD95C',
                                                        fontSize: '0.667vw',
                                                        textTransform: 'none',
                                                        width: '40%',
                                                        maxWidth: '7.812vw',
                                                        px: 1,
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
                                                        color: '#003366',
                                                        fontWeight: 500,
                                                        fontSize: '0.667vw',
                                                        }}
                                                        >
                                                            {msg.currentPage + 1}/{msg.pages.length}
                                                        </Typography>

                                                        {/* Next Button or Invisible Placeholder */}
                                                        {msg.currentPage < msg.pages.length - 1 ? (
                                                        <Button
                                                        size="large"
                                                        variant="contained"
                                                        onClick={() => goToPage(index, 1)}
                                                        endIcon={<NavigateNext />}
                                                        sx={{
                                                        color: '#000',
                                                        backgroundColor: '#FFD95C',
                                                        fontSize: '0.667vw',
                                                        textTransform: 'none',
                                                        px: 1,
                                                        py: 1,
                                                        width: '40%',
                                                        maxWidth: '7.812vw',
                                                        '&:hover': {
                                                        backgroundColor: '#FFCB42',
                                                        },
                                                        }}
                                                        >
                                                        Next Response
                                                        </Button>
                                                        ) : (
                                                        <Box sx={{ width: '160px', visibility: 'hidden' }} />
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
                {/* Similarity Panel */}
                <Box sx= {{ display: 'flex', gap: 1}}>
                <ClickAwayListener onClickAway={() => setShowSimilarityPanel(false)}>
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Tooltip title="Similarity Score" placement="top" arrow>
                            <IconButton
                            onClick={() => setShowSimilarityPanel(prev => !prev)}
                            sx={{
                                color: '#FFD95C',
                                backgroundColor: '#fff',
                                width: '1.875vw',
                                height: '1.875vw',
                                borderRadius: '8px',
                                ml: 2,
                                mb: 1,
                                boxShadow: '2px 2px 8px #9A9A9A40',
                            }}>
                                <SpeedIcon sx={{ fontSize: '0.9375vw' }}/>
                            </IconButton>
                        </Tooltip>
                        
                        
                        <Box sx={{
                            width: '7.8125vw',
                            height: '1.875vw',
                            px: '0.2083vw',
                            
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '2px 2px 8px #9A9A9A40',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            // flex: 1,
                            // width: '10%',
                            // maxHeight: showSimilarityPanel ? 50 : 0,
                            // overflow: 'hidden',
                            visibility: showSimilarityPanel ? 'visible' : 'hidden'
                        }}>
                            <Box 
                            sx={{ 
                                display: 'flex', justifyContent: 'space-between', width: '100%', 
                                alignItems: 'center', mt: 0.3,mb: -1.5 }}
                            >
                                <Typography sx={{ fontSize: '0.520vw' }} variant="caption">Similarity Score</Typography>
                                <TextField type="number" value={cutoff.toFixed(2)} 
                                    onChange={(e) => {
                                    let value = parseFloat(e.target.value)
                                    if (!isNaN(value)) {
                                        value= Math.min(Math.max(value, 0), 1)
                                        setCutoff(value)
                                    }
                                }}
                                size="small"
                                inputProps={{ 
                                    step: 0.01, min: 0, max: 1, 
                                    style: { padding: '0vw 0.052vw', width: '2.0833vw', fontSize: '0.520vw' } }}
                                InputProps={{ 
                                    sx: {fontSize: '0.520vw', } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '4px',
                                        backgroundColor: '#fff',
                                        '& fieldset': {
                                            borderColor: '#515151',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#515151',
                                        },
                                        '& .Mui-focused fieldset': {
                                            borderColor: '#515151',
                                        },
                                    },
                                }}
                                />
                            </Box>
                            <Slider value={cutoff} min={0} max={1} step={0.01} 
                                    // valueLabelDisplay="auto" 
                                    onChange={(_, v) => setCutoff(v)}
                                sx={{
                                    width: '90%',
                                    px: 0.5,
                                    '& .MuiSlider-thumb': { width: '0.5208vw', height: '0.5208vw' },
                                    '& .MuiSlider-track': { height: '0.2083vw' },
                                    '& .MuiSlider-rail': { height: '0.2083vw' }
                                }}
                            />
                        </Box>
                    </Box>
                </ClickAwayListener>
                </Box>

                {/* Input + Below Buttons */}
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

                    {/* Filter Button PopUp */}
                    <Popper
                        open={showFilterOptions}
                        anchorEl={filterButtonRef.current}
                        placement='top'
                        modifiers={[
                            {name: 'offset',
                                options: {
                                    offset: [-180, 20]
                                },
                            },
                        ]}
                        sx={{zIndex: 1300}}
                    >
                        {/* <ClickAwayListener onClickAway={() => {
                            if (!isInteractingWithSelect) {
                                setShowFilterOptions(false);
                                setShowCalendarPanel(false);
                                setShowSimilarityPanel(false);
                            }
                        }}> */}
                        <ClickAwayListener
                            onClickAway={(event) => {
                                if (
                                    filterButtonRef.current &&
                                    filterButtonRef.current.contains(event.target)
                                ) return;

                                setShowFilterOptions(false);
                            }}>
                            <Paper 
                            sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1.5,
                                borderRadius: 2,
                                width: '400px',
                                backgroundColor: 'rgba(250, 250, 250, 0.95',
                                //backgroundColor: 'transparent',
                                boxShadow: '2px 2px 8px #9A9A9A40',
                                border: 'none'
                            }}>

                                {/* Top Row: Calendar */}
                                {/* <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}> */}
                                    {/* Calendar Selector */}
                                    {/* <Box sx={{
                                        flex: 1,
                                        overflow: 'hidden',
                                    }}> */}
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontSize: '0.4167vw', ml: 0.5 }}>From</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, backgroundColor: '#fff', 
                                                borderRadius: 1, px: 0.5, height: '2.59vh', alignItems: 'center' }}>
                                                    {/* Day */}
                                                    <Select value={fromDay} 
                                                    onChange={(e) => setFromDay(e.target.value)} 
                                                    size="small" IconComponent={() => null}
                                                        MenuProps={{ 
                                                            anchorOrigin: {vertical: 'top'}, transformOrigin: {vertical:'bottom'}, 
                                                            PaperProps: { 
                                                                sx:{
                                                                    mt: -1.5,
                                                                    maxHeight: 100,
                                                                    minWidth: 'unset',
                                                                    fontSize: '0.5208vw',
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.5208vw',
                                                                        padding: '4px 8px'
                                                                    }
                                                                } } }}
                                                        sx={{
                                                            fontSize: '0.5208vw', width: 30, height: '1.25vw',
                                                            backgroundColor:'#f5f5f5', borderRadius: '4px',
                                                            display: 'flex', justifyContent: 'center',
                                                            alignItems: 'center',textAlign: 'center',
                                                        }}>
                                                        {[...Array(31)].map((_, i) => (
                                                            <MenuItem key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {/* Month */}
                                                    <Select value={fromMonth} 
                                                    onChange={(e) => setFromMonth(e.target.value)} 
                                                    size="small" IconComponent={() => null}
                                                        MenuProps={{ 
                                                            anchorOrigin: {vertical: 'top'}, transformOrigin: {vertical:'bottom'}, 
                                                            PaperProps: { 
                                                                sx:{
                                                                    mt: -1.5,
                                                                    maxHeight: 100,
                                                                    minWidth: 'unset',
                                                                    fontSize: '0.5208vw',
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.5208vw',
                                                                        padding: '4px 8px'
                                                                    }
                                                                } } }}
                                                        sx={{
                                                            fontSize: '0.5208vw', width: 30, height: '1.25vw',
                                                            backgroundColor:'#f5f5f5', borderRadius: '4px',
                                                            display: 'flex', justifyContent: 'center',
                                                            alignItems: 'center',textAlign: 'center',
                                                        }}>
                                                        {[...Array(12)].map((_, i) => (
                                                            <MenuItem key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {/* Year */}
                                                    <Select value={fromYear} 
                                                    onChange={(e) => setFromYear(e.target.value)} 
                                                    size="small" IconComponent={() => null}
                                                        MenuProps={{ 
                                                            anchorOrigin: {vertical: 'top'}, transformOrigin: {vertical:'bottom'}, 
                                                            PaperProps: { 
                                                                sx:{
                                                                    mt: -1.5,
                                                                    maxHeight: 100,
                                                                    minWidth: 'unset',
                                                                    fontSize: '0.5208vw',
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.5208vw',
                                                                        padding: '4px 8px'
                                                                    }
                                                                } } }}
                                                        sx={{
                                                            fontSize: '0.5208vw', height: '1.25vw',
                                                            backgroundColor:'#f5f5f5', borderRadius: '4px',
                                                            display: 'flex', justifyContent: 'center',
                                                            alignItems: 'center',textAlign: 'center',
                                                        }}>
                                                        {Array.from({ length: 101 }, (_, i) => 1950 + i).map((year) => (
                                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </Box>
                                            </Box>

                                            <Typography sx={{ fontSize: '0.5208vw', mt: '2vh' }}>:</Typography>

                                            <Box sx={{display: 'flex', flexDirection:'column',gap: 0.5}}>
                                                <Typography variant='caption' sx={{ fontSize: '0.4167vw', ml: 0.5 }}>To</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, backgroundColor: '#fff', 
                                                borderRadius: 1, px: 0.5, height: '2.59vh', alignItems: 'center' }}>
                                                    {/* Day */}
                                                    <Select value={toDay} 
                                                    onChange={(e) => setToDay(e.target.value)} 
                                                    size="small" IconComponent={() => null}
                                                        MenuProps={{ 
                                                            anchorOrigin: {vertical: 'top'}, transformOrigin: {vertical:'bottom'}, 
                                                            PaperProps: { 
                                                                sx:{
                                                                    mt: -1.5,
                                                                    maxHeight: 100,
                                                                    minWidth: 'unset',
                                                                    fontSize: '0.5208vw',
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.5208vw',
                                                                        padding: '4px 8px'
                                                                    }
                                                                } } }}
                                                        sx={{
                                                            fontSize: '0.5208vw', width: 30, height: '1.25vw',
                                                            backgroundColor:'#f5f5f5', borderRadius: '4px',
                                                            display: 'flex', justifyContent: 'center',
                                                            alignItems: 'center',textAlign: 'center',
                                                        }}>
                                                        {[...Array(31)].map((_, i) => (
                                                            <MenuItem key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {/* Month */}
                                                    <Select value={toMonth} 
                                                    onChange={(e) => setToMonth(e.target.value)} 
                                                    size="small" IconComponent={() => null}
                                                        MenuProps={{ 
                                                            anchorOrigin: {vertical: 'top'}, transformOrigin: {vertical:'bottom'}, 
                                                            PaperProps: { 
                                                                sx:{
                                                                    mt: -1.5,
                                                                    maxHeight: 100,
                                                                    minWidth: 'unset',
                                                                    fontSize: '0.5208vw',
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.5208vw',
                                                                        padding: '4px 8px'
                                                                    }
                                                                } } }}
                                                        sx={{fontSize: '0.5208vw', width: 30, height: '1.25vw',
                                                            backgroundColor:'#f5f5f5', borderRadius: '4px',
                                                            display: 'flex', justifyContent: 'center',
                                                            alignItems: 'center',textAlign: 'center',
                                                        }}>
                                                        {[...Array(12)].map((_, i) => (
                                                            <MenuItem key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</MenuItem>
                                                        ))}
                                                    </Select>
                                                    {/* Year */}
                                                    <Select
                                                    value={toYear}
                                                    onChange={(e) => setToYear(e.target.value)} 
                                                    size="small" IconComponent={() => null}
                                                        MenuProps={{ 
                                                            anchorOrigin: {vertical: 'top'}, transformOrigin: {vertical:'bottom'}, 
                                                            PaperProps: { 
                                                                sx:{
                                                                    mt: -1.5,
                                                                    maxHeight: 100,
                                                                    fontSize: '0.5208vw',
                                                                    '& .MuiMenuItem-root': {
                                                                        fontSize: '0.5208vw',
                                                                        padding: '4px 8px',
                                                                    }
                                                                } } }}
                                                        sx={{fontSize: '0.5208vw', height: '1.25vw',
                                                            backgroundColor:'#f5f5f5', borderRadius: '4px',
                                                            display: 'flex', justifyContent: 'left',
                                                            alignItems: 'center', textAlign: 'left',
                                                        }}>
                                                        {Array.from({ length: 101 }, (_, i) => 1950 + i).map((year) => (
                                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </Box>
                                            </Box>
                                        </Box>
                                    {/* </Box> */}
                                    
                                    {/* Calendar Icon */}
                                     {/* <Tooltip title="Date Filter" placement="right" arrow>
                                    <IconButton
                                    onClick={() => setShowCalendarPanel(prev => !prev)}
                                    sx={{
                                        color: '#FFD95C',
                                        backgroundColor: '#fff',
                                        width: '45px',
                                        height:'45px',
                                        borderRadius: '8px',
                                        ml: 1
                                    }}>
                                        <CalendarMonthIcon />
                                    </IconButton>
                                    </Tooltip>  */}
                                {/* </Box> */}

                                {/* Bottom Row: Similarity */}
                                

                            </Paper>
                            </ClickAwayListener>
                    </Popper>
                    
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
                                placeholder="Ask or search anything..."
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
                            
                            <Tooltip title="Date Filter" placement="top" arrow>
                                <IconButton
                                    ref={filterButtonRef}
                                    onClick={handleFilterIconClick}
                                    sx={{
                                        width: '1.875vw',
                                        height: '1.875vw',
                                        borderRadius: '8px',
                                        color: '#FFD95C',  
                                        boxShadow: '2px 2px 8px #9A9A9A40',                                  
                                        bgcolor: '#fff',
                                        '&:hover': {
                                            bgcolor: '#ddd',
                                        },
                                    }}
                                    >
                                    <CalendarMonthIcon sx={{ fontSize: '0.9375vw' }} />
                                </IconButton>
                            </Tooltip>
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>

                                <IconButton
                                    onClick={onNotepadToggle}
                                    sx={{
                                        position: 'absolute',
                                        top: -68,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        p: 1,
                                        color: '#515151',
                                        bgcolor: '#ffd24e',
                                        '&:hover': { bgcolor: '#ffd24e' },
                                        display: 'none'
                                    }}
                                    >
                                    <EditNoteIcon sx={{ fontSize: 18 }}  />
                                </IconButton>

                                {/* your existing Send button */}
                                <Tooltip title="Send" placement="top" arrow>
                                    <IconButton
                                        sx={{
                                            bgcolor: '#FFD95C',
                                            width: '1.875vw',
                                            height: '1.875vw',
                                            borderRadius: '8px',
                                            boxShadow: '2px 2px 8px #9A9A9A40',
                                            color: '#515151',
                                            '&:hover': { bgcolor: '#FFCB42' },
                                        }}
                                        onClick={handleSend}
                                        >
                                        <Send sx={{ fontSize: '0.9375vw' }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
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
            </Paper>
            </>)}
        </Box>
    )
}

export default MainContent 