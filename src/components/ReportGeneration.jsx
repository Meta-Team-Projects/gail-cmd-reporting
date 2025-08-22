import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

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
    Divider,
    Chip,
    Stack,
    List,
    ListItem,
    LinearProgress,
    Tooltip as MuiTooltip
} from '@mui/material'

import {
    CircleOutlined as CircleOutlinedIcon,
    Circle as CircleIcon,
    VisibilityOff as VisibilityOffIcon,
    Visibility as VisibilityIcon,
    Widgets,
    ModeEditOutlined as ModeEditOutlinedIcon,
    FileDownloadOutlined as FileDownloadOutlinedIcon,
    PlayArrow as PlayArrowIcon,
    ZoomIn as ZoomInIcon,
    Delete,
    RadioButtonCheckedOutlined as RadioButtonCheckedOutlinedIcon
} from '@mui/icons-material'

const steps = ['Template Selection','Document Selection','Generate Report','Final Report']
import { StepArrow,ArrowShape, ArrowLabel } from './StepArrow' 
import edit_report from '../assets/edit_report_icon.png'
import save_template from '../assets/save_template_icon.png'
import download_report from '../assets/download_report_icon.png'
import ai_icon from '../assets/ai_icon.png'
import regenerate_response from '../assets/regenerate_response_icon.png'
import generate_report from '../assets/generate_report_icon.png'
import side_by_side_icon from '../assets/side_by_side_icon.png'
import arrowMask from '../assets/arrow.png';
import previousArrow from '../assets/previousarrow.png';
import currentArrow from '../assets/currentarrow.png';
import nextArrow from '../assets/nextarrow.png';
import templateArrowBlack from '../assets/templatearrow-black.png';
import templateArrowYellow from '../assets/templatearrow-yellow.png';


