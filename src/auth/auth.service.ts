import { PasswordCompareService } from "./services/password-compare-service.ts";
import { AuthenticationService } from "@shoppingapp/common";
import { AuthDto } from "./dtos/auth.dto";
import { UserService, userService } from "./user/user.service";

export class AuthService {
  constructor(
    public userService: UserService,
    public passwordCompareService: PasswordCompareService,
    public authenticationService: AuthenticationService
  ) {}
  async signup(createUserDto: AuthDto) {
    const existingUser = await this.userService.findOnebyEmail(
      createUserDto.email
    );
    if (existingUser) {
      return { message: "email is taken" };
    }
    const newUser = await this.userService.create(createUserDto);

    const jwt = this.authenticationService.generateJwt(
      {
        email: createUserDto.email,
        userId: newUser.id,
      },
      process.env.JWT_KEY!
    );
    return { jwt };
  }

  async signin(signinDto: AuthDto) {
    const user = await this.userService.findOnebyEmail(signinDto.email);
    if (!user) {
      return { message: "Invalid credentials" };
    }
    const samePwd = await this.passwordCompareService.comparePwd(
      signinDto.password,
      user.password
    );
    if (!samePwd) {
      return { message: "Invalid credentials" };
    }
    const jwt = this.authenticationService.generateJwt(
      {
        email: user.email,
        userId: user.id,
      },
      process.env.JWT_KEY!
    );
    return { jwt };
  }
}

export const authService = new AuthService(
  userService,
  new PasswordCompareService(),
  new AuthenticationService()
);
