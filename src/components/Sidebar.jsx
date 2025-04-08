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

const drawerWidth = 240

const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Data Ingestion', icon: <DataUsage />, path: '/data-ingestion' },
    { text: 'AI Configuration', icon: <Settings />, path: '/ai-config' },
    { text: 'FAQs', icon: <QuestionAnswer />, path: '/faqs' },
    { text: 'Saved Queries', icon: <GetApp />, path: '/saved-queries' },
    { text: 'Saved Notes', icon: <Note />, path: '/saved-notes' },
    { text: 'Recent Sessions', icon: <History />, path: '/recent-sessions' },
    { text: 'Session Log', icon: <History />, path: '/session-log' },
]

const bottomMenuItems = [
    { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
    { text: 'Support', icon: <Help />, path: '/support' },
]

const Sidebar = ({ open, handleDrawerToggle }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const drawer = (
        <>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40 }} />
                <Typography variant="h6" component="div">
                    GAIL Chat
                </Typography>
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
                        <ListItemButton>
                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
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