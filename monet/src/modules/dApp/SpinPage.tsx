import React, { FC, useMemo, useRef, useState } from "react";
import DAppLayout from "./layouts/DAppLayout";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import SpinCard from "./components/Spin/SpinCard";
import { useWindowSize } from "react-use";
import { CARD_GAP, CARD_WIDTH, DEMO_USERS } from "../spin/config";

const SpinPage = () => {
  // const [cards, setCards] = useState<spinUserType[]>([]);
  const { colorMode } = useColorMode();

  const isDarkMode = colorMode === "dark";
  const spinRef = useRef(null);

  const { width } = useWindowSize();
  const [isFast, setIsFast] = useState(false);

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
      value = 72 - CARD_WIDTH - CARD_GAP;
    } else {
      value = ((width / 2) % (CARD_WIDTH + CARD_GAP)) - 50 + CARD_GAP;
    }
    return value;
  }, [width]);

  const originCards = useMemo(() => {
    const showCards = DEMO_USERS.flatMap((item) =>
      Array.from({ length: item.ticketsCount }, () => item)
    );

    return showCards;
  }, [DEMO_USERS, centerPoint]);

  const prevCount = Math.ceil(centerPoint / (CARD_WIDTH + CARD_GAP)) + 1;

  const showCards = useMemo(() => {
    const repeatedCards = Array(4).fill(originCards).flat();
    const list = [
      ...originCards.slice(-prevCount),
      ...repeatedCards,
      ...originCards.slice(0, originCards.length - prevCount),
    ];
    return list;
  }, [originCards]);

  const [target, setTarget] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState(-1);

  const [isSpinEnd, setIsSpinEnd] = useState(false);

  const handleSpin = () => {
    console.log("clicked");
    const duration = !isFast ? 12000 : 2000; // 8 seconds or 2 second by isFast toggle
    const startTime = performance.now();
    const startValue = target;
    const endValue =
      (CARD_WIDTH + CARD_GAP) * originCards.length * (3 + Math.random());
    const winner =
      Math.floor(endValue / (CARD_WIDTH + CARD_GAP)) + prevCount - 1;

    const updateTargetValue = () => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime >= duration) {
        setTarget(endValue);
        setWinnerIndex(winner);
        setIsSpinEnd(true);
      } else {
        const t = elapsedTime / duration;
        const easing = 1 - Math.pow(1 - t, 4); // Cubic easing function
        const newValue = startValue + (endValue - startValue) * easing;
        setTarget(newValue);
        setTimeout(updateTargetValue, 16); // Update every 16ms (~60fps)
      }
    };

    updateTargetValue();
  };

  return (
    <DAppLayout>
      <Box mx="1.5rem" mt="3rem">
        <Text fontSize="2rem" fontWeight="600" mb={1}>
          Spin
        </Text>
        <Box position="relative">
          <Box position="relative" ref={spinRef} mb={4} overflow="hidden">
            <Box
              display="flex"
              height={360}
              mt={6}
              position="relative"
              style={{
                translate: "transform 16ms",
                transform: `translateX(-${target}px)`,
                marginLeft: firstLeft,
              }}
            >
              {showCards.map((user, index) => (
                <SpinCard
                  key={user.wallet + index}
                  user={user}
                  index={index}
                  winnerIndex={winnerIndex}
                />
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
              height={360}
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
              height={360}
              pointerEvents="none"
            />
          </Box>
          <MiddleLine isSpinEnd={isSpinEnd} />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Button
            bgColor="#ffe71a"
            border="none"
            width="200px"
            height="48px"
            fontWeight={800}
            rounded={10}
            textTransform="uppercase"
            onClick={handleSpin}
            boxShadow="-2px -4px 0px #e0cb0f inset"
            _hover={{
              backgroundColor: "#d2bd09 !important",
              boxShadow: "-2px -4px 0px #9f8f0d inset",
            }}
            disabled={winnerIndex !== -1}
          >
            Spin
          </Button>
          <Button
            bgColor="#6B6B6B"
            border="none"
            width="90px"
            height="48px"
            fontWeight={800}
            rounded={10}
            textTransform="uppercase"
            textColor="#fff"
            onClick={() => {
              setTarget(0);
              setWinnerIndex(-1);
              setIsSpinEnd(false);
            }}
            boxShadow="-2px -4px 0px #5B5B5B inset"
            _hover={{
              backgroundColor: "#5B5B5B !important",
              boxShadow: "-2px -4px 0px #444 inset",
            }}
            disabled={winnerIndex === -1}
          >
            reset
          </Button>

          <FormControl display="flex" alignItems="center" gap={1}>
            <Switch
              size="lg"
              id="is-fast"
              colorScheme="yellow"
              checked={isFast}
              onChange={() => setIsFast(!isFast)}
            />
            <FormLabel
              htmlFor="is-fast"
              fontSize="1rem"
              fontWeight="600"
              margin={0}
              color={isDarkMode ? "#999" : "#000"}
            >
              Fast Spin
            </FormLabel>
          </FormControl>
        </Box>
      </Box>
    </DAppLayout>
  );
};
export default SpinPage;

interface MiddleLineProps {
  isSpinEnd: boolean;
}
const MiddleLine: FC<MiddleLineProps> = ({ isSpinEnd }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  return (
    <Box
      width={1}
      height={360}
      position="absolute"
      left="50%"
      top={1}
      transform="transform(-1px, -4px)"
      bgColor={isDarkMode ? "#fff" : "#f3e033"}
      boxShadow={isDarkMode ? "10px 4px 10px #000" : "10px 4px 10px #000"}
      opacity={!isSpinEnd ? 1 : 0}
      style={{
        transition: `opacity 0.5s`,
      }}
    >
      <Box
        position="absolute"
        left={-1}
        top={-1}
        transform="rotate(45deg)"
        w={3}
        h={3}
        bgColor={isDarkMode ? "#fff" : "#f3e033"}
      ></Box>
      <Box
        position="absolute"
        left={-1}
        bottom={-1}
        transform="rotate(45deg)"
        w={3}
        h={3}
        bgColor={isDarkMode ? "#fff" : "#f3e033"}
      ></Box>
    </Box>
  );
};
