from kafka import KafkaConsumer
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json
import redis
import spacy

# Загрузка spaCy
nlp = spacy.load("ru_core_news_sm")

# Redis клиент
redis_client = redis.Redis(host="localhost", port=6379, db=0)

# Модель
model_path = "./model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path).to("cuda" if torch.cuda.is_available() else "cpu")

tokenizer.pad_token = tokenizer.eos_token
model.resize_token_embeddings(len(tokenizer))

# Категоризация
def detect_category(text: str) -> str:
    categories = {
    'IT': ['windows','приложение','ассемблер','it','сисадмин','1с','программист', 'айти', 'код', 'алгоритм', 'сервер', 'баг', 'python', 'разработчик', 'тестер', 'программирован', 'компьютер', 'интернет', 'сайт', 'дизайнер', 'геймдев','искуственный интеллект','нейросеть','машинное обучение'],
    'Школа': ['перемена','математика','учитель', 'школа', 'вовочка', 'контрольная', 'урок', 'класс', 'ученик', 'дневник', 'домашка', 'родительское собрание'],
    'Работа': ['отчёт','собеседование','секретарша','работа', 'начальник', 'офис', 'сотрудник', 'зарплата', 'отпуск', 'карьера', 'офисный планктон', 'босс', 'менеджер'],
    'Доктора': ['врач', 'доктор', 'медик', 'больница', 'пациент', 'аптечка', 'ветеринар', 'поликлиника', 'операция', 'приём', 'лечение','проктолог'],
    'Студенты': ['профессор','студент', 'сесси', 'зачёт', 'общежит', 'препод', 'лекци', 'диплом', 'курсова', 'магистр', 'бакалавр'],
    'Семья': ['мама','папа','жена', 'муж', 'семь', 'тещ', 'свёкр', 'дети', 'ребёнок', 'брак', 'родители', 'воспитание', 'развод','отец','внук','дед','бабка','бабушка'],
    'Политика': ['медведев','брежнев','сво','политик', 'президент', 'депутат', 'выбор', 'правительств', 'жириновский', 'путин', 'трамп', 'санкции', 'революция', 'митинг', 'кремль', 'байден','коммунист','чиновник','война','ленин','сталин','мэр'],
    '18+': ['блять', 'сук', 'хуй', 'еба', 'пизд', 'нахуй', 'трах', 'манда', 'гандон', 'секс', 'трахает', 'еба', 'пидор', 'ёб', 'дроч', 'жопа', 'ссан', 'говн', 'бля', 'пезд', 'шлюх'],
    'Бар': ['бармен', 'бар', 'пиво', 'улитка', 'водка', 'пьяный', 'барная стойка', 'виски', 'шот'],
    'Армия': ['солдат', 'сержант', 'рот', 'офицер', 'дембель', 'поручик', 'Ржевский', 'армия', 'присяга', 'военный', 'казарма'],
    'Спорт': ['кубок','арена','кержаков','зенит','спартак','абрамович','футбол', 'хоккей', 'тренер', 'матч', 'олимпиад', 'сборн', 'спортсмен', 'турнир', 'чемпионат', 'гол', 'пенальти'],
    'Штирлиц': ['штирлиц', 'кэт', 'мюллер'],
    'Национальность': ['американец','чукч','русский', 'еврей', 'немец', 'негр', 'армянин', 'грузин', 'хохол', 'хохлы', 'чеченец', 'дагестанец', 'украинец', 'казах'],
    'Другое': []
}
    lemmas = [t.lemma_ for t in nlp(text.lower())]
    for cat, words in categories.items():
        if any(w in lemmas for w in words):
            return cat
    return "Другое"

# Kafka consumer
consumer = KafkaConsumer(
    "joke_requests",
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    auto_offset_reset="earliest",
    group_id="joke_worker"
)

print("✅ Worker запущен...")

for msg in consumer:
    data = msg.value
    task_id = data.get("task_id")
    if not task_id:
        print("⚠️ Пропуск задачи без ID")
        continue

    prompt_text = data.get("prompt", "").strip()
    print(f"📥 Обработка задачи: {task_id} | prompt={prompt_text[:30]}...")
    length = data.get("length", "короткий")
    obscene = data.get("obscene", False)

    category = detect_category(prompt_text) if prompt_text else data.get("category", "Другое")

    if prompt_text:
        prompt = f"<s>{prompt_text}"
    else:
        mat = "с матом" if obscene else "без мата"
        prompt = f"Расскажи {length} анекдот про {category} {mat}:\n"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    output = model.generate(
        **inputs,
        max_new_tokens=80,
        do_sample=True,
        temperature=0.9,
        top_k=50,
        top_p=0.95,
        repetition_penalty=1.2,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.pad_token_id
    )

    decoded = tokenizer.decode(output[0], skip_special_tokens=False)
    result = decoded.replace(prompt, "").split("</s>")[0].strip()

    # Сохраняем result и категорию правильно!
    redis_client.setex(f"joke_result:{task_id}", 3600, json.dumps({
        "response": result,
        "category": category
    }))

    print(f"✅ Готово: task_id={task_id}, category={category}")