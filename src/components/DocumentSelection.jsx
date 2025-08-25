import { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'

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
    ListItem
} from '@mui/material'

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PanoramaFishEyeOutlinedIcon from '@mui/icons-material/PanoramaFishEyeOutlined';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
// import placeholder from '../assets/placeholder.png'
// import placeholder_2 from '../assets/placeholder_2.png'
// import placeholder_3 from '../assets/placeholder_3.png'
import {
    CloudUpload,
    PlayArrow as PlayArrowIcon,
    Delete,
} from '@mui/icons-material'

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

const steps = ['Template Selection','Document Selection','Generate Report','Final Report']
import { StepArrow,ArrowShape, ArrowLabel } from './StepArrow' 
import arrowMask from '../assets/arrow.png';
import previousArrow from '../assets/previousarrow.png';
import currentArrow from '../assets/currentarrow.png';
import nextArrow from '../assets/nextarrow.png';
import templateArrowBlack from '../assets/templatearrow-black.png';
import templateArrowYellow from '../assets/templatearrow-yellow.png';


const DocumentSelection = ({
    leftSidebarOpen,
    selectedPreview,
    onNavigateToTemplate,
    onNavigateToReport,
    selectedDocs,
    setSelectedDocs,
    setUploadStatus,
    setUploadSnackOpen,
    setUploadProgressKey,
    setUploadDuration,
    }) => {
    const categories = ['Reference PDFs', 'Uploaded']
    const [selectedCategory, setSelectedCategory] = useState('Reference PDFs');
    const [documentList, setDocumentList] = useState({})
    const [referencePdfs, setReferencePdfs] = useState([]); // [{ name, url }]
    const [templatePdfUrl, setTemplatePdfUrl] = useState(null); // fallback preview (same as TemplateSelection)
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [previewingName, setPreviewingName] = useState(null);
    const [previewingType, setPreviewingType] = useState('template'); 
    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null)
    const createdUrlsRef = useRef(new Set());
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 7;

    const [refLoading, setRefLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setRefLoading(false), 12000); // 8 seconds
        return () => clearTimeout(t);
    }, []);

    const addZoomParam = (url, zoom = 50) => {
        if (!url) return undefined;
        return url.includes('#') ? `${url}&zoom=${zoom}` : `${url}#zoom=${zoom}`;
    };

    const b64ToBlobUrl = (b64, mime = 'application/pdf') => {
        if (!b64) return null;
        let clean = b64.replace(/^data:[^;]+;base64,/i, '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
        let bytes;
        try { bytes = atob(clean); } catch { return null; }
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: mime });
        const url = URL.createObjectURL(blob);
        createdUrlsRef.current.add(url);
        return url;
        };

        // Dynamic docs list based on category
        const key = selectedCategory.toLowerCase();
        let docs =
        key === 'reference pdfs'
            ? referencePdfs.map(f => f.name)
            : Object.values(documentList).flat();
        const paginatedDocs = docs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
        const totalPages = Math.ceil(docs.length / itemsPerPage);


    const handleToggle = (name) => {
        setSelectedDocs(prev =>
            prev.includes(name)
            ? prev.filter(n => n !== name)
            : [...prev, name]
        );
    };

    const [visibleDocs, setVisibleDocs] = useState({});
    const handleToggleVisibility = (docName) => {
    setVisibleDocs(prev => {
        const willBeVisible = !prev[docName];
        const next = { ...prev, [docName]: willBeVisible };
        const url = refUrlByName[docName]; // only exists for Reference PDFs
        if (url) {
        setPdfPreviewUrl(curr =>
            willBeVisible ? url : (curr === url ? null : curr)
        );
        if (willBeVisible) {
        setPreviewingName(docName);
        setPreviewingType('document');
        } else {
            setPreviewingName(null);
            setPreviewingType('template');
        }
        }
        return next;
    });
    };
    
    // const imageOptions = [placeholder, placeholder_2, placeholder_3]
    // //const allImages = [...Array(18)].map((_, idx) => imageOptions[idx % imageOptions.length])
    // const allImages = [
    //     ...Array(6).fill(placeholder),
    //     ...Array(6).fill(placeholder_2),
    //     ...Array(6).fill(placeholder_3),
    // ]
    // const [page, setPage] = useState(0)
    
    const handleUploadFiles = async (e) => {
        const files = Array.from(e.target.files || []);

        // 10 MB guard (same as before)
        const tooBig = files.filter(f => f.size > 10 * 1024 * 1024);
        if (tooBig.length) {
            alert(`These file(s) exceed 10 MB and won’t be uploaded:\n${tooBig.map(f => f.name).join('\n')}`);
            e.target.value = null;
            return;
        }

        // optional meta (tweak or derive from UI if needed)
        const defaultReportDate = "";  // e.g. "2025-08-24" if you have it
        const defaultDocLink   = "";   // e.g. a source URL if relevant
        const defaultBatchSize = 128;  // matches Swagger example

        const startMs = Date.now();
        try {
            setIsUploading(true); 
            setUploadStatus?.('loading');
            setUploadSnackOpen?.(true);
            setUploadProgressKey?.(prev => prev + 1); // keep your progress bar reset

            const uploadedNames = [];
            for (const file of files) {
                const source = selectedCategory === 'Reference PDFs' ? 'reference' : 'uploaded';
                console.log('Uploading', file.name, 'to source =', source);
                const fd = new FormData();
                fd.append('file', file);                        // <-- REQUIRED
                fd.append('report_date', defaultReportDate);    // <-- OPTIONAL (string)
                fd.append('doc_link', defaultDocLink);          // <-- OPTIONAL (string)
                fd.append('batch_size', String(defaultBatchSize)); // <-- OPTIONAL (int)
                fd.append('upload_source', source);
            

            const res = await axios.post(
                `${import.meta.env.VITE_CHAT_API_URL}/ingest-document`,
                fd,
                { headers: { 'Content-Type': 'multipart/form-data', accept: 'application/json' } }
            );
            console.log('ingest response', res.status, res.data);
            uploadedNames.push(file.name);
            }

            const elapsed = Math.max(1, (Date.now() - startMs) / 1000);
            setUploadDuration?.(elapsed);

            const refreshed = await fetchReferencePdfs(); // get fresh list synchronously
            setUploadStatus?.('success');
            setTimeout(() => setUploadSnackOpen?.(false), 4000);
            const namesNow = referencePdfs.map(f => f.name);
            const present = uploadedNames.filter(n => namesNow.includes(n));
            console.log('Uploaded & present:', present, 'of', uploadedNames);

            setUploadStatus?.('success');
            setTimeout(() => setUploadSnackOpen?.(false), 4000);
        } catch (err) {
            console.error('Error uploading files', err);
            setUploadStatus?.('error');
            setTimeout(() => setUploadSnackOpen?.(false), 4000);
        } finally {
            setIsUploading(false);
            e.target.value = null; // reset picker
        }
    };

    
    const fetchReferencePdfs = async () => {
        try {
            const url = `${import.meta.env.VITE_CHAT_API_URL}/get_reference_pdfs?offset=0&limit=20&max_file_bytes=20971520&max_return_bytes=83886080`;
            const { data } = await axios.get(url, { headers: { accept: 'application/json' } });
            const mapped = (Array.isArray(data) ? data : []).map((f) => ({
                name: f?.name || 'Document.pdf',
                url: b64ToBlobUrl(f?.file_b64, 'application/pdf')
            }));
            setReferencePdfs(mapped);
            return mapped;
        } catch (err) {
            console.error('Error loading reference PDFs', err);
            return [];
        }
    };
    const fetchTemplateForPreview = async () => {
        try {
            const url = `${import.meta.env.VITE_CHAT_API_URL}/get_templates?offset=0&limit=20&max_file_bytes=20971520&max_return_bytes=83886080`;
            const { data } = await axios.get(url, { headers: { accept: 'application/json' } });
            const arr = Array.isArray(data) ? data : [];
            const t1 = arr.find(t => (t?.name || '').toLowerCase().startsWith('cmd template_1')) || arr[0];
            if (t1?.file_b64) {
                const blobUrl = b64ToBlobUrl(t1.file_b64, 'application/pdf');
                setTemplatePdfUrl(blobUrl);
                setPreviewingName(t1?.name || 'Template.pdf');
                setPreviewingType('template');
            }
        } catch (err) {
            console.error('Error fetching template for preview', err);
        }
    };

    useEffect(() => {
            fetchReferencePdfs();
            fetchTemplateForPreview();
            // cleanup blob URLs on unmount
            return () => {
                try {
                    createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
                    createdUrlsRef.current.clear();
                } catch {}
            };
    }, []);


    const refUrlByName = useMemo(
        () => Object.fromEntries(referencePdfs.map(f => [f.name, f.url])),
        [referencePdfs]
    );

    const visibleRepoDocs = useMemo(() => {
        return selectedCategory.toLowerCase() === 'reference pdfs'
            ? referencePdfs.map(f => f.name)
            : Object.values(documentList).flat();
    }, [selectedCategory, referencePdfs, documentList]);

    // Select-all helpers (for current category)
    const allVisibleSelected =
        visibleRepoDocs.length > 0 &&
        visibleRepoDocs.every(n => selectedDocs.includes(n));
    const someVisibleSelected =
        !allVisibleSelected &&
        visibleRepoDocs.some(n => selectedDocs.includes(n));

    const handleToggleAllVisible = () => {
        setSelectedDocs(prev => {
            const prevSet = new Set(prev);
            const makeAll = !visibleRepoDocs.every(n => prevSet.has(n));
            if (makeAll) {
                // add all visible docs
                return Array.from(new Set([...prev, ...visibleRepoDocs]));
            }
            // remove all visible docs
            return prev.filter(n => !visibleRepoDocs.includes(n));
        });
    };

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
                CMD Platform
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
                transition: 'max-width 0.3s ease',
                display: 'flex',
                flexDirection: 'column', 
                gap: '0.417vw'
            }}>
                {/* ─── Timeline Stepper ─── */}
                <ArrowStepper activeStep={1} />
                <Box
                    sx={{
                    px: '0.8333vw',
                    py:'0.7vw',
                    mx: '0.8333vw',
                    background: 'linear-gradient(to right, rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))',
                    borderRadius: 2,
                    //border: '1px solid #CBD0DC',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    //height: '100px',
                    transition: 'all 0.3s ease',
                    }}
                >
                    
                    {/* <Typography variant="subtitle2" sx={{
                        fontWeight: 600, fontSize: '20px', color: '#081A33'
                    }}>
                        Document Selection
                    </Typography> */}
                    <Typography variant="subtitle2" sx={{
                        fontWeight: 600, fontSize: '0.8854vw', color: '#081A33', lineHeight: '1.4',
                    }}>
                        Select files from the repository and/or upload new files for updating the contents of the CMD report.                    </Typography>
                </Box>

                <Box sx={{
                    //border: '1px solid black',
                    display: 'flex',
                    height: '67vh',
                    flex: 1,
                    mx: '0.8333vw',
                    gap: '0.417vw',
                }}>
                    {/* Left of Left */}
                    <Box sx={{
                        //border: '1px solid green',
                        bgcolor: '#F5FAFF',
                        overflow: 'hidden',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1.2,
                        px: '0.8333vw',
                        py: '0.208vw',
                        pb: '0.8333vw',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '0.208vw' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.0417vw', color: '#081A33' }}>
                                Documents Repository
                            </Typography>
                        </Box>
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '0.41vw' }}>
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
                        <Box
                        sx={{
                            mt: '0.417vw', pr: '0.417vw',
                            // flexGrow: 1,
                            maxHeight: '65vh',
                            overflowY: 'auto !important',
                            overflow: 'hidden',
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
                        {(isUploading) || (selectedCategory === 'Reference PDFs' && refLoading) ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '55vh'
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, fontSize: '0.8854vw', color: '#081A33', mb: '0.625vw' }}
                                >
                                    {isUploading ? 'Uploading document… Please wait' : 'Loading…'}
                                </Typography>
                                <CircularProgress size="1.667vw" />
                            </Box>
                        ) : (
                            (() => {
                                const key = selectedCategory.toLowerCase();
                                let docs = visibleRepoDocs; // use memoized visible docs
                                return (
                                    <>
                                    {/* Select-all row */}
                                    <Box
                                        onClick={handleToggleAllVisible}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.417vw',
                                            py: '0.313vw',
                                            px: '0.417vw',
                                            mb: '0.417vw',
                                            borderBottom: '1px dashed #D2D2D2',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleToggleAllVisible(); }}
                                        >
                                            {allVisibleSelected ? (
                                                <RadioButtonCheckedOutlinedIcon sx={{ fontSize: '0.8333vw', color: '#081A33' }} />
                                            ) : someVisibleSelected ? (
                                                <IndeterminateCheckBoxOutlinedIcon sx={{ fontSize: '0.8333vw', color: '#081A33' }} />
                                            ) : (
                                                <PanoramaFishEyeOutlinedIcon sx={{ fontSize: '0.8333vw', color: '#515151' }} />
                                            )}
                                        </IconButton>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.8333vw', color: '#081A33' }}>
                                            Select all documents
                                        </Typography>
                                    </Box>

                                    <List sx={{ px: 0 }}>
                                        {docs.map(name => {
                                            const isSelected = selectedDocs.includes(name);
                                            return (
                                                <ListItem
                                                    key={name}
                                                    disableGutters
                                                    onClick={() => {
                                                        handleToggleVisibility(name);
                                                    }}
                                                    sx={{
                                                        bgcolor: isSelected ? '#A9C7FF66' : 'transparent',
                                                        borderRadius: 2,
                                                        mb: '0.208vw',
                                                        p: '0.208vw',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        border: visibleDocs[name] ? '1px solid #0b2c5bff' : '0.5px solid #00000033',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: '0.417vw'}}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedDocs(prev =>
                                                                    prev.includes(name)
                                                                        ? prev.filter(n => n !== name)
                                                                        : [...prev, name]
                                                                );
                                                            }}
                                                        >
                                                            {isSelected ? (
                                                                <RadioButtonCheckedOutlinedIcon
                                                                    sx={{ fontSize: '0.8333vw', fill: '#081A33', strokeWidth: 1, transition: 'all 0.2s ease' }}
                                                                />
                                                            ) : (
                                                                <PanoramaFishEyeOutlinedIcon
                                                                    sx={{ fontSize: '0.8333vw', color: '#515151', transition: 'all 0.2s ease' }}
                                                                />
                                                            )}
                                                        </IconButton>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: '#1C1C1C',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                fontSize: '0.8333vw'
                                                            }}
                                                        >
                                                           {(() => {
                                                                const dotIdx = name.lastIndexOf('.');
                                                                const ext  = dotIdx >= 0 ? name.slice(dotIdx) : '';
                                                                const base = dotIdx >= 0 ? name.slice(0, dotIdx) : name;
                                                                return base.length > 20
                                                                    ? `${base.slice(0,20)}...${ext}`
                                                                    : name;
                                                           })()}
                                                        </Typography>
                                                    </Box>
                                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                                        {/* <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleVisibility(name);
                                                            }}
                                                        >
                                                            {visibleDocs[name] ? (
                                                                <VisibilityIcon sx={{ fontSize: '0.8333vw', color: '#081A33' }} />
                                                            ) : (
                                                                <VisibilityOffIcon sx={{ fontSize: '0.8333vw', color: '#081A33'}} />
                                                            )}
                                                        </IconButton> */}
                                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                                                            <Tooltip title='Delete' placement='bottom' arrow>
                                                                <Delete sx={{ fontSize: '0.8333vw', color: '#f08a8a' }} />
                                                            </Tooltip>
                                                        </IconButton>
                                                    </Box>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </>
                                );
                            })()
                        )}
                        </Box>
                    </Box>

                    {/* Right of Left */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        gap: '0.417vw',
                    }}>
                        {/* Browse File Box */}
                        <Box sx={{
                            border: '2px dashed #E6E6E6',
                            borderRadius: 2,
                            p: '0.417vw',
                            textAlign: 'center',
                            bgcolor: '#FFD95C1A',   //later
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.208vw',
                            height: '30%',
                        }}>
                            {/* hidden file input + upload handler */}
                            <input
                            type="file"
                            multiple
                            hidden
                            ref={fileInputRef}
                            onChange={handleUploadFiles}
                            accept=".pdf,application/pdf,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            />

                            <CloudUpload sx={{ fontSize: '2.0833vw', color: '#081A33' }} /> 
                            
                            <Typography variant="caption" display="block" color="#515151"
                            sx={{ fontWeight: 500, fontSize: '0.78vw'}}>
                                Choose a file
                            </Typography>
                            <Typography variant="caption" display="block" color="#515151"
                            sx={{ fontWeight: 500, fontSize: '0.78vw'}}>
                                PDF format, up to 10MB
                            </Typography>
                            
                            <Button
                                variant="contained"
                                onClick={() => fileInputRef.current.click()}
                                sx={{
                                borderRadius: 2,
                                bgcolor: '#0088D6',
                                color: '#ffffff',
                                textTransform: 'none',
                                px: '1.25vw',
                                py: '0.208vw',
                                fontWeight: 500,
                                fontSize: '0.78vw',
                                mt: '0.417vw',
                                mb: '0.417vw',
                                }}
                            >
                                Browse File
                            </Button>
                        </Box>

                        {/* Selected Documents Box */}
                        <Box sx={{
                            borderRadius: 2,
                            px: '0.833vw',
                            py: '0.208vw',
                            pb: '0.833vw',
                            textAlign: 'center',
                            bgcolor: '#F5FAFF',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.208vw',
                            flex: 1,
                            //height: '70%',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '0.208vw' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.0417vw', color: '#081A33' }}>
                                    Selected Documents
                                </Typography>
                            </Box>
                            <Box
                            sx={{
                                flexGrow: 1,
                                pr: '0.417vw',
                                maxHeight: '50vh',
                                overflowY: 'auto !important',
                                overflow: 'hidden',
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
                                // flatten all docs if 'All', else pick selected category
                                // const key = selectedCategory === 'All'
                                // ? null
                                // : selectedCategory.toLowerCase()
                                // let docs = []
                                // if (key) {
                                // docs = documentList[key] || []
                                // } else {
                                // docs = Object.values(documentList).flat()
                                // }
                                const docs = selectedDocs;
                                // filter by search
                                return (
                                <List sx={{ px: 0 }}>
                                    {docs
                                    // .filter(name =>
                                    //     name.toLowerCase().includes(searchTerm.toLowerCase())
                                    // )
                                    .map(name => {
                                        //const isSelected = selectedDocs.includes(name);
                                        return (
                                        <ListItem
                                        key={name}
                                        disableGutters
                                        onClick={() => {
                                            handleToggleVisibility(name);
                                        }}
                                        sx={{
                                            bgcolor: '#A9C7FF66',
                                            borderRadius: 2,
                                            mb: '0.208vw',
                                            p: '0.208vw',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: visibleDocs[name] ? '1px solid #0b2c5bff' : '0.5px solid #00000033',
                                            cursor: 'pointer'
                                        }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: '0.417vw'}}>
                                                    <IconButton
                                                    size="small"
                                                    // onClick={() => {
                                                    // setSelectedDocs(prev =>
                                                    //     prev.includes(name)
                                                    //     ? prev.filter(n => n !== name)
                                                    //     : [...prev, name]
                                                    // );
                                                    // }}
                                                    >
                                                    <RadioButtonCheckedOutlinedIcon
                                                        sx={{
                                                            fontSize: '0.8333vw',
                                                            fill: '#081A33',
                                                            //stroke: '#515151',
                                                            strokeWidth: 1,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        />
                                                        
                                                </IconButton> 
                                                <Typography
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#1C1C1C',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        fontSize: '0.8333vw'
                                                    }}
                                                    >
                                                    {(() => {
                                                        const dotIdx = name.lastIndexOf('.');
                                                        const ext    = dotIdx >= 0 ? name.slice(dotIdx) : '';
                                                        const base   = dotIdx >= 0 ? name.slice(0, dotIdx) : name;
                                                        return base.length > 20
                                                        ? `${base.slice(0,20)}...${ext}`
                                                        : name;
                                                    })()
                                                }
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                                {/* <IconButton
                                                size="small"
                                                onClick={() => handleToggleVisibility(name)}
                                                >
                                                    {visibleDocs[name] ? (
                                                        <VisibilityIcon sx={{ fontSize: '0.8333vw', color: '#081A33' }} />
                                                    ) : (
                                                        <VisibilityOffIcon sx={{ fontSize: '0.8333vw', color: '#081A33'}} />
                                                    )}
                                                </IconButton> */}
                                                <IconButton 
                                                size="small"
                                                // onClick={e => {
                                                //         e.stopPropagation();
                                                //         setDialogDocName(name);
                                                //         setOpenDeleteDialog(true);
                                                //}}
                                                >
                                                    <Tooltip title='Delete' placement='bottom' arrow>
                                                        <Delete sx={{ fontSize: '0.8333vw', color: '#f08a8a' }} />
                                                    </Tooltip>
                                                </IconButton>
                                            </Box>
                                        </ListItem>
                                    );
                                    })}
                                </List>
                            )
                            })()}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mx: '0.8333vw'
                }}>
                    <Button
                    variant= "contained"
                    onClick={onNavigateToTemplate}
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
                    onClick={async () => {
                        try {
                          // POST selected file names (both ref + uploaded—backend can accept/ignore as needed)
                                const body = { filenames: selectedDocs };
                                const url = `${import.meta.env.VITE_CHAT_API_URL}/selecting_reference_files`;
                                const { data } = await axios.post(url, body, {
                                headers: { 'Content-Type': 'application/json', accept: 'application/json' }
                            });
                        } catch (err) {
                            console.error('Error submitting selected files', err);
                        } finally {
                            onNavigateToReport();
                        }
                    }}
                    sx={{
                        fontSize: '0.78vw',
                        fontWeight: 600,
                        color: '#081A33',
                        backgroundColor: '#FFD95C',
                        '&:hover': {bgcolor: '#FFCB42'}
                    }}
                    >
                        Next
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
                        {/* Header bar + actions (matches TemplateSelection) */}
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
                            }}
                            >
                            <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9375vw' }}>
                                {previewingType === 'document' && previewingName
                                    ? `Previewing Document: ${previewingName}`
                                    : previewingType === 'template' && previewingName
                                    ? `Previewing Template: ${previewingName}`
                                    : 'Previewing Template: CMD Template_1'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.417vw' }}>
                                <Button
                                size="small"
                                variant="outlined"
                                component="a"
                                href={addZoomParam(pdfPreviewUrl || templatePdfUrl)}
                                target={pdfPreviewUrl || templatePdfUrl ? '_blank' : undefined}
                                rel={pdfPreviewUrl || templatePdfUrl ? 'noreferrer' : undefined}
                                disabled={!pdfPreviewUrl && !templatePdfUrl}
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
                                href={(pdfPreviewUrl || templatePdfUrl) || undefined}
                                download={pdfPreviewUrl || templatePdfUrl ? 'document.pdf' : undefined}
                                disabled={!pdfPreviewUrl && !templatePdfUrl}
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
                            {/* iframe preview area */}
                            <Box
                            sx={{
                                flexGrow: 1,
                                width: '100%',
                                p: '0.833vw',
                                boxSizing: 'border-box'
                            }}
                            >
                            {pdfPreviewUrl || templatePdfUrl ? (
                                <Box
                                component="iframe"
                                src={addZoomParam(pdfPreviewUrl || templatePdfUrl)}
                                title="Document preview"
                                sx={{
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    border: 0,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    backgroundColor: '#fff',
                                    borderRadius: 1
                                }}
                                />
                            ) : (
                                <Typography sx={{ opacity: 0.7, px: '1rem', textAlign: 'center' }}>
                                Select a document to preview
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
  )
}

export default DocumentSelection