const axios = require("axios");

async function getQuestionById(questionId, accessToken) {
  const url = `https://api.mercadolibre.com/questions/${questionId}`;

  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
}

module.exports = { getQuestionById };

