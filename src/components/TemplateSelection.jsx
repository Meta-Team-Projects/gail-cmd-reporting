import { useState, useEffect, useRef, useMemo  } from 'react'


import {
    Box,
    TextField,
    IconButton,
    Slider,
    Typography,
    CircularProgress,
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
    Divider,
    Chip,
    Stack,
    List,
    ListItem,
} from '@mui/material'

import { styled } from '@mui/system';
import axios from 'axios';

import arrowMask from '../assets/arrow.png'
import previousArrow from '../assets/previousarrow.png';
import currentArrow from '../assets/currentarrow.png';
import nextArrow from '../assets/nextarrow.png';
import templateArrowBlack from '../assets/templatearrow-black.png';
import templateArrowYellow from '../assets/templatearrow-yellow.png';

import placeholder_1 from '../assets/placeholder_1.png'
import placeholder_2 from '../assets/placeholder_2.png'
import placeholder_3 from '../assets/placeholder_3.png'
import placeholder_5 from '../assets/placeholder_5.png'
import {
    CloudUpload,
    FindInPage,
    PlayArrow as PlayArrowIcon,
    Search as SearchIcon,
} from '@mui/icons-material'
import FindInPageIcon from '@mui/icons-material/FindInPage';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

const steps = ['Report Template Selection','Reference Document Preview','Generate Report']
import { StepArrow,ArrowShape,ArrowLabel } from './StepArrow' 
import { setTemplateNumber } from './cmdTemplateStore';

