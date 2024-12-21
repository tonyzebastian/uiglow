import JellyTags from "./JellyTagsSingle"
import JellyTagHome from "./JellyTagsHome"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function JellyTagsPage() {
  return (
    <main className="w-full p-6 flex">
      <Tabs defaultValue="Component" className="w-full flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="Component">Component</TabsTrigger>
          <TabsTrigger value="Usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="Component" className="w-full flex-1">
          <Card className="h-full">
            <CardContent className="h-full flex items-center justify-center">
              <JellyTags />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="Usage" className="w-full flex-1">
          <Card className="h-full">
            <CardContent className="h-full flex items-center justify-center">
              <JellyTagHome />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
