import Clock from "./Clock"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const timeZones = [
  { offset: -12, name: "Baker Island Time (BIT)" },
  { offset: -11, name: "Niue Time (NUT)" },
  { offset: -10, name: "Hawaii-Aleutian Standard Time (HAST)" },
  { offset: -9.5, name: "Marquesas Islands Time (MIT)" },
  { offset: -9, name: "Alaska Standard Time (AKST)" },
  { offset: -8, name: "Pacific Standard Time (PST)" },
  { offset: -7, name: "Mountain Standard Time (MST)" },
  { offset: -6, name: "Central Standard Time (CST)" },
  { offset: -5, name: "Eastern Standard Time (EST)" },
  { offset: -4, name: "Atlantic Standard Time (AST)" },
  { offset: -3.5, name: "Newfoundland Standard Time (NST)" },
  { offset: -3, name: "Argentina Time (ART)" },
  { offset: -2, name: "South Georgia Time (GST)" },
  { offset: -1, name: "Cape Verde Time (CVT)" },
  { offset: 0, name: "Greenwich Mean Time (GMT)" },
  { offset: 1, name: "Central European Time (CET)" },
  { offset: 2, name: "Eastern European Time (EET)" },
  { offset: 3, name: "Moscow Time (MSK)" },
  { offset: 3.5, name: "Iran Standard Time (IRST)" },
  { offset: 4, name: "Gulf Standard Time (GST)" },
  { offset: 4.5, name: "Afghanistan Time (AFT)" },
  { offset: 5, name: "Pakistan Standard Time (PKT)" },
  { offset: 5.5, name: "Indian Standard Time (IST)" },
  { offset: 5.75, name: "Nepal Time (NPT)" },
  { offset: 6, name: "Bangladesh Standard Time (BST)" },
  { offset: 6.5, name: "Myanmar Time (MMT)" },
  { offset: 7, name: "Indochina Time (ICT)" },
  { offset: 8, name: "China Standard Time (CST)" },
  { offset: 8.75, name: "Australian Central Western Standard Time (ACWST)" },
  { offset: 9, name: "Japan Standard Time (JST)" },
  { offset: 9.5, name: "Australian Central Standard Time (ACST)" },
  { offset: 10, name: "Australian Eastern Standard Time (AEST)" },
  { offset: 10.5, name: "Lord Howe Standard Time (LHST)" },
  { offset: 11, name: "Solomon Islands Time (SBT)" },
  { offset: 12, name: "New Zealand Standard Time (NZST)" },
  { offset: 12.75, name: "Chatham Islands Standard Time (CHAST)" },
  { offset: 13, name: "Tonga Time (TOT)" },
];

export default function ClockPage() {
  return (
    <main className="w-full p-6 ">
      <Card className="w-full ">
        <CardHeader>
          <CardTitle>World Clocks</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {timeZones.map((tz, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className=" flex flex-col items-center p-4 border border-slate-900 transition-colors hover:bg-[var(--clock-bg)] hover:text-white group">
                      <div className="text-sm text-slate-600 group-hover:text-white mb-2">
                        UTC{tz.offset >= 0 ? '+' : ''}{tz.offset}
                      </div>
                      <Clock 
                        initialTime={new Date()} 
                        timeZoneOffset={tz.offset}
                        size={150}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tz.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </main>
  )
}