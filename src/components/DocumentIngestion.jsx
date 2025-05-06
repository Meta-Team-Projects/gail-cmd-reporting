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
} from '@mui/material'
import {
    CloudUpload,
    Delete,
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Add as AddIcon,
} from '@mui/icons-material'

const DocumentIngestion = ({ open, onToggle }) => {
    const documents = [
        { name: 'New Document 1', date: '03-04-2024' },
        { name: 'New Document 2', date: '03-04-2024' },
        { name: 'New Document 3', date: '03-04-2024' },
        { name: 'New Document 4', date: '03-04-2024' },
    ]

    const categories = ['HR', 'Finance', 'Group 1', 'Group 2']

    return (
        <Paper
            sx={{
                width: open ? 350 : 0,
                height: '95vh',
                position: 'fixed',
                right: '1.5vh',
                top: '2.5vh',
                bgcolor: 'background.sidebar',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                borderLeft: '1px solid',
                borderColor: 'divider',
                zIndex: 1100,
                borderRadius: '15px'
            }}
        >
            <Box sx={{
                p: 3,
                position: 'relative',
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Document Ingestion
                    </Typography>
                    {open && (
                        <IconButton
                            onClick={onToggle}
                            sx={{
                                color: 'text.primary',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#C4C4C4' }}>
                        URL
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder=""
                        size="small"
                        sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: '#FFD95C1A',
                                color: '#515151',
                                '& fieldset': {
                                    borderColor: 'transparent', 
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent', 
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#515151', 
                                },
                            },
                        }}
                    />
                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#C4C4C4', my: 0.5, mb: -1 }}>
                        OR
                    </Typography>
                </Box>

                <Box
                    sx={{
                        border: 'none',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        mb: 1,
                        bgcolor: '#FFD95C1A',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.2,
                    }}
                    >
                    <CloudUpload sx={{ fontSize: 40, color: '#FFD95C' }} /> {/* Icon on top */}
                    
                    <Typography variant="caption" display="block" color="#515151">
                        Choose a file or enter a URL in the box above.
                        JPEG, PNG, PDF, and MP4 formats, up to 50MB
                    </Typography>

                    <Button
                        variant="contained"
                        sx={{
                        borderRadius: 2,
                        bgcolor: '#FFD95C',
                        color: '#515151',
                        textTransform: 'none',
                        px: 3,
                        py: 0.8,
                        fontWeight: 500,
                        }}
                    >
                        Browse File
                    </Button>
                </Box>


                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: '#FFD95C',
                            color: '#515151',
                            px: 2.5,         //custom horizontal padding
                            py: 1,           //custom vertical padding
                            mx: 'auto',     
                        }}
                    >
                        Upload from notes
                    </Button>
                </Box>
            </Box>

            <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto', }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search here..."
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFD95C1A',
                            borderRadius: 2,
                            color: '#515151',
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)', // Default border
                                },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)', //no border color change on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#515151', // When focused or selecred border change
                            },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#515151' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small">
                                    <FilterIcon sx={{ color: '#515151' }}/>
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1}}>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            variant="outlined"
                            size="small"
                            sx={{
                                borderRadius: '999px', 
                                bgcolor: category === 'HR' ? '#ffd95c' : '#FFD95C1A',
                                borderColor: category === 'HR' ? '#ffd95c' : 'divider',
                                '& .MuiChip-label': {
                                    color: category === 'HR' ? 'primary.contrastText' : '#515151',
                                }
                            }}
                        />
                    ))}
                    <Chip
                        icon={<AddIcon/>}
                        size="small"
                        variant="outlined"
                        sx={{
                            position: 'relative',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            bgcolor: '#FFD95C1A',
                            border: 'none',
                            // now style the icon slot
                            '& .MuiChip-icon': {
                                position: 'absolute',            
                                top: '50%',                      
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                margin: 0,                       
                                color: '#515151',               
                                fontSize: 16,
                            },
                        }}
                    />
                </Stack>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        px: 4.5,
                    }}
                    >
                    <Typography variant="subtitle2" sx={{ color: '#515151' }}>
                        Document Name
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#515151' }}>
                        Last Modified
                    </Typography>
                </Box>


                <List sx={{ px: 0 }}>
                    {documents.map((doc, index) => {
                        const isSelected = index < 2;

                        return (
                        <ListItem
                            key={index}
                            disableGutters
                            sx={{
                            bgcolor: isSelected ? '#FFD95C' : '#FFFFFF',
                            borderRadius: 2,
                            mb: 1,
                            px: 2,
                            py: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? 'inset 0 0 0 2px #FFD95C' : 'inset 0 0 0 1px #FFD95C',
                            }}
                        >
                            {/* Left: Radio + Document Name */}
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {/* Radio */}
                            <Box sx={{ mr: 1 }}>
                                <Box
                                sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    border: '2px solid #515151',
                                    backgroundColor: isSelected ? '#515151' : 'transparent',
                                }}
                                />
                            </Box>
                            {/* Document Name */}
                            <Typography
                                sx={{
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                color: '#1A1A1A',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                }}
                            >
                                {doc.name}
                            </Typography>
                            </Box>

                            {/* Center: Last Modified */}
                            <Typography
                            sx={{
                                fontSize: '0.8rem',
                                color: '#515151',
                                mx: 2,
                                whiteSpace: 'nowrap',
                            }}
                            >
                            {doc.date}
                            </Typography>

                            {/* Right: Delete Icon */}
                            <IconButton size="small">
                            <Delete sx={{ fontSize: 16, color: '#515151' }} />
                            </IconButton>
                        </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Paper>
    )
}

export default DocumentIngestion 