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
    ListItem
} from '@mui/material'

import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
// import placeholder from '../assets/placeholder.png'
// import placeholder_2 from '../assets/placeholder_2.png'
// import placeholder_3 from '../assets/placeholder_3.png'
import {
    CloudUpload,
    PlayArrow as PlayArrowIcon,
    Delete,
    Widgets,
    ModeEditOutlined as ModeEditOutlinedIcon,
 } from '@mui/icons-material'

const steps = ['Template Selection','Document Selection','Generate Report','Final Report']
import { StepArrow,ArrowShape } from './StepArrow' 

const GeneratePreview = ({
    leftSidebarOpen,
    selectedPreview,
    onNavigateToDocument,
    onNavigateToFinal,
    selectedDocs
    }) => {
    const categories = ['All', 'Pinned', 'Recently Viewed']
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [documentList, setDocumentList] = useState({})
    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null)
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 7;

    const key = selectedCategory === 'All' ? null : selectedCategory.toLowerCase();
    let docs = key ? (documentList[key] || []) : Object.values(documentList).flat();
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

    // const imageOptions = [placeholder, placeholder_2, placeholder_3]
    // //const allImages = [...Array(18)].map((_, idx) => imageOptions[idx % imageOptions.length])
    // const allImages = [
    //     ...Array(6).fill(placeholder),
    //     ...Array(6).fill(placeholder_2),
    //     ...Array(6).fill(placeholder_3),
    // ]
    // const [page, setPage] = useState(0)

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
    }, []);

    const panelRef = useRef<HTMLDivElement>(null);

    const ArrowStepper = ({ activeStep }) => (
            <Box display="flex" justifyContent="center" mt={2} width="100%">
                <Box display="flex"  sx={{ position: 'relative' }}>
                {steps.map((label, idx) => {
                    const isActive = idx === activeStep;
                    const isComplete = idx < activeStep;
    
                    const bg = isActive ? '#081A33' : isComplete ? '#FFD95C' : '#FFFFFF';
                    const fg = isActive ? '#FFFFFF' : isComplete ? '#081A33' : '#B0B0B0';
    
                    return (
                    <Box key={label} sx={{ minWidth: 'max-content' }}>
                        <StepArrow bg={bg} fg={fg}>
                        {label}
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
            gap: 2,
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
            p: 2.5,
            pb: 0, mb: -3
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
                gap: 1
            }}>
                <ArrowStepper activeStep={2} />
                <Box
                    sx={{
                    px: 2,
                    py:0.5,
                    //mt: -1,
                    mx: 2,
                    //mb: 1,
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
                        fontSize: '0.8854vw', color: '#081A33'
                    }}>
                        Finalize your report template and selected documents before generating the report. Make sure you've chosen the relevant documents and template, as these will shape the content and layout of your final report.
                    </Typography>
                </Box>

                <Box sx={{
                    bgcolor: '#F5FAFF',
                    borderRadius: 2,
                    mx: 2,
                    px: 2, pt: 1, pb: 2

                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', p: 0.5, pr: 0
                    }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.0417vw', color: '#081A33' }}>
                            Reports Template
                        </Typography>
                        <IconButton
                        size="small"
                        sx={{
                            color: '#081A33'
                        }}>
                            <ModeEditOutlinedIcon sx={{fontSize: '1.14vw'}}/>
                        </IconButton>
                        {/* <Widgets sx={{color: '#081A33', width: '1.0417vw', height: '1.0417vw'}}/> */}
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', px: 2, py: 1,
                        bgcolor: '#0088D61A', borderRadius: 2
                    }}>
                        <Typography variant="subtitle2"
                        sx={{
                            fontWeight: 550, fontSize: '0.9375vw',
                            color: '#081A33'
                        }}>
                            Daily Pipeline Operations Report
                        </Typography>
                    </Box>
                </Box>

                {/* Selected Documents */}
                <Box sx={{
                    //border: '1px solid green',
                    borderRadius: 2,
                    bgcolor: '#F5FAFF',
                    overflow: 'hidden',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    mx: 2,
                    px: 2,
                    py: 0.5,
                    pb: 2,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.5, pr: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.04vw', color: '#081A33' }}>
                            Selected Documents
                        </Typography>
                        <IconButton
                        size="small"
                        sx={{
                            color: '#081A33'
                        }}>
                            <ModeEditOutlinedIcon sx={{fontSize: '1.14vw'}}/>
                        </IconButton>
                    </Box>
                    <Box
                    sx={{
                        flexGrow: 1,
                        pr: 1,
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
                                        mb: '4px',
                                        p: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '0.5px solid #00000033',
                                    }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: 1}}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton
                                            size="small"
                                            onClick={() => handleToggleVisibility(name)}
                                            >
                                                {visibleDocs[name] ? (
                                                    <VisibilityIcon sx={{ fontSize: '0.8333vw', color: '#081A33' }} />
                                                ) : (
                                                    <VisibilityOffIcon sx={{ fontSize: '0.8333vw', color: '#081A33'}} />
                                                )}
                                            </IconButton>
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
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mx: 2
                }}>
                    <Button
                    variant= "contained"
                    onClick={onNavigateToDocument}
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
                    onClick={onNavigateToFinal}
                    sx={{
                        fontSize: '0.78vw',
                        fontWeight: 600,
                        color: '#081A33',
                        backgroundColor: '#FFD95C',
                        '&:hover': {bgcolor: '#FFCB42'}
                    }}
                    >
                        Generate Report
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
                <Box sx={{ pt: 2, flexGrow: 1 }}>
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
                            ml: 1, mr: 2, 
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
                            }}
                        />
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexGrow: 1,
                            width: '100%'
                        }}>
                            {selectedPreview && (
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
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
  )
}

export default GeneratePreview