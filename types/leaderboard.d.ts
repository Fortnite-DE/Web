type LeaderboardApiResponse = {
    currentPage: number;
    pageSize: number;
    data: LeaderboardEntry[];
}

type LeaderboardEntry = {
    username: string;
    avatarUrl: string;
    xp: number;
    messages: number;
}