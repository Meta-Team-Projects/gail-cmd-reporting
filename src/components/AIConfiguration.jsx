import {
    Box,
    Paper,
    Typography,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material'
import { ChevronRight } from '@mui/icons-material'

const AIConfiguration = ({ open, onToggle }) => {
    const configurations = [
        {
            label: 'Tone of Response', value: 'Detailed Explanation', options: [
                'Detailed Explanation',
                'Brief Summary',
                'Technical',
                'Conversational',
            ]
        },
        {
            label: 'Communication Style', value: 'Expert Level Industry Terminology', options: [
                'Expert Level Industry Terminology',
                'Simplified Language',
                'Technical Documentation',
                'Casual Conversation',
            ]
        },
        {
            label: 'Response Format', value: 'Info-graphics', options: [
                'Info-graphics',
                'Text Only',
                'Bullet Points',
                'Step by Step',
            ]
        },
        {
            label: 'Response Length', value: '30-50 Words', options: [
                '30-50 Words',
                '50-100 Words',
                '100-200 Words',
                '200+ Words',
            ]
        },
        {
            label: 'Language Preference', value: 'English', options: [
                'English',
                'Hindi',
                'Spanish',
                'French',
            ]
        },
        {
            label: 'Data Source Preference', value: 'Custom & Global Data', options: [
                'Custom & Global Data',
                'Custom Data Only',
                'Global Data Only',
                'Verified Sources Only',
            ]
        },
        {
            label: 'Language Model', value: 'LLama 3', options: [
                'LLama 3',
                'GPT-4',
                'Claude 2',
                'Custom Model',
            ]
        },
    ]

    return (
        <Paper
            sx={{
                width: open ? 350 : 0,
                height: '95vh',
                position: 'fixed',
                right: '1.5vh',
                top: '2.5vh',
                bgcolor: 'background.sidebar',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                borderLeft: '1px solid',
                borderColor: 'divider',
                zIndex: 1100,
            }}
        >
            <Box sx={{
                p: 3,
                position: 'relative',
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        AI Configuration
                    </Typography>
                    {open && (
                        <IconButton
                            onClick={onToggle}
                            sx={{
                                color: '#515151',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    )}
                </Box>
            </Box>

            <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                {configurations.map((config, index) => (
                    <FormControl
                        key={config.label}
                        fullWidth
                        size="small"
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.paper',
                            }
                        }}
                    >
                        <InputLabel
                            id={`${config.label}-label`}
                            sx={{
                                color: 'text.secondary',
                                fontSize: '0.875rem',
                            }}
                        >
                            {config.label}
                        </InputLabel>
                        <Select
                            labelId={`${config.label}-label`}
                            value={config.value}
                            label={config.label}
                            sx={{
                                '& .MuiSelect-select': {
                                    fontSize: '0.875rem',
                                }
                            }}
                        >
                            {config.options.map((option) => (
                                <MenuItem
                                    key={option}
                                    value={option}
                                    sx={{
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
            </Box>
        </Paper>
    )
}

export default AIConfiguration 