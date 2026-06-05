import React, { useState } from 'react'
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery,
    Divider,
    Tooltip,
    Menu,
    MenuItem,
    Avatar,
    TextField,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import {
    Home,
    DataUsage,
    Settings,
    QuestionAnswer,
    GetApp,
    Note,
    History,
    AccountCircle,
    Help,
    ChevronLeft,
    Close as CloseIcon,
} from '@mui/icons-material'

import DifferenceIcon from '@mui/icons-material/Difference'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { MenuType } from '../constants/menuTypes'
import RecentSessions from './RecentSessions'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = '12.5vw'
const collapsedWidth = '3vw'

const menuItems = [
    { text: 'Notepad', icon: <EditNoteIcon />, type: 'TOGGLE_NOTEPAD' },
    { text: 'Home', icon: <Home />, type: MenuType.NONE },
    //{ text: 'New Session', icon: <DifferenceIcon />, type: 'NEW_SESSION' },
    { text: 'Saved Notes', icon: <Note />, type: MenuType.SAVED_NOTES, disabled: '' },
    // { text: 'Report Repository', icon: <FilePresentIcon />, type: MenuType.DOCUMENT_INGESTION, disabled: '' },
    { text: 'Document Manager', icon: <QuestionAnswer />, type: MenuType.DOCUMENT_INGESTION, disabled: '' },
    //{ text: 'Saved Queries', icon: <GetApp />, type: MenuType.SAVED_QUERIES, disabled: '' },
]

const bottomMenuItems = [
    { text: 'Profile', icon: <AccountCircle />, type: MenuType.NONE },
    { text: 'Support', icon: <Help />, type: MenuType.NONE },
]

