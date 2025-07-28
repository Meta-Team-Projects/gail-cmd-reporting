import { Paper, Box, Typography, IconButton, } from '@mui/material'

import { useState } from 'react'

import mainFullIcon from '../assets/mainFull.png'
import expandIcon from '../assets/75.png'
import fiftyfiftyIcon from '../assets/50-50.png'
import collapseIcon from '../assets/25.png'
import formulateFullIcon from '../assets/formulateFull.png'
// import collapseIcon from '../assets/collapse.png'
// import expandIcon   from '../assets/expand.png'
// import fullscreenIcon from '../assets/full.png'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'

const TopPanel = ({ layoutMode, leftSidebarOpen, setLayoutMode}) => {

    const [showLayoutIcons, setShowLayoutIcons] = useState(false)
    const toggleLayoutIcons = () => setShowLayoutIcons(v => !v)
return (
    <Box
            sx={{
                position: 'fixed',
                //border: '1px solid black',
                top: '2.5vh',
                right: '1vw',
                width: leftSidebarOpen ? `calc(100vw - 14.5vw)`: `calc(100vw - 5vw)`,
                transition: 'width 0.3s ease',
                height: '6vh',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
                alignItems: 'center',
                zIndex: 1000,
                bgcolor:'none'
            }}
        >
            <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                {/* Left Box - Parliamentary Bot */}
                <Paper
                    elevation={1}
                    sx={{
                        flex: 1,
                        height: '6vh',
                        borderRadius: '15px',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, fontSize: '0.85vw', color: '#081A33' }}
                    >
                        Parliamentary Bot
                    </Typography>
                </Paper>

                {/* Right Box - Layout Icons */}
                <Paper
                    elevation={1}
                    sx={{
                        height: '6vh',
                        borderRadius: '15px',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: 1.5,
                        py: 1.4,
                        transition: 'width 0.3s ease',
                    }}
                >
                    {showLayoutIcons && (
                        <Box sx={{ display: 'flex', gap: leftSidebarOpen ? 0.5 : 1, mr: leftSidebarOpen ? 1 : 1.5 }}>
                            <IconButton size="small" onClick={() => setLayoutMode('fullscreenMain')}>
                                <img src={mainFullIcon} alt="Expand Main" style={{ width: '1.05vw', height: '1.05vw',}} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setLayoutMode('expand')}>
                                <img src={expandIcon} alt="Expand" style={{ width: '1.05vw', height: '1.05vw', }} />
                            </IconButton>
                            <IconButton size="small" 
                            onClick={() => setLayoutMode('fiftyfifty')}
                            >
                                <img src={fiftyfiftyIcon} alt="50-50" style={{ width: '0.89vw', height: '0.89vw', }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setLayoutMode('collapse')}>
                                <img src={collapseIcon} alt="Collapse" style={{width: '1.05vw', height: '1.05vw', }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => setLayoutMode('fullscreenFormulate')}>
                                <img src={formulateFullIcon} alt="Fullscreen Formulate" style={{ width: '1.05vw', height: '1.05vw', }} />
                            </IconButton>
                        </Box>
                    )}
                    <IconButton
                        size="small"
                        onClick={toggleLayoutIcons}
                        sx={{
                            backgroundColor: '#ffd24e',
                            color: '#081A33',
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: '#FFD700',
                            },
                        }}
                    >
                        <AspectRatioIcon fontSize="small" style={{ width: 20, height: 20 }} />
                    </IconButton>
                </Paper>
            </Box>
        </Box>
  )
}

export default TopPanel