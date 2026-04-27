import { Request, Response, NextFunction } from 'express';

const checkRole = (allowedRoles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // В реальном приложении мы достанем роль из расшифрованного JWT-токена
    // req.user приходит из middleware аутентификации
    const userRole = req.user?.role; 

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Доступ запрещен", 
        message: "У вашей роли недостаточно прав для этого действия" 
      });
    }
    next();
  };
};

export { checkRole };