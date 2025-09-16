import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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
          return;
        }
        // Mock sending code
        const code = '123456';
        setSentCode(code);
        setInfo('Mã xác minh đã được gửi tới email của bạn.');
        setForgotStep(2);
      } else if (forgotStep === 2) {
        if (!inputCode) {
          setError('Vui lòng nhập mã xác minh');
          return;
        }
        if (inputCode !== sentCode) {
          setError('Mã xác minh không đúng');
          return;
        }
        setForgotStep(3);
        setInfo('Mã xác minh hợp lệ. Vui lòng nhập mật khẩu mới.');
      } else if (forgotStep === 3) {
        if (!newPassword || !confirmNewPassword) {
          setError('Vui lòng nhập đầy đủ mật khẩu mới');
          return;
        }
        if (newPassword.length < 6) {
          setError('Mật khẩu mới phải có ít nhất 6 ký tự');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setError('Xác nhận mật khẩu không khớp');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin để truy cập vào tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isForgot ? (
            <>
              {info && (
                <Alert>
                  <AlertDescription>{info}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => { setIsForgot(true); setError(''); setInfo(''); }}
                      disabled={isLoading}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
                <Link to="/register" className="text-primary hover:underline">
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
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {info && (
                <Alert>
                  <AlertDescription>{info}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {forgotStep === 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="forgotEmail">Email</Label>
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}
                {forgotStep === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="code">Mã xác minh</Label>
                    <Input
                      id="code"
                      placeholder="Nhập mã 6 chữ số"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}
                {forgotStep === 3 && (
                  <>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
      </Card>
    </div>
  );
};

export default Login;
