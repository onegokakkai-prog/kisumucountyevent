import { redirect } from "next/navigation";

// A short link to share with professionals: opens the registration section on their form.
export default function ProfessionalsPage() {
  redirect("/#professionals");
}
