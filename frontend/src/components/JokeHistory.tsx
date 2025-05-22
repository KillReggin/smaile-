
import { motion } from "framer-motion";
import { SavedJoke } from "@/hooks/useJokeGenerator";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JokeHistoryProps {
  jokes: SavedJoke[];
}

const JokeHistory = ({ jokes }: JokeHistoryProps) => {
  const { toast } = useToast();

  const copyJoke = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Шутка скопирована в буфер обмена",
    });
  };

  if (jokes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 mb-12">
      <h2 className="text-2xl font-bold text-center mb-6 text-gradient">История шуток</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jokes.map((joke) => (
          <motion.div
            key={joke.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card text-card-foreground rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <span className="px-3 py-1 bg-joke-lightGreen text-joke-green rounded-full text-sm font-medium flex items-center gap-1.5 mb-3 dark:bg-muted dark:text-primary">
                <span>{joke.emoji}</span>
                <span>{joke.categoryName}</span>
              </span>
              
              <button 
                onClick={() => copyJoke(joke.text)}
                className="text-muted-foreground hover:text-joke-green transition-colors"
                aria-label="Копировать шутку"
              >
                <Copy size={16} />
              </button>
            </div>
            
            <p className="text-foreground">{joke.text}</p>
            
            <div className="flex mt-4 space-x-1 text-gray-300 dark:text-gray-600">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  ☺
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JokeHistory;
