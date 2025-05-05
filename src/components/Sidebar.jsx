import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    Typography,
    useTheme,
    useMediaQuery,
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
} from '@mui/icons-material'
import { MenuType } from '../constants/menuTypes'

const drawerWidth = 240

const menuItems = [
    { text: 'Home', icon: <Home />, type: MenuType.NONE },
    { text: 'Data Ingestion', icon: <DataUsage />, type: MenuType.DOCUMENT_INGESTION },
    { text: 'AI Configuration', icon: <Settings />, type: MenuType.AI_CONFIGURATION },
    { text: 'FAQs', icon: <QuestionAnswer />, type: MenuType.FAQS },
    { text: 'Saved Queries', icon: <GetApp />, type: MenuType.SAVED_QUERIES },
    { text: 'Saved Notes', icon: <Note />, type: MenuType.SAVED_NOTES },
    { text: 'Recent Sessions', icon: <History />, type: MenuType.RECENT_SESSIONS },
    { text: 'Session Log', icon: <History />, type: MenuType.SESSION_LOG },
]

const bottomMenuItems = [
    { text: 'Profile', icon: <AccountCircle />, type: MenuType.NONE },
    { text: 'Support', icon: <Help />, type: MenuType.NONE },
]

const Sidebar = ({ open, handleDrawerToggle, onMenuClick, activeMenu }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleMenuItemClick = (menuType) => {
        if (menuType !== MenuType.NONE) {
            onMenuClick(menuType)
        }
    }

    const renderMenuItem = (item) => (
        <ListItemButton
            onClick={() => handleMenuItemClick(item.type)}
            selected={activeMenu === item.type}
            sx={{
                pl: 2,
                borderLeft: activeMenu === item.type ? '6px solid #303030' : '4px solid transparent',
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
            <ListItemIcon sx={{ color: activeMenu === item.type ? '#303030' : '#081A3366' }}>
                {item.icon}
            </ListItemIcon>
            <ListItemText
                primary={item.text}
                sx={{
                    '& .MuiListItemText-primary': {
                        color: activeMenu === item.type ? '#303030' : '#081A3366',
                        fontWeight: activeMenu === item.type ? 600 : 300,
                    },
                }}
            />
        </ListItemButton>
    )

    const drawer = (
        <>
            <Box sx={{ px: 2, py: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img src="/gail_logo.png" alt="Logo" style={{ width: 40, height: 40 }} />
                {open && (
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#000000',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        GAIL (India)
                    </Typography>
                )}
            </Box>

            <List>
                {/* Section 1: Home */}
                <ListItem disablePadding>{renderMenuItem(menuItems[0])}</ListItem>

                <Box sx={{ height: 32 }} />

                {/* Section 2: Data Ingestion, AI Configuration, FAQs */}
                {menuItems.slice(1, 4).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        {renderMenuItem(item)}
                    </ListItem>
                ))}

                <Box sx={{ height: 32 }} />

                {/* Section 3: Saved Queries to Session Log */}
                {menuItems.slice(4).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        {renderMenuItem(item)}
                    </ListItem>
                ))}
            </List>

            <Box sx={{ mt: 'auto' }}>
                <List>
                    {bottomMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon sx={{ color: activeMenu === item.type ? '#303030' : '#081A3366' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        '& .MuiListItemText-primary': {
                                            color: '#081A3366',
                                        },
                                    }}
                                />
                            </ListItemButton>
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
                width: { sm: open ? drawerWidth : 0 },
                flexShrink: { sm: 0 },
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
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        marginTop: '2.5vh',
                        height: '95vh',
                        marginLeft: '1.5vh',
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: '#FFFFFF',
                        borderRight: '0.5px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0px 4px 8px rgba(18, 18, 18, 0.25)',
                        borderRadius: '15px',
                        transform: !open ? `translateX(-${drawerWidth}px)` : 'none',
                        transition: theme.transitions.create('transform', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    },
                }}
            >
                {drawer}
            </Drawer>
        </Box>
    )
}

export default Sidebar
