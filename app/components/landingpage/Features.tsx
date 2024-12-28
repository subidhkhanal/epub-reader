import { RiBook2Line } from "react-icons/ri";
import { useState, useReducer } from "react";
// import HexagonBoxes from "./hexagonBoxes";
// import girlStudying from "../../../images/girlStudying.jpg";
// import examDay from "../../../images/examDay.jpg";
// import resultsAnnounced from "../../../images/resultsAnnounced.jpg";

// import dataAnalysis from "../../../images/Schedule Plan.jpg";

// This is the data that goes into the hexagon
//We don't send in the color value because we know the id of every single box and we can determine the color according to that
const data = [
  {
    id: 0,
    tabDescription: "Every Day Algorithm Suggests You What To Study",
    firstHexagonText: "Enter Your Desired Grade",
    secondHexagonText: "Toppers explain their strategy",
    thirdHexagonText: "Teachers Provide an Overview of the subject",
    fourthHexagonText: "Teachers Provide an Overview of the subject",
    fifthHexagonText: "Daily questions,answers & accompanying videos to watch",
    sixthHexagonText: "Quiz to Track Progress",
    // image: girlStudying,
  },
  {
    id: 1,
    tabDescription: "When Exam Date is Announced",
    firstHexagonText: "Take a Quick Quiz",
    secondHexagonText: "Toppers explain their strategy",
    thirdHexagonText: "Teachers  an Overview of the subject",
    fourthHexagonText: "Teachers  Overview of the subject",
    fifthHexagonText: "Daily  & accompanying videos to watch",
    sixthHexagonText: "Quiz  Progress",
    // image: dataAnalysis,
  },
  {
    id: 2,
    tabDescription: "At Exam Date",
    firstHexagonText: "Enter Your Desired Grade",
    secondHexagonText: "Toppers explain their strategy",
    thirdHexagonText: "Teachers Provide an Overview of the subject",
    fourthHexagonText: "Teachers Provide an Overview of the subject",
    fifthHexagonText: "Daily questions,answers & accompanying videos to watch",
    sixthHexagonText: "Quiz to Track Progress",
    // image: examDay,
  },
  {
    id: 3,
    tabDescription: "After Result is Announced",
    firstHexagonText: "Enter Your Desired Grade",
    secondHexagonText: "Toppers explain their strategy",
    thirdHexagonText: "Teachers Provide an Overview of the subject",
    fourthHexagonText: "Teachers Provide an Overview of the subject",
    fifthHexagonText: "Daily questions,answers & accompanying videos to watch",
    sixthHexagonText: "Quiz to ",
    // image: resultsAnnounced,
  },
];

//We update the data according to
const reducer = (state, action) => {
  switch (action.type) {
    case "dayToDayClicked":
      return {
        id: data[0].id,
        tabDescription: data[0].tabDescription,
        firstHexagonText: data[0].firstHexagonText,
        secondHexagonText: data[0].secondHexagonText,
        thirdHexagonText: data[0].thirdHexagonText,
        fourthHexagonText: data[0].fourthHexagonText,
        fifthHexagonText: data[0].fifthHexagonText,
        sixthHexagonText: data[0].sixthHexagonText,
        image: data[0].image,
      };
    case "examAnnouncedClicked":
      return {
        id: data[1].id,
        tabDescription: data[1].tabDescription,
        firstHexagonText: data[1].firstHexagonText,
        secondHexagonText: data[1].secondHexagonText,
        thirdHexagonText: data[1].thirdHexagonText,
        fourthHexagonText: data[1].fourthHexagonText,
        fifthHexagonText: data[1].fifthHexagonText,
        sixthHexagonText: data[1].sixthHexagonText,
        image: data[1].image,
      };
    case "examDayClicked":
      return {
        id: data[2].id,
        tabDescription: data[2].tabDescription,
        firstHexagonText: data[2].firstHexagonText,
        secondHexagonText: data[2].secondHexagonText,
        thirdHexagonText: data[2].thirdHexagonText,
        fourthHexagonText: data[2].fourthHexagonText,
        fifthHexagonText: data[2].fifthHexagonText,
        sixthHexagonText: data[2].sixthHexagonText,
        image: data[2].image,
      };
    case "resultsAnnounced":
      return {
        id: data[3].id,
        tabDescription: data[3].tabDescription,
        firstHexagonText: data[3].firstHexagonText,
        secondHexagonText: data[3].secondHexagonText,
        thirdHexagonText: data[3].thirdHexagonText,
        fourthHexagonText: data[3].fourthHexagonText,
        fifthHexagonText: data[3].fifthHexagonText,
        sixthHexagonText: data[3].sixthHexagonText,
        image: data[3].image,
      };
  }
};

