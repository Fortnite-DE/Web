import {NextPage} from "next";
import {useEffect, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";

const Leaderboard: NextPage = () => {

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMoreUsers, setHasMoreUsers] = useState<boolean>(true);
    const [users, setUsers] = useState<LeaderboardEntry[]>([]);


    function fetchMoreData() {
        fetchData().then((data) => {
            setUsers(users.concat(data))
        });
    }

    async function fetchData(): Promise<LeaderboardEntry[]> {
        console.log("fetching data from page " + currentPage);
        return fetch(`https://auth.fn-discord.de/leaderboard?page=${currentPage}&guildId=398567824471097345`)
            .then(response => {
                if (!response.ok) throw Error(response.statusText);  // TODO: Error handling
                return response;
            })
            .then(response => response.json())
            .then(response => {
                setHasMoreUsers(currentPage == response.lastPage);
                setCurrentPage(currentPage + 1);
                return response.data;
            });
    }

    useEffect(() => {
        fetchData().then(data => setUsers(data));
    });

    let numberFormatter = new Intl.NumberFormat('de-DE', {
        notation: 'compact',
        maximumFractionDigits: 1
    });
    console.log(users);
    return (
        <InfiniteScroll
            next={fetchMoreData}
            hasMore={hasMoreUsers}
            loader={<h3>Loading...</h3>}
            dataLength={users.length}>
            <ul>
                {users.map((user: LeaderboardEntry, index: number) => (
                    <li key={index}>
                        <Image src={user.avatarUrl} width={32} height={32} alt={`${user.username}'s avatar`}></Image>
                        <span>{`${index + 1}.)  ${user.username} - ${numberFormatter.format(user.xp)} XP - ${numberFormatter.format(user.messages)} Messages`}</span>
                    </li>
                ))}
            </ul>
        </InfiniteScroll>
    )
}

export default Leaderboard