import Upvote from "./upvote"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export default function UpvotePage() {
  return (
    <main className="w-full p-6 flex">

      <Card className="w-full h-full">
        <CardContent className="h-full flex flex-col items-center justify-center">
          <h1 className="text-xl font-heading mb-4 text-slate-800 dark:text-slate-200">Support us!</h1>
          <Upvote />
        </CardContent>
      </Card>
    </main>
  )
}