const Sidebar = ({
    open,
    handleDrawerToggle,
    onMenuClick,
    onNotepadToggle,
    activeMenu,
    showNotepad,
    sessions,
    activeSessionID,
    onSessionSelect,
    onRename,
    onDelete,
    onReset,
    onLogout
}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const [openProfileDialog, setOpenProfileDialog] = useState(false);
    const [openSupportDialog, setOpenSupportDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutClick = () => {
        handleMenuClose();
        if (typeof onLogout === 'function') {
            onLogout();
        }
    };

    const handleMenuItemClick = (itemOrType, event) => {
        const isObject = typeof itemOrType === 'object' && itemOrType !== null;
        const itemText = isObject ? itemOrType.text : '';
        const menuType = isObject ? itemOrType.type : itemOrType;

        if (itemText === 'Profile') {
            setAnchorEl(event.currentTarget);
            return;
        }
        
        if (itemText === 'Support') {
            setOpenSupportDialog(true);
            return;
        }

        if (menuType === 'TOGGLE_NOTEPAD') {
            if (typeof onNotepadToggle === 'function') onNotepadToggle();
            return;
        }
        
        if (menuType === 'NEW_SESSION') {
            if (typeof onMenuClick === 'function') onMenuClick('NEW_SESSION');
            return;
        }
        
        if (menuType !== MenuType.NONE && typeof onMenuClick === 'function') {
            onMenuClick(menuType);
        }
    };

    const menuPaperSx = {
        mt: '0vh',
        py: '0.45vh',
        minWidth: '10vw',
        borderRadius: '0.8vw',
        //border: '0.05vw solid rgba(255, 255, 255, 0.14)',
        background: 'linear-gradient(180deg, #0b396a 0%, #135aa1 100%)',
        boxShadow: '0 1vh 2.4vh rgba(18, 18, 18, 0.28)',
        overflow: 'hidden',
        '& .MuiList-root': {
            py: '0.35vh',
        },
    }

    const menuItemSx = {
        minHeight: '3.8vh',
        px: '0.9vw',
        py: '0.7vh',
        gap: '0.65vw',
        color: '#FFFFFF',
        fontSize: '0.73vw',
        fontWeight: 500,
        lineHeight: 1.2,
        justifyContent: 'flex-start',
        '& .MuiSvgIcon-root': {
            fontSize: '0.95vw',
            color: '#FFFFFF',
            flexShrink: 0,
        },
        '&:hover': {
            bgcolor: 'rgba(243, 242, 239, 0.1)',
        },
        '&.Mui-focusVisible': {
            bgcolor: 'rgba(255, 217, 92, 0.18)',
        },
        '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.42)',
            opacity: 1,
            '& .MuiSvgIcon-root': {
                color: 'rgba(255, 255, 255, 0.42)',
            },
        },
    }

    const renderMenuItem = (item) => (
        <Tooltip title={!open ? item.text : ''} placement="right" arrow>
            <ListItemButton
                onClick={item.disabled ? undefined : () => handleMenuItemClick(item.type)}
                disabled={item.disabled}
                selected={item.type === 'TOGGLE_NOTEPAD' ? showNotepad : activeMenu === item.type}
                sx={{
                    pl: 2,
                    justifyContent: open ? 'initial' : 'center',
                    //Darker_theme
                    borderLeft: (item.type === 'TOGGLE_NOTEPAD' ? showNotepad : activeMenu === item.type)
                        ? '6px solid #fff'
                        : '4px solid transparent',
                    //Lighter_theme
                    /*borderLeft: (item.type === 'TOGGLE_NOTEPAD' ? showNotepad : activeMenu === item.type)
                        ? '6px solid #081a33'
                        : '4px solid transparent', */
                    //Darker theme
                    color: '#fff',
                    //Lighter_theme
                    //color: activeMenu === item.type ? '#081a33': '#7090ac',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: 'transparent' },
                    '&.Mui-selected': { bgcolor: 'transparent' },
                    '&.Mui-selected:hover': { bgcolor: 'transparent' },
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 2 : 'auto',
                        justifyContent: 'center',
                        color: '#fff',
                    }}
                >
                    {item.type === 'TOGGLE_NOTEPAD' ? (
                        <Box
                            sx={{
                                bgcolor: '#FFD95C',
                                color: '#081A33',
                                borderRadius: '50%',
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '1.666vw',
                                height: '1.666vw',
                            }}
                        >
                            <EditNoteIcon sx={{fontSize: '1vw'}} />
                        </Box>
                    ) : (
                        React.cloneElement(item.icon, {sx: {fontSize: '1vw', ml: '0.045vw'}})
                    )}
                </ListItemIcon>
                {open && (
                    <ListItemText
                        primary={item.text}
                        sx={{
                            '& .MuiListItemText-primary': {
                                //Darker theme
                                color: item.type === 'TOGGLE_NOTEPAD'
                                    ? '#fff'
                                    : activeMenu === item.type
                                        ? '#fff'
                                        : '#fff',
                                //Lighter theme
                                /*color: item.type === 'TOGGLE_NOTEPAD'
                                    ? '#303030'
                                    : activeMenu === item.type
                                        ? '#303030'
                                        : '#081A3366',*/

                                fontWeight: item.type === 'TOGGLE_NOTEPAD' || activeMenu === item.type ? 600 : 300,
                                fontSize: '0.833vw',
                            },
                        }}
                    />
                )}
            </ListItemButton>
        </Tooltip>
    )

    const drawer = (
        <>
            <Box sx={{ px: 2, py: 3, display: 'flex',
                justifyContent: open ? 'flex-start' : 'center',
                alignItems: 'center', gap: open ? 1 : 0 }}>
                <Box component="img"
                    src="/gail_logo.png" alt="Logo"
                    onClick={!open ? handleDrawerToggle : undefined}
                    sx={{ width: '2.083vw', height: '2.083vw',
                    cursor: !open ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover':{
                        transform: !open ? 'scale(1.05' : 'none',
                    },
                    }} />
                {open && (
                    <>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                fontSize: '0.833vw',
                                //Darker_theme 
                                color: '#FFFFFF',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            GAIL (India)
                        </Typography>
                        <IconButton
                            onClick={handleDrawerToggle}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                '&:hover': { bgcolor: 'action.hover' },
                                //Darker theme
                                color: '#FFFFFF',
                                //Lighter theme
                                //color: '#081a33',
                            }}
                        >
                            <ChevronLeft sx={{fontSize: '1.041vw'}}/>
                        </IconButton>
                    </>
                )}
            </Box>

            <List>
                {menuItems.slice(1, 4).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        {renderMenuItem(item)}
                    </ListItem>
                ))}
                <Divider sx={{ mx: 2, my: 1, borderColor: '#e0e0e0' }} />
                <ListItem disablePadding>{renderMenuItem(menuItems[0])}</ListItem>
                {menuItems.slice(4).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        {renderMenuItem(item)}
                    </ListItem>
                ))}
                <Divider sx={{ mx: 2, my: 1, borderColor: '#e0e0e0' }} />
            </List>

            <Box sx={{ mt: 'auto' }}>
                <List>
                    {bottomMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <Tooltip title={!open ? item.text : ''} placement="right" arrow>
                                <ListItemButton
                                onClick={(e) => handleMenuItemClick(item, e)}
                                selected={activeMenu === item.type}
                                sx={{
                                    pl: 2,
                                    justifyContent: open ? 'initial' : 'center',
                                    color: '#fff',
                                    bgcolor: 'transparent',
                                    '&:hover': {
                                    bgcolor: 'transparent',
                                    },
                                    '&.Mui-selected': {
                                    bgcolor: 'transparent',
                                    },
                                    '&.Mui-selected:hover': {
                                    bgcolor: 'transparent',
                                    },
                                }}
                                >
                                <ListItemIcon
                                    sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : 'auto',
                                    justifyContent: 'center',
                                    '& svg': {
                                        fontSize: '1vw',
                                    },
                                    color: '#fff',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {open && (
                                    <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                    sx: {
                                        fontSize: '0.8333vw',
                                        color: '#fff',
                                    }
                                    }}
                                    />
                                )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>

                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: menuPaperSx
                  }}
                >
                    <MenuItem
                      onClick={() => {
                        setOpenProfileDialog(true);
                        handleMenuClose();
                    }}
                      sx={menuItemSx}
                    >
                        <PersonIcon />
                        Go To Profile
                    </MenuItem>
                    <MenuItem
                      onClick={handleLogoutClick}
                      sx={menuItemSx}
                    >
                        <LogoutIcon />
                        Logout
                    </MenuItem>
                </Menu>
            </Box>
        </>
    )

    const dialogs = (
        <>
            {/* Profile Dialog */}
            <Dialog
                open={openProfileDialog}
                onClose={() => setOpenProfileDialog(false)}
                container={() => document.body}
                BackdropProps={{ sx: { backdropFilter: 'grayscale(0.5) brightness(0.5)' } }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 500,
                        mx: 2,
                        px: 3,
                        py: 4,
                        bgcolor: '#F5F7FA',
                        boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
                        position: 'relative' 
                    }
                }}  
            >
                {/* Absolute Positioned Close Button */}
                <IconButton
                    aria-label="close"
                    onClick={() => setOpenProfileDialog(false)}
                    sx={{
                        position: 'absolute',
                        right: 10,
                        top: 10,
                        color: '#687382',
                        '&:hover': {
                            backgroundColor: '#c8e4f45a',
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>

                <DialogContent 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 1.5,
                        p: 0 
                    }}
                >
                    {/* Top Center Profile Circle */}
                    <Avatar 
                        sx={{ 
                            width: '4.167rem', 
                            height: '4.167rem', 
                            bgcolor: '#0088d7',
                            mb: 1
                        }}
                    />

                    {/* 3 Static Display Fields */}
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        
                        {/* Field: Name */}
                        <Box>
                            <Typography 
                                sx={{ 
                                    color: '#0088d7', 
                                    fontWeight: 500, 
                                    fontSize: '0.85rem',
                                    mb: 0.5 
                                }}
                            >
                                Name
                            </Typography>
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: '40px', 
                                    border: '1px solid #687382', 
                                    borderRadius: '4px',
                                    bgcolor: 'transparent'
                                }} 
                            />
                        </Box>

                        {/* Field: Email */}
                        <Box>
                            <Typography 
                                sx={{ 
                                    color: '#0088d7', 
                                    fontWeight: 500, 
                                    fontSize: '0.85rem',
                                    mb: 0.5 
                                }}
                            >
                                Email
                            </Typography>
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: '40px', 
                                    border: '1px solid #687382', 
                                    borderRadius: '4px',
                                    bgcolor: 'transparent'
                                }} 
                            />
                        </Box>

                        {/* Field: Title */}
                        <Box>
                            <Typography 
                                sx={{ 
                                    color: '#0088d7', 
                                    fontWeight: 500, 
                                    fontSize: '0.85rem',
                                    mb: 0.5 
                                }}
                            >
                                Title
                            </Typography>
                            <Box 
                                sx={{ 
                                    width: '100%', 
                                    height: '40px', 
                                    border: '1px solid #687382', 
                                    borderRadius: '4px',
                                    bgcolor: 'transparent'
                                }} 
                            />
                        </Box>

                    </Box>
                </DialogContent>
            </Dialog>

            {/* Support Dialog */}
            <Dialog
                open={openSupportDialog}
                onClose={() => setOpenSupportDialog(false)}
                container={() => document.body}
                BackdropProps={{ sx: { backdropFilter: 'grayscale(0.5) brightness(0.5)' } }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 500,
                        mx: 2,
                        px: 3,
                        pt: 5, // Extra top padding to ensure typography avoids the close button
                        pb: 4,
                        bgcolor: '#F5F7FA',
                        boxShadow: '0px 4px 8px rgba(18,18,18,0.25)',
                        position: 'relative' 
                    }
                }}  
            >
                {/* Absolute Positioned Close Button */}
                <IconButton
                    aria-label="close"
                    onClick={() => setOpenSupportDialog(false)}
                    sx={{
                        position: 'absolute',
                        right: 10,
                        top: 10,
                        color: '#687382',
                        '&:hover': {
                            backgroundColor: '#c8e4f45a',
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>

                <DialogContent sx={{ p: 0 }}>
                    <Typography 
                        sx={{ 
                            color: '#687382', // Matching your secondary text color accent
                            fontSize: '0.95rem', 
                            lineHeight: 1.6,
                            textAlign: 'center'
                        }}
                    >
                        In case of any issue related to chatbot performance please reach out to{' '}
                        <Box component="span" sx={{ color: '#0088d7', fontWeight: 600 }}>
                            Soujanya Mondal
                        </Box>
                        , Senior Manager CSPA at{' '}
                        <Box 
                            component="a" 
                            href="mailto:smondal@gail.co.in" 
                            sx={{ 
                                color: '#0088d7', 
                                textDecoration: 'none', 
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' } 
                            }}
                        >
                            smondal@gail.co.in
                        </Box>
                        .
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    );

    return (
        <>
        {dialogs}
        <Box
            component="nav"
            sx={{
                width: open ? drawerWidth : collapsedWidth,
                flexShrink: 0,
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}
        >
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? open : true}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : collapsedWidth,
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                        //Darker theme
                        background: 'linear-gradient(to top, #001C30 0%, #005696 100%)',
                        //Lighter_theme
                        //background: 'linear-gradient(to top, #5EBBFF 0%,   #E3F2FD 100%)',
                        color: '#FFFFFF',
                        borderRight: '0.5px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                        borderRadius: '15px',
                        marginTop: '2.5vh',
                        height: '95vh',
                        marginLeft: '0.5vw',
                    }
                }}
            >
                {drawer}
            </Drawer>
        </Box>
        </>
    )
}

export default Sidebar
