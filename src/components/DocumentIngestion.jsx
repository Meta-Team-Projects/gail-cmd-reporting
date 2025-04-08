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

    const categories = ['HR', 'Finance', 'Procurement', 'Group 1']

    return (
        <Paper
            sx={{
                width: open ? 400 : 0,
                height: '100vh',
                position: 'fixed',
                right: 0,
                top: 0,
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                borderLeft: '1px solid',
                borderColor: 'divider',
                zIndex: 1100,
            }}
        >
            <Box sx={{
                p: 3,
                position: 'relative',
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Document Ingestion
                    </Typography>
                    {open && (
                        <IconButton
                            onClick={onToggle}
                            sx={{
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
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        URL
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter URL"
                        size="small"
                        sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default',
                            }
                        }}
                    />
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', my: 1 }}>
                        OR
                    </Typography>
                </Box>

                <Box
                    sx={{
                        border: '1px dashed',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        mb: 2,
                        bgcolor: 'background.default',
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 1, borderRadius: 2 }}
                    >
                        Browse File
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary">
                        JPEG, PNG, PDF, and MP4 formats, up to 50MB
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        bgcolor: 'background.default',
                    }}
                >
                    Upload from notes
                </Button>
            </Box>

            <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search here..."
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small">
                                    <FilterIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            variant="outlined"
                            size="small"
                            sx={{
                                borderRadius: 1,
                                bgcolor: category === 'HR' ? 'primary.dark' : 'background.paper',
                                borderColor: category === 'HR' ? 'primary.main' : 'divider',
                                '& .MuiChip-label': {
                                    color: category === 'HR' ? 'primary.contrastText' : 'text.primary',
                                }
                            }}
                        />
                    ))}
                    <Chip
                        icon={<AddIcon />}
                        size="small"
                        variant="outlined"
                        sx={{
                            borderRadius: 1,
                            borderStyle: 'dashed',
                        }}
                    />
                </Stack>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    px: 1,
                }}>
                    <Typography variant="caption" sx={{ flexGrow: 1, color: 'text.secondary' }}>
                        Document Name
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Last Modified
                    </Typography>
                </Box>

                <List sx={{ mx: -2 }}>
                    {documents.map((doc, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" size="small">
                                    <Delete sx={{ fontSize: '1.2rem' }} />
                                </IconButton>
                            }
                            sx={{
                                bgcolor: index < 2 ? 'background.paper' : 'transparent',
                                borderRadius: 1,
                                mb: 0.5,
                                px: 2,
                            }}
                        >
                            <ListItemText
                                primary={doc.name}
                                secondary={doc.date}
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    sx: { color: index < 2 ? 'primary.main' : 'text.primary' }
                                }}
                                secondaryTypographyProps={{
                                    variant: 'caption',
                                    sx: { color: 'text.secondary' }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    )
}

export default DocumentIngestion 