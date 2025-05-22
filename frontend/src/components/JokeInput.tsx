
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface JokeInputProps {
  onSubmit: (params: {
    prompt: string;
    category: string;
    length: string;
    obscene: boolean;
  }) => void;
  isLoading: boolean;
  selectedCategory: string;
  selectedLength: string;
  obscene: boolean;
  setObscene: (value: boolean) => void;
}

const JokeInput = ({ onSubmit, isLoading,
  selectedCategory,
  selectedLength,
  setObscene,
  obscene, }: JokeInputProps) => {
  const [input, setInput] = useState("");

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (input.trim()) {
    onSubmit({
      prompt: input,
      category: selectedCategory,
      length: selectedLength,
      obscene: obscene,
    });
    setInput("");
  }
};

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center w-full space-y-2 sm:space-y-0 sm:space-x-2">
        <Input
          type="text"
          placeholder="Введите запрос для шутки..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-full bg-white border-joke-lightGreen focus:border-joke-green text-black dark:text-black"
          disabled={isLoading}
        />
        <Button 
  type="submit" 
  className="rounded-full bg-gradient-to-r from-joke-green to-joke-lime hover:brightness-110 shadow-lg text-black transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
  disabled={isLoading || !input.trim()}
>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
  <div className="mt-3 flex items-center gap-3">
    <span className="text-sm text-muted-foreground">С матом</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={obscene}
        onChange={(e) => setObscene(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-joke-green transition-colors duration-300"></div>
      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-5"></div>
    </label>
  </div>
    </form>
  );
};

export default JokeInput;
