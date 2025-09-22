import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Document, Page, pdfjs } from 'react-pdf';

import {
Box,
TextField,
IconButton,
Typography,
Button,
InputAdornment,
Tooltip,
Chip,
Stack,
List,
ListItem,
CircularProgress,
} from '@mui/material'

import {
Search as SearchIcon,
TrendingFlat as TrendingFlatIcon,
EditOutlined as EditOutlinedIcon,
Delete
} from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PushPinIcon from '@mui/icons-material/PushPin';

import placeholder from '../assets/placeholder.png';
import placeholder_1 from '../assets/placeholder_1.png';
import placeholder_2 from '../assets/placeholder_2.png';
import placeholder_3 from '../assets/placeholder_3.png';
import placeholder_4 from '../assets/placeholder_4.png';
import placeholder_5 from '../assets/placeholder_5.png';

import download_report from '../assets/download_report_icon.png'
import save_template from '../assets/save_template_icon.png'
import generate_report from '../assets/generate_report_icon.png'

const BYTES_LIMIT = 20971520;
const RETURN_BYTES_LIMIT = 83886080;

function formatBytes(bytes = 0) {
if (bytes === 0) return '0 B';
const k = 1024, sizes = ['B','KB','MB','GB','TB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
function formatDate(iso) {
try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString();
} catch { return '-'; }
}

const CMDContent = ({ onNavigateToTemplate }) => {
const categories = ['All', 'Pinned', 'Recently Viewed'];
const [selectedCategory, setSelectedCategory] = useState('All');

// Existing doc state (kept as-is but not used for repo list now)
const [documentList, setDocumentList] = useState({})

const [searchTerm, setSearchTerm] = useState('')
const [pinnedDocs, setPinnedDocs] = useState(new Set())

// Template data (NEW)
const [templates, setTemplates] = useState([]);
const [loadingTemplates, setLoadingTemplates] = useState(false);
const [templatesError, setTemplatesError] = useState(null);

// Old “Latest Reports” preview
const [selectedReport, setSelectedReport] = useState(null);

const [selectedTemplate, setSelectedTemplate] = useState(null);
const [selectedTemplateUrl, setSelectedTemplateUrl] = useState(null); // blob URL for iframe
const [pdfScale, setPdfScale] = useState(1.0); // controls #zoom=%

const allImages = [
    ...Array(2).fill(placeholder_1),
    ...Array(2).fill(placeholder_5),
    ...Array(2).fill(placeholder_5),
    ...Array(2).fill(placeholder_5),
]

const togglePin = (docName) => {
    setPinnedDocs(prev => {
    const ns = new Set(prev);
    ns.has(docName) ? ns.delete(docName) : ns.add(docName);
    return ns;
    });
};

// Fetch templates
const fetchTemplates = async () => {
    setLoadingTemplates(true);
    setTemplatesError(null);
    try {
    const { data } = await axios.get(
        `${import.meta.env.VITE_CHAT_API_URL}/get_templates`,
        {
        params: {
            offset: 0,
            limit: 20,
            max_file_bytes: BYTES_LIMIT,
            max_return_bytes: RETURN_BYTES_LIMIT,
        },
        headers: { accept: 'application/json' },
        }
    );
    // Expecting an array of { name, size_bytes, modified_iso, file_b64 }
    setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
    console.error('Error fetching templates', err);
    setTemplatesError('Failed to load templates');
    } finally {
    setLoadingTemplates(false);
    }
};

// (Kept; currently unused for repo list)
const fetchDocuments = async () => {
    // your old list-documents call (left commented as in your snippet)
};
const collectStats = async () => {
    // your old stats call (left commented as in your snippet)
};

useEffect(() => {
    fetchDocuments();
    collectStats();
    fetchTemplates();
}, []);

const panelRef = useRef(null);

// Compute list to show (from templates)
const visibleTemplates = (() => {
    let arr = [...templates];

    // Category handling
    if (selectedCategory === 'Pinned') {
    arr = arr.filter(t => pinnedDocs.has(t.name));
    } else if (selectedCategory === 'Recently Viewed') {
    // No view tracking yet; fallback to "recently modified"
    arr.sort((a, b) => new Date(b.modified_iso) - new Date(a.modified_iso));
    }

    // Search filter
    if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    arr = arr.filter(t => t.name.toLowerCase().includes(q));
    }

    return arr;
})();

const createdUrlsRef = useRef(new Set());  
const prevUrlRef = useRef(null);           

const addZoomParam = (url, zoom = 36) => {
    if (!url) return undefined;
    return url.includes('#') ? `${url}&zoom=${zoom}` : `${url}#zoom=${zoom}`;
};

const base64ToPdfUrl = (b64) => {
    if (!b64) return null;
    let clean = String(b64)
        .replace(/^data:application\/pdf;base64,/i, '')
        .replace(/\s+/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    let byteChars;
    try { byteChars = atob(clean); } catch (e) { console.error('Invalid base64 for PDF', e); return null; }
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    createdUrlsRef.current.add(url);
    return url;
};


const handleOpenTemplate = (tpl) => {
    if (prevUrlRef.current) {
        try { URL.revokeObjectURL(prevUrlRef.current); } catch {}
        createdUrlsRef.current.delete(prevUrlRef.current);
        prevUrlRef.current = null;
    }
    const url = base64ToPdfUrl(tpl.file_b64);
    prevUrlRef.current = url;
    setSelectedTemplate(tpl);
    setSelectedTemplateUrl(url);
    setPdfScale(1.0);
};

useEffect(() => {
    return () => {
        try {
        createdUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
        createdUrlsRef.current.clear();
        } catch {}
    };
}, []);

useEffect(() => {
    if (!selectedTemplate && prevUrlRef.current) {
        try { URL.revokeObjectURL(prevUrlRef.current); } catch {}
        createdUrlsRef.current.delete(prevUrlRef.current);
        prevUrlRef.current = null;
        setSelectedTemplateUrl(null);
    }
}, [selectedTemplate]);

const handleDownloadTemplate = (tpl) => {
    try {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${tpl.file_b64}`;
    link.download = tpl.name || 'template.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    } catch (e) {
    console.error('Download failed', e);
    }
};

return (
    <Box
    sx={{
        marginTop: '2.5vh',
        height: '95vh',
        marginLeft: '1vw',
        boxShadow: '2px 0px 8px #50505040',
        bgcolor:'#FFFFFF',
        border: '1px solid #E0E7F0',
        borderRadius: '15px',
        overflow: 'hidden',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.417vw',
        maxWidth: { xs: '90%', sm: '94.5%', md: '98%' },
        transition: 'max-width 0.3s ease',
        position: 'relative',
    }}
    >
    <Box sx={{ p: '1.042vw' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25vw', color: '#081A33'}}>
        CMD Reporting
        </Typography>
    </Box>

    {/* Top 3 Boxes */}
    <Box
        sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mx: '0.833vw',
        height: '18vh',
        mb: '0.417vw',
        }}
    >
        <Box
        sx={{
            width: '100%',
            height: '18vh',
            px: '0.833vw',
            py: '0.5vw',
            background: 'linear-gradient(to right, rgba(230, 240, 250, 1), rgba(204, 229, 255, 1))',
            borderRadius: 2,
            border: '1px solid #CBD0DC',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column', justifyContent: 'space-between'
        }}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '0.2vw', mt: '0.3vw' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.2vw', color: '#081A33' }}>
                Generate New Report
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: '0.9375vw', color: '#081A33' }}>
                    Generate custom reports or update existing templates with new data, context and formatting. 
                    Simply select templates and choose key documents to quickly generate structured, insight-rich CMD reports.
                </Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: '0.417vw', alignItems: 'center' }}>
                <Typography sx={{fontSize: '0.813vw'}}>Start Now</Typography>
                <TrendingFlatIcon />
                </Box>
                <Button
                onClick={onNavigateToTemplate}
                variant="contained"
                sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#081A33',
                    background: 'linear-gradient(to right, #FFE56D, #FFD65A)',
                    fontWeight: 550,
                    fontSize: '0.813vw',
                    px: '0.813vw',
                    py: '0.3568vw',
                    boxShadow: '0px 4px 8px #15151540'
                }}
                >
                    Generate Report
                </Button>
            </Box>
        </Box>

        {/* <Box
        sx={{
            width: '32.5%',
            px: '0.833vw',
            pt: '0.417vw',
            background: 'linear-gradient(to right, #FFE56D, #FFD65A)',
            borderRadius: 2,
            border: '1px solid #CBD0DC',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column', justifyContent: 'space-between'
        }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.417vw', my: '1.25vw' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.2vw', color: '#081A33' }}>
                Generate New Response
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: '0.9375vw', color: '#081A33' }}>
                Need a new version of an existing report or exploring a new angle? Generate custom responses with updated data, context, and formatting.
                </Typography>
            </Box>
            <Box sx={{ py: '0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.833vw' }}>
                <Box sx={{ display: 'flex', gap: '0.417vw', alignItems: 'center' }}>
                <Typography sx={{fontSize: '0.813vw'}}>Start Now</Typography>
                <TrendingFlatIcon />
                </Box>
                <Button
                onClick={onNavigateToTemplate}
                variant="contained"
                sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#fff',
                    bgcolor: '#0087d6',
                    fontWeight: 550,
                    fontSize: '0.813vw',
                    px: '0.813vw',
                    py: '0.3568vw',
                    boxShadow: '0px 4px 8px #15151540'
                }}
                >
                    Generate Report
                </Button>
            </Box>
        </Box>

        <Box
        sx={{
            width: '32.5%',
            px: '0.833vw',
            pt: '0.417vw',
            background: 'linear-gradient(to right, #E3F1FF1F, #D3E8F9)',
            borderRadius: 2,
            border: '1px solid #CBD0DC',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column', justifyContent: 'space-between'
        }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.417vw', my: '1.25vw' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.2vw', color: '#081A33' }}>
                    Resume from last session 
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: '0.9375vw', color: '#081A33' }}>
                    Continue working where you left off. Your documents and settings are auto-saved so you can pick up seamlessly.
                </Typography>
            </Box>
            <Box sx={{ py: '0.833vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.833vw' }}>
                <Box sx={{ display: 'flex', gap: '0.417vw', alignItems: 'center' }}>
                <Typography sx={{fontSize: '0.813vw'}}>Continue</Typography>
                <TrendingFlatIcon />
                </Box>
                    <Button
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#fff',
                        bgcolor: '#0087d6',
                        fontWeight: 550,
                        fontSize: '0.813vw',
                        px: '0.813vw',
                        py: '0.3568vw',
                        boxShadow: '0px 4px 8px #15151540'
                    }}
                    >
                        Resume from last session
                    </Button>
            </Box>
        </Box> */}
    </Box>

    {/* Bottom Boxes */}
    <Box sx={{ display: 'flex', flex: 1, gap: '0.417vw', mx: '0.833vw', height: '50vh' }}>
        {/* Left Section: Latest Reports (unchanged) */}
        <Box sx={{
        flex: 1,
        borderRadius: '12px',
        bgcolor: '#F5FAFF',
        px: '0.833vw', pt: '0.7vw', pb: '0.833vw',
        mb: '0.417vw',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.417vw'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#081A33', fontWeight: 700, fontSize: '1.0417vw' }}>
                Latest Reports
                </Typography>
                <AccessTimeIcon sx={{color: '#081A33', fontSize: '1.5vw'}}/>
            </Box>

            <Box sx={{
                mt: '0.5vw',
                display:'flex',
                flexWrap: 'wrap',
                gap: '2%',
                pr: '1.25vw',
                height: '30vw',
                //maxHeight: '250px',
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
                    <Box sx={{borderRadius: '6px', width: '48%', position: 'relative'}}>
                    <Box
                        key={idx}
                        component="img"
                        src={src}
                        alt={`Report ${idx + 1}`}
                        onClick={() => setSelectedReport(src)}
                        sx={{
                            width: '100%',
                            // mb: '0.625vw',
                            borderRadius: '6px',
                            border: '1px solid black',
                            objectFit: 'cover',
                            cursor: 'pointer',
                        }}
                    />
                    <Box
                    sx={{
                        position: 'absolute',
                        bottom: 6,
                        left: 0,
                        right: 0,
                        width: '100%',
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        px: '0.625vw',
                        py: '0.365vw',
                        fontSize: '0.7292vw',
                        borderRadius: '0px 0px 6px 6px'
                    }}
                    >
                        {`Report ${idx + 1}`}
                    </Box>
                    </Box>
                ))}
            </Box>
                    {/* <Box
                        sx={{
                        position: 'relative',
                        width: '48%',
                        mb: '0.625vw',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: isClickable ? 'pointer' : 'not-allowed',
                        opacity: isClickable ? 1 : 0.6,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        }}
                    >
                        <Box
                        component="img"
                        src={src}
                        alt={label}
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
                            label
                        </Box>
                    </Box>
            </Box> */}

            {/* <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <img src={placeholder} alt="Placeholder" style={{width: '49%', borderRadius: '10px', cursor: 'pointer'}}
                    onClick={() => setSelectedReport('Report 1')} />
                <img src={placeholder_2} alt="Placeholder" style={{width: '49%', borderRadius: '10px', cursor: 'pointer'}}
                    onClick={() => setSelectedReport('Report 2')} />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <img src={placeholder_3} alt="Placeholder" style={{width: '49%', borderRadius: '10px', cursor: 'pointer'}}
                    onClick={() => setSelectedReport('Report 3')} />
                <img src={placeholder} alt="Placeholder" style={{width: '49%', borderRadius: '10px', cursor: 'pointer'}}
                    onClick={() => setSelectedReport('Report 4')} />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <img src={placeholder_3} alt="Placeholder" style={{width: '49%', borderRadius: '10px', cursor: 'pointer'}}
                    onClick={() => setSelectedReport('Report 3')} />
                <img src={placeholder} alt="Placeholder" style={{width: '49%', borderRadius: '10px', cursor: 'pointer'}}
                    onClick={() => setSelectedReport('Report 4')} />
            </Box> */}
        </Box>

        {/* Right Section: Reports Repository -> NOW SHOWS TEMPLATES */}
        <Box sx={{
            flex: 1,
            borderRadius: '12px',
            mb: '0.417vw',
            bgcolor: '#F5FAFF',
            px: '0.833vw', pt: '0.7vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7407vh'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#081A33', fontWeight: 700, fontSize: '1.0417vw' }}>
                Reports Repository
                </Typography>
                <AccessTimeIcon sx={{color: '#081A33', fontSize: '1.5vw'}}/>
            </Box>

            {/* Category chips (kept) */}
            <Stack direction="row" sx={{flexWrap: 'wrap', gap: '0.41vw'}}>
                <Box sx={{ mt: '0.4vw', display: 'flex', flexWrap: 'wrap', gap: '0.417vw', flexGrow: 1 }}>
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
                        mb: '0.417vw',
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

            {/* Search */}
            <Box>
                <TextField
                fullWidth
                variant="outlined"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                    bgcolor: '#0088D61A',
                    borderRadius: 10,
                    height: '1.5625vw',
                    fontSize: '0.833vw',
                    color: '#515151'
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

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '0.208vw' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '1.1417vw', color: '#081A33' }}>
                All Templates
                </Typography>
                <Typography variant="subtitle2" sx={{fontSize: '0.9375vw', color: '#081A33'}}>
                View All &gt;
                </Typography>
            </Box>

            {/* Template List */}
            <Box
                ref={panelRef}
                sx={{
                flexGrow: 1,
                maxHeight: '35vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': { width: '0.2083vw' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#0088d7', borderRadius: '3px' },
                scrollbarWidth: 'thin',
                scrollbarColor: '#0088d7 transparent'
                }}
            >
                {loadingTemplates && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: '0.8854vw', color: '#081A33', mb: '0.625vw' }}
                    >
                        Loading…
                    </Typography>
                    <CircularProgress size="1.667vw" />
                </Box>
                )}
                {templatesError && (
                <Typography sx={{ px: 1, color: '#c62828', fontSize: '0.85vw' }}>
                    {templatesError}
                </Typography>
                )}

                {!loadingTemplates && !templatesError && (
                <List sx={{ px: 0, mb: '0.417vw' }}>
                    {visibleTemplates.length === 0 ? (
                    <Typography sx={{ px: 1, color: '#081A33', fontSize: '0.85vw' }}>
                        No templates to display.
                    </Typography>
                    ) : (
                    visibleTemplates.map(tpl => (
                        <ListItem
                        key={tpl.name}
                        disableGutters
                        onClick={() => handleOpenTemplate(tpl)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: '#A9C7FF66',
                            borderRadius: 2,
                            mb: '0.2083vw',
                            p: '0.208vw',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '0.5px solid #00000033',
                            '&:hover': { bgcolor: '#A9C7FFAA' }
                        }}
                        >
                        <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', gap: '0.417vw'}}>
                            <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); togglePin(tpl.name); }}
                            >
                            <Tooltip title="Pin" placement='bottom' arrow>
                                <PushPinIcon
                                sx={{
                                    fontSize: '0.8333vw',
                                    color: pinnedDocs.has(tpl.name) ? '#000000' : '#A9C7FF66',
                                    stroke: 'black',
                                    strokeWidth: 1.5,
                                    transition: 'all 0.2s ease',
                                }}
                                />
                            </Tooltip>
                            </IconButton>

                            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <Typography
                                sx={{
                                fontWeight: 600,
                                color: '#515151',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '0.8333vw',
                                maxWidth: '22vw',
                                }}
                            >
                                {tpl.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72vw', color: '#2b2b2b' }}>
                                {formatBytes(tpl.size_bytes)} • {formatDate(tpl.modified_iso)}
                            </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.416vw' }}>
                            <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(tpl); }}
                            >
                            <Tooltip title='Download' placement='bottom' arrow>
                                <img
                                src={download_report}
                                style={{ width: '1.042vw', height: '1.042vw', objectFit: 'contain' }}
                                />
                            </Tooltip>
                            </IconButton>

                            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title='Delete (disabled)' placement='bottom' arrow>
                                <Delete sx={{ fontSize: '0.8333vw', color: '#f08a8a' }} />
                            </Tooltip>
                            </IconButton>
                        </Box>
                        </ListItem>
                    ))
                    )}
                </List>
                )}
            </Box>
        </Box>
    </Box>

    {/* Old placeholder preview modal */}
    {selectedReport && (
        <Box
        sx={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            bgcolor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
        }}
        onClick={() => setSelectedReport(null)}
        >
        <Box
            sx={{
            width: '57.29vw', height: '46.88vw', bgcolor: '#F5FAFFD9',
            borderRadius: 2, boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Box
            sx={{
                backgroundColor: '#0088D6CC', height: '3.2vw', width: '100%',
                borderTopLeftRadius: 4, borderTopRightRadius: 4, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '0.417vw',
            }}
            >
            <Typography sx={{ color: '#ffffff', fontSize: '0.833vw', fontWeight: 700 }}>
                {selectedReport}
            </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', width: '100%', p: '0.833vw' }}>
            <Box sx={{ position: 'relative', maxWidth: '60%', maxHeight: '85%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box component="img" src={placeholder_4} alt="Placeholder 4" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <Box sx={{ position: 'absolute', top: '0vw', right: '-3.5vw', display: 'flex', flexDirection: 'column', gap: '0.625vw' }}>
                <IconButton sx={{ width: '3vw', height: '3vw', color: '#081A33', backgroundColor: '#FFD95CE5', borderRadius: '50%', '&:hover': {backgroundColor: '#FFCB42'} }}>
                    <EditOutlinedIcon sx={{ fontSize: '1.042vw' }} />
                </IconButton>
                <IconButton sx={{ width: '3vw', height: '3vw', color: '#081A33', backgroundColor: '#FFD95CE5', borderRadius: '50%', '&:hover': {backgroundColor: '#FFCB42'} }}>
                    <img src={download_report} style={{ width: '1.042vw', height: '1.042vw', objectFit: 'contain' }} />
                </IconButton>
                <IconButton sx={{ width: '3vw', height: '3vw', color: '#081A33', backgroundColor: '#FFD95CE5', borderRadius: '50%', '&:hover': {backgroundColor: '#FFCB42'} }}>
                    <img src={save_template} style={{ width: '1.042vw', height: '1.042vw', objectFit: 'contain' }} />
                </IconButton>
                <IconButton sx={{ width: '3vw', height: '3vw', color: '#081A33', backgroundColor: '#FFD95CE5', borderRadius: '50%', '&:hover': {backgroundColor: '#FFCB42'} }}>
                    <img src={generate_report} style={{ width: '1.042vw', height: '1.042vw', objectFit: 'contain' }} />
                </IconButton>
                </Box>
            </Box>
            </Box>
        </Box>
        </Box>
    )}

    {/* NEW: Template PDF preview modal */}
    {selectedTemplate && (
        <Box
        sx={{
            position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setSelectedTemplate(null)}
        >
        <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
            width: '75vw', height: '85vh', bgcolor: '#F5FAFFD9',
            borderRadius: 2, display: 'flex', flexDirection: 'column', boxShadow: 4
            }}
        >
            <Box sx={{
            backgroundColor: '#0088D6CC', height: '3.2vw', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', px: '0.833vw', borderTopLeftRadius: 8, borderTopRightRadius: 8
            }}>
            <Typography sx={{ color: '#fff', fontSize: '0.95vw', fontWeight: 700 }}>
                {selectedTemplate.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
                <Typography sx={{ color: '#fff', fontSize: '0.8vw' }}>
                    {formatBytes(selectedTemplate.size_bytes)} • {formatDate(selectedTemplate.modified_iso)}
                </Typography>
                <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={addZoomParam(selectedTemplateUrl, Math.round(pdfScale*100)) || undefined}
                    target={selectedTemplateUrl ? '_blank' : undefined}
                    rel={selectedTemplateUrl ? 'noreferrer' : undefined}
                    sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.7)',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' },
                    fontSize: '0.7292vw', py: 0.3, px: '0.625vw'
                    }}
                >
                    Open in new tab
                </Button>
                <IconButton onClick={() => handleDownloadTemplate(selectedTemplate)}>
                <img src={download_report} style={{ width: '1.042vw', height: '1.042vw', objectFit: 'contain' }} />
                </IconButton>
            </Box>
            </Box>

            <Box sx={{ flex: 1, p: '0.8vw' }}>
                {selectedTemplateUrl ? (
                    <Box
                    component="iframe"
                    src={addZoomParam(selectedTemplateUrl, Math.round(pdfScale * 100))}
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
                ) : (
                    <Typography sx={{ p: 2 }}>Preview unavailable.</Typography>
                )}
            </Box>
        </Box>
        </Box>
    )}
    </Box>
)
}

export default CMDContent
