import React, { useEffect, useMemo, useRef, useState } from "react";
import DAppLayout from "./layouts/DAppLayout";
import { Box, Button, Text, useColorMode } from "@chakra-ui/react";
import SpinCard from "./components/Spin/SpinCard";
import { spinUserType } from "../spinGame/types";
import { useMeasure, useWindowSize } from "react-use";

const SpinPage = () => {
  // const [cards, setCards] = useState<spinUserType[]>([]);
  const { colorMode } = useColorMode();

  const isDarkMode = colorMode === "dark";
  const spinRef = useRef(null);
  const windowSize = useWindowSize();
  const { width } = windowSize;

  const handleSpin = () => {};

  const centerPoint = useMemo(() => {
    let value = 0;
    if (width >= 1700) {
      value = width / 2 - (width - 1680) / 2 - 40;
    } else {
      value = width / 2 - 50;
    }
    console.log(value);
    return value;
  }, [DEMO_USERS, width]);

  // const cards = useMemo(() => {
  //   const originGroup: spinUserType[] = [];
  //   DEMO_USERS.map((item) => {
  //     for (let i = 0; i < item.ticketsCount; i++) {
  //       originGroup.push(item);
  //     }
  //   });
  //   const prevCount = Math.ceil(centerPoint / (240 + 4));
  //   const showCards = originGroup.slice(0 - prevCount).concat(originGroup);
  //   console.log(prevCount);

  //   console.log(originGroup)
  //   return showCards;
  // }, [DEMO_USERS, centerPoint]);
  const [translateX, setTranslateX] = useState(73 - 240 - 4);

  const cards = useMemo(() => {
    const showCards = DEMO_USERS.flatMap((item) =>
      Array.from({ length: item.ticketsCount }, () => item)
    );

    return showCards;
  }, [DEMO_USERS, centerPoint]);

  const showCards = useMemo(() => {
    const prevCount = Math.ceil(centerPoint / (240 + 4));
    return [...cards.slice(-prevCount), ...cards];
  }, [cards]);

  return (
    <DAppLayout>
      <Box mx="1.5rem" mt="3rem">
        {/* <Text fontSize="2rem" fontWeight="600" mb="1rem">
          Spin 
        </Text> */}
        <input
          value={translateX}
          step={100}
          onChange={(e) => setTranslateX(e.target.value as unknown as number)}
          type="number"
        />
        <Box position="relative">
          <Box position="relative" ref={spinRef} mb={4} overflow="hidden">
            <Box
              display="flex"
              height={320}
              position="relative"
              style={{
                transform: `translateX(${translateX}px)`,
                transition: `transform 0.2s`,
              }}
            >
              {showCards.map((user, index) => (
                <SpinCard key={user.wallet + index} user={user} index={index} />
              ))}
            </Box>
            <Box
              bgGradient={`linear(to-r, ${
                isDarkMode ? "#1f1f20" : "#fff"
              }, transparent)`}
              position="absolute"
              left={0}
              top={0}
              width={360}
              height={320}
              pointerEvents="none"
            />
            <Box
              bgGradient={`linear(to-r, transparent,${
                isDarkMode ? "#1f1f20" : "#fff"
              } )`}
              position="absolute"
              right={0}
              top={0}
              width={360}
              height={320}
              pointerEvents="none"
            />
          </Box>
          <MiddenLine />
        </Box>

        {/* <Button
          bgColor="#ffe71a"
          border="none"
          mt="1rem"
          w={240}
          fontWeight={800}
          h={12}
          rounded={10}
          textTransform="uppercase"
          onClick={handleSpin}
          boxShadow="-2px -4px 0px #e0cb0f inset"
          _hover={{}}
          _focus={{
            backgroundColor: "#d2bd09 !important",
            boxShadow: "-2px -4px 0px #9f8f0d inset",
          }}
        >
          Spin
        </Button> */}
      </Box>
    </DAppLayout>
  );
};
export default SpinPage;

const MiddenLine = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  return (
    <Box
      width={1}
      height={360}
      position="absolute"
      left="50%"
      top={-5}
      transform="transform(-1px, -4px)"
      bgColor={isDarkMode ? "#fff" : "#e0cb0f"}
      boxShadow={isDarkMode ? "10px 4px 10px #000" : "10px 4px 10px #000"}
    >
      <Box
        position="absolute"
        left={-1}
        top={-1}
        transform="rotate(45deg)"
        w={3}
        h={3}
        bgColor={isDarkMode ? "#fff" : "#e0cb0f"}
      ></Box>
      <Box
        position="absolute"
        left={-1}
        bottom={-1}
        transform="rotate(45deg)"
        w={3}
        h={3}
        bgColor={isDarkMode ? "#fff" : "#e0cb0f"}
      ></Box>
    </Box>
  );
};

const DEMO_USERS = [
  {
    name: "sasuke",
    profilePictureUrl:
      "https://storage.monet.community/next-s3-uploads/b63c7dc2-0d88-400b-ba69-07a340558dbc/ni3J4UrdLgfpb1y5CV3t.png",
    gradientStart: "#FC5C7D",
    wallet: "A8rgsJecHutEamvb7e8p1a14LQH3vGRPr796CDaESMeu",
    gradientEnd: "#6A82FB",
    ticketsCount: 4,
  },
  {
    name: "nickdavisfilms",
    wallet: "8QA4ih5MWJAmF7SAvyqUBrCX9pxHz2N8YezL92CREXPN",
    profilePictureUrl:
      "https://storage.monet.community/next-s3-uploads/ac32407a-e23e-4369-9d59-80bf3d4d8f50/rK0MNdr7wLJpOv62f333.gif",
    gradientStart: "#00F5A0",
    gradientEnd: "#00D9F5",
    ticketsCount: 5,
  },
  {
    name: "NoahNFT05",
    profilePictureUrl: "",
    gradientStart: "#642B73",
    gradientEnd: "#C6426E",
    wallet: "9oQJ6TSKxn5YZGHuScUhPNTZW9r9a51ot43schosAUp5",
    ticketsCount: 3,
  },
];
