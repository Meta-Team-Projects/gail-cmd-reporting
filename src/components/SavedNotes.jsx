import {useState, useRef, useEffect, useLayoutEffect} from 'react';

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
    Tooltip,
    Divider,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit,
    Download,
    Delete,
    Note,
    Add as AddIcon,
} from '@mui/icons-material'
import PushPinIcon from '@mui/icons-material/PushPin';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw   from 'rehype-raw'
import { downloadAnswerAsPdf } from './downloadResponse';

const SavedNotes = ({ 
    open, onToggle,
    showNotepad,  onNotepadToggle,
    savedNotes = [],
    setSelectedNote,
    onDeleteNote  }) => {
    const categories = ['All', 'Pinned']
    const [notes, setNotes] = useState(savedNotes);
    const [isWide, setIsWide] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [dialogNoteIndex, setDialogNoteIndex] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDeleteIndex, setNoteToDeleteIndex] = useState(null);

    const [expandedNotes, setExpandedNotes] = useState({});
    const toggleExpand = (index) => {
        setExpandedNotes(prev => ({
        ...prev,
        [index]: !prev[index],
        }));
    };
    const [hasOverflow, setHasOverflow] = useState({});
    const contentRefs = useRef([]);

    useLayoutEffect(() => {
        const overflows = {};
        contentRefs.current.forEach((el, i) => {
            if (el) overflows[i] = el.scrollHeight > el.clientHeight;
        });
        setHasOverflow(overflows);
    }, [notes]);

    useEffect(() => {
        const onResize = () => {
            const overflows = {};
            contentRefs.current.forEach((el, i) => {
            if (el) overflows[i] = el.scrollHeight > el.clientHeight;
            });
            setHasOverflow(overflows);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    //useEffect(() => {setNotes(savedNotes);}, [savedNotes]);
    useEffect(() => {
        const withIndex = savedNotes.map((note, i) => ({
            ...note,
            originalIndex: note.originalIndex ?? i,
        }));
        setNotes(withIndex);
    }, [savedNotes]);


    const handleDelete = (index) => {
        if (onDeleteNote) onDeleteNote(notes[index].originalIndex);
        setNotes(prev => prev.filter((_, i) => i !== index));
    };

    const confirmDelete = () => {
        if (dialogNoteIndex !== null) {
            handleDelete(dialogNoteIndex);
            setOpenDeleteDialog(false);
            setDialogNoteIndex(null);
        }
    };

    const handlePinToggle = (index) => {
        setNotes(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], pinned: !updated[index].pinned };

            return updated.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return a.originalIndex - b.originalIndex;
            });
        });
    };


    const handleDownload = (note) => {
        downloadAnswerAsPdf({
            response: note.content,
            sources: note.sources,
            title: note.title || 'Saved Note',
            filename: `${note.title || 'note'}.pdf`
        })
    }

    const panelRef = useRef<HTMLDivElement>(null);

    return (
        <Paper
            ref={panelRef}
            sx={{
                width: open ? (isWide ? '46.88vw' : '26.04vw') : 0,
                height: '93vh',
                position: 'fixed',
                right: '1.4vw',
                top: '3.5vh',
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
                p: 2,
                position: 'relative',
                bgcolor: 'background.sidebar',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Note sx={{color: '#081A33', fontSize: '1.25vw'}}/> 
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#081A33', fontSize: '1.25vw' }}>
                            Saved Notes
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
                            //bgcolor: '#c0e1f4', 
                            bgcolor: '#0088D614', //later
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
                                <IconButton size="small">
                                    <FilterIcon sx={{ color: '#b1b8bb' }}/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Stack direction="row" sx={{ mr: 2, mb: -1, flexWrap: 'wrap', gap: '0.41vw' }}>
                    <Box sx={{ 
                        display: 'flex', flexWrap: 'wrap',
                        gap: 1, flexGrow: 1 }}>
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                variant="filled"
                                size="small"
                                onClick={() => setSelectedCategory(category)}
                                sx={{
                                    px: '0.5vw',
                                    py: '0.6vw',
                                    fontWeight: 500,
                                    fontSize: '0.7292vw',
                                    color: '#081A33',
                                    borderRadius: '16px',
                                    bgcolor: selectedCategory === category ? '#edcc09' : '#FFD95C',
                                    '&:hover': { bgcolor: '#FEC636' },
                                }}
                            />
                        ))}
                    </Box>
                    {/* <Tooltip title="Add Note" arrow>
                        <IconButton
                        size="small"
                        onClick={onNotepadToggle}
                        sx={{
                            backgroundColor: '#ffd24e',
                            color: '#515151',
                            width: 24,
                            height: 24,
                            p: 1,
                            borderRadius: '50%',
                            boxShadow: 1,
                            '&:hover': {
                            backgroundColor: '#ffd24e',
                            },
                        }}
                        >
                        <EditNoteIcon
                        sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip> */}
                </Stack>

            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
            {notes
                    .filter(note => {
                        if (selectedCategory === 'All') return true;
                        if (selectedCategory === 'Pinned') return note.pinned;
                        return true;
                    })
                    .map((note, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            bgcolor: '#FFFFFF',   //later
                            borderRadius: 3,
                            boxShadow: '2px 8px 16px #DDEFFF',  //later
                            mb: '0.4167vw',   //later
                            px: 2,
                            pt: 1,
                            pb: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            position: 'relative',
                        }}
                    >
                        {/* Top Icons */}
                        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                            <IconButton size="small"
                            onClick={() => {handlePinToggle(index)}} >
                                <Tooltip title="Pin" placement="right" arrow>
                                <PushPinIcon 
                                sx={{ fontSize: '0.8333vw', stroke: '#000',
                                    fill: note.pinned ? '#000' : 'none',
                                    strokeWidth: 1.5,
                                    transition: 'all 0.2s ease'}} />
                                </Tooltip>
                            </IconButton>
                        </Box>
                        <Box sx={{ position: 'absolute', top: 8, right: 16 }}>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit" placement="top" arrow>
                                <IconButton size="small" 
                                onClick={() => {
                                    setSelectedNote({ ...note, index});
                                    onNotepadToggle();
                                }}
                                sx={{ height: '1.25vw', 
                                    width: '1.25vw', 
                                    bgcolor: '#FFD95C', 
                                    borderRadius: 1, 
                                    '&:hover': {
                                        bgcolor: '#FEC636', 
                                    },  
                                    }}>
                                    <EditIcon sx={{ fontSize: '0.667vw', color: '#000000' }} />
                                </IconButton>
                                </Tooltip>
                                <Tooltip title="Download" placement="top" arrow>
                                <IconButton size="small"
                                    sx={{ height: '1.25vw',
                                        width: '1.25vw', 
                                        bgcolor: '#FFD95C', 
                                        borderRadius: 1, 
                                        '&:hover': {
                                            bgcolor: '#FEC636', 
                                        }, }}>
                                        
                                    <Download 
                                    onClick={() => handleDownload(note)}
                                    sx={{ fontSize: '0.6667vw', color: '#000000' }} />
                                </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                        {/* Note title & content */}
                        <Box sx={{ 
                            display: 'flex', alignItems: 'center', 
                            mt: '0.833vw' }}>
                            <Typography sx={{ 
                                flexGrow: 1, fontWeight: '600', color: '#081A33', 
                                fontSize: '0.9375vw', mt: 2, cursor: 'pointer' }}>
                                    {note.title}
                            </Typography>
                        </Box>
                        <Box
                            ref={el => contentRefs.current[index] = el}
                            sx={{
                                ml: 2,
                                mr: 2,
                                mb: 1,
                                fontSize: '0.833vw',
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                ...(expandedNotes[index]
                                ? {}
                                : {
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    }),
                            }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {note.content}
                            </ReactMarkdown>
                        </Box>
                        
                        {/* Bottom Bar: Delete Icon */}
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
                                <Delete/> Delete Note?</DialogTitle>
                            <DialogContent
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                textAlign: 'center',
                                justifyContent: 'center',
                                color: '#687382',
                                }}>
                                <Typography>Are you sure you want to delete this note?</Typography>
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
                                    onClick={() => setOpenDeleteDialog(false)}>Cancel
                                </Button>
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
                        {/* Bottom row: Read More/Less on left, Delete on right */}
                        <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 1,
                            mx: 0,
                        }}
                        >
                            {hasOverflow[index] && !expandedNotes[index] ? (
                            <Typography
                                variant="body2"
                                onClick={() => toggleExpand(index)}
                                sx={{ cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center' }}
                                >
                                Read More <ExpandMoreIcon fontSize="small" />
                                </Typography>
                            ) : hasOverflow[index] && expandedNotes[index] ? (
                                <Typography
                                    variant="body2"
                                    onClick={() => toggleExpand(index)}
                                    sx={{ cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center' }}
                                >
                                Read Less <ExpandLessIcon fontSize="small" />
                                </Typography>
                            ) : <Box />} 

                            <IconButton
                                size="small"
                                onClick={e => {
                                    e.stopPropagation();
                                    setDialogNoteIndex(index);
                                    setOpenDeleteDialog(true);
                                }}
                                sx={{ py: 0.5 }}
                            >
                                <Tooltip title="Delete" placement="bottom" arrow>
                                    <Delete sx={{ fontSize: '0.8333vw', color: '#f08a8a' }} />
                                </Tooltip>
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        mx: 'auto',
                        display: 'block',
                        color: '#fff',
                        bgcolor: '#0087d6',
                        fontSize: '0.8333vw'
                    }}
                >
                    Save and update
                </Button>
            </Box>
        </Paper>
    )
}

export default SavedNotes 

