let a = ["aa", "bb", "cc", "dd", "ee", "ff", "gg"];
let c = {
  aa: 1,
  bb: 2,
  cc: 3,
  dd: 4,
};

let column = "ff";
let e = {
  ...c,
  [column]: 5,
};
console.log("====================================");
console.log(e);
console.log("====================================");

// let b = a.filter((i) => i == "cc");

let columns = {
  column1: ["item1", "item2", "item3"],
  column2: ["item4", "item5", "item6"],
};
let item = "item2";
const fromdata = columns["column1"].filter((i) => i !== item);
const toData = [...columns["column2"], item];

// console.log("fromdata : ", fromdata, "ToData : ", toData , "fulll--Columns", columns);