const TemplateSelection = ({
    leftSidebarOpen,
    onNavigateToDoc,
    onNavigateToLandingPage,
    selectedPreview,
    setSelectedPreview,
    isEditMode
    }) => {
    const [templates, setTemplates] = useState([]); // [{ name, displayName, url }]
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [previewingTemplateName, setPreviewingTemplateName] = useState(null);
    const previewBoxRef = useRef(null);
    const [previewWidth, setPreviewWidth] = useState(800);
    const pdfUrlRef = useRef(null);               // currently selected preview URL
    const createdUrlsRef = useRef(new Set());     // track ALL blob URLs to revoke on unmount
    
    const addZoomParam = (url, zoom = 50) => {
            if (!url) return undefined;
            return url.includes('#') ? `${url}&zoom=${zoom}` : `${url}#zoom=${zoom}`;
    };

    const uploadsDisabled = true;


    // const categories = ['All', 'Pinned', 'Recently Viewed']
    const categories = ['All']
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false);
    const uploadSource = 'template-selection';
    const [searchTerm, setSearchTerm] = useState('')

    //const allImages = [...Array(18)].map((_, idx) => imageOptions[idx % imageOptions.length])
    const allImages = [
        ...Array(2).fill(placeholder_1),
        ...Array(2).fill(placeholder_5),
        ...Array(2).fill(placeholder_5),
    ]
    const imagesPerPage = 6
    const [page, setPage] = useState(0)

    const totalPages = Math.ceil(allImages.length / imagesPerPage)
    const handleNext = () => {
        if (page < totalPages - 1) setPage(prev => prev + 1)
    }
    const handlePrev = () => {
        if (page > 0) setPage(prev => prev - 1)
    }

    const currentImages = allImages.slice(
        page * imagesPerPage,
        page * imagesPerPage + imagesPerPage
    )

    const [cardsLoading, setCardsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setCardsLoading(false), 30000); // 30s
        return () => clearTimeout(timer);
    }, []);

    const MAX_TILES = 6;
    const tiles = useMemo(() => {
        const realCount = Math.min(templates.length, MAX_TILES);
        const real = templates.slice(0, realCount).map((t, idx) => ({
            key: t.name || t.displayName || `template-${idx}`,
            label: t.displayName || `CMD Template_${idx + 1}`,
            src: allImages[idx % allImages.length],
            url: t.url,
            name: t.name,        
            index: idx, 
            clickable: !!t.url,
        }));
        const placeholders = Array.from({ length: MAX_TILES - realCount }, (_, i) => {
            const idx = realCount + i;
            return {
                key: `placeholder-${idx + 1}`,
                label: `CMD Template_${idx + 1}`,
                src: allImages[idx % allImages.length],
                url: null,
                clickable: false,
            };
        });
        return [...real, ...placeholders];
    }, [templates, allImages]);

    // Convert base64 (with or without data-URL prefix / URL-safe chars) → Blob URL
    const base64ToPdfUrl = (b64) => {
        if (!b64) return null;
        let clean = b64.replace(/^data:application\/pdf;base64,/i, '').replace(/\s+/g, '');
        clean = clean.replace(/-/g, '+').replace(/_/g, '/');
        let byteChars;
    try {
        byteChars = atob(clean);
    } catch (e) {
        console.error('Invalid base64 for PDF:', e);
        return null;
    }
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    createdUrlsRef.current.add(url);
    return url;
    };

    //  fetch templates from backend on mount 
    useEffect(() => {
    const fetchTemplates = async () => {
        try {
        const url = `${import.meta.env.VITE_CHAT_API_URL}/get_templates?offset=0&limit=20&max_file_bytes=20971520&max_return_bytes=83886080`;
        const { data } = await axios.get(url, { headers: { accept: 'application/json' } });
        // data is an array of { name: "CMD Template_1.pdf", file_b64, ... }
        const mapped = (Array.isArray(data) ? data : []).map((t) => {
            const displayName = t?.name?.replace(/\.pdf$/i, '') || 'CMD Template_1';
            const url = base64ToPdfUrl(t.file_b64);
        return { name: t.name, displayName, url };
        });
        setTemplates(mapped);
        
        } catch (e) {
        console.error('Failed to fetch templates:', e);
        }
    };
    fetchTemplates();
    // cleanup on unmount: revoke any created object URLs
    return () => {
        try {
        createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        createdUrlsRef.current.clear();
    } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // keep PDF Page width responsive to container
    useEffect(() => {
    const update = () => {
        setPreviewWidth(Math.max(320, (previewBoxRef.current?.clientWidth || 800) - 32));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    }, []);



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

        const startMs = Date.now();
        try {
            setUploading(true);
            await axios.post(
                `${import.meta.env.VITE_CHAT_API_URL}/upload-docs`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            console.info('Upload finished in', Math.round((Date.now() - startMs)/1000), 's');
        } catch (err) {
            console.error('Error uploading files', err)
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    }

    

    const ArrowStepper = ({ activeStep }) => (
    <Box display="flex" justifyContent="center" mt={'0.8333vw'} width="100%" sx={{ px: '0.8333vw' }}>
        <Box display="flex" width="100%">
        {steps.map((label, idx) => {
            const isActive = idx === activeStep;
            const isComplete = idx < activeStep;

            let arrowImage;
            if (idx === 0) {
            if (isActive) arrowImage = templateArrowYellow;
            else if (isComplete) arrowImage = templateArrowBlack;
            else arrowImage = nextArrow;
            } else {
            if (isActive) arrowImage = currentArrow;
            else if (isComplete) arrowImage = previousArrow;
            else arrowImage = nextArrow;
            }
            let textColor;
            if (isActive) textColor = '#fff';        
            else if (isComplete) textColor = '#081A33'; 
            else textColor = '#B9B9B9';
            return (
            <Box
                key={label}
                sx={{
                flex: 1,
                position: 'relative',
                marginLeft: idx !== 0 ? '-0.625vw' : 0, // overlap by 20px
                }}
            >
                <StepArrow fg={textColor}>
                <ArrowShape
                    sx={{
                    backgroundImage: `url(${arrowImage})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100% 100%',
                    }}
                />
                <ArrowLabel fg={textColor} variant="body2" sx={{ fontSize: '0.7292vw'}}>{label}</ArrowLabel>
                </StepArrow>
            </Box>
            );
        })}
        </Box>
    </Box>
    );

  return (
    <Box
        sx={{
            marginTop: '2.5vh',
            height: '95vh',
            marginLeft: '1vw',
            //marginRight: '0.25vw',
            boxShadow: '2px 0px 8px #50505040',
            bgcolor:'#FFFFFF',
            border: '1px solid #E0E7F0',
            borderRadius: '15px',
            // borderRadius: layoutMode === 'expand' || layoutMode === 'collapse' 
            //     || layoutMode === 'fullscreenFormulate' || layoutMode === 'fullscreenMain' || layoutMode === 'fiftyfifty'
            //     ? '15px 0 0 15px'  
            //     : '15px',          
            overflow: 'hidden',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8333vw',
            maxWidth: {
                xs: '90%',
                sm: '94.5%',
                md: '98%'
            },
            transition: 'max-width 0.3s ease',
            //filter: dimMainContent ? 'grayscale(0.5) brightness(0.5)' : 'none',
            //bgcolor: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
            position: 'relative',
        }}
    >
        <Box sx={{
            p: '1.042vw',
            pb: 0, mb: '-1.25vw'
        }}>
            <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: '1.25vw', color: '#081A33'}}>
                CMD Reporting
            </Typography>
        </Box>
        <Box sx={{
            //border: '1px solid black',
            display: 'flex',
            height: '87vh'
        }}>
            {/* Left Section */}
            <Box sx={{
                //border: '1px solid red',
                maxWidth: leftSidebarOpen ? '41.67vw' : '46.88vw',
                flex: `0 0 ${leftSidebarOpen ? '41.67vw' : '46.88vw'}`,
                transition: 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column', 
                gap: '0.417vw'
            }}>
                {/* ─── Timeline Stepper ─── */}
                <ArrowStepper activeStep={0} />
                <Box
                    sx={{
                    px: '0.8333vw',
                    py:'0.7vw',
                    mx: '0.8333vw',
                    background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                    borderRadius: 2,
                    //border: '1px solid #CBD0DC',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    }}
                >
                    <Typography variant="subtitle2" sx={{
                        fontWeight: 600,fontSize: '0.8854vw', color: '#081A33', lineHeight: '1.4',
                    }}>
                        Select an existing template as a base for your CMD report.
                    </Typography>
                </Box>
                <Box sx={{
                    px: '0.8333vw',
                    py: '0.208vw',
                    pb: '0.417vw',
                    mx: '0.8333vw',
                    borderRadius: 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.417vw',
                    minHeight: 0,
                    //border: '0.5px solid #00000033',
                    transform: 'translateZ(0)',
                    bgcolor: '#F5FAFF'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.0417vw', color: '#081A33' }}>
                            Report Templates Repository
                        </Typography>
                    </Box>

                    <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
                        <Box sx={{ 
                            display: 'flex', flexWrap: 'wrap',
                            gap: '0.417vw', flexGrow: 1 }}>
                            {categories.map((category) => (
                                <Chip
                                    key={category}
                                    label={category}
                                    variant="filled"
                                    size="small"
                                    onClick={() => setSelectedCategory(category)}
                                    sx={{
                                        px: '0.469vw',
                                        py: '0.469vw',
                                        fontWeight: 500,
                                        fontSize: '0.7292vw',
                                        color: '#081A33',
                                        borderRadius: '16px',
                                        bgcolor: selectedCategory === category ? '#FEC636' : '#FFD95C',
                                        '&:hover': { bgcolor: '#FEC636' },
                                        //boxShadow: '0px 4px 8px #15151540'
                                    }}
                                />
                            ))}
                        </Box>
                    </Stack>
                    <Box sx={{ mr: '1.667vw', mt: '0.417vw',}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search here..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: '#0088D61A', //later
                                    borderRadius: 10,
                                    height: '1.563vw',
                                    fontSize: '0.833vw',
                                    color: '#515151',
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#515151', fontSize: '1.042vw' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                    <Box sx={{
                        mt: '0.417vw',
                        display:'flex',
                        ...(cardsLoading
                            ? {
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '28vh',
                                pr: '1.25vw',
                            }
                            : {
                                flexWrap: 'wrap',
                                gap: '2%',
                                pr: '1.25vw',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                '&::-webkit-scrollbar': { width: '0.2083vw' },
                                '&::-webkit-scrollbar-track': { background: 'transparent' },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#0088d7',
                                    borderRadius: '3px',
                                },
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#0088d7 transparent',
                            }
                        )
                    }}>
                        {cardsLoading ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, fontSize: '0.8854vw', color: '#081A33', mb: '0.625vw' }}
                                >
                                    Loading…
                                </Typography>
                                <CircularProgress size="1.667vw" />
                            </Box>
                        ) : (
                        tiles.map((tile) => (
                            <Tooltip
                                key={tile.key}
                                title={tile.clickable ? 'Click to preview' : 'Coming soon'}
                                placement="top"
                            >
                                <Box
                                    onClick={() => {
                                        if (!tile.clickable) return;
                                        const url = tile.url;
                                        if (url) {
                                            pdfUrlRef.current = url;
                                            setPdfPreviewUrl(url);
                                            setSelectedPreview?.(null);
                                            setPreviewingTemplateName(tile.label);
                                            const idx =
                                                typeof tile.index === 'number'
                                                ? tile.index
                                                : templates.findIndex(tt => tt.name === tile.name);
                                            const num = idx === 0 ? 12 : (idx === 1 ? 6 : null);
                                            setTemplateNumber(num);
                                        }
                                    }}
                                    sx={{
                                        position: 'relative',
                                        width: '48%',
                                        mb: '0.625vw',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        cursor: tile.clickable ? 'pointer' : 'not-allowed',
                                        opacity: tile.clickable ? 1 : 0.6,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={tile.src}
                                        alt={tile.label}
                                        sx={{ width: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            bgcolor: 'rgba(0,0,0,0.6)',
                                            color: '#fff',
                                            px: '0.625vw',
                                            py: '0.365vw',
                                            fontSize: '0.7292vw',
                                        }}
                                    >
                                        {tile.label}
                                    </Box>
                                </Box>
                            </Tooltip>
                        ))
                    )}
                    </Box>
                    {/* <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        Left Arrow
                        <IconButton 
                        onClick={handlePrev}
                        disabled={page === 0}
                        sx={{
                            color: '#081A33',
                            backgroundColor: '#FFD95C',
                            borderRadius: '50%',
                            '&:disabled': {opacity: 0.5},
                            '&:hover': {   
                            backgroundColor: '#FFCB42',
                            },
                        }}>
                            <PlayArrowIcon sx={{transform: 'scaleX(-1)'}}/>
                        </IconButton>
                        Page Label
                        <Typography variant="body2" 
                        sx={{color: '#AEAEAE'}}>
                            {page + 1}/{Math.ceil(allImages.length / imagesPerPage)}
                        </Typography>
                        Right Arrow
                        <IconButton 
                        onClick={handleNext}
                        disabled={page === totalPages - 1}
                        sx={{
                            color: '#081A33',
                            backgroundColor: '#FFD95C',
                            borderRadius: '50%',
                            '&:disabled': {opacity: 0},
                            '&:hover': {   
                            backgroundColor: '#FFCB42',
                            },
                        }}>
                            <PlayArrowIcon sx={{color: '#081A33'}}/>
                        </IconButton>
                    </Box> */}
                </Box>
                {/* <Box
                    sx={{
                        border: '2px dashed #E6E6E6',
                        borderRadius: 2,
                        p: '0.417vw',
                        textAlign: 'center',
                        bgcolor: '#FFD95C1A',   //later
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.208vw',
                        mx: '0.8333vw',
                        ...(uploadsDisabled && {
                            filter: 'grayscale(0.75) brightness(1) contrast(0.85)',
                            cursor: 'not-allowed',
                         '& *': { cursor: 'not-allowed !important' },
                        }),
                    }}
                    aria-disabled={uploadsDisabled}
                >
                    <input
                    type="file"
                    multiple
                    hidden
                    ref={fileInputRef}
                    onChange={uploadsDisabled ? undefined : handleUploadFiles}
                    disabled={uploadsDisabled}
                    />

                    <CloudUpload sx={{ fontSize: '2.0833vw', color: '#081A33' }} /> 
                    
                    <Typography variant="caption" display="block" color="#515151"
                    sx={{ fontWeight: 500, fontSize: '0.625vw', mt: '-0.208vw'}}>
                        Choose a file
                    </Typography>
                    <Typography variant="caption" display="block" color="#515151"
                    sx={{ fontWeight: 500, fontSize: '0.625vw', mt: '-0.208vw'}}>
                        DOCX format, up to 10MB
                    </Typography>
                    
                    <Button
                        variant="contained"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#0088D6',
                        color: '#ffffff',
                        textTransform: 'none',
                        px: '1.25vw',
                        py: '0.208vw',
                        fontWeight: 500,
                        fontSize: '0.7292vw',
                        my: '0.417vw',
                        }}
                    >
                        {uploading ? 'Uploading…' : 'Browse Reports'}
                    </Button>
                </Box> */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mx: '0.8333vw'
                }}>
                    <Button
                    variant= "contained"
                    onClick={onNavigateToLandingPage}
                    sx={{
                        fontSize: '0.78vw ',
                        fontWeight: 600,
                        color: '#081A33',
                        backgroundColor: '#FFD95C',
                        '&:hover': {bgcolor: '#FFCB42'}
                    }}
                    >
                        Back
                    </Button>
                    <Button
                    variant= "contained"
                    onClick={onNavigateToDoc}
                    sx={{
                        fontSize: '0.78vw',
                        fontWeight: 600,
                        color: '#081A33',
                        backgroundColor: '#FFD95C',
                        '&:hover': {bgcolor: '#FFCB42'}
                    }}
                    >
                        {isEditMode ? 'Done' : 'Next'}
                    </Button>
                </Box>
            </Box>
            {/* Right Section */}
            <Box sx={{
                //border: '1px solid blue',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Box sx={{ pt: '0.8333vw', flexGrow: 1 }}>
                    <Box
                        sx={{
                            border: '1px solid #D2D2D2',
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: '#F5FAFF',   //later
                            //boxShadow: '0px 2px 8px #76767640',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            ml: '0.417vw', mr: '0.8333vw', 
                            height: '100%',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                        }}
                    >
                        <Box
                        sx={{
                            background: '#0088D6CC',
                            height: '2.3vw',
                            width: '100%',
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: '0.625vw',
                            py: '0.625vw',
                            // gap: '0.625vw'
                        }}
                        >
                        <Typography
                            sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9375vw' }}
                        >
                            {
                                previewingTemplateName
                                    ? `Previewing Template: ${previewingTemplateName}`
                                    : 'Preview'
                            }
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.417vw' }}>
                            <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={addZoomParam(pdfPreviewUrl)|| undefined}
                            target={pdfPreviewUrl ? '_blank' : undefined}
                            rel={pdfPreviewUrl ? 'noreferrer' : undefined}
                            disabled={!pdfPreviewUrl}
                            sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.7)',
                                textTransform: 'none',
                                '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' },
                                fontSize: '0.7292vw', py: 0.3, px: '0.625vw'
                            }}
                            >
                            <OpenInNewIcon sx={{ fontSize: '1.0417vw', mr: 0.5 }} />
                            Open in new tab
                            </Button>
                            {/* <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={pdfPreviewUrl || undefined}
                            download={pdfPreviewUrl ? 'template.pdf' : undefined}
                            disabled={!pdfPreviewUrl}
                            sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.7)',
                                textTransform: 'none',
                                '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' },
                                fontSize: '0.7292vw', py: 0.3, px: '0.625vw'
                            }}
                            >
                            <FileDownloadOutlinedIcon sx={{ fontSize: '1.0417vw', mr: 0.5 }} />
                            Download
                            </Button> */}
                        </Box>
                        </Box>
                        <Box ref={previewBoxRef}  sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexGrow: 1,
                            width: '100%',
                        }}>
                            {pdfPreviewUrl ? (
                            <>
                                {/* Blob preview via iframe */}
                                <Box sx={{ flexGrow: 1, width: '100%', p: '0.833vw', boxSizing: 'border-box' }}>
                                <Box
                                    component="iframe"
                                    src={addZoomParam(pdfPreviewUrl)}
                                    title="Template preview"
                                    sx={{
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        border: 0,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                        backgroundColor: '#fff',
                                        borderRadius: 1,
                                    }}
                                />
                                </Box>
                            </>) : selectedPreview ? (
                                <>
                                <Box 
                                component="img"
                                src={selectedPreview}
                                alt="Selected Preview"
                                sx={{
                                    width: '100%',
                                    objectFit: 'contain'
                                }}
                                />
                                </>
                            ) : (
                                <>
                                    <FindInPageIcon sx={{ fontSize: '1.667vw', color: '#081A33', mb: '0.208vw' }} /> 

                                    <Typography variant="subtitle2"
                                    sx={{ fontWeight: 600, fontSize: '0.8854vw',
                                        color: '#081A33', opacity: 0.8
                                    }}>
                                        Select a template to preview
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
  )
}

export default TemplateSelection