import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, User } from "lucide-react";

export const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "Nguyễn Văn A",
    email: "nguyenvana@student.edu.vn",
    studentId: "SV001234",
    class: "CNTT-K65",
    major: "Công nghệ thông tin",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    year: "3"
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save profile logic here
    console.log("Saving profile:", profileData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Hồ sơ cá nhân</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Ảnh đại diện</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="text-2xl">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Đổi ảnh</span>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Mã sinh viên</Label>
                  <Input
                    id="studentId"
                    value={profileData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Lớp</Label>
                  <Input
                    id="class"
                    value={profileData.class}
                    onChange={(e) => handleInputChange("class", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Chuyên ngành</Label>
                  <Select 
                    value={profileData.major} 
                    onValueChange={(value) => handleInputChange("major", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Công nghệ thông tin">Công nghệ thông tin</SelectItem>
                      <SelectItem value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</SelectItem>
                      <SelectItem value="Khoa học máy tính">Khoa học máy tính</SelectItem>
                      <SelectItem value="Hệ thống thông tin">Hệ thống thông tin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Năm học</Label>
                  <Select 
                    value={profileData.year} 
                    onValueChange={(value) => handleInputChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Năm 1</SelectItem>
                      <SelectItem value="2">Năm 2</SelectItem>
                      <SelectItem value="3">Năm 3</SelectItem>
                      <SelectItem value="4">Năm 4</SelectItem>
                      <SelectItem value="5">Năm 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Hủy</Button>
                <Button onClick={handleSave} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Lưu thay đổi</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};