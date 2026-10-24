import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BsPencil } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "../utils/toast";
import { profileSchema, type ProfileInput } from "../utils/schemas";
import { TEST_ACCOUNT_EMAIL } from "../utils/constants";
import { CURRENCIES, setCurrency } from "../utils/currency";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { FieldError, Input, Label } from "../components/ui/Field";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SavedItems from "../components/SavedItems";
import Skeleton from "../components/ui/Skeleton";
import { useCurrency } from "../hooks/useCurrency";
import {
  errorMessage,
  useDeleteAccount,
  useLogout,
  useMe,
  useUpdateProfile,
} from "../hooks/useAuth";

const PROFILE_FIELDS: {
  name: keyof ProfileInput;
  label: string;
  type: "text" | "date";
  autoComplete: string;
}[] = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  {
    name: "address",
    label: "Address",
    type: "text",
    autoComplete: "street-address",
  },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  {
    name: "postcode",
    label: "Postcode",
    type: "text",
    autoComplete: "postal-code",
  },
  {
    name: "dateOfBirth",
    label: "Date of birth",
    type: "date",
    autoComplete: "bday",
  },
];

export default function Profile() {
  const [editProfile, setEditProfile] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { symbol: currencySymbol } = useCurrency();
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
      onSuccess: () => {
        setEditProfile(false);
        toast("Profile updated");
      },
      onError: (error) => toast(errorMessage(error), "error"),
    });
  };

  // back to the saved values
  const cancelEdit = () => {
    reset();
    setEditProfile(false);
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

  // logged out visitors are sent to /signin by the effect above
  if (!user) {
    return (
      <Container size="md" className="py-8" aria-busy="true">
        <span className="sr-only">Loading your account</span>
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="mt-8 h-60" />
        <Skeleton className="mt-6 h-32" />
      </Container>
    );
  }

  const details = [
    { label: "Name", value: user?.name },
    { label: "Address", value: user?.address },
    { label: "City", value: user?.city },
    { label: "Postcode", value: user?.postcode },
    {
      label: "Date of birth",
      value: user?.dateOfBirth && user.dateOfBirth_formatted,
    },
  ];

  return (
    <Container size="md" className="py-8">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary"
        >
          {user?.firstName?.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">
            Welcome{user && `, ${user.firstName}`}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>

      <Card className="mt-8 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Personal details</h2>
          {!editProfile && (
            <Button
              variant="secondary"
              size="sm"
              aria-label="Edit details"
              onClick={() => setEditProfile(true)}
            >
              <BsPencil aria-hidden /> Edit
            </Button>
          )}
        </div>
        {editProfile ? (
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit(updateProfile)}
          >
            {PROFILE_FIELDS.map(({ name, label, type, autoComplete }) => (
              <div key={name} className="flex flex-col gap-1">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  type={type}
                  id={name}
                  autoComplete={autoComplete}
                  aria-invalid={Boolean(errors[name])}
                  {...register(name)}
                />
                <FieldError message={errors[name]?.message} />
              </div>
            ))}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={updateProfileMutation.isPending}>
                Update
              </Button>
              <Button variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {details.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value || "Not set"}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <SavedItems />

      <Card className="mt-6 p-5 md:p-6">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <div
          role="group"
          aria-labelledby="currency-label"
          className="mt-4 flex flex-wrap items-center gap-4"
        >
          <p id="currency-label" className="text-sm font-medium">
            Currency
          </p>
          <div className="flex gap-2">
            {CURRENCIES.map((symbol) => (
              <Button
                key={symbol}
                variant={currencySymbol === symbol ? "primary" : "secondary"}
                aria-pressed={currencySymbol === symbol}
                onClick={() => setCurrency(symbol)}
                className="w-10 px-0 text-lg"
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Prices are converted from pounds. Your choice is saved on this device.
        </p>
      </Card>

      <Card className="mt-6 p-5 md:p-6">
        <h2 className="text-lg font-semibold">Account</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={async () => {
              await logOut();
              toast("Signed out");
            }}
          >
            <HiOutlineLogout aria-hidden className="text-lg" /> Log out
          </Button>
          {user && user.email !== TEST_ACCOUNT_EMAIL ? (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete account
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              The demo account can&apos;t be deleted.
            </p>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete your account?"
        description="Your reviews are deleted too. This can't be undone."
        confirmLabel="Delete"
        pending={deleteAccount.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Container>
  );
}
