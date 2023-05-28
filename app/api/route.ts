import { NextResponse } from 'next/server';
import axios from 'axios';
import moment from 'moment';

export async function GET(request: Request) {
  const { searchParams }: any = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const name = searchParams.get('name').toLowerCase();

  try {
    const dataToken = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?slug=${name}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'X-CMC_PRO_API_KEY': '8af8eaa1-bdb2-4e4c-82d5-9da281833deb',
        },
      }
    );

    const id = await Object.keys(dataToken.data.data)[0];

    const { data } = await axios.get(
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/historical?id=${id}&convertId=2781&timeStart=${start}&timeEnd=${end}`
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'error' });
  }
}
