import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const jokeCategories = [
  { id: "IT", name: "IT", emoji: "💻" },
  { id: "Школа", name: "Школа", emoji: "🎓" },
  { id: "Работа", name: "Работа", emoji: "💼" },
  { id: "Доктора", name: "Доктора", emoji: "🩺" },
  { id: "Студенты", name: "Студенты", emoji: "📚" },
  { id: "Семья", name: "Семья", emoji: "👨‍👩‍👧‍👦" },
  { id: "Политика", name: "Политика", emoji: "🏛️" },
  { id: "Армия", name: "Армия", emoji: "🪖" },
  { id: "Спорт", name: "Спорт", emoji: "⚽" },
  { id: "Штирлиц", name: "Штирлиц", emoji: "🕵️‍♂️" },
];

export const extendedJokeCategories = [
  ...jokeCategories,
  { id: "18+", name: "18+", emoji: "🔞" },
  { id: "Бар", name: "Бар", emoji: "🍺" },
  { id: "Национальность", name: "Национальность", emoji: "🌍" },
  { id: "Другое", name: "Другое", emoji: "🎲" },
];

export interface SavedJoke {
  id: string;
  text: string;
  category: string;
  categoryName: string;
  emoji: string;
  timestamp: number;
}

const generateJoke = async (
  input?: string,
  category: string = "auto",
  obscene: boolean = false,
  length: string = "короткий"
): Promise<{ response: string; category: string }> => {
  const res = await axios.post("/generate", {
    prompt: input || "",
    category,
    length,
    obscene,
  });

  const taskId = res.data.task_id;

  for (let i = 0; i < 20; i++) {
    const resultRes = await axios.get(`/result/${taskId}`);
    if (resultRes.data.response) {
      return resultRes.data; // содержит { response, category }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error("Время ожидания шутки истекло");
};

export function useJokeGenerator() {
  const [joke, setJoke] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [jokeHistory, setJokeHistory] = useState<SavedJoke[]>([]);
  const [showExtendedCategories, setShowExtendedCategories] = useState(false);
  const [obscene, setObscene] = useState(false);
  const { toast } = useToast();

  const getJoke = async (
    input?: string,
    selectedCategory?: string,
    length: string = "короткий"
  ) => {
    try {
      setIsLoading(true);

      const usePrompt = input?.trim().length > 0;
      const categoryToSend = usePrompt ? "auto" : selectedCategory || "другое";
      const useObscene =
        input?.toLowerCase().includes("с матом") ||
        input?.toLowerCase().includes("без мата")
          ? false
          : obscene;

      const { response, category: detectedCategory } = await generateJoke(
        input,
        categoryToSend,
        useObscene,
        length
      );

      setJoke(response);

      const finalCategoryId = detectedCategory || "Другое";
      const categoryObj =
        extendedJokeCategories.find((c) => c.id === finalCategoryId) || {
          name: "Случайные",
          emoji: "🎲",
        };

      const savedJoke: SavedJoke = {
        id: Date.now().toString(),
        text: response,
        category: finalCategoryId,
        categoryName: categoryObj.name,
        emoji: categoryObj.emoji,
        timestamp: Date.now(),
      };

      setJokeHistory((prev) => [savedJoke, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Failed to generate joke:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать шутку. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExtendedCategories = () => {
    setShowExtendedCategories((prev) => !prev);
  };

  return {
    joke,
    isLoading,
    getJoke,
    jokeHistory,
    showExtendedCategories,
    toggleExtendedCategories,
    obscene,
    setObscene,
  };
}