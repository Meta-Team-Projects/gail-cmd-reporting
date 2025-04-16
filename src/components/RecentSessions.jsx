import { useState } from 'react'
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
    Menu,
    MenuItem,
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download,
    Edit,
    Delete,
    Add as AddIcon,
    MoreVert,
} from '@mui/icons-material'

const SessionList = ({ open, onToggle }) => {
    const sessions = [
        { id: '1', name: 'Session 1' },
        { id: '2', name: 'Session 2' },
        { id: '3', name: 'Session 3' },
        { id: '4', name: 'Session 4' },
    ]

    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
                        Session List
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
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {sessions.map((session) => (
                    <ListItem
                        key={session.id}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <ListItemText primary={session.name} secondary={`ID: ${session.id}`} />
                        <IconButton size="small" onClick={handleMenuClick}>
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            sx={{
                                '& .MuiPaper-root': {
                                    bgcolor: 'rgba(164, 191, 255, 0.08)',
                                    borderRadius: 1,
                                    boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                                },
                            }}
                        >
                            <MenuItem onClick={handleMenuClose} >Rename</MenuItem>
                            <MenuItem onClick={handleMenuClose}>Export</MenuItem>
                            <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
                        </Menu>
                    </ListItem>
                ))}
            </List>
        </Paper >
    )
}

export default SessionList
