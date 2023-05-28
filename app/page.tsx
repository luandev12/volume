'use client';
import { Button, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { DatePicker, Space } from 'antd';
import moment from 'moment-timezone';
import axios from 'axios';
import { Input } from 'antd';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

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
      setQuotes(data.data.quotes);
      setName(data.data.name);
      setLoading(false);
      console.log(data.data.quotes);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleChangeSlug = (v: any) => {
    setName(v.target.value.split('/')[4]);
  };

  useEffect(() => {}, [quotes]);

  const exportVolume = () => {
    setLoading(true);
    const result = quotes.map((d: any) => ({
      ['Date']: moment(d.timeOpen).format('DD-MM-YYYY'),
      ['volume']: d.quote.volume,
    }));

    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const ws = XLSX.utils.json_to_sheet(result);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `volume-triet` + fileExtension);

    setLoading(false);

    message.success('Exports success!');
  };

  return (
    <>
      <div className="container mb-4">
        <Input placeholder="Link Coinmaketcap" onChange={handleChangeSlug} />
        {name && (
          <div className="d-flex align-items-center">
            <RangePicker onChange={handleChange} className="my-4" />
            <Button type="primary" onClick={exportVolume} className="mx-2">
              Export Volume
            </Button>
          </div>
        )}
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
