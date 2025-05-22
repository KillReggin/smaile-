import { useState } from "react";
import { motion } from "framer-motion";
import JokeDisplay from "@/components/JokeDisplay";
import JokeInput from "@/components/JokeInput";
import CategorySelector from "@/components/CategorySelector";
import JokeHistory from "@/components/JokeHistory";
import { useJokeGenerator } from "@/hooks/useJokeGenerator";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const {
    joke,
    isLoading,
    getJoke,
    jokeHistory,
    showExtendedCategories,
    toggleExtendedCategories,
    obscene,
    setObscene,
  } = useJokeGenerator();

  const [selectedCategory, setSelectedCategory] = useState("Другое");
  const [selectedLength, setSelectedLength] = useState("короткий");

  const handleInputSubmit = ({
    prompt,
    category,
    length,
    obscene,
  }: {
    prompt: string;
    category: string;
    length: string;
    obscene: boolean;
  }) => {
    getJoke(prompt, category, length);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    getJoke(undefined, category, selectedLength);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors pt-16 md:pt-24">
        <div className="absolute top-4 right-25 flex items-center gap-3 z-50">
<Tooltip>
  <TooltipTrigger asChild>
    <button className="text-xl hover:scale-110 transition-transform" aria-label="FAQ">
      ❓
    </button>
  </TooltipTrigger>
  <TooltipContent side="bottom">
    <p className="text-sm max-w-xs">
      Чтобы сгенерировать анекдот достаточно нажать на любую интересующую вас тему. Либо вы можете вписать в строке "Расскажи x анекдот про y" где x -  длина а y - тема. Переключите флажок если хотите анекдот 18+ или разбавить нецензурной лексикой. Вы также можете начать писать анекдот а модель за вас ее продолжит, например "Заходит улитка в бар" и жмите отправить.
    </p>
  </TooltipContent>
</Tooltip>
  </div>
      <div className="container max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gradient">Генератор Шуток</h1>
            <p className="text-muted-foreground text-lg">Получите дозу смеха в один клик!</p>
          </motion.div>
        </header>

        <main>
          <JokeInput
            onSubmit={handleInputSubmit}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
            selectedLength={selectedLength}
            obscene={obscene}
            setObscene={setObscene}
          />
          <CategorySelector
            onSelect={handleCategorySelect}
            isLoading={isLoading}
            showExtended={showExtendedCategories}
            onToggleExtended={toggleExtendedCategories}
          />
          <JokeDisplay joke={joke} isLoading={isLoading} />

          {joke && !isLoading && (
            <div className="flex justify-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-joke-green hover:bg-joke-green/90 text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg"
                onClick={() => getJoke(undefined, selectedCategory, selectedLength)}
                disabled={isLoading}
              >
                <span>Еще шутку</span>
                <span className="animate-bounce-subtle">😂</span>
              </motion.button>
            </div>
          )}
          <JokeHistory jokes={jokeHistory} />
        </main>
      </div>
    </div>
  );
};

export default Index;
