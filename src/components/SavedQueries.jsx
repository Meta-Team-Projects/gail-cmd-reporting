import { useState, useEffect, useRef } from 'react';

import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
    Button,
    Divider,
    Collapse,
    Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download,
    Edit,
    Delete,
    Add as AddIcon,
    ContentCopy,
} from '@mui/icons-material'


import FilterListIcon from '@mui/icons-material/FilterList';
import PushPinIcon from '@mui/icons-material/PushPin';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw';
import jsPDF from 'jspdf'

const SavedQueries = ({ open, onToggle }) => {
    const categories = ['All', 'Pinned', 'Date']
    const [notes, setNotes] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [isWide, setIsWide] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [dialogNoteKey, setDialogNoteKey] = useState(null);

    const handleToggle = (key) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };
    const loadNotes = () => {
        const all = Object.keys(localStorage)
            .filter(k => k.startsWith('savedQuery_'))
            .map(k => {
                const note = JSON.parse(localStorage.getItem(k));
                return { key: k, ...note };
            })
            // pinned notes first
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        setNotes(all);
    };
    useEffect(() => {
        loadNotes();
        window.addEventListener('saved-query', loadNotes);
        return () => window.removeEventListener('saved-query', loadNotes);
    }, []);


    // open the confirmation dialog
    const handleDelete = (key) => {
        setDialogNoteKey(key);
        setOpenDeleteDialog(true);
    };

    // actually delete after confirmation
    const confirmDelete = () => {
        if (dialogNoteKey) {
            localStorage.removeItem(dialogNoteKey);
            window.dispatchEvent(new Event('saved-query'));
        }
        setOpenDeleteDialog(false);
        setDialogNoteKey(null);
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
    const handleDownload = async (note) => {
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(note.content, 180);
        pdf.text(lines, 10, 10);
        const pdfBlob = pdf.output('blob');
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${note.title}.pdf`,
                    types: [{
                        description: 'PDF Document',
                        accept: { 'application/pdf': ['.pdf'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(pdfBlob);
                await writable.close();
                return;
            } catch (fsError) {
                console.warn('Save canceled or failed:', fsError);
            }
        }
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${note.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    };
    const handlePin = (key) => {
        const note = JSON.parse(localStorage.getItem(key));
        note.pinned = !note.pinned;
        localStorage.setItem(key, JSON.stringify(note));
        window.dispatchEvent(new Event('saved-query'));
    };

    const panelRef = useRef<HTMLDivElement>(null);

    return (
        <Paper
            ref={panelRef}
            sx={{
                width: open ? (isWide ? '46.88vw' : '26.04vw') : 0,
                height: '87.5vh',
                    position: 'fixed',
                    right: '1.4vw',
                    top: '9.5vh',
                bgcolor: 'background.sidebar',
                transform: 'translateZ(0)',
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
                        <Download sx={{color: '#081A33', fontSize: '1.25vw'}}/> 
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#081A33', fontSize: '1.25vw' }}>
                            Saved Queries
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
                                <Tooltip title="Close" placement="bottom" arrow>
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
                            bgcolor: '#0088D614',   //later
                            borderRadius: 10,
                            height: '4.1667vh',
                            fontSize: '0.9375vw'
                        }
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

                <Stack direction="row" sx={{ mb: -1, flexWrap: 'wrap', gap: '0.41vw' }}>
                    <Box sx={{
                        display: 'flex', flexWrap: 'wrap',
                        gap: 1, flexGrow: 1}}>
                            {categories.map((category) => (
                            <Chip
                            key={category}
                            label={category}
                            onClick={() => setSelectedCategory(category)}
                            variant="filled"
                            size="small"
                            sx={{
                                px: '0.5vw',
                                py: '0.6vw',
                                fontWeight: 500,
                                fontSize: '0.7292vw',
                                color: '#081A33',
                                borderRadius: '16px',
                                bgcolor: selectedCategory === category ? '#edcc09' : '#FFD95C',
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
                {notes
                .filter(note => {
                    if (selectedCategory === 'All') return true;
                    if (selectedCategory === 'Pinned') return note.pinned;
                    return true;
                })
                .sort((a,b) => {
                    if (selectedCategory === 'Date') {
                        const parseDate = (d) => {
                            const [day, month, year] = d.split('/').map(Number);
                            return new Date(year, month-1, day);
                        };
                        return parseDate(b.date) - parseDate(a.date);
                    }
                    return 0;
                })
                .map((note) => (
                    <ListItem key={note.key}
                        onClick={() => handleToggle(note.key)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: '#FFFFFFCC',
                            '&:hover': { bgcolor: '#FFFFFFE6' },
                            boxShadow: '2px 8px 16px #DDEFFF',
                            borderRadius: 3,
                            mb: '0.4167vw',
                            px: 2,
                            pt: 1,
                            pb: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            position: 'relative',
                        }}>
                    `   <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                        e.stopPropagation();
                                        handlePin(note.key)}}
                            >
                                <Tooltip title="Pin" placement='right' arrow>
                                <PushPinIcon
                                    sx={{
                                        fontSize: '0.8333vw',
                                        fill: note.pinned ? 'black' : 'none',
                                        stroke: 'black',
                                        strokeWidth: 1.5,
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                                </Tooltip>
                            </IconButton>
                        </Box> 
                        <Box sx={{ position: 'absolute', top: 8, right: 20 }}>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Copy" placement='top' arrow>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(note.content)}}
                                    sx={{ 
                                        height: '1.25vw', width: '1.25vw', bgcolor: '#FFD95C', borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: '#FEC636', 
                                        }, 
                                    }}>
                                    <ContentCopy sx={{ fontSize: '0.6667vw', color: '#000000' }} />
                                </IconButton>
                                </Tooltip>
                                <Tooltip title="Download" placement='top' arrow>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(note)}}
                                    sx={{ height: '1.25vw', width: '1.25vw', bgcolor: '#FFD95C', borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: '#FEC636', 
                                        }, 
                                    }}>
                                    <Download sx={{ fontSize: '0.6667vw', color: '#000000' }} />
                                </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            mt: '0.833vw'
                        }}>
                            <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.9375vw' }}>
                                {note.title}
                            </Typography>
                            <IconButton size="small" >
                                <ChevronRight sx={{
                                    transform: expanded[note.key] ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                    color: '#000',
                                    fontSize: '0.9375vw'
                                }} />
                            </IconButton>
                        </Box>
                        {/* Bottom Bar: Date + Delete */}
                        {/* --- Delete Confirmation Dialog --- */}
                        <Dialog
                            open={openDeleteDialog}
                            onClose={() => setOpenDeleteDialog(false)}
                            container={() => panelRef.current}
                            disablePortal
                            BackdropProps={{ sx: { 
                                backgroundColor: 'transparent',
                                backdropFilter: 'grayscale(0.5) brightness(0.5)' ,
                                position: 'absolute',
                                inset: 0,
                            } }}
                            PaperProps={{
                                sx: {
                                m: 'auto',
                                borderRadius: 2,
                                width: '80%',
                                maxWidth: 400,
                                px: 2,
                                pt: 1,
                                pb: 2,
                                bgcolor: '#F5F7FA',        // or whatever light grey
                                boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
                                }
                            }}  
                            >
                            <DialogTitle
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1,
                                textAlign: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                pb: 1,
                                mb: 1,
                                color: '#687382',
                            }}>
                                <Delete/> Delete Query?</DialogTitle>
                            <DialogContent
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                textAlign: 'center',
                                justifyContent: 'center',
                                color: '#687382',
                                }}>
                                <Typography>Are you sure you want to delete this query?</Typography>
                            </DialogContent>
                            <DialogActions
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                textAlign: 'center',
                                justifyContent: 'center',
                                }}>
                                <Button 
                                    sx={{
                                    color: '#687382',
                                    width: 200,
                                    borderRadius: 999,
                                    }}
                                    onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                                <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#0088d7',
                                    py: 1,
                                    width: 200,
                                    borderRadius: 999,
                                    color: '#fff',
                                    '&:hover': {
                                    backgroundColor: '#0072b1',
                                    }
                                }}
                                onClick={confirmDelete}
                                >
                                Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 0,
                            mr: 0.5
                        }}>
                            <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.625vw' }}>
                                {note.date}
                            </Typography>
                            <IconButton
                                size="small"
                                sx={{ p: 0.5 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(note.key);
                                }}
                            >
                                <Tooltip title="Delete" placement='bottom' arrow>
                                <Delete sx={{ fontSize: '0.8333vw', color: '#f08a8a' }} />
                                </Tooltip>
                            </IconButton>
                        </Box>
                        <Collapse in={expanded[note.key]} timeout="auto" unmountOnExit>
                            <Box sx={{ ml: 2, mr: 2, mb: 1 }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}
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
                                                fontSize: '0.8333vw',
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
                                                fontSize: '0.7292vw',
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
                                    {note.content}
                                </ReactMarkdown>
                            </Box>
                        </Collapse>

                    </ListItem>
                ))}
            </List>

        </Paper>
    )
}

export default SavedQueries 