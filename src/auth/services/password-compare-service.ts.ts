import bcrypt from "bcryptjs";

export class PasswordCompareService {
  async comparePwd(supplyPassword: string, storedPassword: string) {
    const isValid = await bcrypt.compare(supplyPassword, storedPassword);
    return isValid;
  }
}
