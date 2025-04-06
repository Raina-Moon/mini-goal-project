"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartData, Goal } from "@/utils/api";

interface ChartComponentProps {
  nailedPosts: Goal[];
  failedPosts?: Goal[];
  chartPeriod: "day" | "week" | "month" | "year";
  setChartPeriod: (period: "day" | "week" | "month" | "year") => void;
  isOwnProfile: boolean;
}

const ChartComponent = ({
  nailedPosts,
  failedPosts = [],
  chartPeriod,
  setChartPeriod,
  isOwnProfile,
}: ChartComponentProps) => {
  const chartData: ChartData[] = useMemo(() => {
    if (!nailedPosts || nailedPosts.length === 0) return [];

    const processData = (posts: Goal[]): ChartData[] => {
      if (chartPeriod === "day") {
        const today = new Date();
        const durationByHour = Array(6).fill(0);
        posts.forEach((post) => {
          const postDate = new Date(post.created_at);
          if (postDate.toDateString() === today.toDateString()) {
            const hour = postDate.getHours();
            const slot = Math.floor(hour / 4);
            durationByHour[slot] = (durationByHour[slot] || 0) + post.duration;
          }
        });

        return [
          { time: "0-4", nailedDuration: durationByHour[0] },
          { time: "4-8", nailedDuration: durationByHour[1] },
          { time: "8-12", nailedDuration: durationByHour[2] },
          { time: "12-16", nailedDuration: durationByHour[3] },
          { time: "16-20", nailedDuration: durationByHour[4] },
          { time: "20-24", nailedDuration: durationByHour[5] },
        ];
      } else if (chartPeriod === "week") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const durationByDate = nailedPosts.reduce((acc, post) => {
          const date = new Date(post.created_at).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          });
          if (new Date(post.created_at) >= weekAgo) {
            acc[date] = (acc[date] || 0) + post.duration;
          }
          return acc;
        }, {} as { [key: string]: number });
        return Object.entries(durationByDate).map(([date, duration]) => ({
          date,
          nailedDuration: duration,
        }));
      } else if (chartPeriod === "month") {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const durationByDate = nailedPosts.reduce((acc, post) => {
          const date = new Date(post.created_at).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          });
          if (new Date(post.created_at) >= monthAgo) {
            acc[date] = (acc[date] || 0) + post.duration;
          }
          return acc;
        }, {} as { [key: string]: number });
        return Object.entries(durationByDate).map(([date, duration]) => ({
          date,
          nailedDuration: duration,
        }));
      } else if (chartPeriod === "year") {
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const durationByMonth = nailedPosts.reduce((acc, post) => {
          const date = new Date(post.created_at).toLocaleDateString("en-US", {
            month: "short",
          });
          if (new Date(post.created_at) >= yearStart) {
            acc[date] = (acc[date] || 0) + post.duration;
          }
          return acc;
        }, {} as { [key: string]: number });
        return Object.entries(durationByMonth).map(([date, duration]) => ({
          date,
          nailedDuration: duration,
        }));
      }
      return [];
    };

    const nailedData = processData(nailedPosts);
    if (!isOwnProfile) return nailedData;

    const failedData = processData(failedPosts);
    return nailedData.map((nailed, index) => ({
      ...nailed,
      failedDuration: failedData[index]?.nailedDuration || 0,
    }));
  }, [nailedPosts, failedPosts, chartPeriod, isOwnProfile]);

  const maxDuration = useMemo(() => {
    const nailedDurations = chartData.map((d) => d.nailedDuration || 0);
    const failedDurations = chartData.map((d) => d.failedDuration || 0);
    return Math.max(...nailedDurations, ...failedDurations, 5);
  }, [chartData]);

  const chartConfig = {
    nailedDuration: {
      label: "Nailed It (min)",
      color: "hsl(var(--primary-400))",
    },
    failedDuration: {
      label: "Failed It (min)",
      color: "#ef4444",
    },
  } satisfies ChartConfig;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Success Duration</CardTitle>
        <CardDescription>
          {chartPeriod === "day" && "Last 24 Hours"}
          {chartPeriod === "week" && "Last 7 Days"}
          {chartPeriod === "month" && "Last 30 Days"}
          {chartPeriod === "year" && "This Year"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <div className="space-x-2">
            <Button
              variant={chartPeriod === "day" ? "default" : "outline"}
              onClick={() => setChartPeriod("day")}
            >
              Day
            </Button>
            <Button
              variant={chartPeriod === "week" ? "default" : "outline"}
              onClick={() => setChartPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant={chartPeriod === "month" ? "default" : "outline"}
              onClick={() => setChartPeriod("month")}
            >
              Month
            </Button>
            <Button
              variant={chartPeriod === "year" ? "default" : "outline"}
              onClick={() => setChartPeriod("year")}
            >
              Year
            </Button>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey={chartPeriod === "day" ? "time" : "date"}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartPeriod === "day" ? value : value.slice(0, 6)
              }
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              label={{
                value: "Duration (min)",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
              }}
              domain={[0, maxDuration + 10]}
              tickCount={Math.ceil((maxDuration + 10) / 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="nailedDuration"
              fill="var(--color-nailedDuration)"
              radius={4}
              barSize={10}
            />
            {isOwnProfile && (
              <Bar
                dataKey="failedDuration"
                fill="var(--color-failedDuration)"
                radius={4}
                barSize={10}
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ChartComponent;
