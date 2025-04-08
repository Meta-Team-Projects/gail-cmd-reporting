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
} from '@mui/icons-material'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import DocumentIngestion from './components/DocumentIngestion'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0A1929',
      paper: '#132F4C',
    },
    primary: {
      main: '#3399FF',
    },
  },
})

function App() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'))

  const handleLeftDrawerToggle = () => {
    setLeftSidebarOpen(!leftSidebarOpen)
  }

  const handleRightDrawerToggle = () => {
    setRightSidebarOpen(!rightSidebarOpen)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          open={leftSidebarOpen}
          handleDrawerToggle={handleLeftDrawerToggle}
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
              <VerticalSplit />
            </IconButton>
          )}

          {/* Right sidebar toggle button - shown only when sidebar is closed */}
          {!rightSidebarOpen && (
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
          <DocumentIngestion
            open={rightSidebarOpen}
            onToggle={handleRightDrawerToggle}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
