import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast'; 

const backgroundTags = [
  { text: "Update project documentation", border: "border-dotted" },
  { text: "Debug a mysterious bug", border: "border-dashed" },
  { text: "Write unit tests", border: "border-dotted" },
  { text: "Solve a random coding challenge", border: "border-dashed" },
  { text: "Optimize a slow-running function", border: "border-dotted" },
  { text: "Automate a repetitive personal or team task", border: "border-dashed" },
  { text: "Explore and integrate a new library or tool", border: "border-dotted" },
  { text: "Learn, Explore, Analyze", border: "border-dashed" },
  { text: "Create a login page", border: "border-dotted" },
  { text: "Filter the database clearly", border: "border-dashed" },
  { text: "Check security updates", border: "border-dotted" },
];

function Login() {
  const { login, register, user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [positions, setPositions] = useState<Array<{ top: string; left: string }>>([]);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [systemRole, setSystemRole] = useState("Employee");

  const [isResetting, setIsResetting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');


  const formatUsernameForUrl = (displayName: string | null) => {
    return displayName ? displayName.replace(/\s+/g, '') : 'dashboard';
  };

  useEffect(() => {
    if (user) {
      const urlName = formatUsernameForUrl(user.name);
      navigate(`/${urlName}`);
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Logging in...'); 

    try {
      await login({ email, password });
      toast.success('Welcome back!', { id: toastId }); 
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password.", { id: toastId }); 
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Creating account...');

    try {
      await register({
        name,
        email,
        password,
        systemRole: systemRole
      });
      toast.success('Account created successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Registration failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending OTP...');

    try {
      await api.forgotPassword(email);
      setOtpSent(true); 
      toast.success("OTP sent to your email!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if(!otp || !newPassword) {
        toast.error("Please fill in all fields");
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Updating password...');

    try {
      await api.resetPassword({ email, otp, newPassword });
      toast.success("Password reset successful! Please login.", { id: toastId });
      
      setIsResetting(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || "Reset failed. Invalid OTP.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const availableSlots = useMemo(() => {
    const slots = [];
    const rows = 6;
    const cols = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isCenterRow = r >= 1 && r <= 4;
        const isCenterCol = c >= 1 && c <= 2;
        if (!(isCenterRow && isCenterCol)) slots.push({ row: r, col: c });
      }
    }
    return slots;
  }, []);

  const shuffleArray = (array: typeof availableSlots) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generatePositions = () => {
    const shuffledSlots = shuffleArray(availableSlots);
    return backgroundTags.map((_, index) => {
      const slot = shuffledSlots[index];
      if (!slot) return { top: '50%', left: '50%' };
      const baseTop = (slot.row / 6) * 100; 
      const baseLeft = (slot.col / 4) * 100;
      const jitterTop = Math.random() * 10;
      const jitterLeft = Math.random() * 10;
      return { top: `${baseTop + jitterTop}%`, left: `${baseLeft + jitterLeft}%` };
    });
  };

  useEffect(() => {
    setPositions(generatePositions());
    const interval = setInterval(() => {
      setPositions(generatePositions());
    }, 5000);
    return () => clearInterval(interval);
  }, [availableSlots]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-black/80 relative overflow-hidden">
        {backgroundTags.map((tag, index) => (
          <div
            key={index}
            className={`absolute bg-white/40 px-5 py-2 border border-white/60 ${tag.border} 
            transition-all duration-[2000ms] ease-in-out pointer-events-none z-0`}
            style={{
              top: positions[index]?.top || '50%',
              left: positions[index]?.left || '50%',
            }}
          >
            {tag.text}
          </div>
        ))}
        
        <div className="w-96 h-[600px] [perspective:1000px] z-10">
          
          <div 
            className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          >

            <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-white p-8 rounded-lg shadow-white/30 shadow-xl [backface-visibility:hidden]">
              
              {isResetting ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

                  {!otpSent ? (
                    <form onSubmit={handlePasswordResetRequest} className="space-y-4 w-full">
                      <p className="text-gray-600 text-sm text-center">Enter your email to receive a One-Time Password (OTP).</p>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                        <input 
                          type="email" 
                          required 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Enter your email" 
                        />
                      </div>
                      <button type="submit" disabled={loading} className="w-full text-lg font-bold bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
                        {loading ? 'Sending...' : 'Get OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleFinalReset} className="space-y-4 w-full">
                      <p className="text-gray-600 text-xs text-center">Enter the code sent to <b>{email}</b></p>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">OTP Code</label>
                        <input 
                          type="text" 
                          required 
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value)} 
                          className="w-full px-3 py-2 border rounded-lg text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-green-500" 
                          placeholder="123456" 
                          maxLength={6} 
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">New Password</label>
                        <input 
                          type="password" 
                          required 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                          placeholder="New secure password" 
                        />
                      </div>
                      <button type="submit" disabled={loading} className="w-full text-lg font-bold bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors">
                        {loading ? 'Processing...' : 'Change Password'}
                      </button>
                    </form>
                  )}

                  <div className="flex justify-center mt-6">
                    <button 
                      type="button" 
                      onClick={() => { setIsResetting(false); setOtpSent(false); }} 
                      className="text-gray-500 cursor-pointer font-bold hover:text-gray-800 text-sm"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                  
                  <div className="w-full mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-1">Login As</label>
                      <select 
                        value={systemRole} 
                        onChange={(e) => setSystemRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                      >
                          <option value="Employee">Employee</option>
                          <option value="Admin">Admin / CEO</option>
                      </select>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4 w-full">
                    <div>
                      <label className="block text-gray-700">Email</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter your email" />
                    </div>
                    <div>
                      <label className="block text-gray-700">Password</label>
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter your password" />
                    </div>
                    
                    <div className="flex gap-x-2 justify-end text-sm">
                      <span>Forgot Password?</span>
                      <button 
                        type="button" 
                        onClick={() => { setIsResetting(true); }} 
                        className="text-red-500 cursor-pointer hover:underline font-medium"
                      >
                        Reset Here
                      </button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full text-lg font-bold transition-colours duration-300 ease-in-out bg-blue-500 text-white py-2 rounded-lg cursor-pointer hover:bg-blue-600">
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                    
                    <div className="text-center text-gray-400 text-sm">------------------- Login with -------------------</div>
                    
                    <div className="flex gap-x-2 justify-center text-sm mt-4">
                      <span>Don't have an Account?</span>
                      <button type="button" onClick={() => { setIsFlipped(true); }} className="text-red-500 cursor-pointer font-bold hover:underline">Sign Up</button>
                    </div>
                  </form>
                </>
              )}
            </div>

            <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-white p-8 rounded-lg shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
              <div className="w-full mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-1">Role</label>
                  <select 
                    value={systemRole} 
                    onChange={(e) => setSystemRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                  >
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin / CEO</option>
                  </select>
              </div>
              <form onSubmit={handleSignup} className="space-y-4 w-full">
                <div>
                  <label className="block text-gray-700">Username</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Create a username" />
                </div>
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-gray-700">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Create a password" />
                </div>
                <button type="submit" disabled={loading} className="w-full text-lg font-bold transition-colours duration-300 ease-in-out bg-green-500 text-white py-2 rounded-lg cursor-pointer hover:bg-green-600 mt-6">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <div className="text-center text-gray-400 text-sm">------------------- Or -------------------</div>
                <div className="flex gap-x-2 justify-center text-sm mt-4">
                  <span>Already have an account?</span>
                  <button type="button" onClick={() => { setIsFlipped(false); }} className="text-blue-500 cursor-pointer font-bold hover:underline">Login</button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Login;