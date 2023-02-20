import 'reflect-metadata'
import 'dotenv/config'
import { hash } from "bcryptjs";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { User } from "@modules/users/entities/User";
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase
let usersRepository: IUsersRepository;
let user: User;

describe("Authenticate User", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    )

    user = await usersRepository.create({
      name: "User Comun",
      email: "user@exemplo.com",
      password: await hash("user123", 8),
    })
  });

  it("should be able to authenticate an user", async () => {
    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: 'user123',
    })

    const { user: userAuth } = auth

    expect(auth).toHaveProperty('user')
    expect(auth).toHaveProperty('token')
    expect(userAuth.id).toBe(user.id)
    expect(userAuth.email).toBe(user.email)
  });

  it("should not be able to authenticate an nonexists user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'user.fake@exemplo.com',
        password: 'user123',
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it("should not be able to authenticate with incorrect password", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'fakePassword',
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });
});
