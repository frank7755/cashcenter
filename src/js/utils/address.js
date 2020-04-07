import provinces from "china-division/dist/provinces.json";
import cities from "china-division/dist/cities.json";
import areas from "china-division/dist/areas.json";
import streets from "china-division/dist/streets.json";

const getProvince = () => {
  const provinceArr = [];
  provinces.map(item => {
    provinceArr.push({
      code: item.code,
      value: item.name
    });
  });
  console.log(provinces);
  console.log(cities);
  console.log(areas);
  console.log(streets);
  return provinceArr;
};

const getCities = code => {};

export { getProvince };
