import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
    Button,
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download,
    Edit,
    Delete,
    Add as AddIcon,
} from '@mui/icons-material'

const SavedNotes = ({ open, onToggle }) => {
    const categories = ['All', 'HR', 'Finance', 'Procurement']
    const notes = [
        {
            title: 'Note 1',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta arcu quam, at lobortis leo ultricies sit amet. Donec porttitor dui nulla, sed dictum tortor viverra id.',
        },
        {
            title: 'Note 2',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta arcu quam, at lobortis leo ultricies sit amet. Donec porttitor dui nulla, sed dictum tortor viverra id.',
        },
        {
            title: 'Note 3',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta arcu quam, at lobortis leo ultricies sit amet. Donec porttitor dui nulla, sed dictum tortor viverra id.',
        },
        {
            title: 'Note 4',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta arcu quam, at lobortis leo ultricies sit amet. Donec porttitor dui nulla, sed dictum tortor viverra id.',
        },
    ]

    return (
        <Paper
            sx={{
                width: open ? 400 : 0,
                height: '100vh',
                position: 'fixed',
                right: 0,
                top: 0,
                bgcolor: 'rgba(164, 191, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                borderLeft: '0.5px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                borderRadius: '15px',
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
                        Saved Notes
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
                            variant={category === 'All' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{
                                borderRadius: 1,
                                bgcolor: category === 'All' ? 'primary.dark' : 'transparent',
                                borderColor: 'divider',
                                '& .MuiChip-label': {
                                    color: category === 'All' ? 'primary.contrastText' : 'text.primary',
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
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {notes.map((note, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                {note.title}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <IconButton size="small">
                                    <Download sx={{ fontSize: '1.2rem' }} />
                                </IconButton>
                                <IconButton size="small">
                                    <Edit sx={{ fontSize: '1.2rem' }} />
                                </IconButton>
                                <IconButton size="small">
                                    <Delete sx={{ fontSize: '1.2rem' }} />
                                </IconButton>
                            </Stack>
                        </Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {note.content}
                        </Typography>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                    }}
                >
                    Save and update
                </Button>
            </Box>
        </Paper>
    )
}

export default SavedNotes 