import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import fetchApi from '../fetchApi';
import PublicNavbar from '../components/PublicNavbar';
import { Mail, Lock, User, ShieldQuestion, ArrowRight, CheckCircle2 } from 'lucide-react';

const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What is your favorite book?"
];

const AuthPage = () => {
  const [view, setView] = useState('login'); 
  const [forgotStep, setForgotStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: '' 
  });
  const [fetchedQuestion, setFetchedQuestion] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleForgotFlow = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (forgotStep === 1) {
        const data = await fetchApi('/auth/get-question', { method: 'POST', body: JSON.stringify({ email: formData.email }) });
        setFetchedQuestion(data.question);
        setForgotStep(2);
      } else if (forgotStep === 2) {
        const data = await fetchApi('/auth/verify-answer', { method: 'POST', body: JSON.stringify({ email: formData.email, answer: formData.securityAnswer }) });
        setResetToken(data.resetToken);
        setForgotStep(3);
      } else {
        const data = await fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify({ resetToken, newPassword: formData.password }) });
        login(data.user, data.token);
        navigate('/dashboard');
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAuthFlow = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
      const data = await fetchApi(endpoint, { method: 'POST', body: JSON.stringify(view === 'login' ? { email: formData.email, password: formData.password } : formData) });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors font-sans">
      <PublicNavbar />
      
      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          
          {/* Header Content */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              {view === 'login' ? <Lock size={24} /> : view === 'register' ? <User size={24} /> : <ShieldQuestion size={24} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {view === 'login' ? 'Welcome back' : view === 'register' ? 'Create an account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {view === 'login' ? 'Enter your credentials to access your workspace.' : view === 'register' ? 'Start managing projects like a pro today.' : 'Follow the steps to recover your access.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={view === 'forgot' ? handleForgotFlow : handleAuthFlow} className="space-y-4">
            {view !== 'forgot' && (
              <>
                {view === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input name="name" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Full Name" />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" name="email" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Email Address" />
                </div>

                {view === 'register' && (
                  <>
                    <div className="relative">
                      <ShieldQuestion className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select name="securityQuestion" onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                        {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input name="securityAnswer" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Security Answer (Keep it safe)" />
                    </div>
                  </>
                )}
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="password" name="password" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Password" />
                </div>
              </>
            )}

            {view === 'forgot' && (
              <>
                {forgotStep === 1 && (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="email" name="email" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter your registered email" />
                  </div>
                )}
                
                {forgotStep === 2 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Q: {fetchedQuestion}
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input name="securityAnswer" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Your Answer" />
                    </div>
                  </div>
                )}
                
                {forgotStep === 3 && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="password" name="password" onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter New Password" />
                  </div>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Continue')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center text-xs font-semibold">
            {view === 'login' ? (
              <div className="flex flex-col gap-3">
                <p className="text-gray-500 dark:text-gray-400">
                  Don't have an account? <button onClick={() => setView('register')} className="text-blue-600 hover:text-blue-700 hover:underline">Register now</button>
                </p>
                <button onClick={() => setView('forgot')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Forgot Password?</button>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Already have an account? <button onClick={() => { setView('login'); setForgotStep(1); }} className="text-blue-600 hover:text-blue-700 hover:underline">Sign in</button>
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AuthPage;