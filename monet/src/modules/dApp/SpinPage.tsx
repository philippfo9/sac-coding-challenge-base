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

  const { width } = useWindowSize();

  const centerPoint = useMemo(() => {
    let value = 0;
    if (width >= 1700) {
      value = width / 2 - (width - 1680) / 2 - 40;
    } else {
      value = width / 2 - 50;
    }
    return value;
  }, [DEMO_USERS, width]);

  const firstLeft = useMemo(() => {
    let value = 0;
    if (width >= 1700) {
      value = 72 - 240 - 4;
    } else {
      value = ((width / 2) % 244) - 50 + 4;
    }
    // console.log("dec:", width);
    // console.log("count:", centerPoint / (240 + 4));
    return value;
  }, [width]);

  const originCards = useMemo(() => {
    const showCards = DEMO_USERS.flatMap((item) =>
      Array.from({ length: item.ticketsCount }, () => item)
    );

    return showCards;
  }, [DEMO_USERS, centerPoint]);

  const [prevCount, setPrevCount] = useState(
    Math.ceil(centerPoint / (240 + 4)) + 1
  );

  const [showCards, setShowCards] = useState([
    ...originCards.slice(-prevCount),
    ...originCards.slice(0, originCards.length - prevCount),
  ]);

  const [target, setTarget] = useState(0);

  const handleSpin = () => {
    console.log("clicked");
    const duration = 15000; // 4 seconds
    const startTime = performance.now();
    const startValue = target;
    const endValue = 1500;

    const updateTargetValue = () => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime >= duration) {
        setTarget(endValue);
      } else {
        const t = elapsedTime / duration;
        const easing = 1 - Math.pow(1 - t, 3); // Cubic easing function
        const newValue = startValue + (endValue - startValue) * easing;
        setTarget(newValue);
        setTimeout(updateTargetValue, 16); // Update every 16ms (~60fps)
      }
    };

    updateTargetValue();
  };

  useEffect(() => {
    const show = showCards;
    if ((1500 - target) > 244 && target % (240 + 4) <= 10) {
      console.log(target % (240 + 4), "ddd")
      const firstItem = show.shift();
      if (firstItem) {
        show.push(firstItem);
      }
    }
    setShowCards(show);
  }, [originCards, target]);

  return (
    <DAppLayout>
      <Box mx="1.5rem" mt="3rem">
        {/* <Text fontSize="2rem" fontWeight="600" mb="1rem">
          Spin 
        </Text> */}
        {/* <input
          value={target}
          step={1}
          onChange={(e) => settarget(e.target.value as unknown as number)}
          type="number"
        /> */}
        <Box position="relative">
          <Box position="relative" ref={spinRef} mb={4} overflow="hidden">
            <Box
              display="flex"
              height={320}
              position="relative"
              style={{
                transform: `translateX(-${target % 244}px)`,
                marginLeft: firstLeft,
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

        <Button
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
        </Button>
        <Button
          bgColor="#ffe71a"
          border="none"
          mt="1rem"
          w={240}
          fontWeight={800}
          h={12}
          rounded={10}
          textTransform="uppercase"
          onClick={() => setTarget(0)}
          boxShadow="-2px -4px 0px #e0cb0f inset"
          _hover={{}}
          _focus={{
            backgroundColor: "#d2bd09 !important",
            boxShadow: "-2px -4px 0px #9f8f0d inset",
          }}
        >
          reset
        </Button>
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
    ticketsCount: 3,
  },
  {
    name: "Aickdavisfilms",
    wallet: "8QA4ih5MWJAmF7SAvyqUBrCX9pxHz2N8YezL92CREXPN",
    profilePictureUrl:
      "https://storage.monet.community/next-s3-uploads/ac32407a-e23e-4369-9d59-80bf3d4d8f50/rK0MNdr7wLJpOv62f333.gif",
    gradientStart: "#00F5A0",
    gradientEnd: "#00D9F5",
    ticketsCount: 4,
  },
  {
    name: "NoahNFT05",
    profilePictureUrl: "",
    gradientStart: "#642B73",
    gradientEnd: "#C6426E",
    wallet: "9oQJ6TSKxn5YZGHuScUhPNTZW9r9a51ot43schosAUp5",
    ticketsCount: 2,
  },
];
