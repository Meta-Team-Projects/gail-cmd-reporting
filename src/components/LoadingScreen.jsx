import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

export default function LoadingScreen() {
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#F1F8FF',
            zIndex: 2000,
        }}>
            <Box sx={{ width: '20vw', textAlign: 'center' }}>
                <Typography 
                    sx={{ 
                        fontSize: '1.2vw', 
                        color: '#000000', 
                        mb: '2vh',
                        fontWeight: 500 
                    }}
                >
                    Loading...
                </Typography>
                <LinearProgress 
                    sx={{
                        height: '0.8vh',
                        borderRadius: '0.4vh',
                        bgcolor: 'rgba(0, 51, 102, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: '#003366',
                        }
                    }}
                />
            </Box>
        </Box>
    );
}