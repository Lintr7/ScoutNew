import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Label } from './ui/label';
import { Input } from './/ui/input';
import "../css sheets/global2.css"
import { GlowingEffect } from './ui/glowing-effect';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the intended destination or default to /stocks
  const from = location.state?.from?.pathname || '/stocks';

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${from}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(0,0,0)]">
  <div className="login-scale max-w-md w-full space-y-8">
    {/* Outer container with relative positioning for the glow effect */}
    <div className="relative h-full rounded-2xl border border-transparent p-px md:rounded-2xl md:p-px">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      {/* Inner container - your actual card content */}
      <div className="relative bg-[rgb(10,10,12)] py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border-0 border-purple-300">
        <div className="flex justify-center mb-5">
          <img style={{width: '3.5em'}} src='./logoScout.png' alt="Scout Logo" />
        </div>
        <h2 className="mt-3 text-center text-2xl font-extrabold text-white">
          Welcome Back
        </h2>
        <p style={{ fontWeight: 'bold', fontSize: '1rem', opacity: '0.6'}} className="mt-2 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">Sign in to Scout</p>
        <br/>
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600 text-red-400 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6" style={{}}>
          <div style={{marginBottom: '1em'}} className="space-y-2">
            <Label htmlFor="email">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[rgb(10,10,12)] text-zinc-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-zinc-600 rounded-md shadow-sm bg-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-purple-400 hover:text-purple-300 dark:text-purple-400 dark:hover:text-purple-300">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}