export default function Features() {
  //We will use Reducer for passing data to the Hexagonal icons
  // noinspection JSCheckFunctionSignatures
  const [state, dispatch] = useReducer(reducer, {
    id: data[0].id,
    tabDescription: data[0].tabDescription,
    firstHexagonText: data[0].firstHexagonText,
    secondHexagonText: data[0].secondHexagonText,
    thirdHexagonText: data[0].thirdHexagonText,
    fourthHexagonText: data[0].fourthHexagonText,
    fifthHexagonText: data[0].fifthHexagonText,
    sixthHexagonText: data[0].sixthHexagonText,
    image: data[0].image,
  });

  //This is  for selecting the icon correctly
  const [dayToDay, setDayToDay] = useState(true); //As something needs to be true first
  const [examAnnounced, setExamAnnounced] = useState(false);
  const [examDay, setExamDay] = useState(false);
  const [resultsAnnounced, setResultsAnnounced] = useState(false);

  const dayToDayClicked = () => {
    setDayToDay(true);
    setExamAnnounced(false);
    setExamDay(false);
    setResultsAnnounced(false);
  };

  const examAnnouncedClicked = () => {
    setDayToDay(false);
    setExamAnnounced(true);
    setExamDay(false);
    setResultsAnnounced(false);
  };

  const examDayClicked = () => {
    setDayToDay(false);
    setExamAnnounced(false);
    setExamDay(true);
    setResultsAnnounced(false);
  };

  const resultsAnnouncedClicked = () => {
    setDayToDay(false);
    setExamAnnounced(false);
    setExamDay(false);
    setResultsAnnounced(true);
  };

  return (
    <div className="bg-[#181a1b] text-white">
      <div id="features" className="max-w-6xl container mx-auto pt-2">
        <section className="mt-20">
          <div className="container flex flex-col mx-auto space-y-12 md:space-y-0 md:flex-row">
            <div className="flex flex-col space-y-12 md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold   md:text-left">
                Study ebooks <br />
                <span className="text-[#3c95f0] break-words">
                  from any device{" "}
                </span>
              </h2>
            </div>
          </div>
        </section>

        <section>
          <div className="container flex flex-col md:flex-row mx-auto justify-center mt-10">
            {/*    First Button*/}

            <span
              onClick={() => {
                dispatch({ type: "dayToDayClicked" });
              }}
            >
              <button
                type="button"
                onClick={dayToDayClicked}
                className="border-gray-600 focus:text-blue-900 hover:border-blue-700 focus:border-blue-900 whitespace-nowrap rounded-md border border-gray-600 px-20 py-2.5 text-sm leading-5 font-medium mr-6 mb-2"
              >
                <span className="flex">
                  <RiBook2Line
                    size="20px"
                    className={`mr-3 ${
                      dayToDay === true ? "text-red-500" : ""
                    }`}
                  />
                  Cloud Storage
                </span>
              </button>
            </span>

            {/*    Second Button*/}
            <span
              onClick={() => {
                dispatch({ type: "examAnnouncedClicked" });
              }}
            >
              <button
                type="button"
                onClick={examAnnouncedClicked}
                className="border-gray-600 focus:text-blue-900 hover:border-blue-700 focus:border-blue-900 whitespace-nowrap rounded-md border border-gray-600 px-20 py-2.5 text-sm leading-5 font-medium mr-6 mb-2"
              >
                <span className="flex">
                  <RiBook2Line
                    size="20px"
                    className={`mr-3 ${
                      examAnnounced === true ? "text-red-500" : ""
                    }`}
                  />
                  View Mode
                </span>
              </button>
            </span>

            {/*    Third Button*/}
            <span
              onClick={() => {
                dispatch({ type: "examDayClicked" });
              }}
            >
              <button
                type="button"
                onClick={examDayClicked}
                className="border-gray-600 focus:text-blue-900 hover:border-blue-700 focus:border-blue-900 whitespace-nowrap rounded-md border border-gray-600 px-20 py-2.5 text-sm leading-5 font-medium mr-6 mb-2"
              >
                <span className="flex">
                  <RiBook2Line
                    size="20px"
                    className={`mr-3 ${examDay === true ? "text-red-500" : ""}`}
                  />
                  Sync
                </span>
              </button>
            </span>

            {/*    After Results*/}
            {/* <span
              onClick={() => {
                dispatch({ type: "resultsAnnounced" });
              }}
            >
              <button
                type="button"
                onClick={resultsAnnouncedClicked}
                className="categoryButtonsAbstractionCss border-gray-600  focus:text-blue-900  hover:border-blue-700 focus:border-blue-900"
              >
                <span className="flex">
                  <RiBook2Line
                    size="22px"
                    className={`mr-3 ${
                      resultsAnnounced === true ? "text-red-500" : ""
                    }`}
                  />
                  Results Announced
                </span>
              </button>
            </span> */}
          </div>
        </section>

        {/*Courses With Hexagon And Animation*/}
        {/* <HexagonBoxes
        key={state.id}
        tabDescription={state.tabDescription}
        firstHexagonText={state.firstHexagonText}
        secondHexagonText={state.secondHexagonText}
        thirdHexagonText={state.thirdHexagonText}
        fourthHexagonText={state.fourthHexagonText}
        fifthHexagonText={state.fifthHexagonText}
        sixthHexagonText={state.sixthHexagonText}
        image={state.image}
      /> */}
      </div>
    </div>
  );
}
