import React, { useState, useEffect,  useRef } from 'react'
import axios from 'axios'
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    InputAdornment,
    Chip,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    MenuItem,
    Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Backdrop, Snackbar, Fade, SnackbarContent, LinearProgress,
    GlobalStyles
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import {
    CloudUpload,
    Delete,
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import FilterListIcon from '@mui/icons-material/FilterList'
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import FilePresentIcon from '@mui/icons-material/FilePresent'
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import NotificationsIcon from '@mui/icons-material/Notifications'

const globalStyles = {
    '@keyframes toastProgress': {
        '0%':   { width: '0%'   },
        '100%': { width: '100%' },
    },
};

const DocumentIngestion = ({ open, onToggle }) => {
    
    const [isWide, setIsWide] = useState(false);
    const [searchTerm, setSearchTerm] = useState('')
    const [documentList, setDocumentList] = useState({})
    const categoryOptions = ['All', 'Lok Sabha', 'Rajya Sabha', 'COPU', 'Standing Committee']
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [uploadSource,   setUploadSource]   = useState('Lok Sabha')
    const fileInputRef = useRef(null)
    const [openDeleteDialog, setOpenDeleteDialog]     = useState(false);
    const [dialogDocName,    setDialogDocName]        = useState(null);

    const [uploadSnackOpen,  setUploadSnackOpen]      = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle')
    const [uploadProgressKey, setUploadProgressKey] = useState(0)
    const [stats, setStats] = useState(null);
    const [uploadDuration, setUploadDuration] = useState(5);

    const [isRepoLoading, setIsRepoLoading] = useState(false);
    const repoLoadingTimeoutRef = useRef(null);

    const repoOptions = ['Document Repository', 'Report Templates Repository']
    const [selectedRepo, setSelectedRepo] = useState('Document Repository') // default selected


    const sentenceCase = str =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const handleDeleteDoc = async (docName) => {
    try {
            await axios.post(
                `${import.meta.env.VITE_CHAT_API_URL}/deactivate-documents`,
                { document_names: [docName] }
            );
        } catch (error) {
            console.error('Error deactivating document', error);
        } finally {
            setOpenDeleteDialog(false);
            setDialogDocName(null);
            await fetchDocuments();
        }
    };

    const confirmDeleteDoc = () => {
    if (dialogDocName) {
        handleDeleteDoc(dialogDocName);
        }
    };

    const fetchDocuments = async () => {
        try {
            setIsRepoLoading(true);
            if (repoLoadingTimeoutRef.current) {
                clearTimeout(repoLoadingTimeoutRef.current);
                repoLoadingTimeoutRef.current = null;
            }
            repoLoadingTimeoutRef.current = setTimeout(() => {
                setIsRepoLoading(false);
                repoLoadingTimeoutRef.current = null;
            }, 30000);

            const isDocsRepo = selectedRepo === 'Document Repository';
            const url = isDocsRepo
                ? `${import.meta.env.VITE_CHAT_API_URL}/get_reference_pdfs`
                : `${import.meta.env.VITE_CHAT_API_URL}/get_templates`;

            const { data } = await axios.get(url, {
                params: {
                    offset: 0,
                    limit: 20,
                    max_file_bytes: 20971520,
                    max_return_bytes: 83886080,
                },
                headers: { accept: 'application/json' },
            });

            // API returns an array of { name, ...bytes }
            const names = Array.isArray(data)
                ? data.map(item => item?.name).filter(Boolean)
                : [];

            // Keep shape compatible with existing consumer (flattens values)
            setDocumentList({ __all: names });
        } catch (err) {
            console.error('Error loading documents', err);
            } finally {
                if (repoLoadingTimeoutRef.current) {
                clearTimeout(repoLoadingTimeoutRef.current);
                repoLoadingTimeoutRef.current = null;
            }
            setIsRepoLoading(false);
        }
    };

    const collectStats = async () => {
    try {
        const { data } = await axios.get(
        `${import.meta.env.VITE_CHAT_API_URL}/collection_stats`
        );
        setStats(data);
    } catch (error) {
        console.error('Error fetching stats', error);
    }
    };

    useEffect(() => {
        fetchDocuments();
        collectStats();
    }, [])

    useEffect(() => {
        return () => {
            if (repoLoadingTimeoutRef.current) clearTimeout(repoLoadingTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [selectedRepo]);

    const handleUploadFiles = async (e) => {
        const files = Array.from(e.target.files)
        const tooBig = files.filter(f => f.size > 10 * 1024 * 1024)
        if (tooBig.length) {
            alert(`These file(s) exceed 10 MB and won’t be uploaded:\n${tooBig.map(f=>f.name).join('\n')}`)
            e.target.value = null
            return
        }
        const formData = new FormData()
        files.forEach(f => formData.append('files', f))
        formData.append('source', uploadSource)

        formData.append('repository_type', selectedRepo === 'Document Repository' ? 'documents' : 'report_templates')

        const startMs = Date.now();
        try {
            setUploadStatus('loading')
            setUploadSnackOpen(true)
            setUploadProgressKey(prev => prev + 1) // reset progress bar animation

            await axios.post(
                `${import.meta.env.VITE_CHAT_API_URL}/upload-docs`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            const elapsed = Math.max(1, (Date.now() - startMs) / 1000);
            setUploadDuration(elapsed);

            await fetchDocuments()
            setUploadStatus('success')
            setTimeout(() => setUploadSnackOpen(false), 4000)
        } catch (err) {
            console.error('Error uploading files', err)
            setUploadStatus('error')
            setTimeout(() => setUploadSnackOpen(false), 4000)
        } finally {
        e.target.value = null
        }
    }

    const panelRef = useRef<HTMLDivElement>(null);
    const uploadBoxRef = useRef(null);

    return (
        <>
            <GlobalStyles styles={globalStyles} />
            <Paper
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
                    p: 1,
                    position: 'relative',
                    bgcolor: 'background.sidebar',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilePresentIcon sx={{color: '#081A33', fontSize: '1.25vw'}}/>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#081A33', fontSize: '1.25vw' }}>
                                Document Manager
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

                </Box> 
                <Box
                    sx={{
                        position: 'relative',
                        px: 1,
                        mb: 1,
                        ml: 3,
                        mr: 3,
                        bgcolor: '#e9f5fc',
                        border: '1px solid #008cff',
                        borderRadius: 2,
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                        transform: 'translateZ(0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <TextField
                        select
                        value={selectedRepo}
                        onChange={(e) => setSelectedRepo(e.target.value)}
                        size="medium"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                            width: '100%',
                            '& label': {
                                color: '#081A33',
                                fontWeight: 600,
                                fontSize: '0.7292vw',
                                transform: 'translate(0, -8px) scale(1)',
                            },
                            '& .MuiInputBase-root': {
                                background: 'transparent',
                                borderRadius: 2,
                                px: 1,
                                py: 0.5,
                            },
                            // remove any borders/underlines completely
                            '& .MuiInput-underline:before, & .MuiInput-underline:after': {
                                borderBottom: 'none',
                            },
                            '& .MuiSelect-icon': { color: '#081A33' },
                            color: '#081A33',
                        }}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        bgcolor: '#FFFBEF',
                                        color: '#081A33',
                                        '& .MuiMenuItem-root:hover': { bgcolor: '#FFD95C' },
                                        '& .Mui-selected': { bgcolor: '#FFD95C !important', fontWeight: 600 },
                                    },
                                },
                            },
                        }}
                    >
                        {repoOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                <Typography variant="body2" sx={{ fontSize: '0.7292vw', color: '#081A33' }}>
                                    {opt}
                                </Typography>
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>


                <Box
                    ref={uploadBoxRef}
                    sx={{
                        position: 'relative', 
                        px: 2,
                        py:1,
                        mb: 1,
                        ml: 3,
                        mr: 3,
                        bgcolor: '#e9f5fc',
                        border: '1px solid #008cff',
                        borderRadius: 2,
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                        transform: 'translateZ(0)',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.7292vw' }}>
                                Upload a file
                            </Typography>
                            <InsertDriveFileIcon sx={{ color: '#081A33', fontWeight: 600, fontSize: '0.833vw'  }} />
                        </Box>

                        {uploadSnackOpen && (
                            <Backdrop
                            open
                            container={() => uploadBoxRef.current}
                            sx={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: '100%', height: '100%',
                                backdropFilter: 'blur(2px)',
                                backgroundColor: 'rgba(255,255,255,0)',
                                zIndex: theme => theme.zIndex.snackbar - 1,
                            }}
                            />
                        )}
                        {/* upload notification */}
                        <Snackbar
                        open={uploadSnackOpen}
                        container={() => uploadBoxRef.current}
                        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
                        TransitionComponent={Fade}
                        key={uploadProgressKey}
                        sx={{ position: 'absolute',
                            top: '0%',
                            }} 
                        >
                        <SnackbarContent
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                mr: 1,
                                mt: 1,
                            backgroundColor:
                                uploadStatus === 'success'
                                ? '#e6f4ea'
                                : uploadStatus === 'error'
                                ? '#fce8e6'
                                : '#f0f0f0',
                            color: '#081A33',
                            border: `1px solid ${
                                uploadStatus === 'success'
                                ? '#137333'
                                : uploadStatus === 'error'
                                ? '#d93025'
                                : '#999'
                            }`,
                            borderRadius: 2,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            width: 360,
                            px: 2,
                            pt: 1,
                            pb: 0.5,
                            fontFamily: 'Inter, sans-serif',
                            }}
                            message={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {uploadStatus === 'success' && (
                                    <CheckCircleIcon sx={{ color: '#137333', fontSize: 20 }} />
                                )}
                                {uploadStatus === 'error' && (
                                    <ErrorIcon sx={{ color: '#d93025', fontSize: 20 }} />
                                )}
                                <Typography fontWeight={600} fontSize={14} sx={{ color: '#081A33' }}>
                                    {uploadStatus === 'success' && 'Upload successful'}
                                    {uploadStatus === 'error' && 'Upload failed'}
                                    {uploadStatus === 'loading' && 'Uploading document...'}
                                </Typography>
                                </Box>

                                {uploadStatus === 'loading' && (
                                    <Box
                                        sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '100%',
                                        height: 4,
                                        bgcolor: '#f0f0f0',
                                        overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                        sx={{
                                            height: '100%',
                                            bgcolor: '#0088D6',
                                            animation: `toastProgress ${uploadDuration}s linear forwards`,
                                        }}
                                        />
                                    </Box>
                                )}
                                {uploadStatus !== 'loading' && (
                                <Typography variant="caption" sx={{ color: '#081A33' }}>
                                    This message will close in 4 seconds.
                                </Typography>
                                )}
                            </Box>
                            }
                            action={
                                <>
                                    <NotificationsIcon sx={{ color: '#081A33', mr: 1, fontSize: 20 }} />
                                    <IconButton
                                        size="small"
                                        onClick={() => setUploadSnackOpen(false)}
                                        sx={{ color: '#081A33' }}
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </>
                            }
                        />
                        </Snackbar>
                        <Box
                            sx={{
                                border: 'none',
                                borderColor: 'primary.main',
                                borderRadius: 2,
                                p: 1,
                                textAlign: 'center',
                                bgcolor: '#FFD95C1A',   //later
                                boxShadow: '0px 2px 8px #76767640',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            
                            {/* --- CATEGORY DROPDOWN FOR UPLOAD --- */}
                            {/* <TextField
                            select
                            label="Select the Category"
                            value={uploadSource}
                            onChange={e => setUploadSource(e.target.value)}
                            size="medium"
                            sx={{
                                mt: 1,
                                mb:1,
                                width: '90%',
                                '& label': {
                                    color: '#081A33', // Label color
                                    fontWeight: 500,
                                    fontSize: '0.7292vw' // 14px at 1920px screen
                                },
                                '& label.Mui-focused': {
                                    color: '#081A33', // Focused label color
                                },
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: '#fff', // Background of dropdown
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: '#FFD95C', // Default border
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#FEC636', // Hover border
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#EDCC09', // Focus border
                                    },
                                    '& .MuiSelect-icon': {
                                        color: '#081A33', // your desired icon color
                                    },
                                },
                            }}
                            SelectProps={{
                                MenuProps: {
                                PaperProps: {
                                    sx: {
                                    bgcolor: '#FFFBEF', // Dropdown menu background
                                    color: '#081A33',   // Text color
                                    '& .MuiMenuItem-root:hover': {
                                        bgcolor: '#FFD95C', // Hover effect on items
                                    },
                                    '& .Mui-selected': {
                                        bgcolor: '#FFD95C !important', // Selected item background
                                        fontWeight: 600,
                                    },
                                    }
                                }
                                }
                            }}
                            >
                                {categoryOptions.slice(1).map(cat => (
                                    <MenuItem
                                    key={cat}
                                    value={cat.toLowerCase().replace(/ /g,'_')}
                                    sx={{
                                        display: 'block',           // Force block layout
                                        textAlign: 'left',  }}
                                    >
                                    <Typography variant="body2" sx={{ textAlign: 'left', fontSize: '0.7292vw' }}>
                                        {cat}
                                    </Typography>
                                    </MenuItem>
                                ))}
                            </TextField> */}

                            {/* hidden file input + upload handler */}
                            <input
                            type="file"
                            multiple
                            hidden
                            ref={fileInputRef}
                            onChange={handleUploadFiles}
                            />

                            <CloudUpload sx={{ fontSize: '2.0833vw', color: '#081A33' }} /> 
                            
                            <Typography variant="caption" display="block" color="#515151"
                            sx={{ fontWeight: 500, fontSize: '0.625vw', mt: -1}}>
                                Choose a file
                            </Typography>
                            <Typography variant="caption" display="block" color="#515151"
                            sx={{ fontWeight: 500, fontSize: '0.625vw', mt: -1}}>
                                DOCX format, up to 10MB
                            </Typography>
                            {stats?.last_upload_date && (
                                <Typography
                                    variant="caption"
                                    display="block"
                                    color="#515151"
                                    sx={{ fontWeight: 500, fontSize: '0.625vw', mt:-1, mb: 1 }}
                                >
                                    Last updated on {stats.last_upload_date}
                                </Typography>
                            )}
                            
                            <Button
                                variant="contained"
                                onClick={() => fileInputRef.current.click()}
                                sx={{
                                borderRadius: 2,
                                bgcolor: '#FFD95C',
                                color: '#515151',
                                textTransform: 'none',
                                px: 3,
                                py: 0.5,
                                fontWeight: 500,
                                fontSize: '0.7292vw',
                                mb:1,
                                }}
                            >
                                Browse File
                            </Button>
                        </Box>
                    </Box> 
                {stats && (
                <Box
                    sx={{
                    px: 2,
                    py:0.5,
                    ml: 3,
                    mr: 3,
                    mb: 1,
                    background: 'linear-gradient(to right, rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))',
                    borderRadius: 2,
                    border: '1px solid #CBD0DC',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.7292vw' }}>
                            Last Updated File
                        </Typography>
                        <HistoryIcon sx={{ color: '#081A33', fontWeight: 600, fontSize: '0.833vw'  }} />
                    </Box>
                    <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                    >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.625vw',fontWeight: 500 }}>
                        {stats.latest_document.document_name} 
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.52vw', fontWeight: 500 }}>
                        • {sentenceCase(stats.latest_document.document_type)}
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#515151', fontSize: '0.52vw' }}>
                        {stats.latest_document.date}
                    </Typography>
                    </Box>
                </Box>
                )}

                {/* <Box
                    sx={{
                    p: 1,
                    ml: 3,
                    mr: 3,
                    mb: 1,
                    bgcolor: '#e9f5fc',
                    borderRadius: 2,
                    border: '1px solid #008cff',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <Stack direction="row" sx={{  flexWrap: 'wrap', gap: '0.2083vw' }}>
                        {categoryOptions.map((cat) => (
                        <Chip
                            key={cat}
                            label={cat}
                            onClick={() => setSelectedCategory(cat)}
                            variant="filled"
                            size="small"
                            sx={{
                                px: '0.3vw',
                                py: '0.5vw',
                                fontWeight: 500,
                                fontSize: '0.625vw',
                                color: '#081A33',
                                borderRadius: '16px',
                                bgcolor: selectedCategory === cat ? '#edcc09' : '#FFD95C',
                                '&:hover': { backgroundColor: '#FEC636' },
                            }}
                        />
                        ))}
                    </Stack>
                </Box> */}
                
                <Box
                ref={panelRef}
                sx={{
                    px: 2,
                    py: 0.5,
                    ml:3, mr:3,
                    mb:2,
                    borderRadius: 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0, 
                    border: '1px solid #008cff',
                    transform: 'translateZ(0)',
                    bgcolor: '#e9f5fc',
                }}>
                    {/* Repo fetch loading overlay (matches CMDContent look & feel) */}
                    <Backdrop
                        open={isRepoLoading}
                        container={() => panelRef.current}
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(245,250,255,0.85)',
                            zIndex: (theme) => theme.zIndex.snackbar - 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.8854vw', color: '#081A33' }}
                        >
                            Loading…
                        </Typography>
                        <CircularProgress size="1.667vw" />
                    </Backdrop>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt:1, mb: 1, }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.7292vw' }}>
                            {selectedRepo}
                        </Typography>
                        <FolderCopyIcon sx={{ color: '#081A33', fontWeight: 600, fontSize: '0.833vw' }} />
                    </Box>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search here..."
                        size="small"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        sx={{
                                mb: 0.5,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: '#0088D614',
                                boxShadow: '0px 2px 8px #76767640',
                                borderRadius: 2,
                                color: '#BABABA',
                                fontSize: '0.8333vw',
                                fontWeight: 300,
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)', // Default border
                                    },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)', //no border color change on hover
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#515151', // When focused or selected border change
                                },
                                '& .MuiOutlinedInput-input': {
                                    py: 0.5,   // reduce vertical padding
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#67676799', fontSize: '0.833vw' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end" sx={{display: 'none'}}>
                                    <IconButton size="small">
                                        <FilterIcon sx={{ color: '#676767' }}/>
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    
                    <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto !important',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { 
                            width: '0.2083vw' 
                        },
                        '&::-webkit-scrollbar-track': { 
                            background: 'transparent'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#0088d7',
                            borderRadius: '3px',
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#0088d7 transparent'
                    }}>
                    
                    {/* determine which docs to show */}
                    {(() => {
                        const key = selectedCategory === 'All' ? null : selectedCategory.toLowerCase();
                        let docs = [];
                        if (key) {
                            docs = documentList[key] || [];
                        } else {
                            // { __all: [names...] }
                            docs = Object.values(documentList).flat();
                        }
                        // filter by search
                        return (
                        <List sx={{ px: 0, mb: 1 }}>
                            {docs
                            .filter(name =>
                                name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map(name => (
                                <ListItem
                                key={name}
                                disableGutters
                                sx={{
                                    bgcolor: '#A9C7FF0D',
                                    borderRadius: 2,
                                    mb: '0.2083vw',
                                    px: 2,
                                    py: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '0.5px solid #00000033',
                                }}
                                >
                                    <Typography
                                        sx={{
                                        fontWeight: 600,
                                        color: '#515151',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontSize: '0.8333vw'
                                        }}
                                    >
                                        {isWide
                                        ? name
                                        : (() => {
                                            const dotIdx = name.lastIndexOf('.');
                                            const ext    = dotIdx >= 0 ? name.slice(dotIdx) : '';
                                            const base   = dotIdx >= 0 ? name.slice(0, dotIdx) : name;
                                            return base.length > 20
                                            ? `${base.slice(0,20)}...${ext}`
                                            : name;
                                        })()
                                    }
                                    </Typography>
                                    {/* --- Delete Confirmation Dialog --- */}
                                    <Dialog
                                        open={openDeleteDialog}
                                        onClose={() => setOpenDeleteDialog(false)}
                                        container={() => panelRef.current}
                                        disablePortal
                                        BackdropProps={{ sx: { backgroundColor: 'rgba(255, 255, 255, 0)' , backdropFilter: 'blur(1px)',
                                            position: 'absolute',
                                            inset: 0,
                                        } }}
                                        PaperProps={{
                                            sx: {
                                                borderRadius: 2,
                                                width: '80%',
                                                maxWidth: 400,
                                                px: 1,
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
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            pb: 0.5,
                                            color: '#687382',
                                        }}>
                                            <Delete/> Delete Document?</DialogTitle>
                                        <DialogContent
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            color: '#687382',
                                            }}>
                                            <Typography>Are you sure you want to delete this document?</Typography>
                                        </DialogContent>
                                        <DialogActions
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            justifyContent: 'center',
                                            mt:-2,
                                            mb:1,
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
                                            onClick={confirmDeleteDoc}
                                            >
                                            Delete
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                    <IconButton 
                                    size="small"
                                    onClick={e => {
                                            e.stopPropagation();
                                            setDialogDocName(name);
                                            setOpenDeleteDialog(true);
                                    }}>
                                        <Tooltip title='Delete' placement='bottom' arrow>
                                            <Delete sx={{ fontSize: '0.8333vw', color: '#f08a8a' }} />
                                        </Tooltip>
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    )
                    })()}
                    </Box>
                </Box>
            </Paper>
        </>
    )
}

export default DocumentIngestion