import Upvote from "./Upvotes"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export default function UpvotePage() {
  return (
    <main className="flex flex-col items-center p-6">
      <h1 className="text-xl font-heading mb-4 text-slate-800 dark:text-slate-200">Support us!</h1>
      <Upvote />
    </main>
  )
}