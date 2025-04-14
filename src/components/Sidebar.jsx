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
    IconButton,
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

    const drawer = (
        <>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                <img src="/gail_logo.png" alt="Logo" style={{ width: 40, height: 40 }} />
                {open && (
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>
                )}
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => handleMenuItemClick(item.type)}
                            selected={activeMenu === item.type}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.dark',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{
                                color: activeMenu === item.type ? 'primary.contrastText' : 'primary.main'
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: activeMenu === item.type ? 'primary.contrastText' : 'text.primary',
                                    },
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ mt: 'auto' }}>
                <List>
                    {bottomMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon sx={{ color: 'primary.main' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
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
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: 'background.paper',
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