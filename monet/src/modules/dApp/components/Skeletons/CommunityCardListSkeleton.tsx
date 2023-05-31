import {SimpleGrid, Skeleton} from "@chakra-ui/react";
import React, {useMemo} from "react";
import RaffleCardSkeleton from "./RaffleCardSkeleton";
import CommunityCardSkeleton from "./CommunityCardSkeleton";

const CommunityCardListSkeleton = (props: { count?: number }) => {
    const array = useMemo(() => {
        if (!props.count) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }

        const arr = [];
        for (let i = 0; i < props.count; i++) {
            arr.push(i);
        }
        return arr;
    }, [props.count])
    return (
        <>
            {array.map((i) => (
                <CommunityCardSkeleton key={i} />
            ))}
        </>
    )
};

export default CommunityCardListSkeleton