import 'reflect-metadata'
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { User } from "@modules/users/entities/User";
import { ShowUserProfileError } from './ShowUserProfileError';

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepository: IUsersRepository;
let user: User;

describe("Show User Profile", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepository
    )

    user = await usersRepository.create({
      name: "User",
      email: "user@exemplo.com",
      password: await hash("user123", 8),
    });
  });


  it("should be able to show user profile", async () => {
    const userProfile = await showUserProfileUseCase.execute(user.id)

    expect(userProfile).toHaveProperty('id')
    expect(userProfile).toHaveProperty('email')
    expect(userProfile).toHaveProperty('name')
  });

  it("should not be able to show nonexists user profile", async () => {
    expect(async () => {
      const fakeUserId = uuidV4()
      await showUserProfileUseCase.execute(fakeUserId)
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });
});
