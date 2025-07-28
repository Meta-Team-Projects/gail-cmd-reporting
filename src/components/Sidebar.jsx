import React from 'react'
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
    Tooltip
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
    ChevronLeft
} from '@mui/icons-material'

import DifferenceIcon from '@mui/icons-material/Difference'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { MenuType } from '../constants/menuTypes'
import RecentSessions from './RecentSessions'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const drawerWidth = '12.5vw'
const collapsedWidth = '3vw'

const menuItems = [
    { text: 'Notepad', icon: <EditNoteIcon />, type: 'TOGGLE_NOTEPAD' },
    { text: 'Home', icon: <Home />, type: MenuType.NONE },
    //{ text: 'New Session', icon: <DifferenceIcon />, type: 'NEW_SESSION' },
    //{ text: 'Saved Notes', icon: <Note />, type: MenuType.SAVED_NOTES, disabled: '' },
    { text: 'Report Repository', icon: <FilePresentIcon />, type: MenuType.DOCUMENT_INGESTION, disabled: '' },
    { text: 'Document Repository', icon: <QuestionAnswer />, type: MenuType.FAQS, disabled: '' },
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
}) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleMenuItemClick = (menuType) => {
        if (menuType === 'TOGGLE_NOTEPAD') {
            if (typeof onNotepadToggle === 'function') onNotepadToggle()
            return
        }
        if (menuType === 'NEW_SESSION') {
            if (typeof onMenuClick === 'function') onMenuClick('NEW_SESSION')
            return
        }
        if (menuType !== MenuType.NONE && typeof onMenuClick === 'function') {
            onMenuClick(menuType)
        }
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
                        color: 'inherit',
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
                                        : '#678092',
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

            <Box sx={{ px: 2, pb: 2, mx: -2 }}>
                {open ? (<RecentSessions
                    embedded
                    open={open}
                    onToggle={handleDrawerToggle}
                    sessions={sessions}
                    activeSessionID={activeSessionID}
                    onSessionSelect={onSessionSelect}
                    onRename={onRename}
                    onDelete={onDelete}
                    onReset={onReset}
                />
                ) : (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 1}}>
                        <Tooltip 
                        PopperProps={{modifiers: [{
                            name: 'offset',
                            options: { offset: [0, 14]}
                        }]}}
                        title="Recent Sessions" placement="right" arrow>
                        < AccessTimeIcon sx={{color: '#999'}}/>
                        </Tooltip>
                    </Box>
                )}
            </Box>

            <Divider sx={{ mx: 2, my: 1, borderColor: '#e0e0e0' }} />
            <List>
                <ListItem disablePadding>{renderMenuItem(menuItems[0])}</ListItem>
                <Divider sx={{ mx: 2, my: 1, borderColor: '#e0e0e0' }} />
                {menuItems.slice(1, 4).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        {renderMenuItem(item)}
                    </ListItem>
                ))}
                <Divider sx={{ mx: 2, my: 1, borderColor: '#e0e0e0' }} />
                {menuItems.slice(4).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        {renderMenuItem(item)}
                    </ListItem>
                ))}
                {/* <Divider sx={{ mx: 2, my: 1, borderColor: '#e0e0e0' }} /> */}
            </List>

            <Box sx={{ mt: 'auto' }}>
                <List>
                    {bottomMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <Tooltip title={!open ? item.text : ''} placement="right" arrow>
                                <ListItemButton
                                onClick={() => handleMenuItemClick(item.type)}
                                selected={activeMenu === item.type}
                                sx={{
                                    pl: 2,
                                    justifyContent: open ? 'initial' : 'center',
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
                                    //Darker theme
                                    color: activeMenu === item.type ? '#678092' : '#678092',
                                    //Lighter theme
                                    //color: activeMenu === item.type ? '#303030' : '#081A3366',
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
                                        color: activeMenu === item.type ? '#678092' : '#678092',
                                    }
                                    }}
                                    />
                                )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>

            </Box>
        </>
    )

    return (
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
    )
}

export default Sidebar
