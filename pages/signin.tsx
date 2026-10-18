import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  loginSchema,
  type LoginInput,
  type SignupInput,
} from "../utils/schemas";
import { errorMessage, useLogin, useMe, useSignup } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { FieldError, Input, Label } from "../components/ui/Field";
import { cn } from "../utils/cn";

export default function SignIn() {
  const [showSignup, setShowSignup] = useState(true);
  const router = useRouter();
  const { user } = useMe();
  const signupMutation = useSignup();
  const loginMutation = useLogin();
  const errorSignup = signupMutation.isError
    ? errorMessage(signupMutation.error)
    : "";
  const errorLogin = loginMutation.isError
    ? errorMessage(loginMutation.error)
    : "";

  // also runs right after a successful login or signup
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const signup = (data: SignupInput) => signupMutation.mutate(data);

  // called without data by the test account button
  const login = (data?: LoginInput) => loginMutation.mutate(data);

  return (
    <Container size="sm" className="flex flex-col py-10">
      <h2 className="self-start text-3xl font-semibold">Welcome</h2>
      <Card className="mt-3 overflow-hidden shadow-md">
        <div className={cn("p-4", !showSignup && "bg-muted")}>
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="authMode"
              aria-label="Create account"
              onChange={() => setShowSignup(true)}
              checked={showSignup}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <h3 className="text-sm font-bold">
              Create account.
              <span className="text-xs font-bold"> New here?</span>
            </h3>
          </div>
          <div className={showSignup ? "" : "hidden"}>
            <form
              className="mt-3 flex flex-col gap-3"
              id="signup"
              aria-label="Create account"
              onSubmit={handleSubmit(signup)}
            >
              <FieldError message={errorSignup} />
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">First and last name</Label>
                <Input
                  type="text"
                  id="name"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                <FieldError message={errors.password?.message} />
              </div>
              <Button type="submit" form="signup" size="lg" className="mt-2">
                Continue
              </Button>
            </form>
          </div>
        </div>
        <div
          className={cn("border-t border-border p-4", showSignup && "bg-muted")}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="authMode"
              aria-label="Sign in"
              onChange={() => setShowSignup(false)}
              checked={!showSignup}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <h3 className="text-sm font-bold">
              Sign-In.
              <span className="text-xs font-bold"> Already a customer?</span>
            </h3>
          </div>
          <div className={showSignup ? "hidden" : ""}>
            <form
              className="mt-3 flex flex-col gap-3"
              aria-label="Sign in"
              onSubmit={handleSubmitLogin(login)}
            >
              <FieldError message={errorLogin} />
              <div className="flex flex-col gap-1">
                <Label htmlFor="emailLogin">Email</Label>
                <Input
                  type="email"
                  id="emailLogin"
                  aria-invalid={Boolean(errorsLogin.emailLogin)}
                  {...registerLogin("emailLogin")}
                />
                <FieldError message={errorsLogin.emailLogin?.message} />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="passwordLogin">Password</Label>
                <Input
                  type="password"
                  id="passwordLogin"
                  aria-invalid={Boolean(errorsLogin.passwordLogin)}
                  {...registerLogin("passwordLogin")}
                />
                <FieldError message={errorsLogin.passwordLogin?.message} />
              </div>
              <Button type="submit" size="lg" className="mt-2">
                Continue
              </Button>
            </form>
          </div>
        </div>
      </Card>
      <div className="mt-7.5 flex flex-col items-center gap-2">
        <p className="w-25 border-b border-border text-center leading-[0.1em]">
          <span className="bg-background p-2">or</span>
        </p>
        <Button size="lg" className="mt-5" onClick={() => login()}>
          Login with test account
        </Button>
      </div>
    </Container>
  );
}
