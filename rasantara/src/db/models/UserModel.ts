import { database } from "../config/mongodb";
import * as z from "zod";
import { hashSync } from "bcryptjs";

const UserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" }),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters long" }),
  role: z.enum(["user", "admin"]).default("user"),
});

type newUser = {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
};

class UserModel {
  static collection() {
    return database.collection<newUser>("users");
  }

  static async create(newUser: newUser) {
    UserSchema.parse(newUser);
    const userExists = await this.collection().findOne({
      $or: [{ email: newUser.email }, { username: newUser.username }],
    });
    if (userExists) {
      throw {
        message: "User with this email or username already exists",
        status: 400,
      };
    }

    const hashedPassword = hashSync(newUser.password);
    newUser.password = hashedPassword;

    await this.collection().insertOne(newUser);
    return "User created successfully";
  }

  static async findByEmail(email: string) {
    const user = await this.collection().findOne({ email: email });
    return user;
  }
}

export default UserModel;
