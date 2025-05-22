
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { extendedJokeCategories, jokeCategories } from "@/hooks/useJokeGenerator";

interface CategorySelectorProps {
  onSelect: (category: string) => void;
  isLoading: boolean;
  showExtended: boolean;
  onToggleExtended: () => void;
}

const CategorySelector = ({ onSelect, isLoading, showExtended, onToggleExtended }: CategorySelectorProps) => {
  const categoriesToShow = showExtended ? extendedJokeCategories : jokeCategories;
  
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-muted-foreground">Выберите категорию</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleExtended}
          className="text-joke-green flex items-center gap-1 bg-white/80 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-white transition-all"
        >
          {showExtended ? (
            <>Меньше категорий <ChevronUp size={16} /></>
          ) : (
            <>Больше категорий <ChevronDown size={16} /></>
          )}
        </motion.button>
      </div>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
        layout
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, layout: { duration: 0.3 } }}
      >
        {categoriesToShow.map((category) => (
          <motion.button
            layout
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            onClick={() => onSelect(category.id)}
            disabled={isLoading}
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{category.emoji}</span>
              <span className="text-sm font-medium text-black dark:text-black">{category.name}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default CategorySelector;
