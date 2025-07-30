import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import { styled } from '@mui/system'
import arrowMask from '../assets/arrow.png'

export const ArrowShape = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'color'
    })(({ color }) => ({
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    backgroundColor: color,
    WebkitMaskImage:  `url(${arrowMask})`,
    maskImage:        `url(${arrowMask})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat:       'no-repeat',
    WebkitMaskSize:   '100% 100%',
    maskSize:         '100% 100%',
}))


export const StepArrow = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'bg' && prop !== 'fg'
    })(({ bg, fg }) => ({
    position:        'relative',
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '0.75rem 1.5rem',
    fontWeight:      600,
    fontSize:        '0.875rem',
    backgroundColor: bg,
    color:           fg,
    border: ({ bg }) => bg === '#FFFFFF'
        ? '1px solid #B9B9B9'
        : 'none',
    '&:not(:last-of-type)': {
        borderRight: 'none',
    },
}))

StepArrow.propTypes = {
    bg: PropTypes.string.isRequired,
    fg: PropTypes.string.isRequired,
}