const ReportGeneration = ({
    leftSidebarOpen,
    onNavigateToCMDContent,
    onNavigateToTemplate,
    selectedPreview,
    selectedDocs,
    onEditTemplate,
    onGenerateNewResponse,
    editDocuments,
    selectedTemplateDocxFile,
    selectedTemplateName
    }) => {
    const categories = ['All', 'Reference PDFs', 'Uploaded']
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [documentList, setDocumentList] = useState({}) // uploaded
    const [referencePdfs, setReferencePdfs] = useState([]);

    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null)

    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 7;

    const key = selectedCategory.toLowerCase();
    const uploadedNames = Object.values(documentList).flat();
    const referenceNames = referencePdfs.map(f => f.name);
    let docs =
        key === 'reference pdfs'
        ? referenceNames
        : key === 'uploaded'
        ? uploadedNames
        : [...referenceNames, ...uploadedNames];
    // Apply search filter if needed here
    const paginatedDocs = docs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    const totalPages = Math.ceil(docs.length / itemsPerPage);


    // const handleToggle = (name) => {
    //     setSelectedDocs(prev =>
    //         prev.includes(name)
    //         ? prev.filter(n => n !== name)
    //         : [...prev, name]
    //     );
    // };

    const [visibleDocs, setVisibleDocs] = useState({});
    const handleToggleVisibility = (docName) => {
        setVisibleDocs(prev => ({
            ...prev,
            [docName]: !prev[docName]
        }));
    };

    // Generate Report (.docx) states 
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [etaText, setEtaText] = useState('~--s');
    const [finalDocUrl, setFinalDocUrl] = useState(null);
    const [finalDocName, setFinalDocName] = useState('Final_Report.docx');
    const [genError, setGenError] = useState('');
    const progressTimerRef = useRef(null);
    const genStartRef = useRef(0);
    const estimatedMsRef = useRef(90000); // 90s optimistic ETA; tweak as needed

    const resetGenerationState = () => {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
        setIsGenerating(false);
        setProgress(0);
        setEtaText('~--s');
        setGenError('');
        };

        const startFakeProgress = () => {
        genStartRef.current = Date.now();
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        progressTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - genStartRef.current;
            const est = estimatedMsRef.current;
            const pct = Math.min(95, Math.floor((elapsed / est) * 100));
            const remaining = Math.max(0, est - elapsed);
            const mm = Math.floor(remaining / 60000);
            const ss = Math.floor((remaining % 60000) / 1000);
            setProgress(pct);
            setEtaText(`${mm}:${ss.toString().padStart(2, '0')} remaining`);
        }, 250);
        };

        const downloadFinal = () => {
        if (!finalDocUrl) return;
        const a = document.createElement('a');
        a.href = finalDocUrl;
        a.download = finalDocName || 'Final_Report.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        };

        const startGenerate = async () => {
        setGenError('');
        // revoke previous blob if any
        if (finalDocUrl) {
            try { URL.revokeObjectURL(finalDocUrl); } catch {}
        }
        setFinalDocUrl(null);
        ((selectedTemplateDocxFile?.name || selectedTemplateName || 'Report')
                .replace(/\.docx$/i, '')) + '_Report.docx'
        setIsGenerating(true);
        setProgress(1);
        setEtaText('~1:30 remaining');
        startFakeProgress();
        try {
            const endpoint = `${import.meta.env.VITE_CHAT_API_URL}/generate-report`;
                let res;
                if (selectedTemplateDocxFile) {
                const fd = new FormData();
                fd.append('file', selectedTemplateDocxFile, selectedTemplateDocxFile.name);
                res = await axios.post(endpoint, fd, { responseType: 'blob' });
                } else {
                res = await axios.post(endpoint, {}, { responseType: 'blob' });
            }
            // If server sends filename in headers, prefer it
            const cd = res?.headers?.['content-disposition'] || '';
            const match = cd.match(/filename="?([^"]+)"?/i);
            const serverName = match?.[1];
            if (serverName) setFinalDocName(serverName);
            const blob = res.data;
            const blobUrl = URL.createObjectURL(blob);
            setFinalDocUrl(blobUrl);
            setProgress(100);
            setEtaText('0:00 remaining');
        } catch (e) {
            console.error('Failed to generate report', e);
            setGenError('Failed to generate report. Please try again.');
        } finally {
            if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
            }
            setIsGenerating(false);
        }
        };

        useEffect(() => {
        return () => {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            if (finalDocUrl) {
            try { URL.revokeObjectURL(finalDocUrl); } catch {}
            }
        };
    }, []);

    const fetchDocuments = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_CHAT_API_URL}/list-documents`
            )
            setDocumentList(data.document_list || {})
        } catch (err) {
            console.error('Error loading documents', err)
        }
    }

    const fetchReferencePdfs = async () => {
        try {
            const url = `${import.meta.env.VITE_CHAT_API_URL}/get_reference_pdfs?offset=0&limit=20&max_file_bytes=20971520&max_return_bytes=83886080`;
            const { data } = await axios.get(url, { headers: { accept: 'application/json' } });
            const mapped = (Array.isArray(data) ? data : []).map((f) => ({
                name: f?.name || 'Document.pdf'
            }));
            setReferencePdfs(mapped);
        } catch (err) {
            console.error('Error loading reference PDFs', err);
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
        fetchReferencePdfs();
        collectStats();
    }, []);

    const panelRef = useRef(null);


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

const disabledGradientSx = {
    '&.Mui-disabled': {
    background: 'linear-gradient(to right, #F0F5FD, #DFEBFF)',
    color: '#081A33',         
    opacity: 1,               
    cursor: 'not-allowed',    
    pointerEvents: 'auto',    
    },
    '&.Mui-disabled:hover': {
        background: 'linear-gradient(to right, #F0F5FD, #DFEBFF)',
        cursor: 'not-allowed',
    },
};

const disabledYellowSx = {
    '&.Mui-disabled': {
        bgcolor: '#FFEAA4',
        color: '#081A33',         
        opacity: 1,
        cursor: 'not-allowed',    
        pointerEvents: 'auto',
    },
    '&.Mui-disabled:hover': {
        bgcolor: '#FFEAA4',
        cursor: 'not-allowed',
    },
};

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
            display: 'flex', height: '87vh', gap: '0.417vw'
        }}>

            {/* Left Section */}
            <Box sx={{
                //border: '1px solid blue',
                //width: leftSidebarOpen ? '36.46vw' : '41.67vw',
                width: leftSidebarOpen ? '41.67vw' : '46.88vw',
                transition: 'max-width 0.3s ease',
                display: 'flex',
                flexDirection: 'column', 
                gap: '0.417vw'
            }}>
                {/* Timeline */}
                <ArrowStepper activeStep={3} />
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
                        mx: '0.8333vw',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                        backgroundColor: '#0088D6CC',
                        height: '2.3vw',
                        width: '100%',
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: '0.417vw',
                        }}
                    >
                        <Typography sx={{
                            color: '#ffffff',
                            fontSize: '15px',
                            fontWeight: 700
                        }}>
                            Report 1
                        </Typography>
                        {/* <ModeEditOutlinedIcon 
                        sx={{
                            color: '#FFFFFF91',
                            fontSize: '20px'
                        }}/> */}
                    </Box>
                    <IconButton sx={{
                        position: 'absolute',
                        top: '2.604vw',
                        right: '0.521vw',
                        width: '2.3438vw', height: '2.3438vw',
                        color: '#081A33',
                        backgroundColor: '#FFD95CE5',
                        borderRadius: '50%',
                        '&:hover': {backgroundColor: '#FFCB42'},
                    }}>
                        <img
                            src={side_by_side_icon}
                            style={{
                            width: '1.0417vw',
                            height: '1.0417vw',
                            objectFit: 'contain',
                            }}
                        />
                        {/* <ModeEditOutlinedIcon sx={{fontSize: '20px'}} /> */}
                    </IconButton>
                    <IconButton sx={{
                        position: 'absolute',
                        top: '5.208vw',
                        right: '0.521vw',
                        width: '2.3438vw', height: '2.3438vw',
                        color: '#081A33',
                        backgroundColor: '#FFD95CE5',
                        borderRadius: '50%',
                        '&:hover': {backgroundColor: '#FFCB42'},
                        }}>
                        <ZoomInIcon sx={{fontSize: '1.0417vw'}}/>
                    </IconButton>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.625vw',
                            flexGrow: 1,
                            width: '100%',
                            px: '1rem',
                            textAlign: 'center'
                        }}
                        >
                        {/* PREVIEW AREA FOR FINAL DOCX */}
                        {isGenerating ? (
                            <>
                            <Typography sx={{ fontWeight: 700, color: '#081A33' }}>
                                Generating report…
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ width: '80%' }}
                            />
                            <Typography sx={{ color: '#081A33' }}>
                                {progress}% completed • ETA {etaText}
                            </Typography>
                            </>
                        ) : finalDocUrl ? (
                            <>
                            <Typography sx={{ color: '#b00020', whiteSpace: 'pre-wrap' }}>
                                Failed to load {finalDocName} preview.
                                {'\n'}
                                This file can’t render inline here.
                            </Typography>
                            {/* <Button
                                variant="text"
                                href={finalDocUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open in new tab
                            </Button>
                            <Typography sx={{ fontSize: '0.78vw', opacity: 0.7 }}>
                                {finalDocName}
                            </Typography> */}
                            {/* <Box sx={{ display:'flex', gap:'0.625vw', mt:'0.625vw' }}>
                                <Button
                                    variant="contained"
                                    onClick={downloadFinal}
                                    sx={{ bgcolor:'#0088D6', color:'#fff', '&:hover':{ bgcolor:'#0074BA' } }}
                                >
                                Download Final
                                </Button>
                            </Box> */}
                            </>
                        ) : genError ? (
                            <Typography sx={{ color: '#b00020' }}>{genError}</Typography>
                        ) : (
                            <>
                            <Typography sx={{ opacity: 0.75 }}>
                                Click “Generate new Report” to create the final report.
                            </Typography>
                            <Box sx={{ display:'flex', gap:'0.625vw', mt:'0.625vw' }}>
                            <Button
                                variant="contained"
                                onClick={startGenerate}
                                disabled={isGenerating}
                                sx={{
                                    bgcolor:'#FFD95C',
                                    color:'#081A33',
                                    fontWeight:600,
                                    '&:hover':{ bgcolor:'#FFCB42' },
                                    ...disabledYellowSx
                                }}
                            >
                                Generate New Report
                            </Button>
                            </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Right Section */}
            <Box sx={{
                //border: '1px solid red',
                transition: 'max-width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: '0.417vw',
            }}>
                <Box sx={{
                    bgcolor: '#F5FAFF',
                    borderRadius: 2,
                    mr: '0.8333vw',
                    px: '0.8333vw', pt: '0.208vw', pb: '0.417vw'

                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', p: '0.208vw'
                    }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.04vw', color: '#081A33' }}>
                            Reports Template
                        </Typography>
                        <IconButton 
                        onClick={onEditTemplate}
                        sx={{
                            color: '#081A33'
                        }}>
                            <ModeEditOutlinedIcon sx={{fontSize: '1.14vw'}}/>
                        </IconButton>
                        {/* <Widgets sx={{color: '#081A33', width: '20px', height: '20px'}}/> */}
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', px: '0.8333vw', py: '0.417vw',
                        bgcolor: '#0088D61A', borderRadius: 2
                    }}>
                        <Typography variant="subtitle2"
                        sx={{
                            fontWeight: 550, fontSize: '0.9375vw',
                            color: '#081A33'
                        }}>
                            {(selectedTemplateName || 'CMD Template_1').replace(/\.docx$/i, '')}
                        </Typography>
                    </Box>
                </Box>

                {/* Documents Repository */}
                <Box sx={{
                    px: '0.8333vw',
                    py: '0.417vw',
                    //mt: 1,
                    mr: '0.8333vw',
                    overflow: 'hidden',
                    borderRadius: 2,
                    display: 'flex', flex: 1,
                    flexDirection: 'column',
                    gap: '0.417vw',
                    //border: '1px solid black',
                    transform: 'translateZ(0)',
                    bgcolor: '#F5FAFF'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '0.208vw' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.04vw', color: '#081A33' }}>
                            Documents Repository
                        </Typography>
                        <IconButton
                        size="small"
                        sx={{
                            color: '#081A33', pr: '0.5vw'
                        }}>
                            <ModeEditOutlinedIcon sx={{fontSize: '1.14vw'}}/>
                        </IconButton>
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
                                        boxShadow: '0px 4px 8px #15151540'
                                    }}
                                />
                            ))}
                        </Box>
                    </Stack>
                    <Box
                    sx={{
                        flexGrow: 1,
                        pr: 1,
                        height: '28vh',
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
                                    sx={{
                                        bgcolor: '#A9C7FF66',
                                        borderRadius: 2,
                                        mb: '0.2083vw',
                                        p: '0.208vw',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '0.5px solid #00000033',
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.417vw' }}>
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
                    {/* <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                    }}>
                        <Button
                        variant="contained"
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#FFD95C',
                        color: '#081A33',
                        px: 2,
                        py: 0.5,
                        fontWeight: 600,
                        fontSize: '15px',
                        '&:hover': {backgroundColor: '#FFCB42'},
                        }}>
                            Regenerate Response
                        </Button>
                        <Button
                        variant="contained"
                        onClick={onGenerateNewResponse}
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#0088D6',
                        color: '#ffffff',
                        px: 2,
                        py: 0.5,
                        fontWeight: 600,
                        fontSize: '15px',
                        '&:hover': {backgroundColor: '#0074BA'}
                        }}>
                            Generate New Response
                        </Button>
                    </Box> */}
                </Box> 

                {/* Bottom Buttons */}
                {/* <Box sx={{
                    px: 2,
                    pt: 1.5,
                    //mt: 1,
                    mr:2,
                    overflow: 'hidden',
                    borderRadius: 2,
                    display: 'flex',
                    flex: 1,
                    //border: '2px solid #00000033',
                    transform: 'translateZ(0)',
                    bgcolor: '#F5FAFF'
                }}>
                    <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'space-between',
                    }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                            // flex: '0 1 calc(33.333% - 0.5vw)',
                            height: '8.5vw',
                            borderRadius: '10px',
                            //background: 'linear-gradient(to right, #F5FAFF, #939699), linear-gradient(to bottom, #E6F0FA, #CCE5FF)',
                            //backgroundBlendMode: 'overlay',
                            //background: 'linear-gradient(to right, #F5FAFF, #E6F0FA , #CCE5FF)',
                            background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                            color: '#081A33',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                            }}
                        >
                            <img src={edit_report} style={{ width: '1.823vw', height: '1.823vw' }} />
                            Edit Report
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                            //flex: '0 1 calc(33.333% - 0.5vw)',
                            height: '8.5vw',
                            borderRadius: '10px',
                            background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                            //background: 'linear-gradient(to right, #F5FAFF, #939699), linear-gradient(to bottom, #E6F0FA, #CCE5FF)',
                            //backgroundBlendMode: 'overlay',
                            color: '#081A33',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                            }}
                        >
                            <img src={save_template} style={{ width: '1.823vw', height: '1.823vw' }} />
                            Save as template
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                            //flex: '0 1 calc(33.333% - 0.5vw)',
                            height: '8.5vw',
                            borderRadius: '10px',
                            background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                            //background: 'linear-gradient(to right, #F5FAFF, #939699), linear-gradient(to bottom, #E6F0FA, #CCE5FF)',
                            //backgroundBlendMode: 'overlay',
                            color: '#081A33',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                            }}
                        >
                            <img src={download_report} style={{ width: '1.823vw', height: '1.823vw' }} />
                            Download Report
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                            //flex: '0 1 calc(33.333% - 0.5vw)',
                            height: '8.5vw',
                            borderRadius: '10px',
                            background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                            //background: 'linear-gradient(to right, #F5FAFF, #939699), linear-gradient(to bottom, #E6F0FA, #CCE5FF)',
                            //backgroundBlendMode: 'overlay',
                            color: '#081A33',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                            }}
                        >
                            <img src={ai_icon} style={{ width: '1.823vw', height: '1.823vw' }} />
                            AI Analyser
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                            //flex: '0 1 calc(33.333% - 0.5vw)',
                            height: '8.5vw',
                            borderRadius: '10px',
                            background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                            //background: 'linear-gradient(to right, #F5FAFF, #939699), linear-gradient(to bottom, #E6F0FA, #CCE5FF)',
                            //backgroundBlendMode: 'overlay',
                            color: '#081A33',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                            }}
                        >
                            <img src={regenerate_response} style={{ width: '1.823vw', height: '1.823vw' }} />
                            Regenerate Response
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onNavigateToCMDContent}
                            sx={{
                            //flex: '0 1 calc(33.333% - 0.5vw)',
                            height: '8.5vw',
                            borderRadius: '10px',
                            background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                            //background: 'linear-gradient(to right, #F5FAFF, #939699), linear-gradient(to bottom, #E6F0FA, #CCE5FF)',
                            //backgroundBlendMode: 'overlay',
                            color: '#081A33',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: 0.5,
                            }}
                        >
                            <img src={generate_report} style={{ width: '1.823vw', height: '1.823vw' }} />
                            Generate new Response
                        </Button>
                    </Box>

                </Box> */}
                <Box
                sx={{
                    display: 'grid',
                    bgcolor: '#F5FAFF',
                    borderRadius: 2,
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.2vw', // spacing between buttons, scalable
                    mr: '0.8333vw', p: '0.8333vw',
                    justifyItems: 'center',
                }} 
                >
                {[ save_template, download_report, regenerate_response, generate_report].map((icon, index) => (
                    <Button
                    key={index}
                    variant="contained"
                    onClick={
                        index === 1
                            ? downloadFinal
                            : index === 2
                            ? startGenerate
                            : index === 3
                            ? onNavigateToCMDContent
                            : undefined
                    }
                    sx={{
                        height: '8.5vw',
                        width: '100%', // full width of grid column
                        maxWidth: '20vw', // limit width for very large screens
                        borderRadius: '10px',
                        background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                        color: '#081A33',
                        fontWeight: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.208vw',
                        textAlign: 'center', fontSize: '0.7292vw',
                        ...disabledGradientSx
                    }}
                        disabled={(index === 1 && !finalDocUrl) || (index >= 2 && isGenerating)}
                    >
                    <img src={icon} style={{ width: '1.823vw', height: '1.823vw' }} />
                    {[
                        // 'Edit Report',
                        'Save as template',
                        'Download Report',
                        // 'AI Analyser',
                        'Regenerate Report',
                        'Generate new Report',
                    ][index]}
                    </Button>
                ))}
                </Box>
                    
            </Box>
        </Box>
    </Box>
    )   
}

export default ReportGeneration