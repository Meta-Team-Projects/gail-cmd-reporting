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
    ListItemButton,  
    ListItemText,
    Chip,
    Stack,
    Button,
    Menu,
    MenuItem,
    Divider,
} from '@mui/material'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    FilterList as FilterIcon,
    IosShare,
    Edit,
    Delete,
    Add as AddIcon,
    MoreVert,
    History,
} from '@mui/icons-material'

const SessionList = ({ embedded = false, open, onToggle, sessions, activeSessionID, onSessionSelect, onRename, onDelete, onReset  }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuSessionId, setMenuSessionId] = useState(null);

    const [openResetDialog, setOpenResetDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openRenameDialog, setOpenRenameDialog] = useState(false);
    const [dialogSessionId, setDialogSessionId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    

    const handleMenuClick = (event, sessionId) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setMenuSessionId(sessionId);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuSessionId(null);
    };

    const content = (
        <Box
        sx={{
            flex: 1,
            minHeight: embedded ? 125 : 'auto',
            maxHeight: embedded ? 125 : 'auto',
            overflowY: embedded ? 'auto !important' : 'hidden',
            overflowX: 'hidden',
            ...(embedded && {
            // Chrome, Edge, Safari
            '&::-webkit-scrollbar': {
                width: '4px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#0088d7',
                borderRadius: '3px',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: '#0088d7 transparent',
            }),
        }}>
        <List sx={{
            px: embedded ? 0 : 2,
            py: 1,
        }}>
            {sessions.map(session => {
            const isActive = session.id === activeSessionID;
            return (
                <ListItem
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        mb: 1,
                        px: embedded ? 1 : 2,
                        py: embedded ? 0 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: isActive ? '#0088d7' : 'transparent',
                        '&:hover': {
                        bgcolor: isActive ? '#0088d7' : '#0088a3',
                        },
                        '&:active': {
                        bgcolor: '#0087d6',
                        },
                    }}
                >
                <ListItemText
                    primary={session.name}
                        primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.8333vw',
                    color: isActive
                        ? (session.name === 'Session 1' ? '#fff' : '#fff')
                        : '#fff',
                    }}
                />
                <IconButton size="small" onClick={e => handleMenuClick(e, session.id)} 
                    sx={{ color: isActive ? '#fff' : '#fff' }}>
                    <MoreVert sx={{fontSize: '0.8333vw'}}/>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && menuSessionId === session.id}
                    onClose={handleMenuClose}
                    PaperProps={{ sx: { bgcolor: '#fff', borderRadius: 1, boxShadow: '0px 4px 8px rgba(18,18,18,0.25)' } }}
                    >
                    <MenuItem onClick={() => {
                        setDialogSessionId(session.id);
                        setOpenResetDialog(true);
                        handleMenuClose();
                    }}>
                        <History sx={{ fontSize: 20, mr: 1 }} />
                        Reset
                    </MenuItem>
                    <MenuItem
                        disabled
                        onClick={() => {
                        alert('Export clicked!');
                        handleMenuClose();
                        }}
                    >
                        <IosShare sx={{ fontSize: 20, mr: 1 }} />
                        Export
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setDialogSessionId(session.id);
                        setRenameValue(session.name);
                        setOpenRenameDialog(true);
                        handleMenuClose();
                    }}>
                        <Edit sx={{ fontSize: 20, mr: 1 }} />
                        Rename
                    </MenuItem>
                    <MenuItem 
                        sx={{color: 'red'}}
                        onClick={() => {
                            setDialogSessionId(session.id);
                            setOpenDeleteDialog(true);
                            handleMenuClose();
                        }}>
                        <Delete sx={{ fontSize: 20, mr: 1}} />
                        Delete
                    </MenuItem>
                    </Menu>
                </ListItem>
                )
            })}
            </List>
        </Box>
    )
    const dialogs = (
        <>
        {/* Reset Confirmation */}
        <Dialog
            open={openResetDialog}
            onClose={() => setOpenResetDialog(false)}
            container={() => document.body}
            BackdropProps={{ sx: { backdropFilter: 'grayscale(0.5) brightness(0.5)' } }}
            PaperProps={{
                sx: {
                borderRadius: 4,
                width: 500,
                px: 2,
                pt: 1,
                pb: 2,
                bgcolor: '#F5F7FA',        
                boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
                }
            }}  
        >
            <DialogTitle
                sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                textAlign: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 1,
                color: '#687382',
                }}>
                <History/>Reset Session?
            </DialogTitle>
            <DialogContent
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                color: '#687382',
                }}>
                <Typography>Are you sure you want to reset this session?</Typography>
            </DialogContent>
            <DialogActions 
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                }}>
                <Button 
                sx={{
                    color: '#687382',
                    width: 200,
                    borderRadius: 999,
                }}
                onClick={() => setOpenResetDialog(false)}>Cancel</Button>
                <Button
                variant="contained"
                sx={{
                    backgroundColor: '#0088d7',
                    py: 1,
                    width: 200,
                    borderRadius: 999,
                    color: '#fff',
                    '&:hover': {
                    backgroundColor: '#0072b1',
                    }
                }}
                onClick={() => {
                    onReset(dialogSessionId);
                    setOpenResetDialog(false);
                }}
                >
                    Reset
                </Button>
            </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            container={() => document.body}
            BackdropProps={{ sx: { backdropFilter: 'grayscale(0.5) brightness(0.5)' } }}
            PaperProps={{
                sx: {
                borderRadius: 2,
                width: 500,
                px: 2,
                pt: 1,
                pb: 2,
                bgcolor: '#F5F7FA',        // or whatever light grey
                boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
                }
            }}  
            >
            <DialogTitle
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                textAlign: 'center',
                justifyContent: 'center',
                gap: 2,
                pb: 1,
                mb: 1,
                color: '#687382',
            }}>
                <Delete/> Delete Session?</DialogTitle>
            <DialogContent
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                color: '#687382',
                }}>
                <Typography>Are you sure you want to delete this session?</Typography>
            </DialogContent>
            <DialogActions
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                }}>
                <Button 
                    sx={{
                    color: '#687382',
                    width: 200,
                    borderRadius: 999,
                    }}
                    onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                <Button
                variant="contained"
                sx={{
                    backgroundColor: '#0088d7',
                    py: 1,
                    width: 200,
                    borderRadius: 999,
                    color: '#fff',
                    '&:hover': {
                    backgroundColor: '#0072b1',
                    }
                }}
                onClick={() => {
                    onDelete(dialogSessionId);
                    setOpenDeleteDialog(false);
                }}
                >
                Delete
                </Button>
            </DialogActions>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog
            open={openRenameDialog}
            onClose={() => setOpenRenameDialog(false)}
            container={() => document.body}
            BackdropProps={{ sx: { backdropFilter: 'grayscale(0.5) brightness(0.5)' } }}
            PaperProps={{
                sx: {
                borderRadius: 2,
                width: 500,
                px: 2,
                pt: 1,
                pb: 2,
                bgcolor: '#F5F7FA',        // or whatever light grey
                boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
                }
            }}  
            >
            <DialogTitle
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                textAlign: 'center',
                justifyContent: 'center',
                gap: 2,
                pb: 1,
                mb: 1,
                color: '#687382',
                }}>
                <Edit/>Rename Session?
            </DialogTitle>
            <DialogContent>
                <TextField
                autoFocus
                margin="dense"
                label="New Session Name"
                fullWidth
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                InputLabelProps={{
                    sx: {
                    color: '#0088d7',        // your desired color
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    '&.Mui-focused': {
                        color: '#0072b1',     // color when label is focused
                    }
                    }
                }}
                />
            </DialogContent>
            <DialogActions
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                }}>
                <Button 
                sx={{
                    color: '#687382',
                    width: 200,
                    borderRadius: 999,
                }}
                onClick={() => setOpenRenameDialog(false)}>Cancel</Button>
                <Button
                variant="contained"
                sx={{
                    backgroundColor: '#0088d7',
                    color: '#fff',
                    py: 1,
                    width: 200,
                    borderRadius: 999,
                    '&:hover': {
                    backgroundColor: '#0072b1',
                    }
                }}
                onClick={() => {
                    onRename(dialogSessionId, renameValue);
                    setOpenRenameDialog(false);
                }}
                >
                Rename
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );

    if (embedded) {
        return (
            <>
            {dialogs}
            <Box sx={{ px: 2, pt: 1 }}>{content}</Box>
            </>
        );
    }
    return (
        <>
        {dialogs}
        <Paper
            sx={{
            width: open ? 450 : 0,
            height: '95vh',
            position: 'fixed',
            right: '1.5vh',
            top: '2.5vh',
            bgcolor: 'background.sidebar',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            borderLeft: '0.5px solid rgba(255,255,255,0.15)',
            boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
            borderRadius: '15px',
            zIndex: 1100,
            }}
        >
            {content}
        </Paper>
        </>
    )
}

export default SessionList
