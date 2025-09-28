import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Plus, MessageCircle, Bot, User } from "lucide-react";

export const ChatAI = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");

  // Mock conversations list
  const conversations = [
    { id: 1, title: "Hỗ trợ học tập", lastMessage: "Tôi cần giúp với bài tập Toán", time: "10:30", unread: 2 },
    { id: 2, title: "Lập kế hoạch", lastMessage: "Làm thế nào để quản lý thời gian?", time: "09:15", unread: 0 },
    { id: 3, title: "Tư vấn môn học", lastMessage: "Môn nào nên học trước?", time: "Hôm qua", unread: 1 },
  ];

  // Mock messages for selected conversation
  const messages = [
    { id: 1, sender: "user", content: "Chào AI! Tôi cần giúp đỡ với bài tập Toán cao cấp", time: "10:25" },
    { id: 2, sender: "ai", content: "Xin chào! Tôi rất vui được hỗ trợ bạn. Bạn đang gặp khó khăn ở phần nào của Toán cao cấp?", time: "10:26" },
    { id: 3, sender: "user", content: "Tôi không hiểu về tích phân từng phần", time: "10:28" },
    { id: 4, sender: "ai", content: "Tích phân từng phần là một kỹ thuật quan trọng! Công thức cơ bản là: ∫u dv = uv - ∫v du. Bạn có thể cho tôi biết bài tập cụ thể không?", time: "10:30" },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message logic here
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Chat AI Assistant</h1>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Cuộc trò chuyện mới</span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Cuộc trò chuyện</span>
              </h3>
            </div>
            <div className="space-y-1">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                    selectedChat === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{conv.title}</h4>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <div className="mt-2">
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                        {conv.unread}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg p-3 ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};