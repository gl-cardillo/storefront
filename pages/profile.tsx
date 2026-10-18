import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { BsFillPencilFill } from "react-icons/bs";
import { CurrencyContext, type CurrencySymbol } from "../utils/context";
import { HiOutlineLogout } from "react-icons/hi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "../utils/toast";
import { profileSchema, type ProfileInput } from "../utils/schemas";
import { TEST_ACCOUNT_EMAIL } from "../utils/constants";
import { cn } from "../utils/cn";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { FieldError, Input, Label } from "../components/ui/Field";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  errorMessage,
  useDeleteAccount,
  useLogout,
  useMe,
  useUpdateProfile,
} from "../hooks/useAuth";

const CURRENCY_RATES: Record<CurrencySymbol, number> = {
  "£": 1,
  "€": 1.18,
  $: 1.2,
};
const CURRENCIES = Object.keys(CURRENCY_RATES) as CurrencySymbol[];

const PROFILE_FIELDS: {
  name: keyof ProfileInput;
  label: string;
  type: "text" | "date";
}[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "address", label: "Address", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "postcode", label: "Postcode", type: "text" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
];

export default function Profile() {
  const [showDetails, setShowDetails] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { currencySymbol, setCurrencySymbol, setCurrencyRate } =
    useContext(CurrencyContext);
  const { user, isLoading } = useMe();
  const updateProfileMutation = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const logout = useLogout();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const updateProfile = (data: ProfileInput) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => setEditProfile(false),
    });
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }
    // the schema expects strings, missing fields would fail validation
    reset({
      name: user.name ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      postcode: user.postcode ?? "",
      dateOfBirth: user.dateOfBirth_toISODate ?? "",
    });
  }, [isLoading, user, reset, router]);

  // leave the page first, otherwise the redirect above sends us to /signin
  const logOut = async () => {
    await router.push("/");
    logout();
  };

  const confirmDelete = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: async () => {
        setConfirmingDelete(false);
        await logOut();
        toast("Account deleted");
      },
      onError: (error) => {
        setConfirmingDelete(false);
        toast(errorMessage(error), "error");
      },
    });
  };

  const setCurrency = (symbol: CurrencySymbol) => {
    setCurrencySymbol(symbol);
    setCurrencyRate(CURRENCY_RATES[symbol]);
  };

  return (
    <Container size="sm" className="py-5">
      <Card className="flex flex-col items-center gap-3 p-5">
        <h2 className="text-xl font-bold">Welcome {user && user.firstName}</h2>
        <Image
          className="h-12.5 w-12.5 rounded-full"
          src="/images/user.svg"
          width={50}
          height={50}
          alt="avatar"
          unoptimized
        />
        <div className="flex items-center gap-2">
          <p>Details</p>
          <button
            onClick={() => {
              setShowDetails(!showDetails);
            }}
            aria-label="Show details"
            aria-expanded={showDetails}
          >
            <MdKeyboardArrowDown
              className={cn("text-xl", showDetails && "rotate-180")}
            />
          </button>
        </div>
        {showDetails &&
          (editProfile ? (
            <form
              className="flex w-60 flex-col gap-3"
              onSubmit={handleSubmit(updateProfile)}
            >
              {PROFILE_FIELDS.map(({ name, label, type }) => (
                <div key={name} className="flex flex-col gap-1">
                  <Label htmlFor={name}>{label}</Label>
                  <Input
                    type={type}
                    id={name}
                    aria-invalid={Boolean(errors[name])}
                    {...register(name)}
                  />
                  <FieldError message={errors[name]?.message} />
                </div>
              ))}
              <div className="mt-2 flex gap-2">
                <Button type="submit" className="flex-1">
                  Update
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setEditProfile(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex min-w-30 flex-col">
              <button
                onClick={() => setEditProfile(!editProfile)}
                aria-label="Edit details"
                className="mb-2 self-end"
              >
                <BsFillPencilFill />
              </button>
              <p>
                <span className="font-bold">Name:</span> {user && user.name}
              </p>
              <p>
                <span className="font-bold">Address:</span>
                {user && user.address}
              </p>
              <p>
                <span className="font-bold">City:</span> {user && user.city}
              </p>
              <p>
                <span className="font-bold">Postcode:</span>
                {user && user.postcode}
              </p>
              <p>
                <span className="font-bold">Date of birth: </span>
                {user && user.dateOfBirth && user.dateOfBirth_formatted}
              </p>
            </div>
          ))}
        <div>
          <p className="my-3 text-center">Currency:</p>
          <div className="flex gap-5">
            {CURRENCIES.map((symbol) => (
              <Button
                key={symbol}
                variant={currencySymbol === symbol ? "primary" : "secondary"}
                aria-pressed={currencySymbol === symbol}
                onClick={() => setCurrency(symbol)}
                className="w-10 px-0 text-xl"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
        <div className="my-3 flex flex-col items-center gap-7">
          <button onClick={() => logOut()} className="flex items-center gap-2">
            <HiOutlineLogout className="text-3xl" />
            <p className="text-lg font-semibold">Log out</p>
          </button>
          {user && user.email !== TEST_ACCOUNT_EMAIL && (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete account
            </Button>
          )}
        </div>
        <ConfirmDialog
          open={confirmingDelete}
          title="Delete your account?"
          description="Your reviews are deleted too. This can't be undone."
          confirmLabel="Delete"
          pending={deleteAccount.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      </Card>
    </Container>
  );
}
