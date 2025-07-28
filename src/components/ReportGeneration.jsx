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
    Delete,
 } from '@mui/icons-material'

const ReportGeneration = ({
    leftSidebarOpen,
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
            pb: 0, mb: -2
        }}>
            <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: '24px', color: '#081A33'}}>
                CMD Platform
            </Typography>
        </Box>
        <Box sx={{
            //border: '1px solid black',
            display: 'flex', height: '100%', pb: 1
        }}>

            {/* Left Section */}
            <Box sx={{
                //border: '1px solid blue',
                
            }}>
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
                        height: '42px',
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
                        <ModeEditOutlinedIcon 
                        sx={{
                            color: '#FFFFFF91',
                            fontSize: '20px'
                        }}/>
                    </Box>
                    <IconButton sx={{
                        position: 'absolute',
                        top: 60,
                        right: 10,
                        width: '45px', height: '45px',
                        color: '#081A33',
                        backgroundColor: '#FFD95CE5',
                        borderRadius: '50%',
                        '&:hover': {backgroundColor: '#FFCB42'},
                    }}>
                        <ModeEditOutlinedIcon sx={{fontSize: '20px'}} />
                    </IconButton>
                    <IconButton sx={{
                        position: 'absolute',
                        top: 110,
                        right: 10,
                        width: '45px', height: '45px',
                        color: '#081A33',
                        backgroundColor: '#FFD95CE5',
                        borderRadius: '50%',
                        '&:hover': {backgroundColor: '#FFCB42'},
                        }}>
                        <FileDownloadOutlinedIcon sx={{fontSize: '20px'}}/>
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
                flexGrow: 1,
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '20px', color: '#081A33' }}>
                            Reports Template
                        </Typography>
                        <Widgets sx={{color: '#081A33', width: '20px', height: '20px'}}/>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', px: 2, py: 1,
                        bgcolor: '#0088D61A', borderRadius: 2
                    }}>
                        <Typography variant="subtitle2"
                        sx={{
                            fontWeight: 550, fontSize: '18px',
                            color: '#081A33'
                        }}>
                            Report 1
                        </Typography>
                        <IconButton 
                        onClick={onEditTemplate}
                        sx={{
                            color: '#081A33'
                        }}>
                            <ModeEditOutlinedIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Documents Repository */}
                <Box sx={{
                    px: 2,
                    py: 1,
                    //mt: 1,
                    mr:2,
                    overflow: 'hidden',
                    borderRadius: 2,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    minHeight: 0,
                    //border: '0.5px solid #00000033',
                    transform: 'translateZ(0)',
                    bgcolor: '#F5FAFF'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '20px', color: '#081A33' }}>
                            Documents Repository
                        </Typography>
                        <Button
                        variant="contained"
                        onClick={editDocuments}
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#0088D6',
                        color: '#ffffff',
                        px: 2,
                        py: 0.5,
                        fontWeight: 600,
                        fontSize: '15px',
                        '&:hover': {backgroundColor: '#0074BA'}
                        }}
                    >
                        Edit Documents
                    </Button>
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
                        // overflowY: 'auto !important',
                        overflow: 'hidden',
                        '&::-webkit-scrollbar': { 
                        display: 'none',
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
                        const key = selectedCategory === 'All'
                        ? null
                        : selectedCategory.toLowerCase()
                        let docs = []
                        if (key) {
                        docs = documentList[key] || []
                        } else {
                        docs = Object.values(documentList).flat()
                        }
                        // filter by search
                        return (
                        <List sx={{ px: 0 }}>
                            {paginatedDocs
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
                                            {/* {isSelected ? (
                                                <CircleIcon
                                                sx={{
                                                    fontSize: '0.8333vw',
                                                    fill: '#081A33',
                                                    stroke: '#515151',
                                                    strokeWidth: 1.5,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                />
                                            ) : (
                                                <CircleOutlinedIcon sx={{ 
                                                    fontSize: '0.8333vw',
                                                    fill: '#FFD95C0A',
                                                    stroke: '#515151',
                                                    strokeWidth: 1.5,
                                                    transition: 'all 0.2s ease',
                                                }}
                                                />
                                            )} */}
                                            <CircleIcon
                                                sx={{
                                                    fontSize: '0.8333vw',
                                                    fill: '#081A33',
                                                    stroke: '#515151',
                                                    strokeWidth: 1.5,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                />
                                                
                                        </IconButton> 
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
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        {/* Left Arrow */}
                        <IconButton 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        sx={{
                            color: '#081A33',
                            backgroundColor: '#FFD95C',
                            borderRadius: '50%',
                            '&:disabled': {opacity: 0.5},
                            '&:hover': {backgroundColor: '#FFCB42'},
                        }}>
                            <PlayArrowIcon sx={{transform: 'scaleX(-1)'}}/>
                        </IconButton>
                        {/* Page Label */}
                        <Typography variant="body2" 
                        sx={{color: '#AEAEAE'}}>
                            {currentPage + 1}/{totalPages || 1}
                        </Typography>
                        {/* Right Arrow */}
                        <IconButton 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                        sx={{
                            color: '#081A33',
                            backgroundColor: '#FFD95C',
                            borderRadius: '50%',
                            '&:disabled': {opacity: 0},
                            '&:hover': {backgroundColor: '#FFCB42'},
                        }}>
                            <PlayArrowIcon sx={{color: '#081A33'}}/>
                        </IconButton>
                    </Box>
                    <Box sx={{
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
                    </Box>
                </Box> 
            </Box>
        </Box>
    </Box>
  )
}

export default ReportGeneration