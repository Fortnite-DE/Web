type LeaderboardApiResponse = {
    currentPage: number;
    pageSize: number;
    data: LeaderboardEntry[];
}

type LeaderboardEntry = {
    username: string;
    avatarUrl: string;
    xp: number;
    level: number;
    messages: number;
}