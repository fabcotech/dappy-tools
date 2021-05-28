import { BeesLoadData } from "./index";

export const fakeQueryHandler = (urlToQuery: string): Promise<BeesLoadData> => {
  if (urlToQuery.includes("nodefail")) {
    return new Promise(r => {
      r({
        type: "ERROR",
        nodeUrl: urlToQuery,
        status: 400
      });
    });
  }

  let data = "";
  if (urlToQuery.includes("nodea")) {
    data = "a";
  } else if (urlToQuery.includes("nodeb")) {
    data = "b";
  } else if (urlToQuery.includes("nodec")) {
    data = "c";
  } else {
    data = "d";
  }
  return new Promise(r => {
    r({
      type: "SUCCESS",
      data: data,
      nodeUrl: urlToQuery
    });
  });
};
