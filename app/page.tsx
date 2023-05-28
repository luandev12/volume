'use client';
import { Card, Col, Row, Table, Typography } from 'antd';
import { BarChart } from '../components/barChart';
import { CardAsset } from '../components/cards/cardAsset';
import { CardCompany } from '../components/cards/cardCompany';
import { CardUnit } from '../components/cards/cardUnit';
import { CardUser } from '../components/cards/cardUser';
import { PieChart } from '../components/pieChart';
import NavLink from './nav-link';
import { DatePicker, Space } from 'antd';
import moment from 'moment-timezone';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Input } from 'antd';

const { RangePicker } = DatePicker;

export default function Home() {
  const [quotes, setQuotes] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'timeOpen',
      key: 'timeOpen',
      render: (timeOpen: any) => <a>{moment(timeOpen).format('DD/MM/YYYY')}</a>,
    },
    {
      title: 'Volume',
      dataIndex: 'quote',
      key: 'quote',
      render: (quote: any) => (
        <a>
          {quote.volume.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </a>
      ),
    },
  ];

  const handleChange = async (v: any) => {
    const start = moment(v[0].$d).unix();
    const end = moment(v[1].$d).unix();

    setLoading(true);

    try {
      const { data } = await axios.get(
        `/api?start=${start}&end=${end}&name=${name}`
      );
      console.log(data);
      setQuotes(data.data.quotes);
      setName(data.data.name);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleChangeSlug = (v: any) => {
    setName(v.target.value.split('/')[4]);
  };

  useEffect(() => {}, [quotes]);

  return (
    <>
      <div className="container mb-4">
        <Input placeholder="Link Coinmaketcap" onChange={handleChangeSlug} />
        {name && <RangePicker onChange={handleChange} className="my-4" />}
        <Table
          columns={columns}
          dataSource={quotes}
          loading={loading}
          pagination={{ pageSize: 100 }}
        />
      </div>
    </>
  );
}
