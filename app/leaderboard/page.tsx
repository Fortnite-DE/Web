"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { Spinner } from "@nextui-org/spinner";
import { Image } from "@nextui-org/image";
import { CircularProgress } from "@nextui-org/progress";
import { Key, useCallback, useState } from "react";
import { Tooltip } from "@nextui-org/tooltip";

import { MessagesIcon, UserIcon, XpIcon } from "@/components/icons";

export default function Leaderboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  let list = useAsyncList({
    async load({ signal, cursor }) {
      if (cursor) {
        setIsLoading(false);
      }

      // If no cursor is available, then we're loading the first page.
      // Otherwise, the cursor is the next URL to load, as returned from the previous page.
      const res = await fetch(
        cursor ||
          "https://auth.fn-discord.de/leaderboard?guildId=398567824471097345",
        { signal },
      );
      let json = await res.json();

      setHasMore(json.next !== null);

      return {
        items: json.items,
        cursor: json.next,
      };
    },
  });

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore,
  });

  const renderCell = useCallback((entry: LeaderboardItem, columnKey: Key) => {
    switch (columnKey) {
      case "position":
        return (
          <div className="w-6 h-6 bg-slate-800 rounded-full flex justify-center items-center">
            <span className="text-xs">{entry.position}</span>
          </div>
        );
      case "user":
        return (
          <div className="relative flex items-center gap-2">
            <Image
              alt={`${entry.username} profile picture`}
              radius="full"
              src={entry.avatarUrl}
              width={32}
            />
            <span>{entry.username}</span>
          </div>
        );
      case "messages":
        return new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(entry.messageCount);
      case "xp":
        return new Intl.NumberFormat("en", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(entry.xp);
      case "level":
        return (
          <Tooltip
            content={`${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format((entry.level - Math.trunc(entry.level)) * 100)}%`}
          >
            <CircularProgress
              aria-label="Loading..."
              maxValue={1}
              showValueLabel={true}
              size="lg"
              value={entry.level - Math.trunc(entry.level)}
              valueLabel={Math.trunc(entry.level)}
            />
          </Tooltip>
        );
    }
  }, []);

  return (
    <Table
      isHeaderSticky
      aria-label="Level Leaderboard"
      baseRef={scrollerRef}
      bottomContent={
        hasMore ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white" />
          </div>
        ) : null
      }
    >
      <TableHeader>
        <TableColumn key="position"> </TableColumn>
        <TableColumn key="user" align="center">
          <UserIcon />
        </TableColumn>
        <TableColumn key="messages" align="center">
          <MessagesIcon />
        </TableColumn>
        <TableColumn key="xp" align="center">
          <XpIcon />
        </TableColumn>
        <TableColumn key="level"> </TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        items={list.items as LeaderboardItem[]}
        loadingContent={<Spinner color="white" />}
      >
        {(item) => (
          <TableRow key={item.username}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
