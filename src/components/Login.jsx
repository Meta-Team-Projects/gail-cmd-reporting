import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  KeyboardArrowDownRounded,
  LockOutlined,
  PersonOutlineRounded,
  SecurityOutlined,
  StorageRounded,
  VerifiedUserOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
  Grading,
  ShieldMoonOutlined,
  PeopleAltOutlined,
} from '@mui/icons-material';
import background from '../assets/background.jpeg';

const featureItems = [
  { icon: <ShieldMoonOutlined sx={{ fontSize: '2.0833vw' }} />, label: 'AI-Assisted Reporting' },
  { icon: <StorageRounded sx={{ fontSize: '2.0833vw' }} />, label: 'Multi-Source Data' },
  { icon: <Grading sx={{ fontSize: '2.0833vw' }} />, label: 'Intelligent Visualization' },
  { icon: <LockOutlined sx={{ fontSize: '2.0833vw' }} />, label: 'Traceability & Visibility' },
];

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: '6vh',
    borderRadius: '0.8vw',
    backgroundColor: '#ffffff',
    fontSize: '0.9vw',
    color: '#152238',
    '& fieldset': {
      borderColor: '#d9e3ef',
    },
    '&:hover fieldset': {
      borderColor: '#9fb5cf',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1e4a89',
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#6b7a90',
    fontSize: '0.9vw',
    '&.Mui-focused': {
      color: '#1e4a89',
    },
  },
};

