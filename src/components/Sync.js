import AsyncStorage from '@react-native-community/async-storage';

const setData = async (name, data) => {  // name: string    data: array, object, or string
  const response = await AsyncStorage.setItem(name, typeof data === "string" ? data : JSON.stringify(data));  // accepts either array, object or string...i think
  console.log(`Saved ${data} to storage item ${name}`);

  return response;
};

const getData = async (name) => {  // name: string
  const response = await AsyncStorage.getItem(name);
  console.log(`Got storage item ${name} with response ${response}`);
  // REMEMBER TO PARSE AFTER GETTING DATA

  return response;
}

export { setData, getData };