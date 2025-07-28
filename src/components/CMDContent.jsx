import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Document, Page, pdfjs } from 'react-pdf';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


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
    Search as SearchIcon,
    Delete
} from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PushPinIcon from '@mui/icons-material/PushPin';
import placeholder from '../assets/placeholder.png';
import placeholder_2 from '../assets/placeholder_2.png';
import placeholder_3 from '../assets/placeholder_3.png';

const CMDContent = ({onNavigateToTemplate}) => {
    const categories = ['All', 'Pinned', 'Recently Viewed']
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [documentList, setDocumentList] = useState({})
    const [searchTerm, setSearchTerm] = useState('')
    const [stats, setStats] = useState(null)

    const [numPages, setNumPages] = useState(null);
    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    };

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
            // maxWidth: {
            //     xs: '90%',
            //     sm: '94.5%',
            //     md: layoutMode === 'fullscreenMain'
            //     ? 'calc(97% - 1.3vw)'
            //     : layoutMode === 'fullscreenFormulate'
            //     ? '2.2vw'
            //         : layoutMode === 'expand'
            //         ? (leftSidebarOpen? 'calc(100% - 26vw)':'calc(100% - 28.5vw)' )
            //         : layoutMode === 'collapse'
            //             ? (leftSidebarOpen? 'calc(100% - 64.5vw)':'calc(100% - 70vw)' )
            //             : layoutMode === 'fiftyfifty'
            //             ? (leftSidebarOpen? 'calc(100% - 43.7vw)':'calc(100% - 49.7vw)' ): '97%',
            // },
            transition: 'max-width 0.3s ease',
            //filter: dimMainContent ? 'grayscale(0.5) brightness(0.5)' : 'none',
            //bgcolor: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
            position: 'relative',
        }}
    >
        <Box sx={{
            p: 2.5,
            pb: 0
        }}>
            <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: '24px', color: '#081A33'}}>
                CMD Platform
            </Typography>
        </Box>
        <Box
            sx={{
            px: 2,
            py:0.5,
            mt: -1,
            ml: 2,
            mr: 2,
            mb: -1,
            background: 'linear-gradient(to right, rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))',
            borderRadius: 2,
            border: '1px solid #CBD0DC',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <Box>
                <Typography variant="subtitle2" sx={{
                    fontWeight: 600, fontSize: '20px', color: '#081A33'
                }}>
                    Get started with report generation!
                </Typography>
            </Box>
            <Box>
                <Typography variant="subtitle2" sx={{
                    fontSize: '18px', color: '#081A33'
                }}>
                    Generate a new, fresh report tailored to your latest needs. This report will include up-to-date insights and clear, organized information.
                </Typography>
            </Box>
            <Box sx= {{
                py: 2,
                display: 'flex',
                gap: 2
            }}>
                <Button
                    onClick={onNavigateToTemplate}
                    variant="contained"
                    
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        display: 'block',
                        color: '#fff',
                        bgcolor: '#0087d6',
                        fontWeight: 550,
                        fontSize: '15.61px',
                        px: '15.61px',
                        py: '6.83px',
                        boxShadow: '0px 4px 8px #15151540'
                    }}
                >
                    Generate Report
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        display: 'block',
                        color: '#fff',
                        bgcolor: '#0087d6',
                        fontWeight: 550,
                        fontSize: '15.61px',
                        px: '15.61px',
                        py: '6.83px',
                        boxShadow: '0px 4px 8px #15151540'
                    }}
                >
                    Resume from last session
                </Button>
            </Box>
        </Box>
        <Box sx={{
            px: 2.5,
            display: 'flex',
            justifyContent: 'space-between'
        }}>
            <Typography sx={{
                color: '#081A33',
                fontWeight: 700, fontSize: '20px'
            }}>
                Latest Reports
            </Typography>
            <AccessTimeIcon sx={{color: '#081A33'}}/>
        </Box>
        <Box sx={{
            maxHeight: '160px',
            ml: 2, mr: 2, my: -1,
            display: 'flex',
            justifyContent: 'space-between'
        }}>
            {/* Fill Later */}
            <img src={placeholder} alt="Placeholder" style={{width: '32.5%'}}/>
            <img src={placeholder_2} alt="Placeholder" style={{width: '32.5%'}}/>
            <img src={placeholder_3} alt="Placeholder" style={{width: '32.5%'}}/>
            
        </Box>
        <Typography sx={{
            px: 2.5, color: '#081A33',
            fontWeight: 700, fontSize: '20px'
        }}>
            Reports Repository
        </Typography>
        
        <Stack direction="row" sx={{ ml: 2.5, mt: -1, flexWrap: 'wrap', gap: '0.41vw' }}>
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
        <TextField
            fullWidth
            variant="outlined"
            placeholder="Search here..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            size="small"
            sx={{
                px: 2,
                '& .MuiOutlinedInput-root': {
                    bgcolor: '#0088D61A', //later
                    borderRadius: 10,
                    height: '30px',
                    fontSize: '16px',
                    color: '#515151'
                }
            }}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#515151', fontSize: '20px' }} />
                    </InputAdornment>
                )
            }}
        />
        <Box
        ref={panelRef}
        sx={{
            px: 2,
            py: 0.5,
            ml:2, mr:2,
            mb: 2,
            borderRadius: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            border: '0.5px solid #00000033',
            // border: '1px solid #008cff',
            transform: 'translateZ(0)',
            // bgcolor: '#e9f5fc',
            bgcolor: '#F5FAFF'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '20px', color: '#081A33' }}>
                    All Reports
                </Typography>
                <Typography variant="subtitle2" sx={{fontSize: '18px', color: '#081A33'}}>
                    View All &gt;
                </Typography>
            </Box>
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
                <List sx={{ px: 0, mb: 1 }}>
                    {docs
                    // .filter(name =>
                    //     name.toLowerCase().includes(searchTerm.toLowerCase())
                    // )
                    .map(name => (
                        <ListItem
                        key={name}
                        disableGutters
                        sx={{
                            bgcolor: '#A9C7FF66',
                            borderRadius: 2,
                            mb: '0.2083vw',
                            p: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '0.5px solid #00000033',
                        }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: 1}}>
                                <IconButton size="small">
                                    <Tooltip title="Pin" placement='bottom' arrow>
                                        <PushPinIcon sx={{ 
                                            fontSize: '0.8333vw',
                                            stroke: 'black',
                                            strokeWidth: 1.5,
                                            transition: 'all 0.2s ease',
                                        }}
                                        />
                                        </Tooltip>
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
                        </ListItem>
                    ))}
                </List>
            )
            })()}
            </Box>
        </Box>
    </Box>
  )
}

export default CMDContent