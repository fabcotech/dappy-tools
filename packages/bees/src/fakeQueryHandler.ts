import { BeesLoadData } from "./index";

export const fakeQueryHandler = (id: string): Promise<BeesLoadData> => {
  if (id.includes("nodefail")) {
    return new Promise(r => {
      r({
        type: "ERROR",
        id: id,
        status: 400
      });
    });
  }

  let data = "";
  if (id.includes("nodea")) {
    data = "a";
  } else if (id.includes("nodeb")) {
    data = "b";
  } else if (id.includes("nodec")) {
    data = "c";
  } else {
    data = "d";
  }
  return new Promise(r => {
    r({
      type: "SUCCESS",
      data: data,
      id: id
    });
  });
};
