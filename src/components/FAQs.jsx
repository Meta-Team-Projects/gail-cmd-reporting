import React, { useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Chip,
    Divider,
    Stack,
    Collapse,
    Tooltip
} from '@mui/material'
import {
    QuestionAnswer,
    ChevronRight,
    Search as SearchIcon,
    KeyboardArrowRight,
} from '@mui/icons-material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

const FAQs = ({ open, onToggle }) => {
    const categories = ['All', 'HR', 'Finance', 'Procurement']
    const initialFaqs = [
        {
            question: "What is GAIL's role in India's energy sector?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            isExpanded: false,
        },
        {
            question: "What initiatives has GAIL undertaken for expanding the natural gas pipeline network?",
            answer: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            isExpanded: false,
        },
        {
            question: "How does GAIL support government initiatives like 'Make in India' and 'Aatmanirbhar Bharat'?",
            answer: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            isExpanded: false,
        },
    ]

    const [faqs, setFaqs] = useState(initialFaqs)
    const [isWide, setIsWide] = useState(false);

    const handleToggle = (index) => {
        setFaqs(prev => prev.map((faq, i) =>
            i === index ? { ...faq, isExpanded: !faq.isExpanded } : faq
        ))
    }

    return (
        <Paper
            sx={{
                width: open ? (isWide ? '46.88vw' : '26.04vw') : 0,
                height: '87.5vh',
                    position: 'fixed',
                    right: '1.4vw',
                    top: '9.5vh',
                bgcolor: 'background.sidebar',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                borderLeft: '0.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                borderRadius: '15px',
                zIndex: 1100,
            }}
        >
            <Box sx={{
                p: 3,
                position: 'relative',
                bgcolor: 'background.sidebar',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QuestionAnswer sx={{color: '#081A33', fontSize: '1.25vw'}} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#081A33', fontSize: '1.25vw' }}>
                            FAQs
                        </Typography>
                    </Box>
                    {open && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                onClick={() => setIsWide(prev => !prev)}
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                {isWide ?
                                <Tooltip title="Collapse" placement="left" arrow> 
                                <CloseFullscreenIcon sx={{color: '#081A33', fontSize: '1.25vw'}}/> 
                                </Tooltip>: 
                                <Tooltip title="Expand" placement="left" arrow>
                                <AspectRatioIcon sx={{color: '#081A33', fontSize: '1.25vw'}}/>
                                </Tooltip>}
                            </IconButton>
                            <IconButton
                                onClick={onToggle}
                                sx={{
                                    color: '#081A33',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <Tooltip title="Close" placement='bottom' arrow>
                                <ChevronRight sx={{fontSize: '1.25vw'}}/>
                                </Tooltip>
                            </IconButton>
                        </Box>
                    )}

                </Box>
                <Divider sx={{ my: 1, mx: -3, borderColor: '#e0e0e0' }} />
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search here..."
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#0088D614',
                            borderRadius: 10,
                            height: '4.1667vh',
                            fontSize: '0.9375vw'
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#b1b8bb', fontSize: '1.4vw' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end" sx={{display: 'none'}}>
                                <FilterListIcon sx={{ color: '#b1b8bb' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack direction="row" sx={{ mb: -2, gap: '0.41vw' }}>
                    <Box sx={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 1, flexGrow: 1}}>
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                variant='filled'
                                size="small"
                                sx={{
                                    px: '0.5vw',
                                    py: '0.6vw',
                                    fontWeight: 500,
                                    fontSize: '0.7292vw',
                                    bgcolor: '#FFD95C',
                                    color: '#081A33',
                                    '&:hover': {
                                        backgroundColor: '#FEC636',
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Stack>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {faqs.map((faq, index) => (
                    <Box key={index} sx={{ mb: '0.416vw', borderRadius: 3, overflow: 'hidden' }}>
                        <ListItemButton
                            onClick={() => handleToggle(index)}
                            sx={{
                                bgcolor: '#f8eecf',
                                '&:hover': { bgcolor: '#ffd350' },
                            }}
                        >
                            <ListItemText
                                primary={faq.question}
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    sx: { color: 'text.primary', fontWeight: 600, fontSize: '0.73vw'},
                                }}
                            />
                            <KeyboardArrowRight
                                sx={{
                                    color: '#000',
                                    transform: faq.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                }}
                            />
                        </ListItemButton>
                        <Collapse in={faq.isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.73vw' }}>
                                    {faq.answer}
                                </Typography>
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </List>
        </Paper>
    )
}

export default FAQs