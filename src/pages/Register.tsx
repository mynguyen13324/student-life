import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  User,
  Mail,
  BookOpen,
  University,
  Lock
} from 'lucide-react';

const Register = () => {
  // thêm useEffect để chèn favicon vào head khi component mount
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'public/graduation-cap.svg';
    link.type = 'image/png';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    major: '',
    year: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) errors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
    if (formData.password.length < 6) errors.password = 'Mật khẩu phải >= 6 ký tự';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!formData.university.trim()) errors.university = 'Vui lòng nhập trường đại học';
    if (!formData.major.trim()) errors.major = 'Vui lòng nhập chuyên ngành';
    if (!/^[1-8]$/.test(formData.year)) errors.year = 'Chọn năm học hợp lệ (1–5)';

    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError('Vui lòng sửa các trường có màu đỏ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Gửi object; điều chỉnh theo signature của register trong AuthContext nếu cần
      const ok = await register(formData.name, formData.email, formData.password);
      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Đăng ký thất bại — vui lòng thử lại');
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
        <Card className="w-full max-w-md shadow-2xl rounded-2xl">
          <CardContent className="pt-8 pb-10">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold text-green-700">Đăng ký thành công!</h2>
              <p className="text-sm text-muted-foreground">Bạn sẽ được chuyển hướng về trang chủ trong giây lát.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconInput = (props: {
    id: string;
    name: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: any) => void;
    disabled?: boolean;
    children?: React.ReactNode;
  }) => (
    <div>
      <div className={`relative flex items-center rounded-md ${fieldErrors[props.name] ? 'ring-1 ring-red-300' : ''}`}>
        <div className="absolute left-3 pointer-events-none"><span className="opacity-80">{props.children}</span></div>
        <Input
          id={props.id}
          name={props.name}
          type={props.type ?? 'text'}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          className="pl-10 w-full"
          disabled={props.disabled}
        />
      </div>
      {fieldErrors[props.name] && <p className="mt-1 text-sm text-red-600">{fieldErrors[props.name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
      <Card className="w-full max-w-3xl shadow-xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - branding: đổi thành StudentLife với icon (xanh lá) */}
          <div className="hidden md:flex flex-col items-start justify-center p-10 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white space-y-6">
            <div className="flex items-center gap-3">
              {/* Hiển thị ảnh icon (nếu bạn có file public/graduation-cap.svg) */}
              <img src="/graduation-cap.svg" alt="graduation cap" className="h-10 w-10" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <h1 className="text-3xl font-extrabold">StudentLife</h1>
            </div>
            <p className="text-sm opacity-90 max-w-xs">
              Tạo tài khoản để truy cập đầy đủ tính năng. Điền thông tin sinh viên để cá nhân hóa trải nghiệm.
            </p>
            <div className="mt-3 px-4 py-2 bg-white/10 rounded-md text-sm">An toàn • Nhanh • Dễ dùng</div>
          </div>

          {/* Right - form */}
          <CardContent className="p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold">Đăng ký</CardTitle>
              <CardDescription>Nhập thông tin cơ bản để tạo tài khoản</CardDescription>
            </CardHeader>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div  className="sm:col-span-2">
                  <Label htmlFor="name" className="sr-only">Họ và tên</Label>
                  <IconInput
                    id="name"
                    name="name"
                    placeholder="Học và tên"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <User className="h-4 w-4" />
                  </IconInput>
                </div>

                <div  className="sm:col-span-2">
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <IconInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <Mail className="h-4 w-4" />
                  </IconInput>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="university" className="sr-only">Trường</Label>
                  <IconInput
                    id="university"
                    name="university"
                    placeholder="Trường đại học hiện tại"
                    value={formData.university}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <University className="h-4 w-4" />
                  </IconInput>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="major" className="sr-only">Chuyên ngành</Label>
                  <IconInput
                    id="major"
                    name="major"
                    placeholder="Ngành học hiện tại"
                    value={formData.major}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <BookOpen className="h-4 w-4" />
                  </IconInput>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="year">Sinh viên năm mấy</Label>
                  <div className={`relative ${fieldErrors.year ? 'ring-1 ring-red-300 rounded-md' : ''}`}>
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md px-3"
                      disabled={isLoading}
                    >
                      <option value="">Chọn năm</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                 
                    </select>
                  </div>
                  {fieldErrors.year && <p className="mt-1 text-sm text-red-600">{fieldErrors.year}</p>}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="password" className="sr-only">Mật khẩu</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Lock className="h-4 w-4 opacity-80" /></div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu (≥6 ký tự)"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
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
                  {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="sr-only">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Lock className="h-4 w-4 opacity-80" /></div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Đã có tài khoản? </span>
              <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default Register;
