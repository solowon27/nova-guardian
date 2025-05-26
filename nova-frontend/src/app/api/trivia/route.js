// /src/app/api/trivia/route.js
import axios from 'axios';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get('amount') || 5;
  const difficulty = searchParams.get('difficulty') || 'easy';
  const type = searchParams.get('type') || 'multiple';

  try {
    const response = await axios.get('https://opentdb.com/api.php', {
      params: {
        amount,
        difficulty,
        type,
        encode: 'url3986',
      },
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Trivia API fetch error:', error.message);
    return new Response(JSON.stringify({ error: 'Trivia fetch failed' }), {
      status: 500,
    });
  }
}
