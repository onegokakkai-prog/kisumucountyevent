"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { pledge } from "@/app/pledge/actions";
import type { PledgeFieldErrors, PledgeState } from "@/app/pledge/schema";
import { Icon } from "../icons";

const kes = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

const fieldClass =
  "min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base text-ink placeholder:text-muted/70 focus:border-navy focus:outline-3 focus:outline-offset-1 focus:outline-sun aria-[invalid=true]:border-rust";

type Props = {
  label: string;
  pricePerBrick: number | null;
  paybill: string;
  account: string;
  instructions: string;
  phoneLabel: string;
};

export function PledgeDialog(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Bumped on every open so a fresh form appears after a completed pledge.
  const [session, setSession] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSession((n) => n + 1);
          dialogRef.current?.showModal();
        }}
        className="inline-flex min-h-[52px] cursor-pointer items-center gap-2.5 self-start rounded-full bg-navy px-[26px] text-base font-bold text-white transition-colors hover:bg-lake"
      >
        {props.label}
        <Icon name="arrow-right" size={18} strokeWidth={2.5} />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="pledge-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[920px] overflow-y-auto rounded-3xl bg-white p-0 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop:bg-navy/80 backdrop:backdrop-blur-sm"
      >
        <PledgeBody key={session} {...props} onClose={() => dialogRef.current?.close()} />
      </dialog>
    </>
  );
}