const roleMenuProps = {
  PaperProps: {
    sx: {
      mt: '0.8vh',
      borderRadius: '1vw',
      minWidth: '16vw',
      overflow: 'hidden',
      border: '0.08vw solid rgba(37, 63, 102, 0.3)',
      background: 'linear-gradient(180deg, rgba(19, 40, 71, 0.98) 0%, rgba(14, 30, 53, 0.98) 100%)',
      boxShadow: '0 1.8vh 3.6vh rgba(4, 17, 34, 0.35)',
      backdropFilter: 'blur(0.5vw)',
      '& .MuiList-root': {
        py: '0.6vh',
      },
      '& .MuiMenuItem-root': {
        minHeight: '5.2vh',
        fontSize: '0.92vw',
        color: 'rgba(244, 248, 255, 0.96)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(48, 89, 148, 0.42)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(57, 104, 173, 0.55)',
          color: '#ffffff',
        },
        '&.Mui-selected:hover': {
          backgroundColor: 'rgba(69, 119, 193, 0.68)',
        },
      },
    },
  },
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '1.5vw',
        py: '2vh',
        position: 'relative',
        overflow: 'hidden',
        //backgroundImage: `linear-gradient(135deg, rgba(7, 27, 52, 0.82), rgba(8, 23, 48, 0.46)), url(${background})`,
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '98vw',
          minHeight: '94vh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 0.86fr' },
          borderRadius: '1.5vw',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.16)',
          //boxShadow: '0 30px 80px rgba(0, 0, 0, 0.32)',
          backdropFilter: 'blur(1px)',
          background: 'linear-gradient(180deg, rgba(6, 29, 56, 0.52) 0%, rgba(6, 24, 46, 0.68) 100%)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: '4vw',
            minHeight: '92vh',
            color: '#f7fbff',
            //background: 'linear-gradient(90deg, rgba(9, 28, 53, 0.82) 0%, rgba(9, 28, 53, 0.48) 55%, rgba(9, 28, 53, 0.14) 100%)',
          }}
        >
          <Box sx={{ maxWidth: '36vw' }}>
            <Box component="img"
              src="/gail_logo_new.png" alt="Logo"
              sx={{height: '5.729vw'}} 
            />

            <Typography
              sx={{
                fontSize: '4.1vw',
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#ffd13d',
              }}
            >
              GAIL
            </Typography>
            <Typography
              sx={{
                fontSize: '3.2vw',
                fontWeight: 500,
                lineHeight: 1.02,
              }}
            >
              CMD Reporting
            </Typography>

            <Box sx={{ display: 'flex', mt: '3vh', mb: '3vh', maxWidth: '21vw' }}>
              <Box sx={{ flex: 1.4, height: '0.5vh', borderRadius: '2vw 0vw 0vw 2vw', backgroundColor: '#f59e0b' }} />
              <Box sx={{ flex: 1, height: '0.5vh', backgroundColor: '#f8fafc' }} />
              <Box sx={{ flex: 1.4, height: '0.5vh', borderRadius: '0vw 2vw 2vw 0vw', backgroundColor: '#17a34a' }} />
            </Box>

            {/* <Typography sx={{ fontSize: '1.25vw', fontWeight: 600 }}>
              Ministry of Petroleum & Natural Gas
            </Typography>
            <Typography sx={{ mt: '0.6vh', fontSize: '1.2vw', color: 'rgba(255,255,255,0.82)' }}>
              Government of India
            </Typography> */}
            
            {/* <Box sx={{mt: '2vh', height: '0.1vh', maxWidth: '26vw', backgroundColor: '#868582'}} /> */}

            <Typography
              sx={{
                mt: '3vh',
                //maxWidth: '25.5vw',
                fontSize: '1.15vw',
                lineHeight: 1.8,
                color: 'rgba(245, 249, 255, 0.86)',
              }}
            >
              Secure AI platform for updating and generating CMD reports.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
              gap: '0.4167vw',
              mt: '4vh',
              maxWidth: '46vw',
            }}
          >
            {featureItems.map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: '1vw',
                  minHeight: '12vh',
                  borderRadius: '1vw',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: 'rgba(9, 28, 53, 0.2)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ color: '#f0c44e' }}>{item.icon}</Box>
                <Typography sx={{ maxWidth: '7vw', textAlign: 'center', fontSize: '0.9vw', lineHeight: 1.45, color: 'rgba(255,255,255,0.9)' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: '4vw',
            background: { xs: 'rgba(255,255,255,0.92)', lg: 'transparent' }
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '26vw',
              height: 'fit-content',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: '1.6vw',
              px: '2.2vw',
              py: '4vh',
              backgroundColor: '#ffffff',
              boxShadow: '0 26px 60px rgba(14, 31, 53, 0.2)'
            }}
          >
            <Typography sx={{ fontSize: '2.4vw', fontWeight: 800, color: '#12233d' }}>
              Sign In
            </Typography>
            <Typography sx={{ mt: '0.8vh', color: '#7a879a', fontSize: '0.95vw' }}>
              Authorized access only
            </Typography>

            <Box sx={{ mt: '4vh', display: 'grid', gap: '2.2vh' }}>
              <Box>
                <Typography sx={{ mb: '0.8vh', fontSize: '0.72vw', fontWeight: 800, color: '#27364a' }}>
                  USERNAME / OFFICIAL EMAIL
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Username / Official Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  sx={fieldStyles}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineRounded sx={{ color: '#a3b1c2' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ mb: '0.8vh', fontSize: '0.72vw', fontWeight: 800, color: '#27364a' }}>
                  PASSWORD
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  sx={fieldStyles}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: '#a3b1c2' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box
                            component="button"
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            sx={{
                              border: 0,
                              background: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#a3b1c2',
                              p: 0,
                            }}
                          >
                            {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                          </Box>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* <Box>
                <Typography sx={{ mb: '0.8vh', fontSize: '0.72vw', fontWeight: 800, color: '#27364a' }}>
                  ROLE
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Select Role"
                  sx={fieldStyles}
                  slotProps={{
                    select: {
                      displayEmpty: true,
                      IconComponent: KeyboardArrowDownRounded,
                      MenuProps: roleMenuProps,
                      renderValue: (selected) =>
                        selected || <Box component="span" sx={{ color: '#8fa0b3' }}>Select Role</Box>,
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleAltOutlined sx={{ color: '#a3b1c2' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Nodal Officer">Nodal Officer</MenuItem>
                  <MenuItem value="Division User">Division User</MenuItem>
                  <MenuItem value="Reviewer">Reviewer</MenuItem>
                </TextField>
              </Box> */}
            </Box>

            <Typography
              sx={{
                mt: '2.5vh',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6vw',
                color: '#7e8b9e',
                fontSize: '0.78vw',
                lineHeight: 1.5,
              }}
            >
              <SecurityOutlined sx={{ fontSize: '0.9375vw', color: '#8fc4a0' }} />
              Use your GAIL network credentials to access the system.
            </Typography>

            <Button
              variant="contained"
              onClick={onLogin}
              fullWidth
              sx={{
                mt: '3vh',
                height: '6vh',
                borderRadius: '0.7vw',
                background: 'linear-gradient(180deg, #234d89 0%, #1a427b 100%)',
                color: '#ffffff',
                fontSize: '1.2vw',
                fontWeight: 700,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  background: 'linear-gradient(180deg, #1e457d 0%, #143867 100%)',
                },
              }}
            >
              Login
            </Button>

            <Box sx={{ mt: '3vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8333vw', color: '#93a1b2' }}>
              <SecurityOutlined sx={{ fontSize: '0.9375vw' }} />
              <Typography sx={{ fontSize: '0.78vw' }}>Secure. Compliant. Trusted.</Typography>
              <Divider orientation="vertical" flexItem sx={{ borderColor: '#e5ecf3' }} />
              <Typography sx={{ fontSize: '0.9vw', fontWeight: 800, color: '#3d8b5a' }}>GAIL</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
