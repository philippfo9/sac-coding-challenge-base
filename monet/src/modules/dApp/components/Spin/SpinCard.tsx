import React, { FC, useRef } from "react";
import { Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import { spinUserType } from "../../../spinGame/types";
import Image from "next/image";

interface Props {
  index: number;
  user: spinUserType;
}

const SpinCard: FC<Props> = ({ user, index }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
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
    >
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
