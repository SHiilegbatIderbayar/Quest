import { useState } from "react";
import "./App.css";

const services = ["Үйлчилгээ 1", "Үйлчилгээ 2", "Үйлчилгээ 3"];

const serviceOptions = [
  "Супермаркет",
  "Эрүүл мэндийн тусламж, үйлчилгээ",
  "Нийтийн тээвэр",
  "Ажил / оффис",
  "Сургууль / боловсролын газар",
  "Кофешоп, ресторан",
  "Цэцэрлэгт хүрээлэн / ногоон байгууламж",
  "Бусад",
];

const scoreTable = {
  transport: {
    "Явганаар": 10,
    "Унадаг дугуйгаар": 10,
    "Нийтийн тээвэр": 5,
    "Машин": 1,
  },
  distance: {
    "5-с бага минут": 10,
    "5–15 минут": 10,
    "15–30 минут": 5,
    "30-с дээш минут": 1,
  },
};

const questionTemplates = [
  {
    type: "place",
    title: "Хамгийн сүүлд үйлчлүүлсэн газар",
    options: serviceOptions,
  },
  {
    type: "transport",
    title: "Сүүлд үйлчлүүлсэн газар руу юугаар явж хүрсэн бэ?",
    options: [
      "Явганаар",
      "Унадаг дугуйгаар",
      "Нийтийн тээвэр",
      "Машин",
    ],
  },
  {
    type: "distance",
    title: "Хэр хугацаа зарцуулж хүрсэн бэ?",
    options: [
      "5-с бага минут",
      "5–15 минут",
      "15–30 минут",
      "30-с дээш минут",
    ],
  },
  {
    type: "reason",
    title: "Яагаад энэ газрыг сонгож үйлчлүүлсэн бэ?",
    options: [
      "Ойрхон",
      "Хямд",
      "Байнга үйлчлүүлдэг газар",
      "Очиход хялбар",
      "Бусдаас чанартай",
      "Өөр сонголтгүй",
    ],
  },
];

const questions = services.flatMap((service, serviceIndex) =>
  questionTemplates.map((q, questionIndex) => ({
    ...q,
    service,
    serviceIndex,
    questionIndex,
    key: `service_${serviceIndex + 1}_${q.type}`,
  }))
);

function calculateScore(answers) {
  const serviceScores = services.map((service, index) => {
    const serviceNumber = index + 1;

    const transportAnswer = answers[`service_${serviceNumber}_transport`];
    const distanceAnswer = answers[`service_${serviceNumber}_distance`];

    const transportScore = scoreTable.transport[transportAnswer] || 0;
    const distanceScore = scoreTable.distance[distanceAnswer] || 0;

    const totalScore = transportScore + distanceScore;
    const maxScore = 20;
    const percent = totalScore / maxScore;

    return {
      service,
      transportAnswer,
      distanceAnswer,
      transportScore,
      distanceScore,
      totalScore,
      maxScore,
      percent,
    };
  });

  const proximityScore =
    serviceScores.reduce((sum, item) => sum + item.percent, 0) /
    serviceScores.length;

  return {
    serviceScores,
    proximityScore,
  };
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export default function App() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[step];

  const startQuiz = () => {
    setStep(0);
    setAnswers({});
    setFinished(false);
  };

  const saveResult = (finalAnswers) => {
    const score = calculateScore(finalAnswers);
    const oldResults = JSON.parse(localStorage.getItem("quizResults")) || [];

    const newResult = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      answers: finalAnswers,
      serviceScores: score.serviceScores,
      proximityScore: score.proximityScore,
    };

    localStorage.setItem(
      "quizResults",
      JSON.stringify([...oldResults, newResult])
    );
  };

  const selectAnswer = (answer) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: answer,
    };

    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      saveResult(updatedAnswers);
      setFinished(true);
    }
  };

  if (step === -1) {
    return (
      <main className="container">
        <section className="card">
          <p className="eyebrow">Судалгааны quiz app</p>

          <h1>Өдөр тутмын үйлчилгээний хүртээмжийн судалгаа</h1>

          <p className="description">
            Та хамгийн сүүлд үйлчлүүлсэн 3 газрынхаа тухай хариулна.
            Тээврийн хэрэгсэл болон хугацааны сонголтоор оноо тооцож,
            эцэст нь Proximity Score гаргана.
          </p>

          <p className="notice">
            Таны хариултыг зөвхөн судалгааны зорилгоор ашиглана.
          </p>

          <button onClick={startQuiz}>Эхлэх →</button>
        </section>
      </main>
    );
  }

  if (finished) {
    const result = calculateScore(answers);

    return (
      <main className="container">
        <section className="card">
          <p className="eyebrow">Үр дүн</p>

          <h1>Баярлалаа!</h1>

          <div className="result-table">
            <div className="table-row table-head">
              <span></span>
              <span>Авсан оноо</span>
              <span>Нийт оноо</span>
              <span>Хувь</span>
            </div>

            {result.serviceScores.map((item) => (
              <div className="table-row" key={item.service}>
                <span>{item.service}</span>
                <span>{item.totalScore}</span>
                <span>{item.maxScore}</span>
                <span>{item.percent.toFixed(2)}</span>
              </div>
            ))}

            <div className="table-row final-row">
              <span>Proximity Score</span>
              <span></span>
              <span></span>
              <span>{formatPercent(result.proximityScore)}</span>
            </div>
          </div>

          <button onClick={startQuiz}>Дахин бөглөх</button>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <div className="top-info">
          <span>{currentQuestion.service} / 3</span>
          <span>Алхам {currentQuestion.questionIndex + 1} / 4</span>
        </div>

        <h2>{currentQuestion.title}</h2>

        <div className="options">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              className="option-btn"
              onClick={() => selectAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="selected-services">
          <p>Your selected services</p>
          {services.map((service, index) => (
            <span
              key={service}
              className={index === currentQuestion.serviceIndex ? "active" : ""}
            >
              {service}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}