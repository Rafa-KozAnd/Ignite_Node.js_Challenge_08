import 'reflect-metadata';
import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { User } from "@modules/users/entities/User";
import { hash } from "bcryptjs";
import { CreateUserError } from './CreateUserError';

let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;

describe("Create User", () => {

  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepository
    )
  });

  it("should be able to create a new User", async () => {
    const user = await createUserUseCase.execute({
      name: "User new",
      email: "user.new@exemplo.com",
      password: "userNew",
    });

    expect(user).toHaveProperty('id')
  });

  it("should not be able to create a new User with name email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User 1",
        email: "user@exemplo.com",
        password: "user123",
      });

      await createUserUseCase.execute({
        name: "User 1",
        email: "user@exemplo.com",
        password: "user123",
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  });
});
