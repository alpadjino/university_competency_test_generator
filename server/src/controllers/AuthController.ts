import { Body, Controller, Post, Route, Tags, SuccessResponse } from "tsoa";
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRolesEnum } from "../models/enums/UserRoles";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  @Post("login")
  public async login(
    @Body() requestBody: { username: string, password: string }
  ): Promise<any> {
    const { username, password } = requestBody;

    try {
      const userData = await User.findOne({
        where: { username }
      });

      if (!userData) {
        this.setStatus(401);
        throw new Error("Неверный логин или пароль")
      }

      const user = userData.toJSON();

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        this.setStatus(401);
        throw new Error("Неверный логин или пароль");
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'super_secret_key',
        { expiresIn: '1h' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };

    } catch (error) {
      this.setStatus(500);
      throw new Error("Внутренняя ошибка сервера");
    }
  }

  @Post("register")
  public async register(
    @Body() requestBody: { username: string, password: string }
  ): Promise<any> {
    const { username, password } = requestBody;

    if (!username || !password) {
      this.setStatus(400);
      throw new Error("Имя пользователя и пароль обязательны");
    }

    try {
      const userExists = await User.findOne({
        where: { username },
      });

      if (userExists) {
        this.setStatus(409);
        throw new Error("Пользователь с таким именем уже существует");
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const role = typeof username === "string" && username.includes('admin') ?
        UserRolesEnum.ADMIN
        : UserRolesEnum.VIEWER

      const result = await User.create({
        username,
        password_hash: passwordHash,
        role,
      });

      const newUser = result;

      return {
        message: "Пользователь успешно зарегистрирован",
        user: newUser
      };

    } catch (error: any) {
      console.error('Registration error:', error);

      // Обработка специфической ошибки Postgres (уникальное ограничение), если не проверили ранее
      if (error.code === '23505') {
        this.setStatus(409);
        throw new Error("Имя пользователя уже занято");
      }

      this.setStatus(500);
      throw new Error("Внутренняя ошибка сервера");
    }
  }
};
