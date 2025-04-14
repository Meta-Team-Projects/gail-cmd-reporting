import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Chip,
    Stack,
} from '@mui/material'
import {
    ChevronRight,
    Search as SearchIcon,
    KeyboardArrowRight,
} from '@mui/icons-material'

const FAQs = ({ open, onToggle }) => {
    const categories = ['ALL', 'Live', 'Popular', 'Favorites']
    const faqs = [
        {
            question: "What is GAIL's role in India's energy sector?",
            isExpanded: false,
        },
        {
            question: "What initiatives has GAIL undertaken for expanding the natural gas pipeline network?",
            isExpanded: false,
        },
        {
            question: "How does GAIL support government initiatives like 'Make in India' and 'Aatmanirbhar Bharat'?",
            isExpanded: false,
        },
    ]

    return (
        <Paper
            sx={{
                width: open ? 400 : 0,
                height: '100vh',
                position: 'fixed',
                right: 0,
                top: 0,
                bgcolor: 'background.default',
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
                        FAQs
                    </Typography>
                    {open && (
                        <IconButton
                            onClick={onToggle}
                            sx={{
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    )}
                </Box>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search here..."
                    size="small"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            variant={category === 'ALL' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{
                                borderRadius: 1,
                                bgcolor: category === 'ALL' ? 'primary.dark' : 'transparent',
                                borderColor: 'divider',
                                '& .MuiChip-label': {
                                    color: category === 'ALL' ? 'primary.contrastText' : 'text.primary',
                                }
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
                {faqs.map((faq, index) => (
                    <ListItem
                        key={index}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            p: 2,
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <ListItemText
                            primary={faq.question}
                            primaryTypographyProps={{
                                variant: 'body2',
                                sx: { color: 'text.primary' }
                            }}
                        />
                        <KeyboardArrowRight sx={{ color: 'text.secondary' }} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    )
}

export default FAQs 