import { redirect } from "next/navigation";

// The root route ("/") has no content of its own — it just sends
// every visitor straight to the login page. This replaces the
// default Next.js welcome page that create-next-app generated here.
export default function Home() {
  redirect("/login");
}