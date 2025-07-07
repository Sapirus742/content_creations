import axios from 'axios';

export const fetchTest = async (blockId: string, testId: string) => {
  const response = await axios.get(`/api/tests/${blockId}/${testId}`);
  console.log('Test data received:', response.data);
  return response.data;
};