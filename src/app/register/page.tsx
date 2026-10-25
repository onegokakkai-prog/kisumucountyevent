import { redirect } from "next/navigation";

// Registration lives on the landing page; keep old links and shared URLs working.
export default function RegisterPage() {
  redirect("/#register");
}
