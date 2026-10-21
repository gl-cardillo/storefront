import { useState, useEffect, type KeyboardEvent } from "react";
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
import { toast } from "../utils/toast";

type Mode = "login" | "signup";

const TABS: { mode: Mode; label: string; title: string }[] = [
  { mode: "login", label: "Sign in", title: "Welcome back" },
  { mode: "signup", label: "Create account", title: "Create your account" },
];

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("login");
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

  const signup = (data: SignupInput) =>
    signupMutation.mutate(data, {
      onSuccess: () => toast("Account created, welcome!"),
    });

  // called without data by the test account button
  const login = (data?: LoginInput) =>
    loginMutation.mutate(data, { onSuccess: () => toast("Signed in") });
  // the demo button and the form share one mutation, only spin the one clicked
  const loggingIn = loginMutation.isPending;
  const demoPending = loggingIn && loginMutation.variables === undefined;

  // arrow keys move between the two tabs, as the tabs pattern expects
  const handleTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = mode === "login" ? "signup" : "login";
    setMode(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const title = TABS.find((tab) => tab.mode === mode)!.title;

  return (
    <Container size="sm" className="py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Card className="mt-6 p-6">
        <div
          role="tablist"
          aria-label="Account"
          className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1"
        >
          {TABS.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              role="tab"
              id={`tab-${tab.mode}`}
              aria-selected={mode === tab.mode}
              aria-controls={`panel-${tab.mode}`}
              tabIndex={mode === tab.mode ? 0 : -1}
              onClick={() => setMode(tab.mode)}
              onKeyDown={handleTabKey}
              className={cn(
                "rounded px-3 py-2 text-sm font-medium transition-colors",
                mode === tab.mode
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* both panels stay mounted, so switching tabs keeps what was typed */}
        <div
          role="tabpanel"
          id="panel-login"
          aria-labelledby="tab-login"
          hidden={mode !== "login"}
        >
          <form
            className="mt-6 flex flex-col gap-4"
            aria-label="Sign in"
            onSubmit={handleSubmitLogin(login)}
          >
            <FieldError message={errorLogin} />
            <div className="flex flex-col gap-1">
              <Label htmlFor="emailLogin">Email</Label>
              <Input
                type="email"
                id="emailLogin"
                autoComplete="email"
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
                autoComplete="current-password"
                aria-invalid={Boolean(errorsLogin.passwordLogin)}
                {...registerLogin("passwordLogin")}
              />
              <FieldError message={errorsLogin.passwordLogin?.message} />
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-2"
              loading={loggingIn && !demoPending}
            >
              Sign in
            </Button>
          </form>
        </div>
        <div
          role="tabpanel"
          id="panel-signup"
          aria-labelledby="tab-signup"
          hidden={mode !== "signup"}
        >
          <form
            className="mt-6 flex flex-col gap-4"
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
                autoComplete="name"
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
                autoComplete="email"
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
                autoComplete="new-password"
                aria-describedby="password-hint"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <p id="password-hint" className="text-xs text-muted-foreground">
                8 to 15 characters, with a letter, a number and one of @$!%*#?
              </p>
              <FieldError message={errors.password?.message} />
            </div>
            <Button
              type="submit"
              form="signup"
              size="lg"
              className="mt-2"
              loading={signupMutation.isPending}
            >
              Create account
            </Button>
          </form>
        </div>
      </Card>
      <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <h2 className="font-semibold">Just looking around?</h2>
        <p className="text-sm text-muted-foreground">
          Explore the store with a ready-made account, no sign-up needed.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => login()}
          loading={demoPending}
          disabled={loggingIn}
        >
          Try the demo account
        </Button>
      </Card>
    </Container>
  );
}
