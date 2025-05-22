
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface JokeDisplayProps {
  joke: string;
  isLoading: boolean;
}

const JokeDisplay = ({ joke, isLoading }: JokeDisplayProps) => {
  const [displayJoke, setDisplayJoke] = useState(joke);

  useEffect(() => {
    if (joke) {
      setDisplayJoke(joke);
    }
  }, [joke]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-10">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-joke-green rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-4 h-4 bg-joke-lime rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-4 h-4 bg-joke-teal rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="mt-4 text-muted-foreground">Генерирую шутку...</p>
        </div>
      ) : displayJoke ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bubble relative"
        >
          <p className="text-lg md:text-xl font-medium text-center">{displayJoke}</p>
        </motion.div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <p>Выберите категорию или введите запрос для генерации шутки</p>
        </div>
      )}
    </div>
  );
};

export default JokeDisplay;
