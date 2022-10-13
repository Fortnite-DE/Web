import {NextPage} from "next";
import {useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const Leaderboard: NextPage = () => {

    // State
    const [users, setUsers] = useState([]);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);
    let page = 1;

    function fetchData() {
        fetch(`https://api.fn-discord.de/leaderboard?page=${page}`)
            .then(response => {
                if (!response.ok) throw Error(response.statusText);  // TODO: Error handling
                return response;
            })
            .then(response => response.json())
            .then(data => {
                setUsers(users.concat(data.data));
                setHasMoreUsers(data.meta.current_page < data.meta.last_page);
                page++;
            }
        );
    }

    return (
        <div>
            <InfiniteScroll
                next={fetchData}
                hasMore={hasMoreUsers}
                loader={<h3>Loading...</h3>}
                dataLength={users.length}>

            </InfiniteScroll>
        </div>
    )
}

export default Leaderboard