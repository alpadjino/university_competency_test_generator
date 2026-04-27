import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/global-context/auth-context/useAuth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    register(username, password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Ошибка регистрации:", err);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input 
                id="username" 
                placeholder="Придумайте логин" 
                value={username}
                onChange={(e) => setUsername(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Зарегистрироваться
            </Button>
          </form>

          <div className="flex justify-center mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold" 
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
