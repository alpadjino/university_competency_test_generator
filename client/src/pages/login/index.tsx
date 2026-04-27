import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/global-context/auth-context/useAuth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    login(username, password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        toast.error('Неверный логин или пароль', {
          position: 'top-center'
        });
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input id="username" placeholder="admin_god" onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Войти</Button>
          </form>

          <div className="flex justify-center mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold" 
                onClick={() => navigate('/register')}
              >
                Создать аккаунт
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
