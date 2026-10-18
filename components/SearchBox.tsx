import Image from "next/image";
import { useRouter } from "next/router";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { BsSearch } from "react-icons/bs";
import { useProductSearch } from "../hooks/useProductSearch";
import { cn } from "../utils/cn";

const MAX_SUGGESTIONS = 5;

// combobox pattern: focus stays in the input, arrows move the highlighted option
export default function SearchBox({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // index of the highlighted suggestion, -1 means none
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const listId = useId();
  const { data: results = [] } = useProductSearch(query);

  const trimmedQuery = query.trim();
  const suggestions =
    trimmedQuery === "" ? [] : results.slice(0, MAX_SUGGESTIONS);
  const showList = open && suggestions.length > 0;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const reset = () => {
    setQuery("");
    setOpen(false);
    setActive(-1);
  };

  const openProduct = (productId: string) => {
    router.push(`/product/${productId}`);
    reset();
  };

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showList && active >= 0) {
      openProduct(suggestions[active].product._id);
      return;
    }
    if (trimmedQuery === "") return;
    router.push({ pathname: "/search", query: { q: trimmedQuery } });
    reset();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((index) => Math.max(index - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <form
      role="search"
      className={cn("relative flex", className)}
      onSubmit={submitSearch}
    >
      <input
        type="text"
        role="combobox"
        aria-label="Search products"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={
          showList && active >= 0 ? optionId(active) : undefined
        }
        autoComplete="off"
        className="h-10 w-full rounded-l-md border-input bg-surface px-3 text-foreground focus:border-primary focus:ring-primary"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-10 items-center rounded-r-md bg-primary px-3 text-primary-foreground hover:bg-primary-hover"
      >
        <BsSearch />
      </button>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-border bg-surface shadow-lg"
        >
          {suggestions.map(({ product }, index) => (
            <li
              key={product._id}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              // keep focus in the input so the click isn't lost to blur
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => openProduct(product._id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-2 py-2",
                index === active && "bg-muted",
              )}
            >
              <Image
                src={product.picUrl}
                width={30}
                height={40}
                className="h-10 min-w-7.5 rounded-sm bg-white object-contain"
                alt=""
              />
              <span className="truncate text-sm font-medium">
                {product.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
