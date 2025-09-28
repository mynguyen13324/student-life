import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Forgot password flow
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [info, setInfo] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);

    try {
      if (forgotStep === 1) {
        if (!forgotEmail) {
          setError('Vui lòng nhập email');
          setIsLoading(false);
          return;
        }
        // Mock sending code (replace with real API)
        const code = '123456';
        setSentCode(code);
        setInfo('Mã xác minh đã được gửi tới email của bạn.');
        setForgotStep(2);
      } else if (forgotStep === 2) {
        if (!inputCode) {
          setError('Vui lòng nhập mã xác minh');
          setIsLoading(false);
          return;
        }
        if (inputCode !== sentCode) {
          setError('Mã xác minh không đúng');
          setIsLoading(false);
          return;
        }
        setForgotStep(3);
        setInfo('Mã xác minh hợp lệ. Vui lòng nhập mật khẩu mới.');
      } else if (forgotStep === 3) {
        if (!newPassword || !confirmNewPassword) {
          setError('Vui lòng nhập đầy đủ mật khẩu mới');
          setIsLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          setError('Mật khẩu mới phải có ít nhất 6 ký tự');
          setIsLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setError('Xác nhận mật khẩu không khớp');
          setIsLoading(false);
          return;
        }
        // Mock reset done
        setInfo('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
        // reset flow and go back to login form
        setIsForgot(false);
        setForgotStep(1);
        setForgotEmail('');
        setSentCode('');
        setInputCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // small helper to render input with icon
  const IconInput = (props: {
    id: string;
    label?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (val: string) => void;
    icon: React.ReactNode;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }) => (
    <div>
      {props.label && <Label htmlFor={props.id}>{props.label}</Label>}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
          {props.icon}
        </div>
        <Input
          id={props.id}
          type={props.type ?? 'text'}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="pl-10"
          {...props.inputProps}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left branding */}
          <div className="hidden md:flex flex-col items-start justify-center p-10 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white space-y-6">
            <div className="flex items-center gap-3">
              <img src="/graduation-cap.svg" alt="graduation cap" className="h-10 w-10" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <h1 className="text-3xl font-extrabold">StudentLife</h1>
            </div>
            <p className="text-sm opacity-90 max-w-xs">
              Chào mừng trở lại — Đăng nhập để tiếp tục trải nghiệm dành cho sinh viên.
            </p>
           
          </div>

          {/* Right - form */}
          <CardContent className="p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold">Đăng nhập</CardTitle>
              <CardDescription>Nhập thông tin để truy cập vào tài khoản của bạn</CardDescription>
            </CardHeader>

            {!isForgot ? (
              <>
                {info && (
                  <Alert className="mb-4">
                    <AlertDescription>{info}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <IconInput
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={setEmail}
                    icon={<Mail className="h-4 w-4" />}
                    inputProps={{ required: true, disabled: isLoading }}
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <button
                        type="button"
                        className="text-xs text-emerald-700 hover:underline"
                        onClick={() => { setIsForgot(true); setError(''); setInfo(''); }}
                        disabled={isLoading}
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(prev => !prev)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Chưa có tài khoản? </span>
                  <Link to="/register" className="text-emerald-700 hover:underline">
                    Đăng ký ngay
                  </Link>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong>Demo account:</strong><br />
                    Email: admin@example.com<br />
                    Password: password
                  </p>
                </div>
              </>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {info && (
                  <Alert className="mb-4">
                    <AlertDescription>{info}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {forgotStep === 1 && (
                    <IconInput
                      id="forgotEmail"
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={setForgotEmail}
                      icon={<Mail className="h-4 w-4" />}
                      inputProps={{ required: true, disabled: isLoading }}
                    />
                  )}

                  {forgotStep === 2 && (
                    <IconInput
                      id="code"
                      label="Mã xác minh"
                      placeholder="Nhập mã 6 chữ số"
                      value={inputCode}
                      onChange={setInputCode}
                      icon={<User className="h-4 w-4" />}
                      inputProps={{ disabled: isLoading }}
                    />
                  )}

                  {forgotStep === 3 && (
                    <>
                      <div>
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Nhập mật khẩu mới"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          placeholder="Nhập lại mật khẩu mới"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:underline"
                      onClick={() => { setIsForgot(false); setForgotStep(1); setError(''); setInfo(''); }}
                      disabled={isLoading}
                    >
                      Quay lại đăng nhập
                    </button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : forgotStep === 1 ? 'Gửi mã' : forgotStep === 2 ? 'Xác nhận mã' : 'Đặt lại mật khẩu'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default Login;
