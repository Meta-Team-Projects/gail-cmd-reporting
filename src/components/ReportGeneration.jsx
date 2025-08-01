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
import { StepArrow,ArrowShape } from './StepArrow' 
import edit_report from '../assets/edit_report_icon.png'
import save_template from '../assets/save_template_icon.png'
import download_report from '../assets/download_report_icon.png'
import ai_icon from '../assets/ai_icon.png'
import regenerate_response from '../assets/regenerate_response_icon.png'
import generate_report from '../assets/generate_report_icon.png'
import side_by_side_icon from '../assets/side_by_side_icon.png'

const ReportGeneration = ({
    leftSidebarOpen,
    onNavigateToCMDContent,
    selectedPreview,
    selectedDocs,
    onEditTemplate,
    onGenerateNewResponse,
    editDocuments
    }) => {
    const categories = ['All', 'Pinned', 'Recently Viewed']
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [documentList, setDocumentList] = useState({})
    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null)
    //const [selectedDocs, setSelectedDocs] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 7;

    const key = selectedCategory === 'All' ? null : selectedCategory.toLowerCase();
    let docs = selectedDocs.length > 0 
    ? selectedDocs 
    : (key 
        ? (documentList[key] || []) 
        : Object.values(documentList).flat());
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
        <Box display="flex" mt={2} mx={2}>
            {steps.map((label, idx) => {
            const isActive   = idx === activeStep
            const isComplete = idx < activeStep

            const bg = isActive
                ? '#081A33'
                : isComplete
                ? '#FFD95C'
                : '#FFFFFF'

            // arrow border + inactive text color
            const fg = isActive
                ? '#FFFFFF'
                : isComplete
                ? '#081A33'
                : '#B0B0B0'

                    return (
                <StepArrow key={label} bg={bg} fg={fg}>
                {label}
                </StepArrow>
            )
            })}
        </Box>
    )


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
            display: 'flex', height: '87vh', gap: 1
        }}>

            {/* Left Section */}
            <Box sx={{
                //border: '1px solid blue',
                width: leftSidebarOpen ? '700px' : '800px',
                transition: 'max-width 0.3s ease',
                display: 'flex',
                flexDirection: 'column', 
                gap: 1
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
                        mx: 2,
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
                        px: 1,
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
                        top: 50,
                        right: 10,
                        width: '45px', height: '45px',
                        color: '#081A33',
                        backgroundColor: '#FFD95CE5',
                        borderRadius: '50%',
                        '&:hover': {backgroundColor: '#FFCB42'},
                    }}>
                        <img
                            src={side_by_side_icon}
                            style={{
                            width: '20px',
                            height: '20px',
                            objectFit: 'contain',
                            }}
                        />
                        {/* <ModeEditOutlinedIcon sx={{fontSize: '20px'}} /> */}
                    </IconButton>
                    <IconButton sx={{
                        position: 'absolute',
                        top: 100,
                        right: 10,
                        width: '45px', height: '45px',
                        color: '#081A33',
                        backgroundColor: '#FFD95CE5',
                        borderRadius: '50%',
                        '&:hover': {backgroundColor: '#FFCB42'},
                        }}>
                        <ZoomInIcon sx={{fontSize: '20px'}}/>
                    </IconButton>
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

            {/* Right Section */}
            <Box sx={{
                //border: '1px solid red',
                transition: 'max-width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: 1,
            }}>
                <Box sx={{
                    bgcolor: '#F5FAFF',
                    borderRadius: 2,
                    mr: 2,
                    px: 2, pt: 0.5, pb: 1 

                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', p: 0.5
                    }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.0417vw', color: '#081A33' }}>
                            Reports Template
                        </Typography>
                        {/* <Widgets sx={{color: '#081A33', width: '20px', height: '20px'}}/> */}
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
                        <IconButton 
                        onClick={onEditTemplate}
                        sx={{
                            color: '#081A33'
                        }}>
                            <ModeEditOutlinedIcon sx={{fontSize: '1.14vw'}}/>
                        </IconButton>
                    </Box>
                </Box>

                {/* Documents Repository */}
                <Box sx={{
                    px: 2,
                    py: 1, pb: 2,
                    //mt: 1,
                    mr:2,
                    overflow: 'hidden',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: 0,
                    //border: '0.5px solid #00000033',
                    transform: 'translateZ(0)',
                    bgcolor: '#F5FAFF'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.04vw', color: '#081A33' }}>
                            Documents Repository
                        </Typography>
                        <IconButton
                        size="small"
                        sx={{
                            color: '#081A33'
                        }}>
                            <ModeEditOutlinedIcon sx={{fontSize: '1.14vw'}}/>
                        </IconButton>
                    </Box>
                
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: '0.41vw' }}>
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
                                        px: '9px',
                                        py: '9px',
                                        fontWeight: 500,
                                        fontSize: '0.7292vw',
                                        color: '#081A33',
                                        borderRadius: '16px',
                                        bgcolor: selectedCategory === category ? '#edcc09' : '#FFD95C',
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
                        height: '32vh',
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
                <Box sx={{
                    px: 2,
                    py: 1, pb: 2,
                    //mt: 1,
                    mr:2,
                    overflow: 'hidden',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    gap: 1,
                    minHeight: 0,
                    //border: '0.5px solid #00000033',
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
                        flex: '0 1 calc(33.333% - 0.5vw)',
                        height: '100px',
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
                        <img src={edit_report} style={{ width: '20px', height: '20px' }} />
                        Edit Report
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                        flex: '0 1 calc(33.333% - 0.5vw)',
                        height: '100px',
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
                        <img src={save_template} style={{ width: '20px', height: '20px' }} />
                        Save as template
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                        flex: '0 1 calc(33.333% - 0.5vw)',
                        height: '100px',
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
                        <img src={download_report} style={{ width: '20px', height: '20px' }} />
                        Download Report
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                        flex: '0 1 calc(33.333% - 0.5vw)',
                        height: '100px',
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
                        <img src={ai_icon} style={{ width: '20px', height: '20px' }} />
                        AI Analyser
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                        flex: '0 1 calc(33.333% - 0.5vw)',
                        height: '100px',
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
                        <img src={regenerate_response} style={{ width: '20px', height: '20px' }} />
                        Regenerate Response
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onNavigateToCMDContent}
                        sx={{
                        flex: '0 1 calc(33.333% - 0.5vw)',
                        height: '100px',
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
                        <img src={generate_report} style={{ width: '20px', height: '20px' }} />
                        Generate new Response
                    </Button>
                    </Box>

                </Box>
            </Box>
        </Box>
    </Box>
  )
}

export default ReportGeneration