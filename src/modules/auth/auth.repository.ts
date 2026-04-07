type UserRecord = {
  id: string;
  email: string;
};

class AuthRepository {
  async findByEmail(_email: string): Promise<UserRecord | null> {
    return null;
  }

  async createUser(input: { email: string; password: string }): Promise<UserRecord> {
    return {
      id: crypto.randomUUID(),
      email: input.email
    };
  }
}

export const authRepository = new AuthRepository();
