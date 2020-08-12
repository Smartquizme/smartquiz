const request = require('axios')
const cheerio = require('cheerio')

exports.handler = async (event, context) => {
  
    // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const url = 'https://en.wikipedia.org/wiki/Rajneesh';
  try {
    const { data } = await request(url)
    const $ = cheerio.load(data)
    /* queryDOM */
    const items = $('p')
    console.log('items', items)
    const itemsText = items.map((i, el) => {
      return $(el).text().trim()
    })
    console.log('itemsText', items)
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: itemsText
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error
      })
    }
  }
}