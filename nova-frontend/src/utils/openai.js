import axios from 'axios';

export const fetchImageExplanation = async (topic) => {
  const res = await axios.post('/api/openai/image-explainer', { topic });
  return res.data; // { imageUrl, explanation, funFact }
};
