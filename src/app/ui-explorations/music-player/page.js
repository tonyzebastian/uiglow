import MusicPlay from "./music"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

export default function MusicPlayPage() {
  return (
    <main className="w-full p-6 flex">
          <Card className=" w-full h-full">
            <CardContent className="h-full flex items-center justify-center">
              <MusicPlay />
            </CardContent>
          </Card>
    </main>
  )
}
