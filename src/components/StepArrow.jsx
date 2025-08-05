import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';

export const ArrowShape = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
});

export const StepArrow = styled(Box)(({ fg = '#fff' }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1.5rem',
    fontWeight: 600,
    fontSize: '0.75rem',
    color: fg,
    overflow: 'hidden',
    flex: 1,
}));

export const ArrowLabel = styled(Typography)(({ fg = 'inherit' }) => ({
    position: 'relative',
    zIndex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: fg,
}));

StepArrow.propTypes = {
    bg: PropTypes.string,
    fg: PropTypes.string,
};
