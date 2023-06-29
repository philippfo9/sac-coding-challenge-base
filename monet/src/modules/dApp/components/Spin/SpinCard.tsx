import React, { FC } from "react";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import { spinUserType } from "../../../spin/types";
import Image from "next/image";

interface Props {
  index: number;
  user: spinUserType;
  winnerIndex: number;
}

const SpinCard: FC<Props> = ({ user, index, winnerIndex }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const isEnd = winnerIndex !== -1;
  const isWinner = winnerIndex === index;

  return (
    <Box
      position="absolute"
      width={240}
      height={320}
      left={(240 + 4) * index}
      borderRadius="20px"
      border={"1px solid"}
      borderColor={isDarkMode ? "#393e43" : "#d1d4d6"}
      boxShadow={isDarkMode ? "lg" : "none"}
      mr="4px"
      pb="2rem"
      textAlign="center"
      alignItems="center"
      bg={isDarkMode ? "cardBlack" : "white"}
      overflow="hidden"
      sx={{
        transition: "transform 0.5s",
        transform: `scale(${isWinner ? 1.1 : 1})`,
        zIndex: isWinner ? 10 : 1,
        filter: `blur(${isEnd ? (isWinner ? 0 : 6) : 0}px)`,
      }}
    >
      <Box
        width={8}
        height={400}
        bgColor={"#ffffffdd"}
        position="absolute"
        zIndex={11}
        top={-9}
        transform="rotate(30deg)"
        style={{
          transition: "left 0.8s",
          left: !isWinner ? -160 : 500,
        }}
      />
      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        flexDirection="column"
      >
        {user.profilePictureUrl !== "" ? (
          <Image
            src={user.profilePictureUrl}
            height={240}
            width={240}
            objectFit="cover"
            alt=""
          />
        ) : (
          <Box
            width={240}
            height={240}
            bgGradient={`linear(to-b, ${user.gradientStart}, ${user.gradientEnd})`}
          ></Box>
        )}

        <Text fontSize="1rem" fontWeight="600" mt={2}>
          {user.name}
        </Text>
      </Box>
    </Box>
  );
};

export default SpinCard;
