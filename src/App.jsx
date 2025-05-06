import { useState } from 'react'
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  VerticalSplit,
  Menu as MenuIcon,
} from '@mui/icons-material'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import DocumentIngestion from './components/DocumentIngestion'
import AIConfiguration from './components/AIConfiguration'
import FAQs from './components/FAQs'
import SavedNotes from './components/SavedNotes'
import SavedQueries from './components/SavedQueries'
import RecentSessions from './components/RecentSessions'
import SessionLog from './components/SessionLog'
import { MenuType } from './constants/menuTypes'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'linear-gradient(180deg, #1F2A44 0%, #000B25 100%)',
      paper: 'rgba(164, 191, 255, 0.08)',
      sidebar: '#F6F6F6'
    },
    primary: {
      main: '#FFD95C',
    },
    text: {
      primary: '#515151',
      secondary: '#FFD95C',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#515151',
            },
          },
        },
      },
    },
  },
})

function App() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [activeRightMenu, setActiveRightMenu] = useState(MenuType.NONE)
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'))

  const handleLeftDrawerToggle = () => {
    setLeftSidebarOpen(!leftSidebarOpen)
  }

  const handleRightDrawerToggle = () => {
    setRightSidebarOpen(!rightSidebarOpen)
  }

  const handleMenuClick = (menuType) => {
    if (activeRightMenu === menuType && rightSidebarOpen) {
      // If clicking the same menu that's already open, close it
      setRightSidebarOpen(false)
      setActiveRightMenu(MenuType.NONE)
    } else {
      // Open the new menu
      setRightSidebarOpen(true)
      setActiveRightMenu(menuType)
    }
  }

  const renderRightMenu = () => {
    switch (activeRightMenu) {
      case MenuType.DOCUMENT_INGESTION:
        return <DocumentIngestion open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.AI_CONFIGURATION:
        return <AIConfiguration open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.FAQS:
        return <FAQs open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.SAVED_QUERIES:
        return <SavedQueries open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.SAVED_NOTES:
        return <SavedNotes open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.RECENT_SESSIONS:
        return <RecentSessions open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      case MenuType.SESSION_LOG:
        return <SessionLog open={rightSidebarOpen} onToggle={handleRightDrawerToggle} />
      default:
        return null
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          open={leftSidebarOpen}
          handleDrawerToggle={handleLeftDrawerToggle}
          onMenuClick={handleMenuClick}
          activeMenu={activeRightMenu}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            bgcolor: 'background.default',
            position: 'relative',
          }}
        >
          {/* Left sidebar toggle button - shown only when sidebar is closed */}
          {!leftSidebarOpen && (
            <IconButton
              color="inherit"
              aria-label="open left drawer"
              onClick={handleLeftDrawerToggle}
              sx={{
                position: 'fixed',
                left: 0,
                top: 8,
                zIndex: 1200,
                bgcolor: 'background.paper',
                borderRadius: '0 4px 4px 0',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Right sidebar toggle button - shown only when sidebar is closed */}
          {!rightSidebarOpen && activeRightMenu !== MenuType.NONE && (
            <IconButton
              color="inherit"
              aria-label="open right drawer"
              onClick={handleRightDrawerToggle}
              sx={{
                position: 'fixed',
                right: 0,
                top: 8,
                zIndex: 1200,
                bgcolor: 'background.paper',
                borderRadius: '4px 0 0 4px',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <VerticalSplit />
            </IconButton>
          )}

          <MainContent
            rightSidebarOpen={rightSidebarOpen}
            leftSidebarOpen={leftSidebarOpen}
          />
          {renderRightMenu()}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
