import { useState, useEffect, useRef } from 'react'

import { Document, Page, pdfjs } from 'react-pdf';
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
    ListItem,
} from '@mui/material'

import { styled } from '@mui/system';

import arrowMask from '../assets/arrow.png'
import placeholder from '../assets/placeholder.png'
import placeholder_2 from '../assets/placeholder_2.png'
import placeholder_3 from '../assets/placeholder_3.png'
import {
    CloudUpload,
    FindInPage,
    PlayArrow as PlayArrowIcon,
    Search as SearchIcon,
} from '@mui/icons-material'
import FindInPageIcon from '@mui/icons-material/FindInPage';

const steps = ['Template Selection','Document Selection','Generate Report','Final Report']
import { StepArrow,ArrowShape } from './StepArrow' 

const TemplateSelection = ({
    leftSidebarOpen,
    onNavigateToDoc,
    onNavigateToLandingPage,
    selectedPreview,
    setSelectedPreview,
    isEditMode
    }) => {
    const categories = ['All', 'Pinned', 'Recently Viewed']
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [stats, setStats] = useState(null);
    const fileInputRef = useRef(null)
    const [searchTerm, setSearchTerm] = useState('')

    const imageOptions = [placeholder, placeholder_2, placeholder_3]
    //const allImages = [...Array(18)].map((_, idx) => imageOptions[idx % imageOptions.length])
    const allImages = [
        ...Array(6).fill(placeholder),
        ...Array(6).fill(placeholder_2),
        ...Array(6).fill(placeholder_3),
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

            const fg = isActive
                ? '#FFFFFF'
                : isComplete
                ? '#081A33'
                : '#B0B0B0'

            return (
            <StepArrow key={label} bg={bg} fg={fg}>
                    {/* masked arrow filled with bg */}
                    <ArrowShape color={bg} />
                    <span style={{ position: 'relative' }}>{label}</span>
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
            display: 'flex',
        }}>
            {/* Left Section */}
            <Box sx={{
                //border: '1px solid red',
                maxWidth: leftSidebarOpen ? '800px' : '900px',
                transition: 'max-width 0.3s ease',
                display: 'flex',
                flexDirection: 'column', 
                gap: 1
            }}>
                {/* ─── Timeline Stepper ─── */}
                <ArrowStepper activeStep={0} />
                <Box
                    sx={{
                    px: 2,
                    py:0.5,
                    mx: 2,
                    background: 'linear-gradient(to right, #E6F0FA, #CCE5FF)',
                    borderRadius: 2,
                    //border: '1px solid #CBD0DC',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    }}
                >
                    {/* <Typography variant="subtitle2" sx={{
                        fontWeight: 600, fontSize: '20px', color: '#081A33'
                    }}>
                        Template Selection
                    </Typography> */}
                    <Typography variant="subtitle2" sx={{
                        fontSize: '0.8854vw', color: '#081A33'
                    }}>
                        Choose a report template from the list or upload your own to get started. This helps tailor the report format to your specific needs.
                    </Typography>
                </Box>
                <Box sx={{
                    px: 2,
                    py: 0.5,
                    pb: 1,
                    //mt: 1,
                    mx:2,
                    //mb: 1,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.0417vw', color: '#081A33' }}>
                            Reports Repository
                        </Typography>
                    </Box>

                    <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
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
                    <Box sx={{ mr: 4}}>
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
                                    height: '30px',
                                    fontSize: '16px',
                                    color: '#515151',
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
                    </Box>
                    <Box sx={{
                        mt: 1,
                        display:'flex',
                        flexWrap: 'wrap',
                        gap: '2%',
                        pr: 3,
                        maxHeight: '250px',
                        overflowY: 'auto',
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
                        {allImages.map((src, idx) => (
                            <Box
                                key={idx}
                                component="img"
                                src={src}
                                alt={`Placeholder ${idx + 1}`}
                                onClick={() => setSelectedPreview(src)}
                                sx={{
                                    width: '32%',
                                    mb: 1.5,
                                    borderRadius: '5px',
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
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
                <Box
                    sx={{
                        border: '2px dashed #E6E6E6',
                        borderRadius: 2,
                        p: 1,
                        textAlign: 'center',
                        bgcolor: '#FFD95C1A',   //later
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        mx: 2
                    }}
                >
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
                    sx={{ fontWeight: 500, fontSize: '0.625vw', mt: -0.5}}>
                        Choose a file
                    </Typography>
                    <Typography variant="caption" display="block" color="#515151"
                    sx={{ fontWeight: 500, fontSize: '0.625vw', mt: -1}}>
                        DOCX format, up to 10MB
                    </Typography>
                    
                    <Button
                        variant="contained"
                        onClick={() => fileInputRef.current.click()}
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#0088D6',
                        color: '#ffffff',
                        textTransform: 'none',
                        px: 3,
                        py: 0.5,
                        fontWeight: 500,
                        fontSize: '0.7292vw',
                        my:1,
                        }}
                    >
                        Browse Reports
                    </Button>
                </Box>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mx: 2
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
                        ml: 1, mr: 2, 
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
                        {selectedPreview ? (
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
                                <FindInPageIcon sx={{ fontSize: '1.667vw', color: '#081A33', mb: 0.5 }} /> 
                    
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
  )
}

export default TemplateSelection