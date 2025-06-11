import { redirect } from "next/navigation"

export default function PettyCashRedirect() {
  redirect("/restaurant/finance?tab=petty-cash")
}
