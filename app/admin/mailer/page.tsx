import { redirect } from "next/navigation";

export default function AdminMailerPage() {
  redirect("/admin?tab=mailer");
}
