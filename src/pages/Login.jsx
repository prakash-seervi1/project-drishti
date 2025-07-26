import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logo from '../assets/ChatGPT_Image.png';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('https://gcp-crowd-agents-268678901849.us-central1.run.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: userId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || 'Login failed');
        setLoading(false);
        return;
      }
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('userid', data.userid);
      localStorage.setItem('accesscode', data.accesscode);
      // Redirect to home page
      navigate('/');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 3, textAlign: 'center', minWidth: 340, maxWidth: 380 }}>
        <Box className="flex flex-col items-center mb-4">
          <img src={logo} alt="Logo" className="logo mb-2" style={{ height: 56, width: 56 }} />
          <Typography variant="h5" component="h1" fontWeight={700} color="primary.main" gutterBottom>
            Project Drishti
          </Typography>
        </Box>
        <Typography variant="h6" component="h2" color="text.secondary" gutterBottom>
          Sign in to your account
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 1, mb: 1, fontSize: 15 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            label="User ID"
            type="text"
            fullWidth
            margin="normal"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
            required
            inputProps={{ 'aria-label': 'User ID' }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            inputProps={{ 'aria-label': 'Password' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box className="flex justify-end mt-1 mb-3">
            <Button size="small" color="primary" sx={{ textTransform: 'none' }} tabIndex={-1}>
              Forgot password?
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, py: 1.2, fontWeight: 600, fontSize: 17, borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}