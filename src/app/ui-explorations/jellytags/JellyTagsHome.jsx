import JellyTags from "./JellyTagsSingle"


export default function JellyTagHome() {

  return (
    <div>
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-heading mb-12 text-slate-800 dark:text-slate-200">What's your favorite thing to do on a lazy Sunday?</h1>
            <div className="flex flex-wrap gap-4">
                <JellyTags title="Nap" />
                <JellyTags title="Read"/>
                <JellyTags title="Walk"/>
                <JellyTags title="Cook"/>
                <JellyTags title="Draw"/>
                <JellyTags title="Knit"/>
                <JellyTags title="Sing"/>
                <JellyTags title="Swim"/>
                <JellyTags title="Dance"/>
                <JellyTags title="Paint"/>
                <JellyTags title="Gardening"/>
                <JellyTags title="Yoga"/>
                <JellyTags title="Pottery"/>
                <JellyTags title="Coding"/>
                <JellyTags title="Hiking"/>
                <JellyTags title="Baking"/>
            </div>
        </div>
    </div>
  );
}