function PayDetails({ paybill, account, amount }: { paybill: string; account: string; amount?: number }) {
  if (!paybill) return null;
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-navy/15">
      <div className="bg-white px-4 py-3">
        <dt className="text-xs font-bold tracking-[0.06em] text-muted uppercase">Paybill</dt>
        <dd className="font-display text-2xl font-extrabold text-navy">{paybill}</dd>
      </div>
      <div className="bg-white px-4 py-3">
        <dt className="text-xs font-bold tracking-[0.06em] text-muted uppercase">Account</dt>
        <dd className="font-display text-2xl font-extrabold text-navy">{account}</dd>
      </div>
      {amount ? (
        <div className="col-span-2 bg-white px-4 py-3">
          <dt className="text-xs font-bold tracking-[0.06em] text-muted uppercase">Amount</dt>
          <dd className="font-display text-2xl font-extrabold text-navy">{kes.format(amount)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function Steps({ text }: { text: string }) {
  const steps = text.split("\n").map((s) => s.trim()).filter(Boolean);
  if (!steps.length) return null;
  return (
    <ol className="flex flex-col gap-2.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-snug">
          <span className="flex size-6 flex-none items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}

function PledgeBody({ pricePerBrick, paybill, account, instructions, phoneLabel, onClose }: Props & { onClose: () => void }) {
  const [state, action, pending] = useActionState<PledgeState, FormData>(pledge, { status: "idle" });
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorState = state.status === "error" ? state : null;
  const values = errorState?.values ?? {};
  const errors: PledgeFieldErrors = errorState?.errors ?? {};
  const [amount, setAmount] = useState(values.amount ?? "");

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  const presets = pricePerBrick ? [1, 5, 10].map((n) => n * pricePerBrick) : [500, 1000, 5000];
  const bricks = pricePerBrick && Number(amount) >= pricePerBrick ? Math.floor(Number(amount) / pricePerBrick) : 0;
  const invalid = (k: keyof PledgeFieldErrors) => (errors[k]?.length ? true : undefined);
  const err = (k: keyof PledgeFieldErrors) =>
    errors[k]?.length ? (
      <p id={`pledge-${k}-error`} className="text-sm font-semibold text-rust">
        {errors[k]![0]}
      </p>
    ) : null;

  return (
    <div className="grid md:grid-cols-[1fr_1.15fr]">
      <div className="flex flex-col gap-5 bg-sun p-6 text-navy sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-extrabold tracking-[0.08em] uppercase">Buy-a-Brick</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-2 -mr-2 flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-navy/10 md:hidden"
          >
            <Icon name="close" size={22} strokeWidth={2.2} />
          </button>
        </div>
        <h2 id="pledge-title" className="font-display text-[32px] leading-none font-extrabold tracking-[-0.02em]">
          How to give
        </h2>
        {pricePerBrick ? (
          <p className="text-[15px] font-semibold">One brick costs {kes.format(pricePerBrick)}. Give as many as you like.</p>
        ) : null}
        <PayDetails paybill={paybill} account={account} />
        <Steps text={instructions} />
        <p className="mt-auto text-sm">
          Questions? Call or WhatsApp <span className="font-bold">{phoneLabel}</span>.
        </p>
      </div>

      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 hidden size-11 cursor-pointer items-center justify-center rounded-full text-navy hover:bg-mist md:flex"
        >
          <Icon name="close" size={22} strokeWidth={2.2} />
        </button>
        {state.status === "success" ? (
          <div className="flex flex-col items-start gap-4 py-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-sun text-navy">
              <Icon name="check" size={26} strokeWidth={2.6} />
            </span>
            <h3 ref={successRef} tabIndex={-1} className="font-display text-[28px] leading-tight font-extrabold text-navy outline-none">
              Thank you, {state.name.split(" ")[0]}.
            </h3>
            <p className="text-base leading-relaxed text-body">
              We&apos;ve noted your pledge of <strong>{kes.format(state.amount)}</strong>.{" "}
              {paybill ? "Send it using the details below to complete your gift." : "The festival team will call you with payment details."}
            </p>
            <div className="w-full">
              <PayDetails paybill={paybill} account={account} amount={state.amount} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex min-h-12 cursor-pointer items-center rounded-full bg-navy px-6 font-bold text-white hover:bg-lake"
            >
              Done
            </button>
          </div>
        ) : (
          <form action={action} noValidate className="flex flex-col gap-4" key={errorState?.submittedAt ?? "initial"}>
            <h3 className="pr-10 text-xl font-bold text-navy">Note your pledge</h3>
            {errorState ? (
              <p role="alert" className="rounded-xl border-2 border-rust bg-rust-soft px-4 py-3 text-[15px] font-semibold text-rust-ink">
                {errorState.message}
              </p>
            ) : null}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[15px] font-semibold">Amount (KES)</legend>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(String(p))}
                    aria-pressed={amount === String(p)}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line-strong px-4 text-[15px] font-semibold text-navy hover:border-navy aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white"
                  >
                    {kes.format(p)}
                  </button>
                ))}
              </div>
              <input
                id="pledge-amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={50}
                placeholder="Or enter an amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Amount in Kenyan shillings"
                aria-invalid={invalid("amount")}
                aria-describedby={errors.amount ? "pledge-amount-error" : undefined}
                className={fieldClass}
              />
              {bricks ? (
                <p className="text-sm font-semibold text-lake">
                  That&apos;s {bricks} brick{bricks === 1 ? "" : "s"}.
                </p>
              ) : null}
              {err("amount")}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="pledge-name" className="text-[15px] font-semibold">
                  Your name
                </label>
                <input
                  id="pledge-name"
                  name="name"
                  autoComplete="name"
                  defaultValue={values.name}
                  aria-invalid={invalid("name")}
                  aria-describedby={errors.name ? "pledge-name-error" : undefined}
                  className={fieldClass}
                />
                {err("name")}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="pledge-phone" className="text-[15px] font-semibold">
                  Mobile number
                </label>
                <input
                  id="pledge-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0712 345 678"
                  defaultValue={values.phone}
                  aria-invalid={invalid("phone")}
                  aria-describedby={errors.phone ? "pledge-phone-error" : undefined}
                  className={fieldClass}
                />
                {err("phone")}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="pledge-email" className="text-[15px] font-semibold">
                Email <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id="pledge-email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                aria-invalid={invalid("email")}
                aria-describedby={errors.email ? "pledge-email-error" : undefined}
                className={fieldClass}
              />
              {err("email")}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="pledge-message" className="text-[15px] font-semibold">
                Message <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea id="pledge-message" name="message" rows={2} defaultValue={values.message} className={fieldClass} />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-sun px-8 text-[17px] font-extrabold text-navy transition-colors hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
            >
              {pending ? "Saving…" : "Pledge"}
              {pending ? null : <Icon name="arrow-right" size={18} strokeWidth={2.5} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
