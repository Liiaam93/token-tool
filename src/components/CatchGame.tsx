import { useState, useEffect, useRef } from 'react';
import { Box, Button, Center, Flex, Stack, Text } from '@chakra-ui/react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PLAYER_WIDTH = 50;
const ITEM_WIDTH = 30;
const ITEM_HEIGHT = 50;
const INITIAL_FALL_SPEED = 5;
const GAME_DURATION = 40_000;

type ItemType = 'good' | 'bad';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  icon: string;
  type: ItemType;
}

const goodItems = ['🩹', '🧦'];
const badItems = ['💊'];

const getRandomItem = (): FallingItem => {
  const isGood = Math.random() < 0.7;
  const icon = isGood
    ? goodItems[Math.floor(Math.random() * goodItems.length)]
    : badItems[Math.floor(Math.random() * badItems.length)];

  return {
    id: Date.now() + Math.random(),
    x: Math.random() * (GAME_WIDTH - ITEM_WIDTH),
    y: 0,
    icon,
    type: isGood ? 'good' : 'bad',
  };
};

const CatchGame = () => {
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [renderItems, setRenderItems] = useState<FallingItem[]>([]);
  const [renderPlayerX, setRenderPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);

  const fallSpeedRef = useRef(INITIAL_FALL_SPEED);
  const playerXRef = useRef(renderPlayerX);
  const fallingItemsRef = useRef<FallingItem[]>([]);
  const moveDirectionRef = useRef<null | 'left' | 'right'>(null);
  const animationRef = useRef<number>();

  // Handle key inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning) return;
      if (e.key === 'ArrowLeft') moveDirectionRef.current = 'left';
      if (e.key === 'ArrowRight') moveDirectionRef.current = 'right';
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        moveDirectionRef.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning]);

  // Spawn items
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      fallingItemsRef.current.push(getRandomItem());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Game timer
  useEffect(() => {
    if (!isRunning) return;
    const timeout = setTimeout(() => endGame(), GAME_DURATION);
    return () => clearTimeout(timeout);
  }, [isRunning]);

  // Main game loop (requestAnimationFrame)
  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    let speedTimer = 0;

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Move player
      const move = moveDirectionRef.current;
      if (move === 'left') {
        playerXRef.current = Math.max(0, playerXRef.current - 5);
      } else if (move === 'right') {
        playerXRef.current = Math.min(GAME_WIDTH - PLAYER_WIDTH, playerXRef.current + 5);
      }

      // Move items
      fallingItemsRef.current = fallingItemsRef.current
        .map((item) => ({
          ...item,
          y: item.y + fallSpeedRef.current * (delta / 16.67), // normalize to 60fps
        }))
        .filter((item) => {
          const caught =
            item.y + ITEM_HEIGHT >= GAME_HEIGHT - 40 &&
            item.x + ITEM_WIDTH >= playerXRef.current &&
            item.x <= playerXRef.current + PLAYER_WIDTH;
          if (caught) {
            if (item.type === 'good') {
              setScore((s) => s + 1);
            } else {
              endGame(); // bad item caught
            }
            return false;
          }
          return item.y < GAME_HEIGHT;
        });

      // Increase fall speed every 10s
      speedTimer += delta;
      if (speedTimer >= 8_000) {
        fallSpeedRef.current += 2;
        speedTimer = 0;
      }

      // Trigger React re-renders
      setRenderItems([...fallingItemsRef.current]);
      setRenderPlayerX(playerXRef.current);

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [isRunning]);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
    fallSpeedRef.current = INITIAL_FALL_SPEED;
    playerXRef.current = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    fallingItemsRef.current = [];
    setRenderItems([]);
    setRenderPlayerX(playerXRef.current);
  };

  const endGame = () => {
    setIsRunning(false);
    setGameOver(true);
  };

  return (
    <Flex mt={10} justify="center" align="flex-start" gap={10}>
      {/* Instructions Panel */}
      <Box
        w="250px"
        p={4}
        borderWidth={1}
        borderColor="gray.300"
        borderRadius="md"
        bg="gray.50"
      >
        <Text fontSize="xl" fontWeight="bold" mb={2}>How to Play</Text>
        <Text fontSize="sm" mb={2}>➡️ Use arrow keys to move the bin left and right.</Text>
        <Text fontSize="sm" mb={2}>🩹🧦 Collect prescriptions with items like bandages and stockings.</Text>
        <Text fontSize="sm" mb={2}>💊 Avoid pills or the game ends!</Text>
        <Text fontSize="sm">⏱️ Game lasts for 40 seconds. Try for the highest score!</Text>
      </Box>

      {/* Game Panel */}
      <Center flexDirection="column" borderWidth={1}>
        {!isRunning && !gameOver && (
          <Button colorScheme="green" size="lg" onClick={startGame}>
            Start Game
          </Button>
        )}

        {gameOver && (
          <Stack spacing={4} align="center">
            <Text fontSize="2xl" fontWeight="bold">Game Over</Text>
            <Text>Your score: {score}</Text>
            <Button colorScheme="blue" onClick={startGame}>
              Play Again
            </Button>
          </Stack>
        )}

        <Box
          width={`${GAME_WIDTH}px`}
          height={`${GAME_HEIGHT}px`}
          border="2px solid"
          borderColor="gray.300"
          position="relative"
          bg="blue.50"
          overflow="hidden"
          display={isRunning ? 'block' : 'none'}
        >
          {/* Player bin */}
          <Box
            position="absolute"
            bottom="0"
            left={`${renderPlayerX}px`}
            width={`${PLAYER_WIDTH}px`}
            height="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="30px"
          >
            🗑️
          </Box>

          {/* Falling items */}
          {renderItems.map((item) => (
            <Box
              key={item.id}
              position="absolute"
              top={`${item.y}px`}
              left={`${item.x}px`}
              width={`${ITEM_WIDTH}px`}
              height={`${ITEM_HEIGHT}px`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="20px"
              bg="green.100"
              border="2px solid"
              borderColor="green.500"
              borderRadius="md"
              pointerEvents="none"
            >
              {item.icon}
            </Box>
          ))}

          {/* Score */}
          <Text position="absolute" top="5px" left="10px" fontWeight="bold">
            Score: {score}
          </Text>
        </Box>
      </Center>
    </Flex>
  );

};

export default CatchGame;